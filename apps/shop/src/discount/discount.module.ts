import { DbName } from '@lib/common/enums';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { DatabaseHelper } from '@lib/utils/helpers';
import { Module } from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';

const entities: IEntitiesMapMetadata = {
  [DbName.Postgres]: DatabaseHelper.getEntitiesPostgres(),
};

@Module({
  imports: [...DatabaseHelper.mapEntities(entities)],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule {}
