import { DataSource } from 'typeorm';
import { User } from '../entities/User.entity';
import { KYCDocument } from '../entities/KYCDocument.entity';
import { Wallet } from '../entities/Wallet.entity';
import { WalletBalance } from '../entities/CurrencyBalance.entity';
import { Beneficiary } from '../entities/Beneficiary.entity';
import { Transaction } from '../entities/Transaction.entity';
import { Escrow } from '../entities/Escrow.entity';
import { Quote } from '../entities/Quote.entity';
import { Currency } from '../entities/Currency.entity';
import { ExchangeRate } from '../entities/ExchangeRate.entity';
import { TransferLimit } from '../entities/TransferLimit.entity';
import { Session } from '../entities/Session.entity';
import { Notification } from '../entities/Notification.entity';
import { ActivityLog } from '../entities/ActivityLog.entity';
import { SystemConfig } from '../entities/SystemConfig.entity';
import * as dotenv from 'dotenv';

dotenv.config();

// console
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ,
  synchronize: process.env.NODE_ENV === 'development', // Désactiver en production
  logging: false,
  entities: [
    User,
    KYCDocument,
    Wallet,
    WalletBalance,
    Beneficiary,
    Transaction,
    Escrow,
    Quote,
    Currency,
    ExchangeRate,
    TransferLimit,
    Session,
    Notification,
    ActivityLog,
    SystemConfig
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});