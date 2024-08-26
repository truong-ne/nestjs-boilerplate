import { ServiceName } from '@lib/common/enums';
import { IPatternMessage } from '@lib/common/interfaces/services';
import {
  HttpException,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ServiceProviderBuilder implements OnApplicationShutdown {
  private instances: Map<string, ClientProxy> = new Map();

  constructor(private readonly config: ConfigService) {}

  onApplicationShutdown() {
    this.instances.clear();
  }

  createInstance(service: string) {
    if (this.instances.has(service)) return this.instances.get(service);
    const client = ClientProxyFactory.create(
      this.config.get(`services.${service}`),
    );
    this.instances.set(service, client);
    return client;
  }

  async sendMessage(
    service: ServiceName,
    message: unknown,
    pattern: IPatternMessage,
  ) {
    const response = this.createInstance(service).send(pattern, message).pipe();
    const dataResult = await lastValueFrom(response);
    const { errorMessage = null, errorCode, data = null } = dataResult;

    if (errorMessage)
      throw new HttpException({ message: errorMessage, data }, errorCode);

    return dataResult;
  }
}
