import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { DatabaseHelper } from '@lib/utils/helpers';
import { DbName } from '@lib/common/enums';

const entities: IEntitiesMapMetadata = {
  [DbName.Postgres]: DatabaseHelper.getEntitiesPostgres(),
};

@Module({
  imports: [...DatabaseHelper.mapEntities(entities)],
  controllers: [BillController],
  providers: [BillService],
})
export class BillModule {}
