import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { DatabaseHelper } from '@lib/utils/helpers';
import { DbName } from '@lib/common/enums';

const entities: IEntitiesMapMetadata = {
  [DbName.Postgres]: DatabaseHelper.getEntitiesPostgres(),
};

@Module({
  imports: [...DatabaseHelper.mapEntities(entities)],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
