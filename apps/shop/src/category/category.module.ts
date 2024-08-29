import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { DatabaseHelper } from '@lib/utils/helpers';
import { DbName } from '@lib/common/enums';

const entities: IEntitiesMapMetadata = {
  [DbName.Postgres]: DatabaseHelper.getEntitiesPostgres(),
};

@Module({
  imports: [...DatabaseHelper.mapEntities(entities)],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
