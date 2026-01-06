import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index, OneToOne
} from 'typeorm';
import { User } from './User.entity';
import { WalletBalance} from './CurrencyBalance.entity';
import { Transaction } from './Transaction.entity';
import {WalletStatus, WalletType} from "../types/contrats";

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  address!: string;

  @Column({ type: 'text' })
  privateKeyEncrypted!: string;

  @Column()
  label!: string;

  @Column({type: 'enum',enum: WalletType,name: 'wallet_type'})
  walletType!: WalletType;

  // Limites
  @Column({type: 'decimal',precision: 20,scale: 8,default: 0,name: 'daily_spent_limit'})
  dailySpentLimit!: string;

  @Column({type: 'decimal',precision: 20,scale: 8,default: 0,name: 'daily_spent'})
  dailySpent!: string;

  @Column({ name: 'last_spend_date', type: 'timestamp', nullable: true })
  lastSpendDate?: Date;

  // Statut
  @Column({type: 'enum',enum: WalletStatus,default: WalletStatus.ACTIVE})
  status!: WalletStatus;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity!: Date;

  // Relations
  @OneToMany(() => WalletBalance, (balance) => balance.wallet)
  balances!: WalletBalance[];

  @OneToMany(() => Transaction, (transaction) => transaction.fromWallet)
  transactionsFrom!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.toWallet)
  transactionsTo!: Transaction[];
}