import { LoggerService } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Channel, Message, Options } from 'amqplib';
import { ConnectionOptions } from 'tls';

export enum RMQProtocol {
  AMQP = 'amqp',
  AMQPS = 'amqps',
}

export interface IRMQServiceOptions {
  exchangeName?: string;
  connection: IRMQConnection;
  queueName: string;
  receiveOnly?: boolean;
  replyQueue: string;
  queueArguments?: {
    [key: string]: string;
  };
  connectionOptions?: ConnectionOptions & {
    noDelay?: boolean;
    timeout?: number;
    keepAlive?: boolean;
    keepAliveDelay?: number;
    clientProperties?: any;
    credentials?: {
      mechanism: string;
      username: string;
      password: string;
      response: () => Buffer;
    };
  };
  prefetchCount?: number;
  isGlobalPrefetchCount?: boolean;
  queueOptions?: Options.AssertQueue;
  isQueueDurable?: boolean;
  isExchangeDurable?: boolean;
  assertExchangeType?: Parameters<Channel['assertExchange']>[1];
  exchangeOptions?: Options.AssertExchange;
  reconnectTimeInSeconds?: number;
  heartbeatIntervalInSeconds?: number;
  messagesTimeout?: number;
  logMessages?: boolean;
  logger?: LoggerService;
  serviceName?: string;
  autoBindingRoutes?: boolean;
}

export interface IRMQConnection {
  user: string;
  password: string;
  host: string;
  protocol?: RMQProtocol;
  port?: number;
  vhost?: string;
}

export interface IRMQServiceAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<IRMQServiceOptions> | IRMQServiceOptions;
  inject?: any[];
}

export interface IPublishOptions extends Options.Publish {
  timeout?: number;
}

export interface IRouteOptions {
  manualAck?: boolean;
  messageFactory?: (message: Message) => any[];
}
