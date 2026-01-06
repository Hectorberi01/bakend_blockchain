"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.QuoteStatus = exports.QuoteDirection = exports.TransactionStatus = exports.PaymentMethod = exports.TransactionType = exports.WalletStatus = exports.WalletType = exports.DocumentType = exports.UserLevel = exports.KYCStatus = void 0;
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["NONE"] = "NONE";
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["VERIFIED"] = "VERIFIED";
    KYCStatus["REJECTED"] = "REJECTED";
    KYCStatus["SUSPENDED"] = "SUSPENDED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
var UserLevel;
(function (UserLevel) {
    UserLevel["BASIC"] = "BASIC";
    UserLevel["VERIFIED"] = "VERIFIED";
    UserLevel["PREMIUM"] = "PREMIUM";
    UserLevel["BUSINESS"] = "BUSINESS";
})(UserLevel || (exports.UserLevel = UserLevel = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["PASSPORT"] = "PASSPORT";
    DocumentType["ID_CARD"] = "ID_CARD";
    DocumentType["DRIVERS_LICENSE"] = "DRIVERS_LICENSE";
    DocumentType["RESIDENCE_PERMIT"] = "RESIDENCE_PERMIT";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var WalletType;
(function (WalletType) {
    WalletType["PERSONAL"] = "PERSONAL";
    WalletType["FAMILY"] = "FAMILY";
    WalletType["BUSINESS"] = "BUSINESS";
    WalletType["SAVINGS"] = "SAVINGS";
    WalletType["CUSTOM"] = "CUSTOM";
})(WalletType || (exports.WalletType = WalletType = {}));
var WalletStatus;
(function (WalletStatus) {
    WalletStatus["ACTIVE"] = "ACTIVE";
    WalletStatus["FROZEN"] = "FROZEN";
    WalletStatus["CLOSED"] = "CLOSED";
})(WalletStatus || (exports.WalletStatus = WalletStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["EXCHANGE"] = "EXCHANGE";
    TransactionType["PAYMENT"] = "PAYMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["MOBILE_MONEY"] = "MOBILE_MONEY";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["CRYPTO"] = "CRYPTO";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var QuoteDirection;
(function (QuoteDirection) {
    QuoteDirection["BUY"] = "BUY";
    QuoteDirection["SELL"] = "SELL";
})(QuoteDirection || (exports.QuoteDirection = QuoteDirection = {}));
var QuoteStatus;
(function (QuoteStatus) {
    QuoteStatus["ACTIVE"] = "ACTIVE";
    QuoteStatus["USED"] = "USED";
    QuoteStatus["EXPIRED"] = "EXPIRED";
    QuoteStatus["CANCELLED"] = "CANCELLED";
})(QuoteStatus || (exports.QuoteStatus = QuoteStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TRANSACTION"] = "TRANSACTION";
    NotificationType["KYC_UPDATE"] = "KYC_UPDATE";
    NotificationType["SECURITY_ALERT"] = "SECURITY_ALERT";
    NotificationType["PROMOTIONAL"] = "PROMOTIONAL";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
