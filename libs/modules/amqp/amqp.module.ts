import { RMQ_MODULE_OPTIONS } from '@lib/common/index';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { LoggerModule } from '../logger';
import { IRMQServiceAsyncOptions } from './interfaces';
import { RMQExplorer, RMQMetadataAccessor, RMQService } from './services';

@Global()
@Module({
  imports: [DiscoveryModule, LoggerModule],
  providers: [RMQExplorer, RMQMetadataAccessor],
})
export class RMQModule {
  static forRootAsync(options: IRMQServiceAsyncOptions): DynamicModule {
    const asyncOptions = this.createAsyncOptionsProvider(options);
    return {
      module: RMQModule,
      imports: options.imports,
      providers: [RMQService, asyncOptions],
      exports: [RMQService],
    };
  }

  private static createAsyncOptionsProvider(
    options: IRMQServiceAsyncOptions,
  ): Provider {
    return {
      provide: RMQ_MODULE_OPTIONS,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        return config;
      },
      inject: options.inject || [],
    };
  }
}
