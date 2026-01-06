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
exports.Wallet = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const CurrencyBalance_entity_1 = require("./CurrencyBalance.entity");
const Transaction_entity_1 = require("./Transaction.entity");
const contrats_1 = require("../types/contrats");
let Wallet = class Wallet {
};
exports.Wallet = Wallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Wallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.wallets, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_entity_1.User)
], Wallet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Wallet.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Wallet.prototype, "privateKeyEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Wallet.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: contrats_1.WalletType, name: 'wallet_type' }),
    __metadata("design:type", String)
], Wallet.prototype, "walletType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0, name: 'daily_spent_limit' }),
    __metadata("design:type", String)
], Wallet.prototype, "dailySpentLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0, name: 'daily_spent' }),
    __metadata("design:type", String)
], Wallet.prototype, "dailySpent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_spend_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Wallet.prototype, "lastSpendDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: contrats_1.WalletStatus, default: contrats_1.WalletStatus.ACTIVE }),
    __metadata("design:type", String)
], Wallet.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Wallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Wallet.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Wallet.prototype, "lastActivity", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CurrencyBalance_entity_1.WalletBalance, (balance) => balance.wallet),
    __metadata("design:type", Array)
], Wallet.prototype, "balances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_entity_1.Transaction, (transaction) => transaction.fromWallet),
    __metadata("design:type", Array)
], Wallet.prototype, "transactionsFrom", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_entity_1.Transaction, (transaction) => transaction.toWallet),
    __metadata("design:type", Array)
], Wallet.prototype, "transactionsTo", void 0);
exports.Wallet = Wallet = __decorate([
    (0, typeorm_1.Entity)('wallets')
], Wallet);
