import { BaseRepository } from '@lib/core/base';
import { LoggerService } from '@lib/modules';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
} from 'typeorm';
import {
  CreateProductDto,
  ProductQuery,
  QueryProductDto,
  UpdateProductDto,
} from './product.dto';
import { Product, Style } from '@lib/core/databases/postgres';
import { GatewayError, PaginationDTO } from '@lib/utils/index';
import { IPaginationResponse } from '@lib/common/interfaces';
import { error } from 'console';
import { isEmpty } from 'class-validator';
import { Sort } from '@lib/common/enums';

@Injectable()
export class ProductService extends BaseRepository {
  private readonly serviceName: string = ProductService.name;
  private readonly logger: LoggerService;

  constructor(
    @InjectDataSource() private readonly dataSourcePostgres: DataSource,
    logger: LoggerService,
  ) {
    super();
    this.logger = logger;
    this.logger.setContext(this.serviceName);
  }

  async listProducts(
    query: ProductQuery,
    dto: QueryProductDto,
  ): Promise<IPaginationResponse<Product>> {
    const { page, size, startPrice, endPrice } = query;
    const { orderFields, queryFields } = dto;
    const { search, label } = queryFields;

    const where: FindOptionsWhere<Product> = {
      price: Between(startPrice, endPrice),
    };

    if (search) Object.assign(where, { name: ILike(`%${search}%`) });
    if (label) Object.assign(where, { label });

    const order: FindOptionsOrder<Product> = {};

    for (const key in orderFields) {
      if (orderFields[key]) Object.assign(order, { [key]: orderFields[key] });
    }

    if (isEmpty(order))
      Object.assign(order, {
        createdAt: Sort.DESC,
      });

    const results = await this.getPagination(
      this.dataSourcePostgres,
      Product,
      {
        page,
        size,
      },
      { where, order },
    );

    return results;
  }

  async detailProduct(id: string) {
    const product = await this.getOne(this.dataSourcePostgres, Product, {
      where: { id },
      relations: ['styles'],
    });

    return product;
  }

  async createProduct(dto: CreateProductDto): Promise<boolean> {
    const { category, styles, ...payload } = dto;

    Object.assign(payload, {
      category: { id: category },
    });

    const createProduct = this.createInstance(
      this.dataSourcePostgres,
      Product,
      payload,
    );

    const queryRunner = this.dataSourcePostgres.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.save(createProduct);

      for (const style of styles) {
        const instance = this.createInstance(
          this.dataSourcePostgres,
          Style,
          Object.assign(style, { product }),
        );
        await queryRunner.manager.save(instance);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error?.message);
    } finally {
      await queryRunner.release();
    }
    return true;
  }

  async updateProduct(dto: UpdateProductDto, id: string): Promise<boolean> {
    const { category, styles, ...payload } = dto;

    const queryRunner = this.dataSourcePostgres.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Product, { id }, payload);

      for (const style of styles) {
        const { id, ...payload } = style;

        await queryRunner.manager.update(Style, { id }, payload);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error?.message);
    } finally {
      await queryRunner.release();
    }
    return true;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return await this.softDelete(this.dataSourcePostgres, Product, { id });
  }
}
