import { configuration } from '@lib/config/configuration';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth';
import { LoggerModule } from '@lib/modules';
import { DatabaseModule } from '@lib/core/databases';
import { dbConfig } from '@lib/common';
import { CacheModule } from '@lib/modules/caching';

const modules = [AuthModule, LoggerModule, CacheModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ...DatabaseModule.register({
      dbConfig,
      getConfig: (cf) => (configService: ConfigService) => {
        const schemaDbConfig = configService.get(cf);
        return schemaDbConfig;
      },
    }),
    ...modules,
  ],
})
export class AppModule {}