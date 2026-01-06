import {Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, JoinColumn, OneToOne, OneToMany, ManyToOne} from 'typeorm';
import { Wallet } from './Wallet.entity';

@Entity('walletBalance')
export class WalletBalance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.balances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet;

  @Column()
  currency!: string;

  @Column({ type: "varchar", length: 40, default: "0.0000" })
  balance!: string;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated!: Date;
}