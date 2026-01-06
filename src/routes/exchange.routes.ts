// import express, { Request, Response } from "express";
// import { BlockchainService } from "../services/BlockchainService";
// import { ExchangeService } from "../services/ExchangeService";
// import { SetExchangeRateRequest, ConvertRequest } from "../types/contrats";

// const router = express.Router();
// const blockchain = new BlockchainService();
// const exchangeService = new ExchangeService(blockchain);

// /**
//  * @swagger
//  * tags:
//  *   name: Exchange
//  *   description: Gestion des conversions et des taux de change sur la blockchain
//  */

// /**
//  * @swagger
//  * /api/exchange/setRate:
//  *   post:
//  *     summary: Définir un taux de change et un spread pour une devise
//  *     tags: [Exchange]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - currency
//  *               - rate
//  *               - spreadBps
//  *             properties:
//  *               currency:
//  *                 type: string
//  *                 example: "USD"
//  *               rate:
//  *                 type: string
//  *                 example: "1000000000000000000"
//  *               spreadBps:
//  *                 type: integer
//  *                 example: 100
//  *     responses:
//  *       200:
//  *         description: Taux défini avec succès
//  *       400:
//  *         description: Erreur lors de la mise à jour du taux
//  */
// router.post("/setRate", async (req: Request, res: Response) => {
//   try {
//     const { currency, rate, spreadBps } = req.body as SetExchangeRateRequest;

//     if (!currency || !rate || spreadBps === undefined) {
//       return res.status(400).json({ error: "currency, rate et spreadBps requis" });
//     }

//     const result = await exchangeService.setExchangeRate({ currency, rate, spreadBps });
//     res.status(result.success ? 200 : 400).json(result);
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /**
//  * @swagger
//  * /api/exchange/convertToToken:
//  *   post:
//  *     summary: Convertir une devise vers le token ERC20
//  *     tags: [Exchange]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - currency
//  *               - amount
//  *             properties:
//  *               currency:
//  *                 type: string
//  *                 example: "USD"
//  *               amount:
//  *                 type: string
//  *                 example: "1000000000000000000"
//  *     responses:
//  *       200:
//  *         description: Conversion réussie
//  *       400:
//  *         description: Erreur de conversion
//  */
// router.post("/convertToToken", async (req: Request, res: Response) => {
//   try {
//     const { currency, amount } = req.body as ConvertRequest;

//     if (!currency || !amount) {
//       return res.status(400).json({ error: "currency et amount requis" });
//     }

//     const result = await exchangeService.convertToToken({ currency, amount });
//     res.status(result.success ? 200 : 400).json(result);
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /**
//  * @swagger
//  * /api/exchange/convertFromToken:
//  *   post:
//  *     summary: Convertir un token ERC20 vers une devise
//  *     tags: [Exchange]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - currency
//  *               - amount
//  *             properties:
//  *               currency:
//  *                 type: string
//  *                 example: "USD"
//  *               amount:
//  *                 type: string
//  *                 example: "1000000000000000000"
//  *     responses:
//  *       200:
//  *         description: Conversion réussie
//  *       400:
//  *         description: Erreur de conversion
//  */
// router.post("/convertFromToken", async (req: Request, res: Response) => {
//   try {
//     const { currency, amount } = req.body as ConvertRequest;

//     if (!currency || !amount) {
//       return res.status(400).json({ error: "currency et amount requis" });
//     }

//     const result = await exchangeService.convertFromToken({ currency, amount });
//     res.status(result.success ? 200 : 400).json(result);
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /**
//  * @swagger
//  * /api/exchange/rate/{currency}:
//  *   get:
//  *     summary: Obtenir le taux de change pour une devise
//  *     tags: [Exchange]
//  *     parameters:
//  *       - in: path
//  *         name: currency
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: "Code de la devise (ex: 'USD')"
//  *     responses:
//  *       200:
//  *         description: Taux de change récupéré avec succès
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: string
//  *                   example: "1000000000000000000"
//  *                 timestamp:
//  *                   type: number
//  *                   example: 1760442016703
//  *       404:
//  *         description: Aucun taux défini pour cette devise
//  *       400:
//  *         description: Requête invalide
//  */
// router.get("/rate/:currency", async (req: Request, res: Response) => {
//   try {
//     const currency = req.params.currency;
//     if (!currency) {
//       return res.status(400).json({ success: false, error: "Paramètre currency manquant" });
//     }

//     const rate = await blockchain.callView(blockchain.exchange, "getExchangeRate", [currency]);

//     if (!rate || rate === 0n) {
//       return res.status(404).json({ success: false, error: "Aucun taux trouvé" });
//     }

//     res.status(200).json({
//       success: true,
//       data: rate.toString(),
//       timestamp: Date.now()
//     });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /**
//  * @swagger
//  * /api/exchange/spread/{currency}:
//  *   get:
//  *     summary: Obtenir le spread (en basis points) pour une devise
//  *     tags: [Exchange]
//  *     parameters:
//  *       - in: path
//  *         name: currency
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: "Code de la devise (ex: 'USD')"
//  *     responses:
//  *       200:
//  *         description: Spread récupéré avec succès
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: string
//  *                   example: "100"
//  *                 timestamp:
//  *                   type: number
//  *       404:
//  *         description: Aucun spread défini pour cette devise
//  *       400:
//  *         description: Paramètre manquant ou invalide
//  */
// router.get("/spread/:currency", async (req: Request, res: Response) => {
//   try {
//     const currency = req.params.currency;
//     if (!currency) {
//       return res.status(400).json({ success: false, error: "Paramètre currency manquant" });
//     }

//     const spread = await blockchain.callView(blockchain.exchange, "getSpread", [currency]);

//     if (!spread || spread === 0n) {
//       return res.status(404).json({ success: false, error: "Aucun spread trouvé" });
//     }

//     res.status(200).json({
//       success: true,
//       data: spread.toString(),
//       timestamp: Date.now()
//     });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /**
//  * @swagger
//  * /api/exchange/info/{currency}:
//  *   get:
//  *     summary: Obtenir les informations complètes d'une devise (taux et spread)
//  *     tags: [Exchange]
//  *     parameters:
//  *       - in: path
//  *         name: currency
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: "Code de la devise (ex: 'USD')"
//  *     responses:
//  *       200:
//  *         description: Informations récupérées avec succès
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     rate:
//  *                       type: string
//  *                       example: "1000000000000000000"
//  *                     spread:
//  *                       type: string
//  *                       example: "100"
//  *                 timestamp:
//  *                   type: number
//  *                   example: 1760442016703
//  *       404:
//  *         description: Aucun taux/spread trouvé pour cette devise
//  *       400:
//  *         description: Paramètre manquant ou invalide
//  */
// router.get("/info/:currency", async (req: Request, res: Response) => {
//   try {
//     const currency = req.params.currency;
//     if (!currency) {
//       return res.status(400).json({ success: false, error: "Paramètre currency manquant" });
//     }

//     const [rate, spread] = await Promise.all([
//       blockchain.callView(blockchain.exchange, "getExchangeRate", [currency]),
//       blockchain.callView(blockchain.exchange, "getSpread", [currency]),
//     ]);

//     if ((!rate || rate === 0n) && (!spread || spread === 0n)) {
//       return res.status(404).json({
//         success: false,
//         error: "Aucun taux/spread défini pour cette devise",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         rate: rate?.toString() || "0",
//         spread: spread?.toString() || "0",
//       },
//       timestamp: Date.now(),
//     });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// export { router as exchangeRouter };
