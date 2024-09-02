import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';
import { EProductLabel } from '../enums/entity.enum';
import { Category } from './category.entity';
import { Feedback } from './feedback.entity';
import { Style } from './style.entity';

@Entity({ name: 'products' })
export class Product extends BaseSchemaEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'int4', nullable: false })
  price: number;

  @Column({ type: 'int4', nullable: true })
  promotionPrice: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  content: string;

  @Column({ type: 'enum', enum: EProductLabel, nullable: true })
  label: EProductLabel;

  @OneToMany(() => Feedback, (feedback) => feedback.product)
  feedbacks: Feedback[];

  @OneToMany(() => Style, (style) => style.product)
  styles: Style[];

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category' })
  category: Category;
}
