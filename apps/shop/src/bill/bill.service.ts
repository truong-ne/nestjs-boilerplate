import { BaseRepository } from '@lib/core/base';
import { LoggerService } from '@lib/modules';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { BillDto, BillQuery, ChangeBillStatusDto } from './bill.dto';
import { Bill, Discount, OrderItem, Style } from '@lib/core/databases/postgres';
import {
  EBillStatus,
  EDiscountStatus,
} from '@lib/core/databases/postgres/enums/entity.enum';
import { IPaginationResponse } from '@lib/common/interfaces';
import { Sort } from '@lib/common/enums';

@Injectable()
export class BillService extends BaseRepository {
  private readonly serviceName: string = BillService.name;
  private readonly logger: LoggerService;

  constructor(
    @InjectDataSource() private readonly dataSourcePostgres: DataSource,
    logger: LoggerService,
  ) {
    super();
    this.logger = logger;
    this.logger.setContext(this.serviceName);
  }

  async listBills(
    query: BillQuery,
    user = null,
  ): Promise<IPaginationResponse<Bill>> {
    const { page, size, ...options } = query;

    const where: FindOptionsWhere<Bill> = options;
    if (user) Object.assign(where, { user: { id: user } });

    const order: FindOptionsOrder<Bill> = {};
    Object.assign(order, { updatedAt: Sort.DESC });

    const results = await this.getPagination(
      this.dataSourcePostgres,
      Bill,
      {
        page,
        size,
      },
      { where, order },
    );

    return results;
  }

  async detailBill(id: string, user: string): Promise<Bill> {
    const bill = await this.getOne(this.dataSourcePostgres, Bill, {
      where: { id, user: { id: user } },
      relations: { orderItems: { style: { product: true } } },
    });

    return bill;
  }

  async createBill(dto: BillDto, user: string): Promise<boolean> {
    const { orderItems, address, code, ...payload } = dto;

    Object.assign(payload, { address: { id: address }, user: { id: user } });
    if (code) Object.assign(payload, { discount: { code } });

    const billInstance = this.createInstance(
      this.dataSourcePostgres,
      Bill,
      payload,
    );

    const discountInstance = await this.getOne(
      this.dataSourcePostgres,
      Discount,
      {
        where: { code },
        select: { quantity: true },
        transaction: true,
        lock: { mode: 'pessimistic_read' },
      },
    );

    if (
      !discountInstance ||
      discountInstance.status === EDiscountStatus.OutOfStock ||
      discountInstance.quantity - 1 < 0
    )
      throw new BadRequestException(
        `Mã code ${discountInstance.code} đã được sử dụng hết`,
      );
    if (discountInstance.quantity === 0)
      await this.update(
        this.dataSourcePostgres,
        Discount,
        { code },
        { status: EDiscountStatus.OutOfStock },
      );

    const promises = orderItems.map(async (orderItem) => {
      const { style, ...payload } = orderItem;

      const styleInstance = await this.getOne(this.dataSourcePostgres, Style, {
        where: { id: style },
        relations: { product: true },
        transaction: true,
      });

      if (!styleInstance || styleInstance.quantity - payload.quantity < 0)
        throw new BadRequestException(
          `Sản phẩm ${styleInstance.product.name} - ${styleInstance.label} đã hết hàng`,
        );
    });

    await Promise.all(promises);

    const queryRunner = this.dataSourcePostgres.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bill = await queryRunner.manager.save(Bill, billInstance);

      if (code)
        await queryRunner.manager
          .getRepository(Discount)
          .createQueryBuilder()
          .setLock('pessimistic_write')
          .update()
          .set({ quantity: () => 'quantity - 1' })
          .where('code = :code', { code })
          .execute();

      const promises = orderItems.map(async (orderItem) => {
        const { style, ...payload } = orderItem;
        Object.assign(payload, { style: { id: style }, bill });

        await queryRunner.manager
          .getRepository(Style)
          .createQueryBuilder()
          .setLock('pessimistic_write')
          .update()
          .set({
            quantity: () => 'quantity - :orderQuantity',
          })
          .where('id = :id', { id: style, orderQuantity: payload.quantity })
          .execute();

        const orderItemInstance = this.createInstance(
          this.dataSourcePostgres,
          OrderItem,
          payload,
        );

        await queryRunner.manager.save(OrderItem, orderItemInstance, {});

        return orderItem;
      });

      await Promise.all(promises);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error?.message);
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  async cancelBill(id: string, user: string): Promise<boolean> {
    return await this.update(
      this.dataSourcePostgres,
      Bill,
      { id, user: { id: user } },
      {
        status: EBillStatus.Cancel,
      },
    );
  }

  async changeBillStatus(
    id: string,
    dto: ChangeBillStatusDto,
  ): Promise<boolean> {
    return await this.update(this.dataSourcePostgres, Bill, { id }, dto);
  }
}
