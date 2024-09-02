import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';
import { EStyle } from '../enums/entity.enum';
import { Product } from './product.entity';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'styles' })
export class Style extends BaseSchemaEntity {
  @Column({ type: 'varchar', nullable: false })
  label: string;

  @Column({ type: 'varchar', nullable: false, default: 'product/:id/:key' })
  image: string;

  @Column({ type: 'enum', enum: EStyle, default: EStyle.Color })
  style: EStyle;

  @Column({ type: 'int4', nullable: false, default: 0 })
  quantity: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.style)
  orderItems: OrderItem[];

  @ManyToOne(() => Product, (product) => product.styles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product' })
  product: Product;
}
