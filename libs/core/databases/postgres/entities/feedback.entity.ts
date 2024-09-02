import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity({ name: 'feedbacks' })
@Tree('materialized-path')
export class Feedback extends BaseSchemaEntity {
  @Column({ type: 'varchar', nullable: true })
  content: string;

  @Column('varchar', { array: true, default: [] })
  images: string[];

  @TreeChildren()
  children: Feedback[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Feedback;

  @ManyToOne(() => User, (user) => user.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() => Product, (product) => product.feedbacks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product' })
  product: Product;
}
