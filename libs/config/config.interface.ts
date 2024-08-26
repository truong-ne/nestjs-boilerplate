import type { config as base } from './envs/default';
import type { config as development } from './envs/development';
import type { strategy as external } from './envs/external';

export type ObjectType = Record<string, unknown>;
export type Default = typeof base;
export type Development = typeof development;
export type External = typeof external;
export type Config = Default & External;
