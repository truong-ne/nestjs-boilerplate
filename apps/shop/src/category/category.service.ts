import { BaseRepository } from '@lib/core/base';
import { LoggerService } from '@lib/modules';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull, Not } from 'typeorm';
import { CategoryDto } from './category.dto';
import { Category } from '@lib/core/databases/postgres/entities/category.entity';

@Injectable()
export class CategoryService extends BaseRepository {
  private readonly serviceName: string = CategoryService.name;
  private readonly logger: LoggerService;

  constructor(
    @InjectDataSource() private readonly dataSourcePostgres: DataSource,
    logger: LoggerService,
  ) {
    super();
    this.logger = logger;
    this.logger.setContext(this.serviceName);
    // this.listCategories();
  }

  async listCategories() {
    const categories = await this.dataSourcePostgres
      .getTreeRepository(Category)
      .findTrees();

    categories
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((parent) => ({
        ...parent,
        children: parent.children
          ? parent.children.sort((a, b) => a.slug.localeCompare(b.slug))
          : [],
      }));

    return categories;
  }

  async createCategory(dto: CategoryDto): Promise<Category> {
    const { parent, ...payload } = dto;

    await this.existedCategory(dto.slug, null, parent);

    if (parent) Object.assign(payload, { parent: { id: parent } });

    const category = this.createInstance(
      this.dataSourcePostgres,
      Category,
      payload,
    );

    return await this.create(this.dataSourcePostgres, Category, category);
  }

  async updateCategory(id: string, dto: CategoryDto): Promise<boolean> {
    await this.existedCategory(dto.slug);

    const { parent, ...payload } = dto;

    if (parent) Object.assign(payload, { parent: { id: parent } });

    return await this.update(
      this.dataSourcePostgres,
      Category,
      { id },
      payload,
    );
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.dataSourcePostgres.getTreeRepository(Category).delete({ id });

    return true;
  }

  private async existedCategory(
    slug: string,
    id = null,
    parent = null,
  ): Promise<void> {
    const parentExisted =
      parent !== null
        ? await this.dataSourcePostgres
            .getTreeRepository(Category)
            .findOneBy({ id: parent })
        : true;
    if (!parentExisted)
      throw new NotFoundException(`Category cha chưa được khởi tạo`);

    const where = { slug, id: Not(id) };
    if (!id) Object.assign(where, { id: Not(IsNull()) });

    const existed = await this.dataSourcePostgres
      .getTreeRepository(Category)
      .exists({ where });

    if (existed)
      throw new ConflictException(`Category ${slug} đã được khởi tạo!`);
  }
}
