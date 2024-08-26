import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Discount } from './discount.entity';
import { BaseSchemaEntity } from '../../base-entity';

@Entity({ name: 'user_discounts' })
export class UserDiscount extends BaseSchemaEntity {
  @ManyToOne(() => User, (user) => user.userDiscounts)
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() => Discount, (discount) => discount.userDiscounts)
  @JoinColumn({ name: 'discount' })
  discount: Discount;
}
