import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User.entity';
import { Wallet } from './Wallet.entity';
import { Beneficiary } from './Beneficiary.entity';
import { Escrow } from './Escrow.entity';
import { Quote } from './Quote.entity';
import { TransactionType, PaymentMethod, TransactionStatus } from './enums';

@Entity('transactions')
@Index(['senderId', 'status'])
@Index(['receiverId', 'status'])
@Index(['fromWalletId'])
@Index(['toWalletId'])
@Index(['status', 'createdAt'])
@Index(['transactionType'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({name: 'transaction_hash', type: 'varchar', length: 66, nullable: true})
  @Index()
  transactionHash?: string;

  // Parties
  @Column({ name: 'sender_id' })
  senderId!: number;


  @ManyToOne(() => User, (user) => user.sentTransactions)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ name: 'from_wallet_id', nullable: true })
  fromWalletId?: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsFrom)
  @JoinColumn({ name: 'from_wallet_id' })
  fromWallet?: Wallet;

  @Column({ name: 'receiver_id', type: 'int', nullable: true })
  receiverId?: number;

  @ManyToOne(() => User, (user) => user.receivedTransactions)
  @JoinColumn({ name: 'receiver_id' })
  receiver?: User;

  @Column({ name: 'to_wallet_id', type: 'int', nullable: true })
  toWalletId?: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactionsTo)
  @JoinColumn({ name: 'to_wallet_id' })
  toWallet?: Wallet;

  @Column({ name: 'beneficiary_id', nullable: true })
  beneficiaryId?: number;

  @ManyToOne(() => Beneficiary, (beneficiary) => beneficiary.transactions)
  @JoinColumn({ name: 'beneficiary_id' })
  beneficiary?: Beneficiary;

  @Column({ name: 'from_currency', length: 10 })
  fromCurrency!: string;

  @Column({ name: 'to_currency', length: 10 })
  toCurrency!: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: {
      to: (value: string | number) => value,
      from: (value: string) => value
    }
  })
  amount!: string;

  @Column({
    name: 'converted_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: string | number) => value,
      from: (value: string) => value
    }
  })
  convertedAmount?: string;

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: string | number) => value,
      from: (value: string) => value
    }
  })
  exchangeRate?: string;

  @Column({
    name: 'fee_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: string | number) => value,
      from: (value: string) => value
    }
  })
  feeAmount!: string;

  @Column({
    name: 'fee_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: string | number) => value,
      from: (value: string) => value
    }
  })
  feePercentage!: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: {
      to: (value: string | number) => value,
      from: (value: string) => value
    }
  })
  totalAmount!: string;

  // Type et méthode
  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type'
  })
  transactionType!: TransactionType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method'
  })
  paymentMethod!: PaymentMethod;

  // Statut
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status!: TransactionStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @Column({ name: 'escrow_id', type: 'int', nullable: true })
  escrowId?: number;

  @OneToOne(() => Escrow, (escrow) => escrow.transaction)
  @JoinColumn({ name: 'escrow_id' })
  escrow?: Escrow;

  @Column({ name: 'otp_required', default: false })
  otpRequired!: boolean;

  @Column({ name: 'otp_verified', default: false })
  otpVerified!: boolean;

  @Column({ name: 'otp_code', type: 'varchar', length: 10, nullable: true })
  otpCode?: string;

  @Column({ name: 'otp_expires_at', type: 'timestamp', nullable: true })
  otpExpiresAt?: Date;

  @Column({ name: 'quote_id', type: 'int', nullable: true })
  quoteId?: number;

  @ManyToOne(() => Quote, (quote) => quote.transactions)
  @JoinColumn({ name: 'quote_id' })
  quote?: Quote;

  @Column({ name: 'quote_locked', default: false })
  quoteLocked!: boolean;

  @Column({ name: 'quote_expires_at', type: 'timestamp', nullable: true })
  quoteExpiresAt?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    notes?: string;
    internalNotes?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.status === TransactionStatus.CANCELLED;
  }

  isConversion(): boolean {
    return this.transactionType === TransactionType.EXCHANGE ||
        (this.fromCurrency !== this.toCurrency && !this.receiverId);
  }

  isTransfer(): boolean {
    return this.transactionType === TransactionType.TRANSFER &&
        !!this.receiverId;
  }

  getNetAmount(): string {
    const amount = parseFloat(this.amount);
    const fee = parseFloat(this.feeAmount);
    return (amount - fee).toFixed(8);
  }

  isOtpExpired(): boolean {
    if (!this.otpExpiresAt) return true;
    return new Date() > this.otpExpiresAt;
  }

  isQuoteExpired(): boolean {
    if (!this.quoteExpiresAt) return false;
    return new Date() > this.quoteExpiresAt;
  }

  getSummary(): string {
    const action = this.isConversion() ? 'converted' : 'sent';
    return `${action} ${this.amount} ${this.fromCurrency}${
        this.convertedAmount ? ` (${this.convertedAmount} ${this.toCurrency})` : ''
    }`;
  }

  toSafeLog(): Partial<Transaction> {
    return {
      id: this.id,
      transactionType: this.transactionType,
      amount: this.amount,
      fromCurrency: this.fromCurrency,
      toCurrency: this.toCurrency,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}