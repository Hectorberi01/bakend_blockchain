import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User.entity';
import { Transaction } from './Transaction.entity';
import { QuoteDirection, QuoteStatus } from './enums';

@Entity('quotes')
@Index(['userId'])
@Index(['status'])
@Index(['expiresAt'])
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.quotes)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'from_currency' })
  fromCurrency!: string;

  @Column({ name: 'to_currency' })
  toCurrency!: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount!: string;

  @Column({type: 'enum',enum: QuoteDirection})
  direction!: QuoteDirection;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 20, scale: 8 })
  exchangeRate!: string;

  @Column({ name: 'fee_amount', type: 'decimal', precision: 20, scale: 8 })
  feeAmount!: string;

  @Column({ name: 'fee_percentage', type: 'decimal', precision: 5, scale: 2 })
  feePercentage!: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 20, scale: 8 })
  totalAmount!: string;

  @Column({type: 'enum',enum: QuoteStatus,default: QuoteStatus.ACTIVE})
  status!: QuoteStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.quote)
  transactions!: Transaction[];

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}