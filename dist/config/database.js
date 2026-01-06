"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../entities/User.entity");
const KYCDocument_entity_1 = require("../entities/KYCDocument.entity");
const Wallet_entity_1 = require("../entities/Wallet.entity");
const CurrencyBalance_entity_1 = require("../entities/CurrencyBalance.entity");
const Beneficiary_entity_1 = require("../entities/Beneficiary.entity");
const Transaction_entity_1 = require("../entities/Transaction.entity");
const Escrow_entity_1 = require("../entities/Escrow.entity");
const Quote_entity_1 = require("../entities/Quote.entity");
const Currency_entity_1 = require("../entities/Currency.entity");
const ExchangeRate_entity_1 = require("../entities/ExchangeRate.entity");
const TransferLimit_entity_1 = require("../entities/TransferLimit.entity");
const Session_entity_1 = require("../entities/Session.entity");
const Notification_entity_1 = require("../entities/Notification.entity");
const ActivityLog_entity_1 = require("../entities/ActivityLog.entity");
const SystemConfig_entity_1 = require("../entities/SystemConfig.entity");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// console
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.NODE_ENV === 'development', // Désactiver en production
    logging: false,
    entities: [
        User_entity_1.User,
        KYCDocument_entity_1.KYCDocument,
        Wallet_entity_1.Wallet,
        CurrencyBalance_entity_1.WalletBalance,
        Beneficiary_entity_1.Beneficiary,
        Transaction_entity_1.Transaction,
        Escrow_entity_1.Escrow,
        Quote_entity_1.Quote,
        Currency_entity_1.Currency,
        ExchangeRate_entity_1.ExchangeRate,
        TransferLimit_entity_1.TransferLimit,
        Session_entity_1.Session,
        Notification_entity_1.Notification,
        ActivityLog_entity_1.ActivityLog,
        SystemConfig_entity_1.SystemConfig
    ],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts'],
});
