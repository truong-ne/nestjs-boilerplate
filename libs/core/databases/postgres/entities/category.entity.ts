import {
  Column,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';

@Entity({ name: 'categories' })
@Tree('materialized-path')
export class Category extends BaseSchemaEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', nullable: false })
  label: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  slug: string;

  @TreeChildren()
  children: Category[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Category;
}