import { ormMapping } from '@lib/common/constants';
import { DbConfig } from '@lib/common/enums';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as entities from '@lib/core/databases/postgres';

export class DatabaseHelper {
  static mapEntities(entities: IEntitiesMapMetadata) {
    const map = [];
    for (const database in entities) {
      const getValue = entities[database];
      map.push(ormMapping[database].forFeature(getValue));
    }
    if (map.length <= 0) console.info('Empty entities map !!!!!');
    return map;
  }

  static getEntitiesPostgres() {
    const entitiesArr = [];

    for (const entity in entities) {
      entitiesArr.push(entities[entity]);
    }

    return entitiesArr;
  }
}

export const getDatabaseConfig =
  (cf: DbConfig, isSql: boolean) => (configService: ConfigService) => {
    const schemaDbConfig = configService.get(cf);

    if (!isSql)
      return Object.assign(
        {},
        schemaDbConfig,
        schemaDbConfig?.replication?.master,
      );

    const postgresConfig = configService.get<PostgresConnectionOptions>(
      DbConfig.Postgres,
    );

    const config = Object.assign(
      postgresConfig,
      { database: schemaDbConfig },
      schemaDbConfig?.replication?.master,
    );

    return config;
  };
