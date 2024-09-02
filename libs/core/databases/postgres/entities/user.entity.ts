import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { EGender, ERole } from '../enums/entity.enum';
import { BaseSchemaEntity } from '../../base-entity';
import { Session } from './session.entity';
import { Address } from './address.entity';
import { UserDiscount } from './user-discounts.entity';
import { Bill } from './bill.entity';
import { Feedback } from './feedback.entity';

@Entity({ name: 'users' })
export class User extends BaseSchemaEntity {
  @Column({ nullable: true, default: 'user/avatar' })
  avatar: string;

  @Column({ nullable: false, length: 50 })
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: EGender, default: EGender.Male })
  gender: EGender;

  @Column({ type: 'enum', enum: ERole, default: ERole.User })
  role: ERole;

  @Column({ length: 10, nullable: true })
  birthday: string;

  @Column({ type: 'int4', default: 0 })
  point: number;

  @Column({ type: 'boolean', default: false })
  notifications: boolean;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Address, (address) => address.user)
  address: Address[];

  @OneToMany(() => UserDiscount, (userDiscount) => userDiscount.user)
  userDiscounts: UserDiscount[];

  @OneToMany(() => Bill, (bill) => bill.user)
  bills: Bill[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];
}
