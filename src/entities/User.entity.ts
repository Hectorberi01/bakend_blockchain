import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { KYCStatus, UserLevel } from './enums';
import { KYCDocument } from './KYCDocument.entity';
import { Wallet } from './Wallet.entity';
import { Transaction } from './Transaction.entity';
import { Beneficiary } from './Beneficiary.entity';
import { Quote } from './Quote.entity';
import { Session } from './Session.entity';
import { Notification } from './Notification.entity';
import { ActivityLog } from './ActivityLog.entity';
import { TransferLimit } from './TransferLimit.entity';

@Entity('users')
@Index(['kycStatus'])
@Index(['isActive'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ length: 2 })
  country!: string;

  @Column({ name: 'phone_hash', length: 66 })
  phoneHash!: string;

  @Column({name: 'blockchain_user_id', type: 'varchar', length: 66, nullable: true})
  @Index()
  blockchainUserId?: string;

  @Column({ name: 'wallet_linked', default: false })
  walletLinked!: boolean;


  @Column({type: 'enum', enum: KYCStatus, default: KYCStatus.NONE, name: 'kyc_status'})
  kycStatus!: KYCStatus;

  @Column({type: 'enum', enum: UserLevel, default: UserLevel.BASIC, name: 'user_level'})
  userLevel!: UserLevel;

  @Column({ name: 'kyc_verified', default: false })
  kycVerified!: boolean;

  @Column({ name: 'kyc_verified_at', type: 'timestamp', nullable: true })
  kycVerifiedAt?: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'last_login_date', type: 'timestamp', nullable: true })
  lastLoginDate?: Date;

  @Column({ name: 'last_login_ip', length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified!: boolean;

  @Column({ name: 'phone_verified_at', type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled!: boolean;

  @Column({ name: 'two_factor_secret', nullable: true, length: 255 })
  twoFactorSecret?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    nationality?: string;
    occupation?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => KYCDocument, (doc) => doc.user)
  kycDocuments!: KYCDocument[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets!: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  sentTransactions!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  receivedTransactions!: Transaction[];

  @OneToMany(() => Beneficiary, (beneficiary) => beneficiary.user)
  beneficiaries!: Beneficiary[];

  @OneToMany(() => Quote, (quote) => quote.user)
  quotes!: Quote[];

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => ActivityLog, (log) => log.user)
  activityLogs!: ActivityLog[];

  @OneToMany(() => TransferLimit, (limit) => limit.user)
  transferLimits!: TransferLimit[];

  canTransact(): boolean {
    return this.isActive && this.emailVerified;
  }

  isKycCompleted(): boolean {
    return this.kycStatus === KYCStatus.VERIFIED;
  }

  isLocked(): boolean {
    return this.failedLoginAttempts >= 5 || !this.isActive;
  }

  getFullName(): string {
    if (this.metadata?.firstName && this.metadata?.lastName) {
      return `${this.metadata.firstName} ${this.metadata.lastName}`;
    }
    return this.email;
  }

  getMaskedEmail(): string {
    const [local, domain] = this.email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }
}