import { RMQ_ROUTES_EXCHANGE } from '@lib/common/index';
import { SetMetadata, applyDecorators } from '@nestjs/common';

export const RMQExchange = (exchange: string): MethodDecorator => {
  return applyDecorators(SetMetadata(RMQ_ROUTES_EXCHANGE, exchange));
};
