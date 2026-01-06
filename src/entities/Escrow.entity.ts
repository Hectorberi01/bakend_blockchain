import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index
} from 'typeorm';
import { Transaction } from './Transaction.entity';

@Entity('escrows')
@Index(['sender'])
@Index(['receiver'])
export class Escrow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'escrow_id', type: 'bigint', unique: true })
  escrowId!: number; // Smart contract ID

  @Column()
  sender!: string;

  @Column()
  receiver!: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount!: string;

  @Column()
  currency!: string;

  @Column({ name: 'secret_hash' })
  secretHash!: string;

  @Column({ default: false })
  released!: boolean;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt?: Date;

  @OneToOne(() => Transaction, (transaction) => transaction.escrow)
  transaction?: Transaction;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}