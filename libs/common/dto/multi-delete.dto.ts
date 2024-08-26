import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { versionUUID } from '../constants';

export class MultipleDeleteDto {
  @ApiProperty({ required: true, isArray: true, type: String })
  @IsArray()
  @IsUUID(versionUUID, { each: true })
  ids: string[];
}
