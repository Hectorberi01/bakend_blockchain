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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const KYCDocument_entity_1 = require("./KYCDocument.entity");
const Wallet_entity_1 = require("./Wallet.entity");
const Transaction_entity_1 = require("./Transaction.entity");
const Beneficiary_entity_1 = require("./Beneficiary.entity");
const Quote_entity_1 = require("./Quote.entity");
const Session_entity_1 = require("./Session.entity");
const Notification_entity_1 = require("./Notification.entity");
const ActivityLog_entity_1 = require("./ActivityLog.entity");
const TransferLimit_entity_1 = require("./TransferLimit.entity");
let User = class User {
    canTransact() {
        return this.isActive && this.emailVerified;
    }
    isKycCompleted() {
        return this.kycStatus === enums_1.KYCStatus.VERIFIED;
    }
    isLocked() {
        return this.failedLoginAttempts >= 5 || !this.isActive;
    }
    getFullName() {
        if (this.metadata?.firstName && this.metadata?.lastName) {
            return `${this.metadata.firstName} ${this.metadata.lastName}`;
        }
        return this.email;
    }
    getMaskedEmail() {
        const [local, domain] = this.email.split('@');
        return `${local.substring(0, 2)}***@${domain}`;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2 }),
    __metadata("design:type", String)
], User.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_hash', length: 66 }),
    __metadata("design:type", String)
], User.prototype, "phoneHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blockchain_user_id', type: 'varchar', length: 66, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "blockchainUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_linked', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "walletLinked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.KYCStatus, default: enums_1.KYCStatus.NONE, name: 'kyc_status' }),
    __metadata("design:type", String)
], User.prototype, "kycStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.UserLevel, default: enums_1.UserLevel.BASIC, name: 'user_level' }),
    __metadata("design:type", String)
], User.prototype, "userLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kyc_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "kycVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kyc_verified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "kycVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_login_attempts', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login_ip', length: 45, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastLoginIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_verified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "emailVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "phoneVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_verified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "phoneVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'two_factor_enabled', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'two_factor_secret', nullable: true, length: 255 }),
    __metadata("design:type", String)
], User.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => KYCDocument_entity_1.KYCDocument, (doc) => doc.user),
    __metadata("design:type", Array)
], User.prototype, "kycDocuments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Wallet_entity_1.Wallet, (wallet) => wallet.user),
    __metadata("design:type", Array)
], User.prototype, "wallets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_entity_1.Transaction, (transaction) => transaction.sender),
    __metadata("design:type", Array)
], User.prototype, "sentTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_entity_1.Transaction, (transaction) => transaction.sender),
    __metadata("design:type", Array)
], User.prototype, "receivedTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Beneficiary_entity_1.Beneficiary, (beneficiary) => beneficiary.user),
    __metadata("design:type", Array)
], User.prototype, "beneficiaries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Quote_entity_1.Quote, (quote) => quote.user),
    __metadata("design:type", Array)
], User.prototype, "quotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Session_entity_1.Session, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ActivityLog_entity_1.ActivityLog, (log) => log.user),
    __metadata("design:type", Array)
], User.prototype, "activityLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TransferLimit_entity_1.TransferLimit, (limit) => limit.user),
    __metadata("design:type", Array)
], User.prototype, "transferLimits", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)(['kycStatus']),
    (0, typeorm_1.Index)(['isActive'])
], User);
