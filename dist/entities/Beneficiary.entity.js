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
exports.Beneficiary = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Transaction_entity_1 = require("./Transaction.entity");
let Beneficiary = class Beneficiary {
};
exports.Beneficiary = Beneficiary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Beneficiary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Beneficiary.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.beneficiaries, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], Beneficiary.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Beneficiary.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number' }),
    __metadata("design:type", String)
], Beneficiary.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Beneficiary.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'swift_code', nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "iban", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_address', nullable: true }),
    __metadata("design:type", String)
], Beneficiary.prototype, "walletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Beneficiary.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_favorite', default: false }),
    __metadata("design:type", Boolean)
], Beneficiary.prototype, "isFavorite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Beneficiary.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Beneficiary.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Beneficiary.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_entity_1.Transaction, (transaction) => transaction.beneficiary),
    __metadata("design:type", Array)
], Beneficiary.prototype, "transactions", void 0);
exports.Beneficiary = Beneficiary = __decorate([
    (0, typeorm_1.Entity)('beneficiaries'),
    (0, typeorm_1.Unique)(['userId', 'phoneNumber']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['phoneNumber'])
], Beneficiary);
