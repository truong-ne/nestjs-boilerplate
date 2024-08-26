import { Channel } from 'amqplib';
import { IPublishOptions } from './options.interface';

export interface IRMQService {
  init: () => Promise<void>;
  ack: (...params: Parameters<Channel['ack']>) => ReturnType<Channel['ack']>;
  sendToExchange: <IMessage, IReply>(
    exchange: string,
    topic: string,
    message: IMessage,
    options?: IPublishOptions,
  ) => Promise<IReply>;
  sendToQueue<IMessage, IReply>(
    queue: string,
    message: IMessage,
    options?: IPublishOptions,
  ): Promise<IReply>;
}
