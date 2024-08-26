import { RMQ_ROUTES_OPTIONS, RMQ_ROUTES_PATH } from '@lib/common/index';
import { SetMetadata, applyDecorators } from '@nestjs/common';
import { IRouteOptions } from '../interfaces';

export const RMQRoute = (
  topic: string,
  options?: IRouteOptions,
): MethodDecorator => {
  return applyDecorators(
    SetMetadata(RMQ_ROUTES_OPTIONS, {
      ...options,
    }),
    SetMetadata(RMQ_ROUTES_PATH, topic),
  );
};
