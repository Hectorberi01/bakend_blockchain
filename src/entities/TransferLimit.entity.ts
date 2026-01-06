import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { User } from './User.entity';
@Entity('transfer_limits')
@Unique(['userId', 'period', 'periodStart'])
@Index(['userId'])
export class TransferLimit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.transferLimits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  period!: string;

  @Column({ name: 'period_start', type: 'timestamp' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamp' })
  periodEnd!: Date;

  @Column({ name: 'limit_amount', type: 'decimal', precision: 20, scale: 8 })
  limitAmount!: string;

  @Column({ name: 'used_amount', type: 'decimal', precision: 20, scale: 8, default: 0 })
  usedAmount!: string;

  @Column()
  currency!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}