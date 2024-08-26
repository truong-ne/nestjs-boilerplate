import {
  CONNECT_EVENT,
  CONNECT_FAILED,
  CONNECT_FAILED_MESSAGE,
  DEFAULT_HEARTBEAT_TIME,
  DEFAULT_RECONNECT_TIME,
  DEFAULT_TIMEOUT,
  DISCONNECT_EVENT,
  DISCONNECT_MESSAGE,
  RMQ_MODULE_OPTIONS,
  WRONG_CREDENTIALS_MESSAGE,
} from '@lib/common/constants';
import { ExchangeType, ResponseEmitterResult } from '@lib/common/enums';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { Channel, Message } from 'amqplib';
import { LoggerService } from '../../logger';
import { replyEmitter, requestEmitter, responseEmitter } from '../emitters';
import {
  IPublishOptions,
  IRMQServiceOptions,
  RMQProtocol,
} from '../interfaces';
import { IRMQService } from '../interfaces/service.interface';
import { RMQMetadataAccessor } from './metadata-accessor.service';
import { CommonHelper } from '@lib/utils/helpers';

@Injectable()
export class RMQService implements OnModuleInit, OnModuleDestroy, IRMQService {
  private readonly serviceName: string = RMQService.name;
  private readonly logger: LoggerService;

  private connection: AmqpConnectionManager = null;
  private consumerChannel: ChannelWrapper = null;
  private producerChannel: ChannelWrapper = null;
  private options: IRMQServiceOptions;
  private routes: string[];
  private exchangeRoutes: Map<string, string[]> = new Map();

  constructor(
    @Inject(RMQ_MODULE_OPTIONS) options: IRMQServiceOptions,
    private readonly metadataAccessor: RMQMetadataAccessor,
    logger: LoggerService,
  ) {
    this.options = options;
    this.logger = logger;
    this.logger.setContext(this.serviceName);
  }

  async onModuleInit() {
    await this.init();
  }

  async onModuleDestroy() {
    responseEmitter.removeAllListeners();
    replyEmitter.removeAllListeners();
    await this.consumerChannel.close();
    await this.producerChannel.close();
    await this.connection.close();
  }

  async init(): Promise<void> {
    try {
      await this.connect();
      const { receiveOnly = false } = this.options;

      this.connection.on(CONNECT_EVENT, () => {
        this.attachEmitters();
        this.logger.log('Connecting RabbitMQ Succeed');
      });

      this.connection.on(DISCONNECT_EVENT, (err) => {
        responseEmitter.removeAllListeners();
        this.logger.error(DISCONNECT_MESSAGE);
        this.logger.error(err.err);
      });

      this.connection.on(CONNECT_FAILED, (err) => {
        this.logger.error(CONNECT_FAILED_MESSAGE);
        this.logger.error(err.err);
        if (
          err.err.message.includes('ACCESS-REFUSED') ||
          err.err.message.includes('403')
        ) {
          this.logger.error(WRONG_CREDENTIALS_MESSAGE);
        }
      });

      await Promise.all([
        !receiveOnly && this.initProducerChannel(),
        this.initConsumerChannel(),
      ]);
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async initConsumerChannel() {
    try {
      if (!this.connection || !this.options)
        throw new Error('Invalid connection');

      const {
        queueName,
        queueArguments,
        queueOptions,
        exchangeName,
        exchangeOptions,
      } = this.options;

      this.consumerChannel = this.connection.createChannel({
        json: false,
        setup: async (channel: Channel) => {
          const [queue] = await Promise.all([
            channel.assertQueue(queueName, {
              durable: true,
              arguments: queueArguments ?? {},
              ...queueOptions,
            }),
            channel.assertExchange(exchangeName, ExchangeType.Topic, {
              durable: true,
              ...exchangeOptions,
            }),
          ]);

          this.options.queueName = queue.queue;
          this.routes = this.metadataAccessor.getAllRMQPaths();
          this.exchangeRoutes = this.metadataAccessor.getAllRMQExchanges();

          await this.bindRoutes(channel);

          await channel.consume(
            queue.queue,
            async (message: Message) => {
              const route = this.getRouteByTopic(message.fields.routingKey);

              if (route) {
                requestEmitter.emit(route, message);
              } else {
                this.reply(new Error('Not found routing'), message);
                this.ack(message);
              }
            },
            { noAck: false },
          );
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async initProducerChannel() {
    try {
      if (!this.connection || !this.options)
        throw new Error('Invalid connection');

      const { replyQueue: replyQueueName } = this.options;

      this.producerChannel = this.connection.createChannel({
        json: false,
        setup: async (channel: Channel) => {
          const replyQueue = await channel.assertQueue(replyQueueName, {
            durable: true,
          });

          this.options.replyQueue = replyQueue.queue;

          await channel.consume(
            replyQueue.queue,
            (message: Message) => {
              replyEmitter.emit(message.properties.correlationId, message);
            },
            {
              noAck: true,
            },
          );
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async connect(): Promise<AmqpConnectionManager> {
    try {
      if (this.connection !== null) return this.connection;
      if (!this.options || !this.options.connection) return null;

      const { connectionOptions, serviceName } = this.options;
      const {
        user,
        password,
        host,
        port,
        vhost,
        protocol = null,
      } = this.options.connection;

      const connectString = `${
        protocol ?? RMQProtocol.AMQP
      }://${user}:${password}@${host}:${port}/${vhost}`;

      const AMQPConnectionOptions: amqp.AmqpConnectionManagerOptions = {
        reconnectTimeInSeconds:
          this.options.reconnectTimeInSeconds ?? DEFAULT_RECONNECT_TIME,
        heartbeatIntervalInSeconds:
          this.options.heartbeatIntervalInSeconds ?? DEFAULT_HEARTBEAT_TIME,
        connectionOptions:
          {
            ...connectionOptions,
            clientProperties: { connection_name: serviceName },
          } ?? {},
      };

      const server = amqp.connect(connectString, AMQPConnectionOptions);
      this.connection = server;

      return server;
    } catch (error) {
      this.logger.error(error?.message);
      return null;
    }
  }

  private attachEmitters(): void {
    responseEmitter.on(
      ResponseEmitterResult.success,
      async (message, result) => {
        this.reply(result, message);
      },
    );
    responseEmitter.on(ResponseEmitterResult.error, async (message, err) => {
      this.reply(err, message);
    });
    responseEmitter.on(ResponseEmitterResult.ack, async (message) => {
      this.ack(message);
    });
  }

  private async reply(res: any, message: Message) {
    await this.consumerChannel.sendToQueue(
      message.properties.replyTo,
      Buffer.from(JSON.stringify(res)),
      { correlationId: message.properties.correlationId },
    );
  }

  private getRouteByTopic(topic: string): string {
    return this.routes.find((route) => {
      if (route === topic) {
        return true;
      }
      const regexString =
        '^' + route.replace(/\*/g, '([^.]+)').replace(/#/g, '([^.]+.?)+') + '$';
      return topic.search(regexString) !== -1;
    });
  }

  public ack(
    ...params: Parameters<Channel['ack']>
  ): ReturnType<Channel['ack']> {
    return this.consumerChannel.ack(...params);
  }

  public async sendToExchange<IMessage, IReply>(
    exchange: string,
    topic: string,
    message: IMessage,
    options?: IPublishOptions,
  ): Promise<IReply> {
    return new Promise<IReply>(async (resolve, reject) => {
      if (!this.connection) reject();
      const correlationId = `${
        this.serviceName
      }_${CommonHelper.generateUnique()}`;

      const timerOutId = setTimeout(() => {
        replyEmitter.removeListener(correlationId, () => {});
      }, DEFAULT_TIMEOUT);

      replyEmitter.once(correlationId, (message: Message) => {
        clearTimeout(timerOutId);
        const { content } = message;
        if (content.toString()) {
          resolve(JSON.parse(content.toString()));
        } else {
          reject();
        }
      });

      const { exchangeName, serviceName, replyQueue } = this.options;

      try {
        await this.producerChannel.publish(
          exchange || exchangeName,
          topic,
          Buffer.from(JSON.stringify(message)),
          {
            replyTo: replyQueue,
            appId: serviceName,
            timestamp: new Date().getTime(),
            correlationId,
            ...options,
          },
        );
      } catch (err) {
        this.logger.error(err);
      }
    });
  }

  public async sendToQueue<IMessage, IReply>(
    queue: string,
    message: IMessage,
    options?: IPublishOptions,
  ): Promise<IReply> {
    return new Promise<IReply>(async (resolve, reject) => {
      if (!this.connection) reject();
      const correlationId = `${
        this.serviceName
      }_${CommonHelper.generateUnique()}`;

      replyEmitter.once(correlationId, (message: Message) => {
        if (message.properties?.headers?.['-x-error']) reject();

        const { content } = message;
        if (content.toString()) {
          resolve(JSON.parse(content.toString()));
        } else {
          reject(new Error(`${this.serviceName}: Empty content`));
        }
      });

      try {
        await this.producerChannel.sendToQueue(
          queue,
          Buffer.from(JSON.stringify(message)),
          {
            replyTo: this.options.replyQueue,
            appId: this.options.serviceName,
            timestamp: new Date().getTime(),
            correlationId,
            ...options,
          },
        );
      } catch (err) {
        this.logger.error(err);
      }
    });
  }

  private async bindRoutes(channel: Channel) {
    if (!this.options) return;
    const { queueName, exchangeName } = this.options;

    if (this.routes.length > 0) {
      await Promise.all(
        this.routes.map((route) => {
          channel.bindQueue(queueName, exchangeName, route);
        }),
      );
    }

    if (this.exchangeRoutes.size > 0) {
      const promise = [];
      this.exchangeRoutes.forEach((routes, exchange) => {
        if (routes.length > 0) {
          this.routes = this.routes.concat(routes);
          routes.map((route) => {
            promise.push(channel.bindQueue(queueName, exchange, route));
          });
        }
      });
      await Promise.all(promise);
    }
  }
}
