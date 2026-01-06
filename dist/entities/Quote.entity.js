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
exports.Quote = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Transaction_entity_1 = require("./Transaction.entity");
const enums_1 = require("./enums");
let Quote = class Quote {
};
exports.Quote = Quote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Quote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Quote.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.quotes),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], Quote.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_currency' }),
    __metadata("design:type", String)
], Quote.prototype, "fromCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_currency' }),
    __metadata("design:type", String)
], Quote.prototype, "toCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], Quote.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.QuoteDirection }),
    __metadata("design:type", String)
], Quote.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], Quote.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fee_amount', type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], Quote.prototype, "feeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fee_percentage', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", String)
], Quote.prototype, "feePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], Quote.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.QuoteStatus, default: enums_1.QuoteStatus.ACTIVE }),
    __metadata("design:type", String)
], Quote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Quote.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_entity_1.Transaction, (transaction) => transaction.quote),
    __metadata("design:type", Array)
], Quote.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Quote.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Quote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Quote.prototype, "updatedAt", void 0);
exports.Quote = Quote = __decorate([
    (0, typeorm_1.Entity)('quotes'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['expiresAt'])
], Quote);
