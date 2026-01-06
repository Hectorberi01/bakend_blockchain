import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { User } from './User.entity';
import { Transaction } from './Transaction.entity';

@Entity('beneficiaries')
@Unique(['userId', 'phoneNumber'])
@Index(['userId'])
@Index(['phoneNumber'])

export class Beneficiary {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.beneficiaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  name!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'phone_number' })
  phoneNumber!: string;

  @Column({ nullable: true })
  address?: string;

  @Column()
  country!: string;

  // Informations bancaires
  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName?: string;

  @Column({ name: 'swift_code', nullable: true })
  swiftCode?: string;

  @Column({ nullable: true })
  iban?: string;

  // Wallet crypto
  @Column({ name: 'wallet_address', nullable: true })
  walletAddress?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_favorite', default: false })
  isFavorite!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.beneficiary)
  transactions!: Transaction[];
}