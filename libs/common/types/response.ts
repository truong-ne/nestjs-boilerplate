import { IGatewayError } from '../interfaces/request';

export type ResponseResult<T> = T | IGatewayError;
