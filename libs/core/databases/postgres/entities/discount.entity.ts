import { Column, Entity, OneToMany } from 'typeorm';
import {
  EDiscountStatus,
  EDiscountType,
  EDiscountUnit,
} from '../enums/entity.enum';
import { UserDiscount } from './user-discounts.entity';
import { BaseSchemaEntity } from '../../base-entity';
import { Bill } from './bill.entity';

@Entity({ name: 'discounts' })
export class Discount extends BaseSchemaEntity {
  @Column({ length: 50, nullable: false })
  label: string;

  @Column({ length: 20, nullable: false, unique: true })
  code: string;

  @Column({ type: 'int4', nullable: false })
  value: number;

  @Column({ type: 'enum', enum: EDiscountUnit, default: EDiscountUnit.VND })
  unit: EDiscountUnit;

  @Column({ type: 'int4', nullable: true })
  quantity: number;

  @Column({ type: 'enum', enum: EDiscountType, default: EDiscountType.Limit })
  type: EDiscountType;

  @Column({ type: 'int4', nullable: true })
  point: number;

  @Column({
    type: 'enum',
    enum: EDiscountStatus,
    default: EDiscountStatus.InActive,
  })
  status: EDiscountStatus;

  @Column({ type: 'date', nullable: true })
  expiredAt: Date;

  @OneToMany(() => UserDiscount, (userDiscount) => userDiscount.discount)
  userDiscounts: UserDiscount[];

  @OneToMany(() => Bill, (bill) => bill.discount)
  bills: Bill[];
}
