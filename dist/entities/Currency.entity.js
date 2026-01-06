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
exports.Currency = void 0;
// entities/currency/Currency.entity.ts
const typeorm_1 = require("typeorm");
const ExchangeRate_entity_1 = require("./ExchangeRate.entity");
let Currency = class Currency {
};
exports.Currency = Currency;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Currency.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Currency.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Currency.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Currency.prototype, "symbol", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 2 }),
    __metadata("design:type", Number)
], Currency.prototype, "decimals", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Currency.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_crypto', default: false }),
    __metadata("design:type", Boolean)
], Currency.prototype, "isCrypto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Currency.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Currency.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Currency.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExchangeRate_entity_1.ExchangeRate, (rate) => rate.base),
    __metadata("design:type", Array)
], Currency.prototype, "ratesFrom", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExchangeRate_entity_1.ExchangeRate, (rate) => rate.quote),
    __metadata("design:type", Array)
], Currency.prototype, "ratesTo", void 0);
exports.Currency = Currency = __decorate([
    (0, typeorm_1.Entity)('currencies')
], Currency);
