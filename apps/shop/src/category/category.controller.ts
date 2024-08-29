import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from '@lib/utils/middlewares/guards';
import { Roles } from '@lib/common/decorators';
import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';
import { CategoryDto } from './category.dto';

@ApiTags('CATEGORY')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Tree View Category' })
  @Get()
  async listCategories() {
    return await this.categoryService.listCategories();
  }

  @ApiOperation({ summary: 'Create Category' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Post()
  async createCategory(@Body() dto: CategoryDto) {
    return await this.categoryService.createCategory(dto);
  }

  @ApiOperation({ summary: 'Update Category' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Patch(':id')
  async updateCategory(@Param('id') id: string, @Body() dto: CategoryDto) {
    return await this.categoryService.updateCategory(id, dto);
  }

  @ApiOperation({ summary: 'Delete Category' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.categoryService.deleteCategory(id);
  }
}
