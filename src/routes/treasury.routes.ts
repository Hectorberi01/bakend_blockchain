import express, { Request, Response } from "express";
import { BlockchainService } from "../services/BlockchainService";

const router = express.Router();
const blockchain = new BlockchainService();

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
router.get("/balance", async (req: Request, res: Response) => {
  try {
    const balance = await blockchain.callView(blockchain.treasury, "getBalance", []);
    res.status(200).json({
      success: true,
      data: balance.toString(),
      timestamp: Date.now(),
    });
  } catch (error: any) {
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
router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const { to, amount } = req.body;
    if (!to || !amount) {
      return res.status(400).json({ success: false, error: "to et amount requis" });
    }

    const result = await blockchain.executeTransaction(blockchain.treasury, "withdraw", [to, amount]);

    const safeResult = JSON.parse(JSON.stringify(result, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    ));

    res.status(200).json({ success: true, data: safeResult, timestamp: Date.now() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as treasuryRouter };
