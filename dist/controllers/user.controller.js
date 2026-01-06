"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const ethers_1 = require("ethers");
const UserManagerService_1 = require("../services/UserManagerService");
const contracts_1 = require("../config/contracts");
const database_1 = require("../config/database");
const entities_1 = require("../entities");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class UserController {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(entities_1.User);
        this.createUserFor = async (req, res) => {
            const queryRunner = database_1.AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                console.log("req.body", req.body);
                const { email, country, phoneHash, password, metadata } = req.body;
                if (!email || !country || !phoneHash || !password) {
                    return res.status(400).json({
                        error: 'Missing required fields: email, country, phoneHash, password'
                    });
                }
                // Validations
                const emailValidation = this.userManagerService.validateEmail(email);
                if (!emailValidation.valid) {
                    return res.status(400).json({ error: emailValidation.message });
                }
                const passwordValidation = this.userManagerService.validatePassword(password);
                if (!passwordValidation.valid) {
                    return res.status(400).json({ error: passwordValidation.message });
                }
                const countryValidation = this.userManagerService.validateCountryCode(country);
                if (!countryValidation.valid) {
                    return res.status(400).json({ error: countryValidation.message });
                }
                const hashedPhone = ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(phoneHash));
                console.log("Creating user on blockchain...");
                console.log("phoneHash:", hashedPhone);
                const passwordHash = await bcryptjs_1.default.hash(password, 12);
                const tx = await this.userManagerService.createUserFor({
                    email,
                    country,
                    phoneHash: hashedPhone,
                    password,
                    metadata: JSON.stringify(metadata || {})
                });
                console.log("Transaction sent. Waiting for confirmation...");
                const receipt = await this.userManagerService.waitForTransaction(tx);
                console.log("receipt", receipt);
                let userId = null;
                if (receipt?.logs) {
                    for (const log of receipt.logs) {
                        if (log.topics[0] === ethers_1.ethers.id('UserCreated(bytes32,string,string,uint256)')) {
                            userId = log.topics[1];
                            break;
                        }
                    }
                }
                console.log("Extracted userId:", userId);
                if (!userId) {
                    throw new Error('Failed to extract userId from blockchain transaction');
                }
                const user = queryRunner.manager.create(entities_1.User, {
                    blockchainUserId: userId,
                    email: email.toLowerCase(),
                    country: country,
                    phoneHash: phoneHash,
                    passwordHash: passwordHash,
                    metadata: metadata || '',
                    walletLinked: false,
                    isActive: true,
                    createdAt: new Date()
                });
                await queryRunner.manager.save(user);
                await queryRunner.commitTransaction();
                console.log("User created in database with ID:", user.id);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        userId: userId,
                        message: 'User created successfully. Send userId and password to the user.'
                    }
                });
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.getAllUsers = async (req, res) => {
            try {
                const offset = parseInt(req.query.offset) || 0;
                const limit = parseInt(req.query.limit) || 100;
                const Users = await this.userRepository.find();
                if (Users.length === 0) {
                    return res.json({
                        success: true,
                        data: {
                            total: 0,
                            offset,
                            limit,
                            users: Users
                        }
                    });
                }
                res.json({
                    success: true,
                    data: {
                        total: Users.length,
                        offset,
                        limit,
                        users: Users
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.getUserById = async (req, res) => {
            try {
                const { userId } = req.params;
                if (!userId) {
                    return res.status(400).json({ error: 'Invalid userId format' });
                }
                const user = await this.userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ['wallets'],
                });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.json({
                    success: true,
                    user: user
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        error: 'Missing required fields: privateKey, email, password'
                    });
                }
                const data = {
                    email,
                    password,
                };
                const user = await this.userRepository.findOne({
                    where: { email: data.email },
                });
                if (!user) {
                    return res.status(400).json({
                        error: 'Missing required fields: email, email, password'
                    });
                }
                const token = this.generateToken(email, user.id);
                res.json({
                    success: true,
                    data: {
                        token,
                        userId: user.id,
                        email: user.email,
                        message: 'Login successful'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                const authHeader = req.headers.authorization;
                const tokenFromHeader = authHeader ? authHeader.split(" ")[1] : undefined;
                const tokenFromCookie = req.cookies ? req.cookies.token : undefined;
                const token = tokenFromHeader ?? tokenFromCookie;
                if (!token) {
                    res.clearCookie("token", {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                    });
                    return res.status(200).json({
                        success: true,
                        data: { message: "Logout successful (no token supplied). Please remove token client-side." },
                    });
                }
                res.clearCookie("token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });
                return res.status(200).json({
                    success: true,
                    data: { message: "Logout successful. Token invalidated server-side (if applicable). Please remove token client-side." },
                });
            }
            catch (error) {
                console.error("Logout error:", error);
                return res.status(500).json({
                    success: false,
                    error: error?.message ?? "Unknown error during logout",
                });
            }
        };
        this.changePassword = async (req, res) => {
            try {
                const { oldPassword, newPassword } = req.body;
                console.log("req.body", req.body);
                // Récupérer l'utilisateur depuis le token JWT
                const token = req.headers.authorization?.split(' ')[1];
                console.log("token", token);
                if (!token) {
                    return res.status(401).json({
                        error: 'Authentication token required'
                    });
                }
                // Décoder le token pour obtenir l'email/userId
                let decoded;
                try {
                    decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                }
                catch (error) {
                    return res.status(401).json({
                        error: 'Invalid or expired token'
                    });
                }
                // Validation des champs requis
                if (!oldPassword || !newPassword) {
                    return res.status(400).json({
                        error: 'Missing required fields: oldPassword, newPassword'
                    });
                }
                // Validation du nouveau mot de passe
                const passwordValidation = this.userManagerService.validatePassword(newPassword);
                if (!passwordValidation.valid) {
                    return res.status(400).json({ error: passwordValidation.message });
                }
                // Récupérer l'utilisateur depuis la DB
                const user = await this.userRepository.findOne({
                    where: { email: decoded.email.toLowerCase() }
                });
                if (!user) {
                    return res.status(404).json({
                        error: 'User not found'
                    });
                }
                console.log("user", user);
                // Vérifier l'ancien mot de passe
                const isOldPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.passwordHash);
                console.log("isOldPasswordValid", isOldPasswordValid);
                if (!isOldPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid old password'
                    });
                }
                // Vérifier que le nouveau mot de passe est différent
                const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.passwordHash);
                if (isSamePassword) {
                    return res.status(400).json({
                        error: 'New password must be different from old password'
                    });
                }
                // Hash du nouveau mot de passe
                const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 12);
                // Mettre à jour dans la DB
                user.passwordHash = newPasswordHash;
                user.updatedAt = new Date();
                await this.userRepository.save(user);
                return res.json({
                    success: true,
                    data: {
                        message: 'Password changed successfully',
                        updatedInDatabase: true,
                    }
                });
            }
            catch (error) {
                console.error('Change password error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.checkWalletLinked = async (req, res) => {
            try {
                const { address } = req.params;
                if (!ethers_1.ethers.isAddress(address)) {
                    return res.status(400).json({ error: 'Invalid address format' });
                }
                const isLinked = await this.userManagerService.isWalletLinked(address);
                res.json({
                    success: true,
                    data: { isLinked }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Vérifie si un utilisateur est connecté
         */
        this.checkLoginStatus = async (req, res) => {
            try {
                const { address } = req.params;
                if (!ethers_1.ethers.isAddress(address)) {
                    return res.status(400).json({ error: 'Invalid address format' });
                }
                const isLoggedIn = await this.userManagerService.isUserLoggedIn(address);
                if (isLoggedIn) {
                    const session = await this.userManagerService.getSession(address);
                    return res.json({
                        success: true,
                        data: {
                            isLoggedIn: true,
                            session: {
                                email: session.email,
                                loginTime: session.loginTime.toString(),
                                lastActivity: session.lastActivity.toString()
                            }
                        }
                    });
                }
                res.json({
                    success: true,
                    data: { isLoggedIn: false }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        // ========== WRITE ENDPOINTS (ACCOUNT CREATOR) ==========
        // ========== WRITE ENDPOINTS (USER WITH WALLET) ==========
        /**
         * Lie un wallet à un compte utilisateur
         */
        this.linkWallet = async (req, res) => {
            try {
                const { privateKey, email, password } = req.body;
                if (!privateKey || !email || !password) {
                    return res.status(400).json({
                        error: 'Missing required fields: privateKey, email, password'
                    });
                }
                const provider = (0, contracts_1.getProvider)();
                const userWallet = new ethers_1.ethers.Wallet(privateKey, provider);
                const tx = await this.userManagerService.linkWalletToAccount(userWallet, {
                    email,
                    password
                });
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        walletAddress: userWallet.address,
                        message: 'Wallet linked successfully'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Met à jour les informations utilisateur
         */
        this.updateUserInfo = async (req, res) => {
            try {
                const { privateKey, email, country, metadata } = req.body;
                if (!privateKey || !email || !country) {
                    return res.status(400).json({
                        error: 'Missing required fields: privateKey, email, country'
                    });
                }
                const countryValidation = this.userManagerService.validateCountryCode(country);
                if (!countryValidation.valid) {
                    return res.status(400).json({ error: countryValidation.message });
                }
                const provider = (0, contracts_1.getProvider)();
                const userWallet = new ethers_1.ethers.Wallet(privateKey, provider);
                const tx = await this.userManagerService.updateUserInfo(userWallet, {
                    email,
                    country,
                    metadata: metadata || ''
                });
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: 'User info updated successfully'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        // ========== WRITE ENDPOINTS (ADMIN) ==========
        /**
         * Désactive un utilisateur
         */
        this.deactivateUser = async (req, res) => {
            try {
                const { userId } = req.params;
                if (!userId) {
                    return res.status(400).json({ error: 'Invalid userId' });
                }
                const tx = await this.userManagerService.deactivateUser(userId);
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: 'User deactivated successfully'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Réactive un utilisateur
         */
        this.reactivateUser = async (req, res) => {
            try {
                const { userId } = req.params;
                if (!userId) {
                    return res.status(400).json({ error: 'Invalid userId' });
                }
                const tx = await this.userManagerService.reactivateUser(userId);
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: 'User reactivated successfully'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Déverrouille un compte utilisateur
         */
        this.unlockAccount = async (req, res) => {
            try {
                const { userId } = req.params;
                if (!userId) {
                    return res.status(400).json({ error: 'Invalid userId' });
                }
                const tx = await this.userManagerService.unlockAccount(userId);
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: 'Account unlocked successfully'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Définit ou révoque les droits de créateur de compte
         */
        this.setAccountCreator = async (req, res) => {
            try {
                const { address, enabled } = req.body;
                if (!ethers_1.ethers.isAddress(address)) {
                    return res.status(400).json({ error: 'Invalid address format' });
                }
                if (typeof enabled !== 'boolean') {
                    return res.status(400).json({ error: 'enabled must be a boolean' });
                }
                const tx = await this.userManagerService.setAccountCreator(address, enabled);
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: enabled ? 'Account creator added' : 'Account creator removed'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Met le contrat en pause
         */
        this.pauseContract = async (req, res) => {
            try {
                const tx = await this.userManagerService.pause();
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: 'Contract paused'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        /**
         * Réactive le contrat
         */
        this.unpauseContract = async (req, res) => {
            try {
                const tx = await this.userManagerService.unpause();
                const receipt = await this.userManagerService.waitForTransaction(tx);
                res.json({
                    success: true,
                    data: {
                        transactionHash: receipt?.hash,
                        blockNumber: receipt?.blockNumber,
                        message: 'Contract unpaused'
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.userManagerService = new UserManagerService_1.UserManagerService();
    }
    hashPassword(password) {
        return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(password));
    }
    generateToken(email, userId) {
        return jsonwebtoken_1.default.sign({ email, userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    }
    simpleHash(str) {
        const buffer = new TextEncoder().encode(str);
        let hex = "";
        for (let i = 0; i < buffer.length; i++) {
            hex += buffer[i].toString(16).padStart(2, "0");
        }
        return "0x" + hex.padEnd(64, "0").slice(0, 64);
    }
}
exports.UserController = UserController;
