"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const BlockchainService_1 = require("../services/BlockchainService");
const router = express_1.default.Router();
exports.authRouter = router;
const blockchain = new BlockchainService_1.BlockchainService();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token manquant',
            timestamp: Date.now()
        });
    }
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        req.user = { id: decoded.userId };
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Token invalide',
            timestamp: Date.now()
        });
    }
};
exports.authenticateToken = authenticateToken;
