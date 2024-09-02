import { PaginateDto } from '@lib/common/dto';
import { Sort } from '@lib/common/enums';
import {
  IQueryFieldProduct,
  IQueryProduct,
  OrderFields,
} from '@lib/common/interfaces';
import { Product } from '@lib/core/databases/postgres';
import {
  EProductLabel,
  EStyle,
} from '@lib/core/databases/postgres/enums/entity.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StyleDto {
  @IsString()
  @ApiProperty({ example: 'Cam' })
  label: string;

  @IsEnum(EStyle)
  @ApiProperty({ enum: EStyle, example: EStyle.Color })
  style: EStyle;

  @IsString()
  @ApiProperty({ example: 'product/:id/:key' })
  image: string;

  @IsNumber()
  @ApiProperty({ example: 10 })
  quantity: number;
}

export class UpdateStyleDto extends StyleDto {
  @IsString()
  @ApiProperty({ example: 'styleId' })
  id: string;
}

export class ProductDto {
  @IsString()
  @ApiProperty({ example: 'product/:id/main' })
  image: string;

  @IsString()
  @ApiProperty({ example: 'Lost Marry' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 350000 })
  price: number;

  @IsNumber()
  @ApiProperty({ example: 300000 })
  promotionPrice: number;

  @IsString()
  @ApiProperty({ example: 'Mô Tả Chi Tiết Sản Phẩm' })
  description: string;

  @IsString()
  @ApiProperty({ example: 'Nội dung Sản Phẩm' })
  content: string;

  @IsEnum(EProductLabel)
  @ApiProperty({ enum: EProductLabel, example: EProductLabel.BestSeller })
  label: EProductLabel;

  @IsString()
  @ApiProperty({ example: 'categoryId' })
  category: string;
}

export class CreateProductDto extends ProductDto {
  @IsArray()
  @ApiProperty({
    isArray: true,
    example: [
      {
        label: 'Cam',
        style: 'Color',
        image: 'product/:id/:key',
        quantity: 10,
      },
    ],
  })
  styles: StyleDto[];
}

export class UpdateProductDto extends ProductDto {
  @IsArray()
  @ApiProperty({
    isArray: true,
    example: [
      {
        id: 'styleId',
        label: 'Cam',
        style: 'Color',
        image: 'product/:id/:key',
        quantity: 10,
      },
    ],
  })
  styles: UpdateStyleDto[];
}

export class ProductQuery extends PaginateDto {
  @IsNumber()
  @ApiProperty({ example: 300000 })
  startPrice: number;

  @IsNumber()
  @ApiProperty({ example: 350000 })
  endPrice: number;
}

export class QueryFieldsProduct implements IQueryFieldProduct {
  @ApiProperty({ required: false })
  @IsOptional()
  search: string;

  @ApiProperty({ required: false, enum: EProductLabel })
  @IsOptional()
  label: EProductLabel;
}

export class OrderFieldsProduct implements OrderFields<Product> {
  @IsEnum(Sort)
  @IsOptional()
  @ApiProperty({ required: false, enum: Sort, default: Sort.DESC })
  price: Sort;

  @IsEnum(Sort)
  @IsOptional()
  @ApiProperty({ required: false, enum: Sort, default: Sort.DESC })
  createdAt: Sort;
}

export class QueryProductDto implements Partial<IQueryProduct> {
  @ApiProperty({ type: QueryFieldsProduct })
  @IsObject()
  @IsDefined()
  @Type(() => QueryFieldsProduct)
  @ValidateNested()
  queryFields: QueryFieldsProduct;

  @ApiProperty({ type: OrderFieldsProduct })
  @IsObject()
  @IsDefined()
  @Type(() => OrderFieldsProduct)
  @ValidateNested()
  orderFields: OrderFieldsProduct;
}
