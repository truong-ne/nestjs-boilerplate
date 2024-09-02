import { Sort } from '@lib/common/enums';
import { IPaginationResponse } from '@lib/common/interfaces/response';
import {
  DatabaseConnection,
  IBaseRepositoryImpl,
  PayloadEntity,
  SchemaLessOption,
} from '@lib/common/interfaces/services';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Connection, FilterQuery, Model } from 'mongoose';
import {
  DataSource,
  DeepPartial,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export class BaseRepository implements IBaseRepositoryImpl {
  getSchemaLessModel<T>(
    dataSource: Connection,
    entity: EntityTarget<T> | string,
  ): Model<T> {
    return dataSource.models[String(entity['name'])];
  }

  checkKeyExistInEntity<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    key: string,
  ): boolean {
    try {
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        const listKey = model.prototype.schema.paths;
        return key in listKey;
      }

      const properties = this.getRepository(dataSource, entity).metadata
        .propertiesMap;

      return key in properties;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getRepository<T>(
    dataSource: DataSource,
    entity: EntityTarget<T>,
  ): Repository<T> {
    try {
      const repo = dataSource.getRepository(entity);
      return repo;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  createInstance<T>(
    dataSource: DataSource,
    entity: EntityTarget<T>,
    payload: DeepPartial<T>,
  ): T {
    const repo = this.getRepository(dataSource, entity);
    const instance = repo.create(payload);

    return instance;
  }

  async getOne<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    where: FindOneOptions<T> | FilterQuery<T>,
    schemaLessOption?: SchemaLessOption<T>,
  ): Promise<T | null> {
    try {
      let record: T | null = null;
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        const { projection = null, query = null } = schemaLessOption || {};
        record = await model.findOne(where, projection, query);
        return record as T;
      }

      const repo = this.getRepository(dataSource, entity);
      record = await repo.findOne(where as FindOneOptions<T>);
      if (!record) return null;

      return record;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMany<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    options: FindManyOptions<T> | FilterQuery<T> = {},
    schemaLessOptions?: SchemaLessOption<T>,
  ): Promise<T[]> {
    try {
      let records: Array<T> = [];

      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        const { projection = null, query = null } = schemaLessOptions || {};
        records = await model.find(options, projection, query);
      } else {
        const repo = this.getRepository(dataSource, entity);
        records = await repo.find(options as FindManyOptions<T>);
      }
      return records;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPagination<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    paginate = { page: 1, size: 10 },
    where: FindManyOptions<T> | FilterQuery<T>,
    schemaLessOptions?: SchemaLessOption<T>,
  ): Promise<IPaginationResponse<T>> {
    try {
      let records: Array<T> = [];
      let count = 0;

      const { page, size } = paginate;
      const skip = (page - 1) * size;

      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        const {
          projection = null,
          query = null,
          order = { createdAt: Sort.DESC },
        } = schemaLessOptions || {};
        [records, count] = await Promise.all([
          model.find(where, projection, {
            ...query,
            skip,
            limit: size,
            sort: order,
          }),
          model.countDocuments(where),
        ]);
      } else {
        const repo = this.getRepository(dataSource, entity);
        [records, count] = await repo.findAndCount({
          ...where,
          skip,
          take: size,
        });
      }
      return { results: records, count };
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    payload: PayloadEntity<T> | Exclude<ObjectLiteral, keyof T>[],
  ): Promise<T> {
    try {
      let record: T;
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        record = await model.create(payload);
      } else {
        const repo = this.getRepository(dataSource, entity);
        record = await repo.save<T>(payload as T);
      }

      return record;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async insertMany<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    payload: Exclude<ObjectLiteral, keyof T>[],
  ): Promise<T[]> {
    try {
      let record;
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        record = await model.create(payload);
      } else {
        const repo = this.getRepository(dataSource, entity);
        const insertResult = await repo.insert(payload);
        record = insertResult.raw;
      }

      return record;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    where: FindOptionsWhere<T> | FilterQuery<T>,
    payload: Exclude<ObjectLiteral, keyof T>,
  ): Promise<boolean> {
    try {
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        await model.updateOne(where, payload);
        return true;
      }

      const repo = this.getRepository(dataSource, entity);
      await repo.update(where, payload);

      return true;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMany<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    where: FindOptionsWhere<T> | FilterQuery<T>,
    payload: Exclude<ObjectLiteral, keyof T>,
  ): Promise<boolean> {
    try {
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        await model.updateMany(where, payload);
        return true;
      }

      const repo = this.getRepository(dataSource, entity);
      await repo.update(where, payload);

      return true;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async upsert<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    where: Array<keyof T> | FilterQuery<T>,
    payload:
      | Exclude<ObjectLiteral, keyof T>
      | Exclude<ObjectLiteral, keyof T>[],
  ): Promise<boolean> {
    try {
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        await model.updateOne(where, payload, { upsert: true });
        return true;
      }

      const repo = this.getRepository(dataSource, entity);
      await repo.upsert(payload, { conflictPaths: where as string[] });

      return true;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkUpdate<T>(
    dataSource: DataSource,
    payload: Exclude<ObjectLiteral, keyof T>[],
  ): Promise<boolean> {
    try {
      await dataSource.manager.save(payload);

      return true;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    where: FindOptionsWhere<T> | FilterQuery<T>,
  ): Promise<boolean> {
    try {
      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        await model.deleteOne(where);
        return true;
      }

      const repo = this.getRepository(dataSource, entity);
      await repo.delete(where);

      return true;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async softDelete<T>(
    dataSource: DataSource,
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
  ): Promise<boolean> {
    try {
      const repo = this.getRepository(dataSource, entity);
      await repo.softDelete(where);

      return true;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exist<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    where: FindManyOptions<T> | FilterQuery<T>,
  ): Promise<boolean> {
    try {
      let result = false;

      if (dataSource instanceof Connection) {
        const model = this.getSchemaLessModel(dataSource, entity);
        const resultEntity = await model.exists(where);
        result = resultEntity ? true : false;
      } else {
        const repo = this.getRepository(dataSource, entity);
        result = await repo.exist(where as FindManyOptions<T>);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
