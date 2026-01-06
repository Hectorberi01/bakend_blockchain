import express, { Request, Response } from 'express';
import { BlockchainService } from '../services/BlockchainService';
const router = express.Router();

const blockchain = new BlockchainService();

const authenticateToken = (req: any, res: Response, next: any) => {
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
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Token invalide',
            timestamp: Date.now()
        });
    }
};
export { router as authRouter, authenticateToken };