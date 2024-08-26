import { IPaginationResponse } from '@lib/common/interfaces';
import {
  Connection,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  SortOrder,
} from 'mongoose';
import {
  DataSource,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export type PayloadEntity<T> =
  | QueryDeepPartialEntity<T>
  | QueryDeepPartialEntity<T>[];

export type DatabaseConnection = DataSource | Connection;

export type SchemaLessOption<T> = {
  projection?: ProjectionType<T>;
  query?: QueryOptions<T>;
  order?: Record<string, SortOrder>;
};

export interface IBaseRepositoryImpl {
  getSchemaLessModel<T>(
    dataSource: Connection,
    entity: EntityTarget<T>,
  ): Model<T>;
  checkKeyExistInEntity<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    key: string,
  ): boolean;
  createInstance<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    payload: T,
  ): T;
  getRepository<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
  ): Repository<T>;
  getOne<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    where: FindOneOptions<T> | FilterQuery<T>,
  ): Promise<T | null>;
  getMany<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    where: FindManyOptions<T> | FilterQuery<T>,
    schemaLessOptions?: SchemaLessOption<T>,
  ): Promise<T[]>;
  getPagination<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    paginate: { page: number; size: number },
    options: FindManyOptions<T> | FilterQuery<T>,
    schemaLessOptions?: SchemaLessOption<T>,
  ): Promise<IPaginationResponse<T>>;
  create<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    payload: PayloadEntity<T>,
  ): Promise<T>;
  insertMany<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    payload: Array<Exclude<ObjectLiteral, keyof T>>,
  ): Promise<T[]>;
  update<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T> | FilterQuery<T>,
    payload: Exclude<ObjectLiteral, keyof T>,
  ): Promise<boolean>;
  updateMany<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T> | FilterQuery<T>,
    payload: Exclude<ObjectLiteral, keyof T>,
  ): Promise<boolean>;
  upsert<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T> | string,
    where: string[] | FilterQuery<T>,
    payload: Exclude<ObjectLiteral, keyof T>,
  ): Promise<boolean>;
  bulkUpdate<T>(
    dataSource: DataSource,
    payload: Array<Exclude<ObjectLiteral, keyof T>>,
  ): Promise<boolean>;
  delete<T>(
    dataSource: DatabaseConnection,
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T> | FilterQuery<T>,
  ): Promise<boolean>;
  softDelete<T>(
    dataSource: DataSource,
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
  ): Promise<boolean>;
  exist<T>(
    dataSource: DataSource,
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
  ): Promise<boolean>;
}
