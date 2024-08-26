import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'libs/modules';
import { isNumber } from 'lodash';
import { RedisClientOptions, createClient } from 'redis';
export type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class CacheService implements OnModuleInit, OnApplicationShutdown {
  private redisClient: RedisClient;
  private callingMaps: Map<string, Promise<unknown>> = new Map();
  private readonly defaultRetryDelay: number = 500;
  private readonly defaultTimeout: number = 5000;
  private readonly defaultMaxRetry: number = 36000;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CacheService.name);
  }

  async onModuleInit() {
    this.redisClient = await this.getInstance();

    this.redisClient.on('error', (err) =>
      this.logger.error(`Redis Error: ${err}`),
    );
    this.redisClient.on('connect', () => this.logger.log('Redis connected'));
    this.redisClient.on('reconnecting', () =>
      this.logger.warn('Redis reconnecting'),
    );
    this.redisClient.on('ready', () => {
      this.logger.log('Redis is ready!');
    });

    await this.redisClient.connect();
  }

  async onApplicationShutdown() {
    this.callingMaps.clear();
    await this.redisClient.disconnect();
  }

  async createInstance(): Promise<RedisClient> {
    try {
      const options = this.configService.get<RedisClientOptions>('cache');
      const instance = createClient(options);

      this.redisClient = instance;

      return instance;
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  async getInstance(): Promise<RedisClient> {
    try {
      if (!this.redisClient) this.redisClient = await this.createInstance();
      return this.redisClient;
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  async set<T>(key: string, payload: string | T, ttl?: number) {
    try {
      let value = payload;
      if (typeof value !== 'string') value = JSON.stringify(payload);

      const result =
        isNumber(ttl) && ttl > 0
          ? await this.redisClient.set(key, value, { EX: ttl })
          : await this.redisClient.set(key, value, { KEEPTTL: true });
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async increase(key: string, value = 1): Promise<number> {
    try {
      const check = await this.redisClient.get(key);

      if (!check) {
        await this.set(key, 1);
        return 1;
      }

      const result = await this.redisClient.incrBy(key, value);

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async decrease(key: string, value = 1): Promise<number> {
    try {
      const check = await this.redisClient.get(key);

      if (!check) {
        await this.set(key, 0);
        return 0;
      }

      const result = await this.redisClient.decrBy(key, value);

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async get(key: string): Promise<string> {
    try {
      const value = await this.redisClient.get(key);
      return value;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getKeysValues(prefix: string): Promise<Map<string, string>> {
    try {
      let map = new Map<string, string>();

      const keys = await this.redisClient.keys(`${prefix}*`);
      if (keys.length === 0) return map;

      const values = await this.redisClient.mGet(keys);

      map = new Map(keys.map((key, index) => [key, values[index]]));

      return map;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(key: string | string[]) {
    try {
      const result = await this.redisClient.del(key);
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteWithPrefix(prefix: string) {
    try {
      const keysDelete = await this.redisClient.keys(`${prefix}*`);
      let result = 0;
      if (keysDelete.length > 0) {
        result = await this.redisClient.del(keysDelete);
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    getData: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value: string | T = await this.get(key);

    if (value !== null) return JSON.parse(value);
    if (this.callingMaps.has(key))
      return this.callingMaps.get(key) as Promise<T>;

    try {
      const promise: Promise<T> = getData();
      this.callingMaps.set(key, promise);
      value = await promise;
    } finally {
      this.callingMaps.delete(key);
    }

    await this.set(key, value, ttl);
    return value;
  }

  async getAllKeyWithPrefix(prefix: string) {
    try {
      const results = await this.redisClient.keys(`${prefix}*`);
      return results;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error?.message || null,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async acquireLock(
    key: string,
    timeout: number,
    retryDelay = this.defaultRetryDelay,
    onLockAcquired: (timeout: number) => void,
    maxRetryTimes: number = this.defaultMaxRetry,
  ) {
    let retryTime = 0;
    const retry = () => {
      setTimeout(() => {
        this.acquireLock(key, timeout, retryDelay, onLockAcquired);
      }, retryDelay);
    };

    const lockTimeoutValue = Date.now() + timeout + 1;
    try {
      const result = await this.redisClient.set(key, lockTimeoutValue, {
        PX: timeout,
        NX: true,
      });

      if (result === null) throw new ConflictException('Lock failed');

      onLockAcquired(lockTimeoutValue);
    } catch (err) {
      retry();
      if (retryTime >= maxRetryTimes)
        throw new ConflictException('Locked timeout');
      retryTime++;
    }
  }

  async lock(
    key: string,
    timeout = this.defaultTimeout,
  ): Promise<() => Promise<unknown>> {
    return new Promise((resolve) => {
      if (!key) throw new ConflictException('Invalid key');
      key = `lock.${key}`;

      const lockTimeoutValue = (timeoutValue: number) => {
        const unlockFunc = async () => {
          if (timeoutValue > Date.now()) {
            return this.redisClient.del(key);
          }
        };
        resolve(unlockFunc);
      };

      this.acquireLock(key, timeout, this.defaultRetryDelay, lockTimeoutValue);
    });
  }
}
