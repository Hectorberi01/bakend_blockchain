import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {authMiddleware} from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// ajout de tags Swagger pour la documentation
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users/id/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Récupérer les informations d'un utilisateur par son userId
 *     description: Récupère les informations complètes d'un utilisateur à partir de son identifiant unique (bytes32)
 *     operationId: getUserInfoById
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: L'identifiant unique de l'utilisateur (bytes32)
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       '200':
 *         description: Informations utilisateur récupérées avec succès
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
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     country:
 *                       type: string
 *                     phoneHash:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                     lastLoginDate:
 *                       type: string
 *                     failedLoginAttempts:
 *                       type: string
 *                     metadata:
 *                       type: string
 *       '400':
 *         description: Format de userId invalide
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur serveur
 */
router.get('/id/:userId', userController.getUserById);

/**
 * @swagger
 * /api/users/wallet/{address}/login-status:
 *   get:
 *     tags:
 *       - Users
 *     summary: Vérifier le statut de connexion d'un utilisateur
 *     description: Vérifie si un utilisateur est connecté et récupère les informations de sa session active
 *     operationId: checkLoginStatus
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         description: L'adresse Ethereum du wallet
 *         schema:
 *           type: string
 *           example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
 *     responses:
 *       '200':
 *         description: Statut récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         isLoggedIn:
 *                           type: boolean
 *                           example: true
 *                         session:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: string
 *                             loginTime:
 *                               type: string
 *                             lastActivity:
 *                               type: string
 *                     - type: object
 *                       properties:
 *                         isLoggedIn:
 *                           type: boolean
 *                           example: false
 *       '400':
 *         description: Format d'adresse invalide
 *       '500':
 *         description: Erreur serveur
 */
router.get('/wallet/:address/login-status', userController.checkLoginStatus);
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Récupérer tous les utilisateurs avec pagination
 *     description: Récupère une liste paginée de tous les identifiants utilisateurs (userIds)
 *     operationId: getAllUsers
 *     parameters:
 *       - name: offset
 *         in: query
 *         description: Position de départ pour la pagination
 *         schema:
 *           type: integer
 *           default: 0
 *           example: 0
 *       - name: limit
 *         in: query
 *         description: Nombre maximum d'éléments à retourner
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 1000
 *           example: 10
 *     responses:
 *       '200':
 *         description: Liste des utilisateurs récupérée avec succès
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
 *                       type: string
 *                       example: "150"
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     userIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["0x1234...abcd", "0x5678...efgh"]
 *       '500':
 *         description: Erreur serveur
 */
router.get('/', userController.getAllUsers);
/**
 * @swagger
 * /api/users/create:
 *   post:
 *     tags:
 *       - Users
 *     summary: Créer un utilisateur sans wallet
 *     description: |
 *       Crée un nouvel utilisateur **sans wallet associé**.
 *       L'utilisateur pourra lier un wallet ultérieurement.
 *
 *       ⚠️ **Nécessite les droits `Account Creator`**
 *       ⚠️ Le `phoneHash` fourni sera **rehashé côté serveur**
 *     operationId: createUserFor
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - country
 *               - phoneHash
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email unique de l'utilisateur
 *                 example: john.doe@example.com
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 description: Code pays ISO 3166-1 alpha-2
 *                 example: FR
 *               phoneHash:
 *                 type: string
 *                 description: |
 *                   Hash du numéro de téléphone (fourni par le client).
 *                   Il sera **rehashé côté serveur** avant stockage.
 *                 example: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Mot de passe en clair (hashé côté serveur)
 *                 example: SecurePass123!
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Métadonnées optionnelles (JSON libre)
 *                 example:
 *                   firstName: John
 *                   lastName: Doe
 *     responses:
 *       '201':
 *         description: Utilisateur créé avec succès
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
 *                     transactionHash:
 *                       type: string
 *                       nullable: true
 *                       example: "0xabc123..."
 *                     blockNumber:
 *                       type: number
 *                       nullable: true
 *                       example: 12345678
 *                     userId:
 *                       type: string
 *                       description: Identifiant blockchain de l'utilisateur
 *                       example: "0x9f8a7b..."
 *                     message:
 *                       type: string
 *                       example: User created successfully. Send userId and password to the user.
 *       '400':
 *         description: Données invalides ou champs manquants
 *       '401':
 *         description: Non autorisé – droits insuffisants
 *       '500':
 *         description: Erreur interne ou blockchain
 */

router.post('/create', userController.createUserFor);
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Connexion d'un utilisateur
 *     description: |
 *       Authentifie un utilisateur avec son email et mot de passe.
 *       Crée une session active sur la blockchain.
 *       Architecture custodial : le wallet est géré par le backend.
 *     operationId: login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "hector.adjakpa@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Hector01"
 *           examples:
 *             standard:
 *               summary: Login standard
 *               value:
 *                 email: "hector.adjakpa@gmail.com"
 *                 password: "Hector01"
 *     responses:
 *       '200':
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     walletAddress:
 *                       type: string
 *                     message:
 *                       type: string
 *       '400':
 *         description: Données manquantes
 *       '401':
 *         description: Identifiants incorrects
 *       '423':
 *         description: Compte verrouillé (trop de tentatives échouées)
 *       '500':
 *         description: Erreur blockchain
 */
router.post('/login', userController.login);
/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Déconnexion d'un utilisateur
 *     description: Ferme la session active de l'utilisateur sur la blockchain
 *     operationId: logout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     message:
 *                       type: string
 *       '400':
 *         description: Clé privée manquante
 *       '404':
 *         description: Aucune session active
 *       '500':
 *         description: Erreur blockchain
 */
router.post('/logout', userController.logout);
/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags:
 *       - Users
 *     summary: Changer le mot de passe
 *     description: |
 *       Permet à un utilisateur authentifié de changer son mot de passe.
 *       Nécessite un token JWT valide dans l'en-tête Authorization.
 *       Le mot de passe est mis à jour en base de données et sur la blockchain si le wallet est lié.
 *     operationId: changePassword
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Ancien mot de passe
 *                 example: "SecurePass123!"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nouveau mot de passe (min 8 caractères)
 *                 example: "NewSecurePass456!"
 *           examples:
 *             standard:
 *               summary: Changement de mot de passe standard
 *               value:
 *                 oldPassword: "SecurePass123!"
 *                 newPassword: "NewSecurePass456!"
 *     responses:
 *       '200':
 *         description: Mot de passe changé avec succès
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
 *                     message:
 *                       type: string
 *                       example: "Password changed successfully"
 *                     updatedInDatabase:
 *                       type: boolean
 *                       example: true
 *                     updatedOnBlockchain:
 *                       type: boolean
 *                       example: true
 *                     transactionHash:
 *                       type: string
 *                       example: "0xabc123..."
 *                     blockNumber:
 *                       type: number
 *                       example: 12345678
 *             examples:
 *               withBlockchain:
 *                 summary: Mise à jour avec blockchain
 *                 value:
 *                   success: true
 *                   data:
 *                     message: "Password changed successfully"
 *                     updatedInDatabase: true
 *                     updatedOnBlockchain: true
 *                     transactionHash: "0xabc123..."
 *                     blockNumber: 12345678
 *               withoutBlockchain:
 *                 summary: Mise à jour sans blockchain (wallet non lié)
 *                 value:
 *                   success: true
 *                   data:
 *                     message: "Password changed successfully"
 *                     updatedInDatabase: true
 *                     updatedOnBlockchain: false
 *       '400':
 *         description: Données invalides
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
 *             examples:
 *               missingFields:
 *                 summary: Champs manquants
 *                 value:
 *                   error: "Missing required fields: oldPassword, newPassword"
 *               weakPassword:
 *                 summary: Mot de passe trop court
 *                 value:
 *                   error: "Le mot de passe doit contenir au moins 8 caractères"
 *               samePassword:
 *                 summary: Même mot de passe
 *                 value:
 *                   error: "New password must be different from old password"
 *       '401':
 *         description: Non authentifié ou ancien mot de passe incorrect
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
 *             examples:
 *               noToken:
 *                 summary: Token manquant
 *                 value:
 *                   error: "Authentication token required"
 *               invalidToken:
 *                 summary: Token invalide
 *                 value:
 *                   error: "Invalid or expired token"
 *               wrongPassword:
 *                 summary: Ancien mot de passe incorrect
 *                 value:
 *                   success: false
 *                   error: "Invalid old password"
 *       '404':
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
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
router.put('/change-password', authMiddleware, userController.changePassword);
/**
 * @swagger
 * /api/users:
 *   put:
 *     tags:
 *       - Users
 *     summary: Mettre à jour les informations utilisateur
 *     description: |
 *       Permet à un utilisateur connecté de mettre à jour son email, pays et métadonnées.
 *       L'utilisateur doit être connecté pour effectuer cette opération.
 *     operationId: updateUserInfo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - email
 *               - country
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Clé privée du wallet
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nouvel email
 *                 example: "john.updated@example.com"
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 description: Nouveau code pays (2 lettres)
 *                 example: "US"
 *               metadata:
 *                 type: string
 *                 description: Nouvelles métadonnées JSON
 *                 example: '{"firstName":"John","lastName":"Doe Updated"}'
 *     responses:
 *       '200':
 *         description: Informations mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     message:
 *                       type: string
 *       '400':
 *         description: Données invalides ou email déjà utilisé
 *       '401':
 *         description: Non connecté
 *       '500':
 *         description: Erreur blockchain
 */
router.put('/', userController.updateUserInfo);
/**
 * @swagger
 * /api/users/id/{userId}/deactivate:
 *   put:
 *     tags:
 *       - Users
 *     summary: Désactiver un utilisateur
 *     description: |
 *       Désactive le compte d'un utilisateur. L'utilisateur ne pourra plus se connecter
 *       ni effectuer d'opérations jusqu'à réactivation.
 *       **Nécessite les droits Admin.**
 *     operationId: deactivateUser
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: L'identifiant unique de l'utilisateur (bytes32)
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     responses:
 *       '200':
 *         description: Utilisateur désactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     message:
 *                       type: string
 *       '400':
 *         description: userId invalide
 *       '401':
 *         description: Non autorisé
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur blockchain
 */
router.put('/id/:userId/deactivate', userController.deactivateUser);
/**
 * @swagger
 * /api/users/id/{userId}/reactivate:
 *   put:
 *     tags:
 *       - Users
 *     summary: Réactiver un utilisateur
 *     description: |
 *       Réactive le compte d'un utilisateur précédemment désactivé.
 *       **Nécessite les droits Admin.**
 *     operationId: reactivateUser
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: L'identifiant unique de l'utilisateur (bytes32)
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     responses:
 *       '200':
 *         description: Utilisateur réactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     message:
 *                       type: string
 *       '400':
 *         description: userId invalide
 *       '401':
 *         description: Non autorisé
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur blockchain
 */
router.put('/id/:userId/reactivate', userController.reactivateUser);
/**
 * @swagger
 * /api/users/id/{userId}/unlock:
 *   put:
 *     tags:
 *       - Users
 *     summary: Débloquer un compte utilisateur
 *     description: |
 *       Réinitialise les tentatives de connexion échouées et débloque le compte.
 *       Un compte est verrouillé après 5 tentatives de connexion échouées.
 *       **Nécessite les droits Admin.**
 *     operationId: unlockAccount
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: L'identifiant unique de l'utilisateur (bytes32)
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     responses:
 *       '200':
 *         description: Compte débloqué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     message:
 *                       type: string
 *       '400':
 *         description: userId invalide
 *       '401':
 *         description: Non autorisé
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur blockchain
 */
router.put('/id/:userId/unlock', userController.unlockAccount);
/**
 * @swagger
 * /api/users/account-creator:
 *   post:
 *     tags:
 *       - Users
 *     summary: Ajouter/retirer un account creator
 *     description: |
 *       Autorise ou révoque les droits de création de compte pour une adresse.
 *       Les account creators peuvent créer des comptes pour d'autres utilisateurs.
 *       **Nécessite les droits Owner.**
 *     operationId: setAccountCreator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - enabled
 *             properties:
 *               address:
 *                 type: string
 *                 description: Adresse Ethereum à autoriser/révoquer
 *                 example: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
 *               enabled:
 *                 type: boolean
 *                 description: true pour autoriser, false pour révoquer
 *                 example: true
 *     responses:
 *       '200':
 *         description: Droits mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     blockNumber:
 *                       type: number
 *                     message:
 *                       type: string
 *       '400':
 *         description: Adresse invalide ou enabled non booléen
 *       '401':
 *         description: Non autorisé
 *       '500':
 *         description: Erreur blockchain
 * */
 router.post('/account-creator', userController.setAccountCreator);
/**
 * @swagger
 * /api/users/pause:
 *   post:
 *     tags:
 *       - Users
 *     summary: Mettre en pause le contrat
 *     description: |
 *       Suspend toutes les opérations sur le contrat en cas d'urgence.
 *       ⚠️ **ATTENTION:** Cette action bloque toutes les opérations utilisateurs !
 *       **Nécessite les droits Owner.**
 *     operationId: pauseContract
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Contrat mis en pause avec succès
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
 *                     transactionHash:
 *                       type: string
 *                       example: "0xabc123..."
 *                     blockNumber:
 *                       type: number
 *                       example: 12345678
 *                     message:
 *                       type: string
 *                       example: "Contract paused"
 *       '401':
 *         description: Non autorisé (seul le owner peut pauser)
 *       '500':
 *         description: Erreur blockchain
 */
router.post('/pause', userController.pauseContract);
/**
 * @swagger
 * /api/users/unpause:
 *   post:
 *     tags:
 *       - Users
 *     summary: Reprendre le contrat
 *     description: |
 *       Réactive le contrat après une pause d'urgence.
 *       Toutes les opérations redeviennent possibles.
 *       **Nécessite les droits Owner.**
 *     operationId: unpauseContract
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Contrat repris avec succès
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
 *                     transactionHash:
 *                       type: string
 *                       example: "0xabc123..."
 *                     blockNumber:
 *                       type: number
 *                       example: 12345679
 *                     message:
 *                       type: string
 *                       example: "Contract unpaused"
 *       '401':
 *         description: Non autorisé (seul le owner peut reprendre)
 *       '500':
 *         description: Erreur blockchain
 */
router.post('/unpause', userController.unpauseContract);

export { router as userRouter }