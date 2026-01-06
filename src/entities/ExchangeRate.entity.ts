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
import { Currency } from './Currency.entity';@Entity('exchange_rates')
@Unique(['baseCurrency', 'quoteCurrency'])
@Index(['baseCurrency'])
@Index(['quoteCurrency'])
@Index(['updatedAt'])
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'base_currency' })
  baseCurrency!: string;

  @ManyToOne(() => Currency, (currency) => currency.ratesFrom)
  @JoinColumn({ name: 'base_currency', referencedColumnName: 'code' })
  base!: Currency;

  @Column({ name: 'quote_currency' })
  quoteCurrency!: string;

  @ManyToOne(() => Currency, (currency) => currency.ratesTo)
  @JoinColumn({ name: 'quote_currency', referencedColumnName: 'code' })
  quote!: Currency;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  rate!: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  spread!: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ name: 'is_manual', default: false })
  isManual!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}