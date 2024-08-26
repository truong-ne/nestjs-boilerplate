import { ormMapping } from '@lib/common/constants';
import { DbConfig, DbName } from '@lib/common/enums';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type options = {
  dbConfig: Partial<Record<DbName, DbConfig>>;
  getConfig: (cf: DbConfig, isSql: boolean) => (a: ConfigService) => any;
};

@Module({})
export class DatabaseModule {
  static register(options: options): DynamicModule[] {
    const modules = [];

    for (const database in options.dbConfig) {
      const orm = ormMapping[database];
      const config = options.dbConfig[database];

      // let identityName = 'connectionName';
      // const isSql = orm === TypeOrmModule;
      // if (isSql) identityName = 'name';

      modules.push(
        orm.forRootAsync({
          // [identityName]: database,
          useFactory: options.getConfig(config, true),
          inject: [ConfigService],
        }),
      );
    }

    if (modules.length <= 0) console.info('Empty import ORM modules !!!');

    return modules;
  }
}
