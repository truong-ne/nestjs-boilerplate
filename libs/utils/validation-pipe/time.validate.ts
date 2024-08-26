import { IPagination } from '@lib/common/interfaces';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import * as moment from 'moment';
import { PaginationDTO } from './pagination.validate';

export class TimeFilterDto extends PaginationDTO implements IPagination {
  @ApiPropertyOptional({
    type: Date,
    description: moment().startOf('date').toISOString(),
  })
  @IsDateString()
  @IsOptional()
  startTime: Date;

  @ApiPropertyOptional({
    type: Date,
    description: moment().endOf('date').toISOString(),
  })
  @IsDateString()
  @IsOptional()
  endTime: Date;
}
