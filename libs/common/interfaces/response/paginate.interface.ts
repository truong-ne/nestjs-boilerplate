import { HttpStatus } from '@nestjs/common';

export interface IPaginationResponse<T> {
  results: T[];
  count: number;
}

export interface IGRPCResponse {
  errors: Array<unknown> | unknown;
  status: HttpStatus;
  data: unknown;
}
