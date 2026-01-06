// entities/currency/Currency.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ExchangeRate } from './ExchangeRate.entity';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column()
  symbol!: string;

  @Column({ default: 2 })
  decimals!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_crypto', default: false })
  isCrypto!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ExchangeRate, (rate) => rate.base)
  ratesFrom!: ExchangeRate[];

  @OneToMany(() => ExchangeRate, (rate) => rate.quote)
  ratesTo!: ExchangeRate[];
}

