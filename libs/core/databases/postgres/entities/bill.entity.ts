import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseSchemaEntity } from "../../base-entity";
import { EBillMethod, EBillStatus, EDeliveryUnit } from "../enums/entity.enum";
import { User } from "./user.entity";
import { Address } from "./address.entity";
import { Discount } from "./discount.entity";

@Entity({name: 'bills'})
export class Bill extends BaseSchemaEntity {
  @Column({type: 'enum', enum: EBillStatus, default: EBillStatus.Pending})
  status: EBillStatus

  @Column({type: 'enum', enum: EBillMethod, default: EBillMethod.COD})
  method: EBillMethod

  @Column({type: 'enum', enum: EDeliveryUnit, default: EDeliveryUnit.Grab})
  delivery: EDeliveryUnit

  @Column({type: 'integer', default: 0})
  point: number

  @ManyToOne(() => User, user => user.bills)
  @JoinColumn({name: 'user'})
  user: User

  @ManyToOne(() => Address, address => address.bills)
  @JoinColumn({name: 'address'})
  address: Address

  @ManyToOne(() => Discount, discount => discount.bills )
  @JoinColumn({name: 'discount'})
  discount: Discount
}