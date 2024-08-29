import { Roles, UserDecorator } from '@lib/common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiscountService } from './discount.service';
import { UserAuthGuard } from '@lib/utils/middlewares/guards';
import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';
import { DiscountDto, DiscountQuery } from './discount.dto';

@ApiTags('DISCOUNT')
@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiOperation({ summary: 'Admin List Discount' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Get()
  async listDiscounts(@Query() query: DiscountQuery) {
    return await this.discountService.listDiscount(query);
  }

  @ApiOperation({ summary: 'Admin Create Discount' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Post()
  async createDiscount(@Body() dto: DiscountDto) {
    return await this.discountService.createDiscount(dto);
  }

  @ApiOperation({ summary: 'Admin Update Discount' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Patch(':id')
  async updateDiscount(@Param('id') id: string, @Body() dto: DiscountDto) {
    return await this.discountService.updateDiscount(id, dto);
  }

  @ApiOperation({ summary: 'Admin Update Discount' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Delete('id')
  async deleteDiscount(@Param('id') id: string) {
    return await this.discountService.deleteDiscount(id);
  }
}
