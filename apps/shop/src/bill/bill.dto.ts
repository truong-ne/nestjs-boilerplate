import { PaginateDto } from '@lib/common/dto';
import {
  EBillMethod,
  EBillStatus,
  EDeliveryUnit,
} from '@lib/core/databases/postgres/enums/entity.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class OrderItemDto {
  @IsString()
  @ApiProperty({ example: 'styleId' })
  style: string;

  @IsNumber()
  @ApiProperty({ example: 3 })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 900000 })
  price: number;
}

export class BillDto {
  @IsEnum(EBillMethod)
  @ApiProperty({ example: EBillMethod.COD })
  method: EBillMethod;

  @IsEnum(EDeliveryUnit)
  @ApiProperty({ example: EDeliveryUnit.Grab })
  delivery: EDeliveryUnit;

  @IsString()
  @ApiProperty({ example: 'addressId' })
  address: string;

  @IsArray()
  @ApiProperty({
    isArray: true,
    example: [
      {
        style: 'styleId',
        quantity: 3,
      },
    ],
  })
  orderItems: OrderItemDto[];

  @IsOptional()
  @ApiProperty({ example: 1000 })
  point: number;

  @IsOptional()
  @ApiProperty({ example: 'PODSTREETVN' })
  code: string;
}

export class ChangeBillStatusDto {
  @IsEnum(EBillStatus)
  @ApiProperty({ example: EBillStatus.Confirm })
  status: EBillStatus;

  @IsEnum(EBillMethod)
  @ApiProperty({ example: EBillMethod.COD })
  method: EBillMethod;

  @IsEnum(EDeliveryUnit)
  @ApiProperty({ example: EDeliveryUnit.Grab })
  delivery: EDeliveryUnit;
}

export class BillQuery extends PaginateDto {
  @Type(() => String)
  @IsOptional()
  @ApiProperty({ enum: EBillStatus, required: false })
  status: EBillStatus;

  @Type(() => String)
  @IsOptional()
  @ApiProperty({ enum: EBillMethod, required: false })
  method: EBillMethod;

  @Type(() => String)
  @IsOptional()
  @ApiProperty({ enum: EDeliveryUnit, required: false })
  delivery: EDeliveryUnit;
}
