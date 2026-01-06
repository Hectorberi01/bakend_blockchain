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
exports.ExchangeRate = void 0;
const typeorm_1 = require("typeorm");
const Currency_entity_1 = require("./Currency.entity");
let ExchangeRate = class ExchangeRate {
};
exports.ExchangeRate = ExchangeRate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExchangeRate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_currency' }),
    __metadata("design:type", String)
], ExchangeRate.prototype, "baseCurrency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Currency_entity_1.Currency, (currency) => currency.ratesFrom),
    (0, typeorm_1.JoinColumn)({ name: 'base_currency', referencedColumnName: 'code' }),
    __metadata("design:type", Currency_entity_1.Currency)
], ExchangeRate.prototype, "base", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quote_currency' }),
    __metadata("design:type", String)
], ExchangeRate.prototype, "quoteCurrency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Currency_entity_1.Currency, (currency) => currency.ratesTo),
    (0, typeorm_1.JoinColumn)({ name: 'quote_currency', referencedColumnName: 'code' }),
    __metadata("design:type", Currency_entity_1.Currency)
], ExchangeRate.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], ExchangeRate.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4 }),
    __metadata("design:type", String)
], ExchangeRate.prototype, "spread", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExchangeRate.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_manual', default: false }),
    __metadata("design:type", Boolean)
], ExchangeRate.prototype, "isManual", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ExchangeRate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ExchangeRate.prototype, "updatedAt", void 0);
exports.ExchangeRate = ExchangeRate = __decorate([
    (0, typeorm_1.Entity)('exchange_rates'),
    (0, typeorm_1.Unique)(['baseCurrency', 'quoteCurrency']),
    (0, typeorm_1.Index)(['baseCurrency']),
    (0, typeorm_1.Index)(['quoteCurrency']),
    (0, typeorm_1.Index)(['updatedAt'])
], ExchangeRate);
