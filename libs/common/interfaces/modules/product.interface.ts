import { Product } from '@lib/core/databases/postgres';
import { OrderFields, QueryFields } from '../request';

export interface IQueryFieldProduct extends QueryFields<Product> {
  search?: string;
}

export interface IQueryProduct {
  queryFields: IQueryFieldProduct;
  orderFields: OrderFields<Product>;
}
