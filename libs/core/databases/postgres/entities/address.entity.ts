import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';
import { User } from './user.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'address' })
export class Address extends BaseSchemaEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ length: 100, nullable: false })
  address: string;

  @Column({ nullable: false })
  phone: string;

  @ManyToOne(() => User, (user) => user.address)
  @JoinColumn({ name: 'user' })
  user: User;

  @OneToMany(() => Bill, (bill) => bill.address)
  bills: Bill[];
}
