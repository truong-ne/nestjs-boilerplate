import {
  FunctionType,
  RMQ_ROUTES_EXCHANGE,
  RMQ_ROUTES_META,
  RMQ_ROUTES_META_EXCHANGE,
  RMQ_ROUTES_OPTIONS,
  RMQ_ROUTES_PATH,
} from '@lib/common/index';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IRouteOptions } from '../interfaces';
import { RMQService } from './amqp.service';

@Injectable()
export class RMQMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getRMQPath(target: FunctionType): string | undefined {
    return this.reflector.get(RMQ_ROUTES_PATH, target);
  }

  getRMQExchange(target: FunctionType): string | undefined {
    return this.reflector.get(RMQ_ROUTES_EXCHANGE, target);
  }

  getAllRMQPaths(): string[] {
    return Reflect.getMetadata(RMQ_ROUTES_META, RMQService) ?? [];
  }

  addRMQPath(path: string): void {
    const paths: string[] = this.getAllRMQPaths();
    paths.push(path);
    Reflect.defineMetadata(RMQ_ROUTES_META, paths, RMQService);
  }

  getAllRMQExchanges(): Map<string, string[]> {
    return (
      Reflect.getMetadata(RMQ_ROUTES_META_EXCHANGE, RMQService) ??
      new Map<string, string[]>()
    );
  }

  addRMQExchangePath(exchange: string, path: string): void {
    const exchangeMap: Map<string, string[]> = this.getAllRMQExchanges();
    const paths: string[] = exchangeMap.get(exchange) || [];

    paths.push(path);
    exchangeMap.set(exchange, paths);

    Reflect.defineMetadata(RMQ_ROUTES_META_EXCHANGE, exchangeMap, RMQService);
  }

  getRMQOptions(target: FunctionType): IRouteOptions | undefined {
    return this.reflector.get(RMQ_ROUTES_OPTIONS, target);
  }
}
