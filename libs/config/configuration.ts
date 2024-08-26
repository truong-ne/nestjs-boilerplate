import type {
  Config,
  Default,
  Development,
  ObjectType,
} from './config.interface';

const util = {
  isObject<T>(value: T): value is T & ObjectType {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },
  merge<T extends ObjectType, U extends ObjectType>(
    target: T,
    source: U,
  ): T & U {
    for (const key of Object.keys(source)) {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (this.isObject(targetValue) && this.isObject(sourceValue)) {
        Object.assign(sourceValue, this.merge(targetValue, sourceValue));
      }
    }
    return { ...target, ...source };
  },
};

export const configuration = async (): Promise<Config | Default> => {
  const { strategy } = await import('@lib/config/envs/external');

  const { config } = <{ config: Default }>(
    await import('@lib/config/envs/default')
  );

  const { config: environment } = <{ config: Development }>(
    await import('@lib/config/envs/development')
  );

  return [environment, strategy].reduce((prev, current) => {
    return util.merge(prev, current);
  }, config);
};
