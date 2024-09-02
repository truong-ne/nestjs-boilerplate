import { BaseRepository } from '@lib/core/base';
import { LoggerService } from '@lib/modules';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  IsNull,
  Not,
  UpdateResult,
} from 'typeorm';
import { DiscountDto, DiscountQuery } from './discount.dto';
import { Discount } from '@lib/core/databases/postgres';
import { IPaginationResponse } from '@lib/common/interfaces';

@Injectable()
export class DiscountService extends BaseRepository {
  private readonly serviceName: string = DiscountService.name;
  private readonly logger: LoggerService;

  constructor(
    @InjectDataSource() private readonly dataSourcePostgres: DataSource,
    logger: LoggerService,
  ) {
    super();
    this.logger = logger;
    this.logger.setContext(this.serviceName);
  }

  async listDiscount(
    query: DiscountQuery,
  ): Promise<IPaginationResponse<Discount>> {
    const { search, unit, type, status, page, size } = query;

    const queryBuilder = this.dataSourcePostgres
      .createQueryBuilder(Discount, 'discount')
      .select('discount')
      .where('1 = 1');

    if (search) {
      queryBuilder.andWhere('(label ILIKE :search OR code ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) queryBuilder.andWhere('status = :status', { status });
    if (unit) queryBuilder.andWhere('unit = :unit', { unit });
    if (type) queryBuilder.andWhere('type = :type', { type });

    queryBuilder.offset((page - 1) * size).limit(size);

    const [results, count] = await queryBuilder.getManyAndCount();

    return { results, count };
  }

  async detailDiscount(id: string): Promise<Discount> {
    const discount = this.getOne(this.dataSourcePostgres, Discount, {
      where: { id },
    });

    return discount;
  }

  async createDiscount(dto: DiscountDto): Promise<boolean> {
    await this.existedDiscount(dto.code);

    const discount = this.createInstance(
      this.dataSourcePostgres,
      Discount,
      dto,
    );

    await this.create(this.dataSourcePostgres, Discount, discount);

    return true;
  }

  async updateDiscount(id: string, dto: DiscountDto): Promise<Boolean> {
    await this.existedDiscount(dto.code, id);

    return await this.update(this.dataSourcePostgres, Discount, { id }, dto);
  }

  async deleteDiscount(id: string): Promise<boolean> {
    return await this.softDelete(this.dataSourcePostgres, Discount, { id });
  }

  private async existedDiscount(code: string, id = null): Promise<void> {
    const where = { code, id: Not(id) };

    if (!id) Object.assign(where, { id: Not(IsNull()) });

    const existed = await this.exist(this.dataSourcePostgres, Discount, {
      where,
    });

    if (existed)
      throw new ConflictException(`Mã Discount ${code} đã được đăng kí!`);
  }
}
