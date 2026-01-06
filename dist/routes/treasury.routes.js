"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.treasuryRouter = void 0;
const express_1 = __importDefault(require("express"));
const BlockchainService_1 = require("../services/BlockchainService");
const router = express_1.default.Router();
exports.treasuryRouter = router;
const blockchain = new BlockchainService_1.BlockchainService();
/**
 * @swagger
 * /api/treasury/balance:
 *   get:
 *     summary: Consulter le solde de la trésorerie
 *     tags: [Treasury]
 *     responses:
 *       200:
 *         description: Solde de la trésorerie récupéré avec succès
 *       400:
 *         description: Erreur lors de la récupération du solde
 */
router.get("/balance", async (req, res) => {
    try {
        const balance = await blockchain.callView(blockchain.treasury, "getBalance", []);
        res.status(200).json({
            success: true,
            data: balance.toString(),
            timestamp: Date.now(),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * @swagger
 * /api/treasury/withdraw:
 *   post:
 *     summary: Retirer des fonds depuis la trésorerie (admin seulement)
 *     tags: [Treasury]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - amount
 *             properties:
 *               to:
 *                 type: string
 *                 example: "0xAbC123456789..."
 *               amount:
 *                 type: string
 *                 example: "1000000000000000000"
 *     responses:
 *       200:
 *         description: Retrait effectué avec succès
 *       400:
 *         description: Erreur ou autorisation refusée
 */
router.post("/withdraw", async (req, res) => {
    try {
        const { to, amount } = req.body;
        if (!to || !amount) {
            return res.status(400).json({ success: false, error: "to et amount requis" });
        }
        const result = await blockchain.executeTransaction(blockchain.treasury, "withdraw", [to, amount]);
        const safeResult = JSON.parse(JSON.stringify(result, (_, v) => typeof v === "bigint" ? v.toString() : v));
        res.status(200).json({ success: true, data: safeResult, timestamp: Date.now() });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
