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
exports.Escrow = void 0;
const typeorm_1 = require("typeorm");
const Transaction_entity_1 = require("./Transaction.entity");
let Escrow = class Escrow {
};
exports.Escrow = Escrow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Escrow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escrow_id', type: 'bigint', unique: true }),
    __metadata("design:type", Number)
], Escrow.prototype, "escrowId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Escrow.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Escrow.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], Escrow.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Escrow.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secret_hash' }),
    __metadata("design:type", String)
], Escrow.prototype, "secretHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Escrow.prototype, "released", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Escrow.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'released_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Escrow.prototype, "releasedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Transaction_entity_1.Transaction, (transaction) => transaction.escrow),
    __metadata("design:type", Transaction_entity_1.Transaction)
], Escrow.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Escrow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Escrow.prototype, "updatedAt", void 0);
exports.Escrow = Escrow = __decorate([
    (0, typeorm_1.Entity)('escrows'),
    (0, typeorm_1.Index)(['sender']),
    (0, typeorm_1.Index)(['receiver'])
], Escrow);
