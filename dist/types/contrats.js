"use strict";
// Types pour les contrats
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.WalletStatus = exports.WalletType = void 0;
// ========== WALLET TYPES ==========
var WalletType;
(function (WalletType) {
    WalletType["PERSONAL"] = "PERSONAL";
    WalletType["BUSINESS"] = "BUSINESS";
    WalletType["SAVINGS"] = "SAVINGS";
    WalletType["SHARED"] = "SHARED";
})(WalletType || (exports.WalletType = WalletType = {}));
var WalletStatus;
(function (WalletStatus) {
    WalletStatus["ACTIVE"] = "ACTIVE";
    WalletStatus["FROZEN"] = "FROZEN";
    WalletStatus["CLOSED"] = "CLOSED";
})(WalletStatus || (exports.WalletStatus = WalletStatus = {}));
// ========== ERROR TYPES ==========
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["EMAIL_EXISTS"] = "EMAIL_EXISTS";
    ErrorCode["PHONE_EXISTS"] = "PHONE_EXISTS";
    ErrorCode["WALLET_ALREADY_LINKED"] = "WALLET_ALREADY_LINKED";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    ErrorCode["NOT_LOGGED_IN"] = "NOT_LOGGED_IN";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["CONTRACT_ERROR"] = "CONTRACT_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
