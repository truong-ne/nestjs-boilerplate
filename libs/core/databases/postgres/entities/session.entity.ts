import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseSchemaEntity } from '../../base-entity';
import { User } from './user.entity';
import { randomUUID } from 'crypto';

@Entity({ name: 'sessions' })
export class Session extends BaseSchemaEntity {
  constructor(){
    super()
    this.refreshToken = randomUUID()
    this.secretKey = randomUUID()
  }

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: false })
  secretKey: string;

  @Column({ nullable: false })
  userAgent: string;

  @Column({ nullable: false })
  ip: string;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({ name: 'user' })
  user: User;
}
