import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {WalletController} from "../controllers/WalletController";

const router = Router();
const walletController = new WalletController();

router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du wallet
 *           example: 1
 *         address:
 *           type: string
 *           description: Adresse Ethereum du wallet
 *           example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *         label:
 *           type: string
 *           description: Nom personnalisé du wallet
 *           example: "Mon Wallet Principal"
 *         type:
 *           type: string
 *           enum: [PERSONAL, BUSINESS, SAVINGS]
 *           description: Type de wallet
 *           example: "PERSONAL"
 *         status:
 *           type: string
 *           enum: [ACTIVE, FROZEN, CLOSED]
 *           description: Statut du wallet
 *           example: "ACTIVE"
 *         isDefault:
 *           type: boolean
 *           description: Wallet par défaut de l'utilisateur
 *           example: true
 *         balances:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WalletBalance'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00Z"
 *
 *     WalletBalance:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           description: Code de la devise
 *           example: "XAF"
 *         balance:
 *           type: string
 *           description: Solde disponible
 *           example: "125000.50"
 *         currencyName:
 *           type: string
 *           description: Nom complet de la devise
 *           example: "CFA Franc"
 *         currencySymbol:
 *           type: string
 *           description: Symbole de la devise
 *           example: "FCFA"
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T14:25:00Z"
 *
 *     CreateWalletRequest:
 *       type: object
 *       required:
 *         - label
 *       properties:
 *         label:
 *           type: string
 *           description: Nom du wallet
 *           example: "Mon Wallet Principal"
 *         type:
 *           type: string
 *           enum: [PERSONAL, BUSINESS, SAVINGS]
 *           description: Type de wallet
 *           default: PERSONAL
 *           example: "PERSONAL"
 *         currency:
 *           type: string
 *           description: Devise initiale du wallet
 *           default: XAF
 *           example: "XAF"
 *
 *     UpdateBalanceRequest:
 *       type: object
 *       required:
 *         - currency
 *         - amount
 *         - operation
 *       properties:
 *         currency:
 *           type: string
 *           description: Code de la devise
 *           example: "XAF"
 *         amount:
 *           type: string
 *           description: Montant à ajouter ou retirer
 *           example: "50000"
 *         operation:
 *           type: string
 *           enum: [add, subtract]
 *           description: Type d'opération
 *           example: "add"
 *
 *     UpdateLabelRequest:
 *       type: object
 *       required:
 *         - label
 *       properties:
 *         label:
 *           type: string
 *           description: Nouveau nom du wallet
 *           example: "Mon Épargne"
 *
 *     ExportKeyRequest:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe pour confirmer l'export
 *           example: "SecurePass123!"
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtenu lors du login
 */

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Gestion des wallets sur la blockchain
 */

/**
 * @swagger
 * /api/wallets:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Créer un nouveau wallet -> C'EST OK
 *     description: |
 *       Crée un nouveau wallet blockchain pour l'utilisateur spécifié.
 *
 *       **Fonctionnalités :**
 *       - Génère automatiquement une adresse Ethereum
 *       - Chiffre la clé privée de manière sécurisée
 *       - Le premier wallet créé devient le wallet par défaut
 *       - Initialise le solde à 0 pour la devise choisie
 *     operationId: createWallet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - label
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *                 example: 1
 *               label:
 *                 type: string
 *                 description: Nom du wallet
 *                 example: "Mon Wallet Principal"
 *               type:
 *                 type: string
 *                 enum: [PERSONAL, BUSINESS, SAVINGS]
 *                 description: Type de wallet
 *                 default: PERSONAL
 *                 example: "PERSONAL"
 *               currency:
 *                 type: string
 *                 description: Devise initiale du wallet
 *                 default: XAF
 *                 example: "XAF"
 *           examples:
 *             personal:
 *               summary: Wallet personnel
 *               value:
 *                 userId: 1
 *                 label: "Mon Wallet Principal"
 *                 type: "PERSONAL"
 *                 currency: "XAF"
 *             business:
 *               summary: Wallet professionnel
 *               value:
 *                 userId: 1
 *                 label: "Entreprise SARL"
 *                 type: "BUSINESS"
 *                 currency: "EUR"
 *             savings:
 *               summary: Wallet épargne
 *               value:
 *                 userId: 1
 *                 label: "Mon Épargne"
 *                 type: "SAVINGS"
 *                 currency: "USDT"
 *             minimal:
 *               summary: Création minimale (valeurs par défaut)
 *               value:
 *                 userId: 1
 *                 label: "Mon Wallet"
 *     responses:
 *       '201':
 *         description: Wallet créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletId:
 *                       type: integer
 *                       example: 1
 *                     address:
 *                       type: string
 *                       example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *                     label:
 *                       type: string
 *                       example: "Mon Wallet Principal"
 *                     type:
 *                       type: string
 *                       example: "PERSONAL"
 *                     isDefault:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     message:
 *                       type: string
 *                       example: "Wallet created successfully"
 *       '400':
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               missingFields:
 *                 summary: Champs manquants
 *                 value:
 *                   error: "Missing required fields: userId, label"
 *               userNotFound:
 *                 summary: Utilisateur non trouvé
 *                 value:
 *                   error: "user does not exist"
 *               invalidType:
 *                 summary: Type invalide
 *                 value:
 *                   error: "Invalid wallet type"
 *       '401':
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       '500':
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/', walletController.createWallet); // OK

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Récupérer tous les wallets de l'utilisateur  -> C'EST OK
 *     description: |
 *       Retourne la liste complète des wallets appartenant à l'utilisateur authentifié.
 *
 *       **Informations retournées :**
 *       - Détails de chaque wallet
 *       - Soldes pour toutes les devises
 *       - Wallet par défaut identifié
 *       - Triés par : wallet par défaut en premier, puis par date de création
 *     operationId: getUserWallets
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Liste des wallets récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Nombre total de wallets
 *                       example: 3
 *                     wallets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Wallet'
 *             examples:
 *               multipleWallets:
 *                 summary: Utilisateur avec plusieurs wallets
 *                 value:
 *                   success: true
 *                   data:
 *                     total: 3
 *                     wallets:
 *                       - id: 1
 *                         address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *                         label: "Mon Wallet Principal"
 *                         type: "PERSONAL"
 *                         status: "ACTIVE"
 *                         isDefault: true
 *                         balances:
 *                           - currency: "XAF"
 *                             balance: "125000.50"
 *                             currencyName: "CFA Franc"
 *                             currencySymbol: "FCFA"
 *                           - currency: "EUR"
 *                             balance: "500.00"
 *                             currencyName: "Euro"
 *                             currencySymbol: "€"
 *                         createdAt: "2025-01-10T10:00:00Z"
 *                       - id: 2
 *                         address: "0x8F3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
 *                         label: "Mon Épargne"
 *                         type: "SAVINGS"
 *                         status: "ACTIVE"
 *                         isDefault: false
 *                         balances:
 *                           - currency: "USDT"
 *                             balance: "1000.00"
 *                             currencyName: "Tether USD"
 *                             currencySymbol: "$"
 *                         createdAt: "2025-01-12T15:30:00Z"
 *       '401':
 *         description: Non authentifié
 *       '500':
 *         description: Erreur serveur
 */
router.get('/', walletController.getUserWallets); // OK

/**
 * @swagger
 * /api/wallets/{walletId}:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Récupérer les détails d'un wallet spécifique  -> C'EST OK
 *     description: |
 *       Retourne les informations détaillées d'un wallet.
 *       L'utilisateur ne peut accéder qu'à ses propres wallets.
 *     operationId: getWalletById
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: walletId
 *         in: path
 *         required: true
 *         description: ID du wallet
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Détails du wallet récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       '400':
 *         description: ID de wallet invalide
 *       '401':
 *         description: Non authentifié
 *       '404':
 *         description: Wallet non trouvé ou accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Wallet not found or access denied"
 *       '500':
 *         description: Erreur serveur
 */
router.get('/:walletId', walletController.getWalletById); // OK

/**
 * @swagger
 * /api/wallets/users/{address}/balance/{currency}:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Récupérer le solde d'un wallet pour une devise  -> C'EST OK
 *     description: |
 *       Retourne le solde d'un wallet pour une devise spécifique.
 *
 *       **Devises supportées :**
 *       - Fiat : XAF, EUR, USD
 *       - Crypto : USDT, BTC, ETH
 *     operationId: getWalletBalance
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         description: Adresse du wallet
 *         schema:
 *           type: string
 *           example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *       - name: currency
 *         in: path
 *         required: true
 *         description: Code de la devise
 *         schema:
 *           type: string
 *           example: "XAF"
 *     responses:
 *       '200':
 *         description: Solde récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WalletBalance'
 *             examples:
 *               xafBalance:
 *                 summary: Solde en XAF
 *                 value:
 *                   success: true
 *                   data:
 *                     walletId: 1
 *                     currency: "XAF"
 *                     balance: "125000.50"
 *                     currencyName: "CFA Franc"
 *                     currencySymbol: "FCFA"
 *                     lastUpdated: "2025-01-15T14:25:00Z"
 *       '400':
 *         description: Paramètres invalides
 *       '401':
 *         description: Non authentifié
 *       '404':
 *         description: Wallet ou devise non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               walletNotFound:
 *                 summary: Wallet non trouvé
 *                 value:
 *                   error: "Wallet not found or access denied"
 *               currencyNotFound:
 *                 summary: Devise non trouvée
 *                 value:
 *                   error: "No balance found for currency EUR"
 *       '500':
 *         description: Erreur serveur
 */
router.get('/:walletId/balance/:currency', walletController.getWalletBalance); // OK

/**
 * @swagger
 * /api/wallets/{walletId}/balance:
 *   put:
 *     tags:
 *       - Wallets
 *     summary: Mettre à jour le solde d'un wallet
 *     description: |
 *       Ajoute ou retire un montant du solde d'un wallet.
 *
 *       **Utilisations :**
 *       - Dépôts (MTN MOMO, carte bancaire)
 *       - Retraits
 *       - Ajustements manuels (admin)
 *
 *       **⚠️ Note :** Cette route devrait être protégée avec des droits spéciaux en production.
 *     operationId: updateBalance
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: walletId
 *         in: path
 *         required: true
 *         description: ID du wallet
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBalanceRequest'
 *           examples:
 *             deposit:
 *               summary: Dépôt de 50000 XAF
 *               value:
 *                 currency: "XAF"
 *                 amount: "50000"
 *                 operation: "add"
 *             withdrawal:
 *               summary: Retrait de 25000 XAF
 *               value:
 *                 currency: "XAF"
 *                 amount: "25000"
 *                 operation: "subtract"
 *     responses:
 *       '200':
 *         description: Solde mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletId:
 *                       type: integer
 *                       example: 1
 *                     currency:
 *                       type: string
 *                       example: "XAF"
 *                     balance:
 *                       type: string
 *                       example: "175000.50"
 *                     operation:
 *                       type: string
 *                       example: "add"
 *                     amount:
 *                       type: string
 *                       example: "50000"
 *                     message:
 *                       type: string
 *                       example: "Balance updated successfully"
 *       '400':
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               missingFields:
 *                 summary: Champs manquants
 *                 value:
 *                   error: "Missing required fields: currency, amount, operation"
 *               invalidOperation:
 *                 summary: Opération invalide
 *                 value:
 *                   error: "Invalid operation. Must be 'add' or 'subtract'"
 *               invalidAmount:
 *                 summary: Montant invalide
 *                 value:
 *                   error: "Invalid amount"
 *       '401':
 *         description: Non authentifié
 *       '404':
 *         description: Wallet non trouvé
 *       '500':
 *         description: "Erreur serveur (ex: solde insuffisant)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Insufficient balance"
 */
router.put('/:walletId/balance', walletController.updateBalance); // OK

/**
 * @swagger
 * /api/wallets/{walletId}/set-default:
 *   put:
 *     tags:
 *       - Wallets
 *     summary: Définir un wallet comme wallet par défaut   -> C'EST OK
 *     description: |
 *       Marque un wallet comme wallet par défaut de l'utilisateur.
 *       Le wallet par défaut est utilisé pour les opérations rapides.
 *
 *       **Comportement :**
 *       - Retire le flag "isDefault" des autres wallets
 *       - Définit le wallet sélectionné comme default
 *     operationId: setDefaultWallet
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: walletId
 *         in: path
 *         required: true
 *         description: ID du wallet à définir comme défaut
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       '200':
 *         description: Wallet par défaut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletId:
 *                       type: integer
 *                       example: 2
 *                     message:
 *                       type: string
 *                       example: "Default wallet updated successfully"
 *       '400':
 *         description: ID invalide
 *       '401':
 *         description: Non authentifié
 *       '404':
 *         description: Wallet non trouvé
 *       '500':
 *         description: Erreur serveur
 */
router.put('/:walletId/set-default', walletController.setDefaultWallet); // OK

/**
 * @swagger
 * /api/wallets/{walletId}/label:
 *   put:
 *     tags:
 *       - Wallets
 *     summary: Mettre à jour le nom d'un wallet   -> C'EST OK
 *     description: |
 *       Permet de renommer un wallet pour une meilleure organisation.
 *
 *       **Exemples de noms :**
 *       - "Mon Wallet Principal"
 *       - "Épargne Vacances"
 *       - "Wallet Professionnel"
 *       - "Budget Courses"
 *     operationId: updateWalletLabel
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: walletId
 *         in: path
 *         required: true
 *         description: ID du wallet
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLabelRequest'
 *           examples:
 *             standard:
 *               summary: Renommer en "Mon Épargne"
 *               value:
 *                 label: "Mon Épargne"
 *     responses:
 *       '200':
 *         description: Label mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletId:
 *                       type: integer
 *                       example: 1
 *                     label:
 *                       type: string
 *                       example: "Mon Épargne"
 *                     message:
 *                       type: string
 *                       example: "Wallet label updated successfully"
 *       '400':
 *         description: Label manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Label is required"
 *       '401':
 *         description: Non authentifié
 *       '404':
 *         description: Wallet non trouvé
 *       '500':
 *         description: Erreur serveur
 */
router.put('/:walletId/label', walletController.updateWalletLabel);     // OK

/**
 * @swagger
 * /api/wallets/{walletId}/export-key:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Exporter la clé privée d'un wallet   -> C'EST OK
 *     description: |
 *       **⚠️ OPÉRATION TRÈS SENSIBLE ⚠️**
 *
 *       Permet d'exporter la clé privée d'un wallet.
 *
 *       **Sécurité :**
 *       - Nécessite une confirmation par mot de passe
 *       - L'opération est loguée
 *       - Ne JAMAIS partager la clé privée
 *
 *       **Cas d'usage :**
 *       - Import dans MetaMask
 *       - Sauvegarde personnelle
 *       - Migration vers une autre plateforme
 *
 *       **⚠️ ATTENTION :**
 *       - Quiconque possède la clé privée contrôle le wallet
 *       - Stockez la clé de manière ultra-sécurisée
 *       - Ne l'envoyez jamais par email ou message
 *     operationId: exportPrivateKey
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: walletId
 *         in: path
 *         required: true
 *         description: ID du wallet
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExportKeyRequest'
 *           examples:
 *             standard:
 *               summary: Exporter avec confirmation
 *               value:
 *                 password: "SecurePass123!"
 *     responses:
 *       '200':
 *         description: Clé privée exportée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletId:
 *                       type: integer
 *                       example: 1
 *                     address:
 *                       type: string
 *                       example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *                     privateKey:
 *                       type: string
 *                       example: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
 *                     warning:
 *                       type: string
 *                       example: "Never share your private key with anyone. Store it securely."
 *       '400':
 *         description: Mot de passe manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Password confirmation required"
 *       '401':
 *         description: Non authentifié ou mot de passe incorrect
 *       '404':
 *         description: Wallet non trouvé
 *       '500':
 *         description: Erreur serveur
 */
router.post('/:walletId/export-key', walletController.exportPrivateKey); // OK

/**
 * @swagger
 * /api/wallets/{address}/currencies:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Récupérer les devises et soldes blockchain d'un utilisateur -> C'EST OK
 *     description: |
 *       Interroge le contrat intelligent pour lister toutes les devises et soldes du wallet utilisateur.
 *
 *       **Informations :**
 *       - Les montants proviennent directement du smart contract `MultiWalletExchange`
 *       - Les soldes sont exprimés en unités standardisées (18 décimales)
 *     operationId: getUserCurrencies
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         description: Adresse Ethereum du wallet
 *         schema:
 *           type: string
 *           example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *     responses:
 *       '200':
 *         description: Liste des devises et soldes récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WalletBalance'
 *       '400':
 *         description: Adresse invalide
 *       '404':
 *         description: Wallet introuvable
 *       '500':
 *         description: Erreur côté blockchain
 */
router.get("/:address/currencies", walletController.getUserCurrencies); // OK

/**
 * @swagger
 * /api/wallets/users/{address}/balance/{currency}:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Obtenir le solde d'une devise spécifique sur la blockchain
 *     description: |
 *       Récupère le solde actuel d'une devise donnée pour une adresse utilisateur via le contrat intelligent.
 *     operationId: getUserBalance
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         description: Adresse Ethereum de l'utilisateur
 *         schema:
 *           type: string
 *           example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *       - name: currency
 *         in: path
 *         required: true
 *         description: "Code de la devise (ex: XAF, EUR, USD)"
 *         schema:
 *           type: string
 *           example: "EUR"
 *     responses:
 *       '200':
 *         description: Solde récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletBalance'
 *       '404':
 *         description: Wallet ou devise non trouvé
 *       '500':
 *         description: Erreur côté blockchain
 */
router.get("/users/:address/balance/:currency", walletController.getUserBalance);// OK

/**
 * @swagger
 * /api/wallets/users/{walletId}/add-currency:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Ajouter une nouvelle devise à un wallet utilisateur -> C'EST OK
 *     description: |
 *       Permet d'ajouter une nouvelle devise à un wallet utilisateur via le contrat `MultiWalletExchange`.
 *       Initialise le solde de la nouvelle devise à zéro.
 *     operationId: addCurrency
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: walletId
 *         in: path
 *         required: true
 *         description: ID du wallet utilisateur
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *             properties:
 *               currency:
 *                 type: string
 *                 description: Code de la devise à ajouter
 *                 example: "USD"
 *     responses:
 *       '200':
 *         description: Devise ajoutée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletId:
 *                       type: integer
 *                       example: 1
 *                     currency:
 *                       type: string
 *                       example: "USD"
 *                     message:
 *                       type: string
 *                       example: "Currency added successfully"
 *       '400':
 *         description: Données invalides
 *       '404':
 *         description: Wallet non trouvé
 *       '500':
 *         description: Erreur côté blockchain
 */
router.post("/users/:walletId/add-currency", walletController.addCurrency); // OK

/**
 * @swagger
 * /api/wallets/deposit:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Effectuer un dépôt dans un wallet blockchain   -> C'EST OK
 *     description: |
 *       Enregistre un dépôt sur la blockchain pour un utilisateur donné.
 *       - Met à jour le solde sur le contrat `MultiWalletExchange`
 *       - Émet un évènement `Deposit` sur la blockchain
 *     operationId: deposit
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - currency
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: Adresse Ethereum de l'utilisateur
 *                 example: 1
 *               currency:
 *                 type: string
 *                 description: Code de la devise
 *                 example: "EUR"
 *               amount:
 *                 type: string
 *                 description: Montant à déposer (en wei)
 *                 example: "1000000000000000000"
 *     responses:
 *       '200':
 *         description: Dépôt effectué avec succès
 *       '400':
 *         description: Données invalides
 *       '500':
 *         description: Erreur côté blockchain
 */
router.post("/deposit", walletController.deposit); // OK

/**
 * @swagger
 * /api/wallets/convert:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Convertir une devise en une autre via le contrat d'échange   -> C'EST OK
 *     description: |
 *       Effectue une conversion blockchain entre deux devises selon le taux défini dans `MultiWalletExchange`.
 *     operationId: convert
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - fromCurrency
 *               - toCurrency
 *               - amount
 *             properties:
 *               walletId:
 *                 type: Number
 *                 description: ID du wallet utilisateur
 *                 example: 1
 *               fromCurrency:
 *                 type: string
 *                 example: "XAF"
 *               toCurrency:
 *                 type: string
 *                 example: "EUR"
 *               amount:
 *                 type: string
 *                 example: "1000000000000000000"
 *     responses:
 *       '200':
 *         description: Conversion effectuée avec succès
 *       '400':
 *         description: Paramètres invalides ou taux manquant
 *       '500':
 *         description: Erreur blockchain
 */
router.post("/convert", walletController.convert); // OK

/**
 * @swagger
 * /api/wallets/transfer:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Transférer des fonds entre deux utilisateurs -> C'EST OK
 *     description: |
 *       Effectue un transfert blockchain d'une devise entre deux adresses utilisateurs.
 *       - Déduit les frais de transfert (par défaut 0.5%)
 *       - Met à jour les soldes sur la blockchain
 *       - Émet un évènement `Transfer`
 *     operationId: transfer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - toAddress
 *               - currency
 *               - amount
 *             properties:
 *               walletId:
 *                 type: number
 *                 description: Adresse de l’expéditeur
 *                 example: 1
 *               toAddress:
 *                 type: string
 *                 description: Adresse du destinataire
 *                 example: "0x2222..."
 *               currency:
 *                 type: string
 *                 description: Code de la devise transférée
 *                 example: "XAF"
 *               amount:
 *                 type: string
 *                 description: Montant transféré (en wei)
 *                 example: "5000000000000000000"
 *     responses:
 *       '200':
 *         description: Transfert effectué avec succès
 *       '400':
 *         description: Paramètres invalides
 *       '500':
 *         description: Erreur blockchain
 */
router.post("/transfer", walletController.transfer); // OK

/**
 * @swagger
 * /api/wallets/withdraw:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Effectuer un retrait depuis un wallet blockchain -> C'EST OK
 *     description: |
 *       Enregistre un retrait sur la blockchain pour un utilisateur donné.
 *       - Met à jour le solde sur le contrat `MultiWalletExchange`
 *       - Émet un évènement `Withdraw` sur la blockchain
 *     operationId: withdraw
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - currency
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: ID du wallet utilisateur
 *                 example: 1
 *               currency:
 *                 type: string
 *                 description: Code de la devise
 *                 example: "EUR"
 *               amount:
 *                 type: string
 *                 description: Montant à retirer (en wei)
 *                 example: "1000000000000000000"
 *     responses:
 *       '200':
 *         description: Retrait effectué avec succès
 *       '400':
 *         description: Données invalides
 *       '500':
 *         description: Erreur côté blockchain
 */
router.post("/withdraw", walletController.withdraw); // OK

// --- ADMIN ROUTES ---

/**
 * @swagger
 * /api/wallets/rate/{currency}:
 *   get:
 *     tags:
 *       - Admin Wallets
 *     summary: Récupérer le taux de change d'une devise
 *     description: |
 *       Retourne le taux de change configuré sur le contrat `MultiWalletExchange`.
 *     operationId: getExchangeRate
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: currency
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "EUR"
 *     responses:
 *       '200':
 *         description: Taux récupéré
 *       '404':
 *         description: Devise inconnue
 *       '500':
 *         description: Erreur blockchain
 */
router.get("/rate/:currency", walletController.getExchangeRate);

/**
 * @swagger
 * /api/wallets/rate:
 *   post:
 *     tags:
 *       - Admin Wallets
 *     summary: Définir un taux de change -> C'EST OK
 *     description: |
 *       Configure le taux de change d'une devise dans le contrat `MultiWalletExchange`.
 *       **⚠️ Réservé aux administrateurs (owner du contrat)**.
 *     operationId: setExchangeRate
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - rate
 *             properties:
 *               currency:
 *                 type: string
 *                 example: "EUR"
 *               rate:
 *                 type: string
 *                 example: "1200"
 *     responses:
 *       '200':
 *         description: Taux mis à jour
 *       '401':
 *         description: Non autorisé
 *       '500':
 *         description: Erreur blockchain
 */
router.post("/rate", walletController.setExchangeRate); // OK

/**
 * @swagger
 * /api/wallets/spread/{currency}:
 *   get:
 *     tags:
 *       - Admin Wallets
 *     summary: Récupérer le spread appliqué à une devise
 *     description: |
 *       Retourne le spread (marge) appliqué pour les conversions d'une devise donnée.
 *     operationId: getSpread
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: currency
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "EUR"
 *     responses:
 *       '200':
 *         description: Spread récupéré
 *       '404':
 *         description: Devise inconnue
 *       '500':
 *         description: Erreur blockchain
 */
router.get("/spread/:currency", walletController.getSpread);

/**
 * @swagger
 * /api/wallets/spread:
 *   post:
 *     tags:
 *       - Admin Wallets
 *     summary: Définir un spread pour une devise -> C'EST OK
 *     description: |
 *       Met à jour le spread (marge en basis points) d'une devise sur le contrat `MultiWalletExchange`.
 *     operationId: setSpread
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - bps
 *             properties:
 *               currency:
 *                 type: string
 *                 example: "EUR"
 *               bps:
 *                 type: integer
 *                 description: Spread en basis points (100 = 1%)
 *                 example: 50
 *     responses:
 *       '200':
 *         description: Spread mis à jour
 *       '401':
 *         description: Non autorisé
 *       '500':
 *         description: Erreur blockchain
 */
router.post("/spread", walletController.setSpread); // OK


export { router as walletRouter };