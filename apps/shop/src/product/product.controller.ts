import {
  Body,
  Controller,
  Delete,
  Get,
  Options,
  Param,
  Patch,
  Post,
  Query,
  Search,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateProductDto,
  ProductQuery,
  QueryProductDto,
  UpdateProductDto,
} from './product.dto';
import { UserAuthGuard } from '@lib/utils/middlewares/guards';
import { Roles } from '@lib/common/decorators';
import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';

@ApiTags('PRODUCT')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'List Products' })
  @Post('list')
  async listProducts(
    @Query() query: ProductQuery,
    @Body() dto: QueryProductDto,
  ) {
    return await this.productService.listProducts(query, dto);
  }

  @ApiOperation({ summary: 'Detail Product' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Get(':id')
  async detailProduct(@Param('id') id: string) {
    return await this.productService.detailProduct(id);
  }

  @ApiOperation({ summary: 'Create Product' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    return await this.productService.createProduct(dto);
  }

  @ApiOperation({ summary: 'Update Product' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return await this.productService.updateProduct(dto, id);
  }

  @ApiOperation({ summary: 'Delete Product' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(id);
  }
}
