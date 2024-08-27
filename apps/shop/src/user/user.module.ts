import { DbName } from '@lib/common/enums';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { DatabaseHelper } from '@lib/utils/helpers';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

const entities: IEntitiesMapMetadata = {
  [DbName.Postgres]: DatabaseHelper.getEntitiesPostgres(),
};

@Module({
  imports: [...DatabaseHelper.mapEntities(entities)],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
