import {
  EDiscountStatus,
  EDiscountType,
  EDiscountUnit,
} from '@lib/core/databases/postgres/enums/entity.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class DiscountDto {
  @IsString()
  @ApiProperty({ example: 'Giảm Giá Khai Trương Chi Nhánh' })
  label: string;

  @IsString()
  @ApiProperty({ example: 'KHAITRUONG' })
  code: string;

  @IsNumber()
  @ApiProperty({ example: 50000 })
  value: number;

  @IsEnum(EDiscountUnit)
  @ApiProperty({ example: EDiscountUnit.VND })
  unit: EDiscountUnit;

  @IsOptional()
  @ApiProperty({ example: 1000 })
  quantity: number;

  @IsEnum(EDiscountType)
  @ApiProperty({ example: EDiscountType.Limit })
  type: EDiscountType;

  @IsOptional()
  @ApiProperty({ example: 50 })
  point: number;

  @IsEnum(EDiscountStatus)
  @ApiProperty({ example: EDiscountStatus.Active })
  status: EDiscountStatus;

  @IsDateString()
  @ApiProperty({ example: new Date() })
  expiredAt: Date;
}

export class DiscountQuery {
  @Type(() => String)
  @IsOptional()
  @ApiProperty({ example: 'khai trương', required: false })
  search: string;

  @Type(() => String)
  @IsOptional()
  @ApiProperty({
    example: EDiscountUnit.VND,
    required: false,
    enum: EDiscountUnit,
  })
  unit: EDiscountUnit;

  @Type(() => String)
  @IsOptional()
  @ApiProperty({
    example: EDiscountType.Limit,
    required: false,
    enum: EDiscountType,
  })
  type: EDiscountType;

  @Type(() => String)
  @IsOptional()
  @ApiProperty({
    example: EDiscountStatus.Active,
    required: false,
    enum: EDiscountStatus,
  })
  status: EDiscountStatus;

  @Type(() => Number)
  @Min(1)
  @ApiProperty({ example: 1, required: true })
  page: number;

  @Type(() => Number)
  @Min(5)
  @ApiProperty({ example: 5, required: true })
  size: number;
}
