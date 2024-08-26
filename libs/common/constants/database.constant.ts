import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfig, DbName } from '../enums';

export const dbConfig: Partial<Record<DbName, DbConfig>> = {
  [DbName.Postgres]: DbConfig.Postgres,
};

export const ormMapping = {
  [DbName.Postgres]: TypeOrmModule,
};

export const versionUUID = '4';
export const versionIP = '4';
