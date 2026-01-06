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
exports.WalletBalance = void 0;
const typeorm_1 = require("typeorm");
const Wallet_entity_1 = require("./Wallet.entity");
let WalletBalance = class WalletBalance {
};
exports.WalletBalance = WalletBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WalletBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Wallet_entity_1.Wallet, (wallet) => wallet.balances, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", Wallet_entity_1.Wallet)
], WalletBalance.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WalletBalance.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 40, default: "0.0000" }),
    __metadata("design:type", String)
], WalletBalance.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'last_updated' }),
    __metadata("design:type", Date)
], WalletBalance.prototype, "lastUpdated", void 0);
exports.WalletBalance = WalletBalance = __decorate([
    (0, typeorm_1.Entity)('walletBalance')
], WalletBalance);
