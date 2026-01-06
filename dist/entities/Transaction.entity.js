"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Wallet_entity_1 = require("./Wallet.entity");
const Beneficiary_entity_1 = require("./Beneficiary.entity");
const Escrow_entity_1 = require("./Escrow.entity");
const Quote_entity_1 = require("./Quote.entity");
const enums_1 = require("./enums");
let Transaction = class Transaction {
    isCompleted() {
        return this.status === enums_1.TransactionStatus.COMPLETED;
    }
    isPending() {
        return this.status === enums_1.TransactionStatus.PENDING;
    }
    isFailed() {
        return this.status === enums_1.TransactionStatus.FAILED;
    }
    isCancelled() {
        return this.status === enums_1.TransactionStatus.CANCELLED;
    }
    isConversion() {
        return this.transactionType === enums_1.TransactionType.EXCHANGE ||
            (this.fromCurrency !== this.toCurrency && !this.receiverId);
    }
    isTransfer() {
        return this.transactionType === enums_1.TransactionType.TRANSFER &&
            !!this.receiverId;
    }
    getNetAmount() {
        const amount = parseFloat(this.amount);
        const fee = parseFloat(this.feeAmount);
        return (amount - fee).toFixed(8);
    }
    isOtpExpired() {
        if (!this.otpExpiresAt)
            return true;
        return new Date() > this.otpExpiresAt;
    }
    isQuoteExpired() {
        if (!this.quoteExpiresAt)
            return false;
        return new Date() > this.quoteExpiresAt;
    }
    getSummary() {
        const action = this.isConversion() ? 'converted' : 'sent';
        return `${action} ${this.amount} ${this.fromCurrency}${this.convertedAmount ? ` (${this.convertedAmount} ${this.toCurrency})` : ''}`;
    }
    toSafeLog() {
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
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_hash', type: 'varchar', length: 66, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_id' }),
    __metadata("design:type", Number)
], Transaction.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.sentTransactions),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", User_entity_1.User)
], Transaction.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_wallet_id', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "fromWalletId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Wallet_entity_1.Wallet, (wallet) => wallet.transactionsFrom),
    (0, typeorm_1.JoinColumn)({ name: 'from_wallet_id' }),
    __metadata("design:type", Wallet_entity_1.Wallet)
], Transaction.prototype, "fromWallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "receiverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.receivedTransactions),
    (0, typeorm_1.JoinColumn)({ name: 'receiver_id' }),
    __metadata("design:type", User_entity_1.User)
], Transaction.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_wallet_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "toWalletId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Wallet_entity_1.Wallet, (wallet) => wallet.transactionsTo),
    (0, typeorm_1.JoinColumn)({ name: 'to_wallet_id' }),
    __metadata("design:type", Wallet_entity_1.Wallet)
], Transaction.prototype, "toWallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'beneficiary_id', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "beneficiaryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Beneficiary_entity_1.Beneficiary, (beneficiary) => beneficiary.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'beneficiary_id' }),
    __metadata("design:type", Beneficiary_entity_1.Beneficiary)
], Transaction.prototype, "beneficiary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_currency', length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "fromCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_currency', length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "toCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 20,
        scale: 8,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'converted_amount',
        type: 'decimal',
        precision: 20,
        scale: 8,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], Transaction.prototype, "convertedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'exchange_rate',
        type: 'decimal',
        precision: 20,
        scale: 8,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], Transaction.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fee_amount',
        type: 'decimal',
        precision: 20,
        scale: 8,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], Transaction.prototype, "feeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fee_percentage',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], Transaction.prototype, "feePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_amount',
        type: 'decimal',
        precision: 20,
        scale: 8,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], Transaction.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.TransactionType,
        name: 'transaction_type'
    }),
    __metadata("design:type", String)
], Transaction.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.PaymentMethod,
        name: 'payment_method'
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.TransactionStatus,
        default: enums_1.TransactionStatus.PENDING
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escrow_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "escrowId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Escrow_entity_1.Escrow, (escrow) => escrow.transaction),
    (0, typeorm_1.JoinColumn)({ name: 'escrow_id' }),
    __metadata("design:type", Escrow_entity_1.Escrow)
], Transaction.prototype, "escrow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_required', default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "otpRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_verified', default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "otpVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_code', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "otpCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "otpExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quote_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "quoteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Quote_entity_1.Quote, (quote) => quote.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'quote_id' }),
    __metadata("design:type", Quote_entity_1.Quote)
], Transaction.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quote_locked', default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "quoteLocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quote_expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "quoteExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "failedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['senderId', 'status']),
    (0, typeorm_1.Index)(['receiverId', 'status']),
    (0, typeorm_1.Index)(['fromWalletId']),
    (0, typeorm_1.Index)(['toWalletId']),
    (0, typeorm_1.Index)(['status', 'createdAt']),
    (0, typeorm_1.Index)(['transactionType']),
    (0, typeorm_1.Index)(['createdAt'])
], Transaction);
