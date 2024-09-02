import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';
import { Style } from './style.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'order_items' })
export class OrderItem extends BaseSchemaEntity {
  @Column({ type: 'int4', nullable: false, default: 0 })
  quantity: number;

  @Column({ type: 'int4', nullable: false, default: 0 })
  price: number;

  @ManyToOne(() => Style, (style) => style.orderItems, { onDelete: 'SET NULL' })
  style: Style;

  @ManyToOne(() => Bill, (bill) => bill.orderItems, { onDelete: 'CASCADE' })
  bill: Bill;
}
