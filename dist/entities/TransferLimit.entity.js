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
exports.TransferLimit = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let TransferLimit = class TransferLimit {
};
exports.TransferLimit = TransferLimit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TransferLimit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], TransferLimit.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.transferLimits, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], TransferLimit.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransferLimit.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_start', type: 'timestamp' }),
    __metadata("design:type", Date)
], TransferLimit.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_end', type: 'timestamp' }),
    __metadata("design:type", Date)
], TransferLimit.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'limit_amount', type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], TransferLimit.prototype, "limitAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_amount', type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], TransferLimit.prototype, "usedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransferLimit.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TransferLimit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TransferLimit.prototype, "updatedAt", void 0);
exports.TransferLimit = TransferLimit = __decorate([
    (0, typeorm_1.Entity)('transfer_limits'),
    (0, typeorm_1.Unique)(['userId', 'period', 'periodStart']),
    (0, typeorm_1.Index)(['userId'])
], TransferLimit);
