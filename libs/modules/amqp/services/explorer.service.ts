import { ResponseEmitterResult } from '@lib/common/enums';
import { FunctionType } from '@lib/common/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Message } from 'amqplib';
import { requestEmitter, responseEmitter } from '../emitters';
import { IRouteOptions } from '../interfaces';
import { RMQMetadataAccessor } from './metadata-accessor.service';

@Injectable()
export class RMQExplorer implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: RMQMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit() {
    this.explore();
  }

  explore() {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ];

    instanceWrappers.forEach((wrapper: InstanceWrapper) => {
      try {
        const { instance } = wrapper;
        if (!instance || !Object.getPrototypeOf(instance)) {
          return;
        }

        const methods = this.metadataScanner.getAllMethodNames(instance);
        methods.map((method) => this.lookupRMQRoute(instance, method));
      } catch (error) {
        return;
      }
    });
  }

  lookupRMQRoute(instance: Record<string, FunctionType>, key: string) {
    const methodRef = instance[key];
    const options = this.metadataAccessor.getRMQOptions(methodRef);
    const path = this.metadataAccessor.getRMQPath(methodRef);
    const exchange = this.metadataAccessor.getRMQExchange(methodRef);

    if (!path || !options) return;

    if (exchange) {
      this.metadataAccessor.addRMQExchangePath(exchange, path);
    } else {
      this.metadataAccessor.addRMQPath(path);
    }

    this.attachEmitter(path, options, instance, methodRef);
  }

  private attachEmitter(
    path: string,
    options: IRouteOptions,
    instance: Record<string, FunctionType>,
    methodRef: FunctionType,
  ) {
    if (requestEmitter.eventNames().includes(path)) return;

    requestEmitter.on(path, async (message: Message) => {
      try {
        const funcArgs = [JSON.parse(message.content.toString())];
        const result = await methodRef.apply(instance, funcArgs);

        if (message.properties.replyTo && result) {
          responseEmitter.emit(ResponseEmitterResult.success, message, result);
        }

        if (message.properties.replyTo && result === undefined) {
          responseEmitter.emit(
            ResponseEmitterResult.error,
            message,
            new Error('Invalid reply to'),
          );
        }
      } catch (err) {
        if (message.properties.replyTo) {
          responseEmitter.emit(ResponseEmitterResult.error, message, err);
        }
      }
      if (!options?.manualAck) {
        responseEmitter.emit(ResponseEmitterResult.ack, message);
      }
    });
  }
}
