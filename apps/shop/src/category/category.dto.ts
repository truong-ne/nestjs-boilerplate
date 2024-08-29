import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class CategoryDto {
  @IsString()
  @ApiProperty({example: 'Tinh dầu'})
  label: string

  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Slug chỉ được chứa chữ cái, số và dấu gạch ngang (không được chứa khoảng trắng hoặc ký tự đặc biệt).',
  })
  @ApiProperty({example: 'tinh-dau'})
  slug: string

  @IsOptional()
  @ApiProperty({example: 'parentId'})
  parent: string
}