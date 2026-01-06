"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagerService = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../config/contracts");
class UserManagerService {
    constructor() {
        const provider = (0, contracts_1.getProvider)();
        const adminWallet = (0, contracts_1.getAdminWallet)();
        const accountCreatorWallet = (0, contracts_1.getAccountCreatorWallet)();
        (0, contracts_1.verifyContractDeployment)();
        this.contract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, provider);
        this.adminContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, adminWallet);
        this.accountCreatorContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, accountCreatorWallet);
    }
    // ========== READ FUNCTIONS ==========
    /**
     * Récupère les informations d'un utilisateur par son ID
     */
    async getUserInfo(userId) {
        const user = await this.contract.getUserInfo(userId);
        return {
            userId: user.userId,
            email: user.email,
            country: user.country,
            phoneHash: user.phoneHash,
            walletAddress: user.walletAddress,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginDate: user.lastLoginDate,
            failedLoginAttempts: user.failedLoginAttempts,
            metadata: user.metadata
        };
    }
    /**
     * Récupère les informations d'un utilisateur par son wallet
     */
    async getUserInfoByWallet(walletAddress) {
        const user = await this.contract.getUserInfoByWallet(walletAddress);
        return {
            userId: user.userId,
            email: user.email,
            country: user.country,
            phoneHash: user.phoneHash,
            walletAddress: user.walletAddress,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginDate: user.lastLoginDate,
            failedLoginAttempts: user.failedLoginAttempts,
            metadata: user.metadata
        };
    }
    /**
     * Vérifie si un wallet est lié à un utilisateur
     */
    async isWalletLinked(walletAddress) {
        return await this.contract.isWalletLinked(walletAddress);
    }
    /**
     * Vérifie si un utilisateur existe par son ID
     */
    async userExists(userId) {
        return await this.contract.userExists(userId);
    }
    /**
     * Vérifie si un email existe déjà
     */
    async emailExists(email) {
        return await this.contract.emailExists(email);
    }
    /**
     * Vérifie si un téléphone existe déjà
     */
    async phoneExists(phoneHash) {
        return await this.contract.phoneExists(phoneHash);
    }
    /**
     * Récupère l'ID utilisateur à partir d'un wallet
     */
    async getWalletToUserId(walletAddress) {
        return await this.contract.walletToUserId(walletAddress);
    }
    /**
     * Vérifie si un utilisateur est connecté
     */
    async isUserLoggedIn(walletAddress) {
        return await this.contract.isUserLoggedIn(walletAddress);
    }
    /**
     * Récupère les informations de session
     */
    async getSession(walletAddress) {
        const session = await this.contract.getSession(walletAddress);
        return {
            isActive: session.isActive,
            loginTime: session.loginTime,
            lastActivity: session.lastActivity,
            email: session.email
        };
    }
    /**
     * Récupère le nombre total d'utilisateurs
     */
    async getTotalUsers() {
        try {
            return await this.contract.getTotalUsers();
        }
        catch (error) {
            console.error('Error in getTotalUsers:', error);
            if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
                console.warn('Contract returned empty data for getTotalUsers, returning 0');
                return 0n;
            }
            throw new Error(`Failed to get total users: ${error.message}`);
        }
    }
    /**
     * Récupère une liste d'IDs utilisateurs avec pagination
     */
    async getUserIds(offset = 0, limit = 100) {
        return await this.contract.getUserIds(offset, limit);
    }
    /**
     * Vérifie si une adresse est un créateur de compte autorisé
     */
    async isAccountCreator(address) {
        return await this.contract.isAccountCreator(address);
    }
    // ========== WRITE FUNCTIONS (ACCOUNT CREATOR) ==========
    /**
     * Crée un utilisateur sans wallet (par un account creator)
     */
    async createUserFor(data) {
        const tx = await this.accountCreatorContract.createUserFor(data.email, data.country, data.phoneHash, data.password, data.metadata || '');
        return tx;
    }
    // ========== WRITE FUNCTIONS (USER WITH WALLET) ==========
    /**
     * Lie un wallet à un compte utilisateur existant
     */
    async linkWalletToAccount(userWallet, data) {
        const userContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, userWallet);
        const tx = await userContract.linkWalletToAccount(data.email, data.password);
        return tx;
    }
    /**
     * Connecte un utilisateur avec email et mot de passe
     */
    async login(userWallet, data) {
        const userContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, userWallet);
        const tx = await userContract.login(data.email, data.password);
        return tx;
    }
    /**
     * Déconnecte l'utilisateur actuel
     */
    async logout(userWallet) {
        const userContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, userWallet);
        const tx = await userContract.logout();
        return tx;
    }
    /**
     * Change le mot de passe de l'utilisateur connecté
     */
    async changePassword(userWallet, email, data) {
        const userContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, userWallet);
        const tx = await userContract.changePassword(email, data.oldPassword, data.newPassword);
        return tx;
    }
    /**
     * Met à jour les informations de l'utilisateur
     */
    async updateUserInfo(userWallet, data) {
        const userContract = new ethers_1.ethers.Contract(contracts_1.CONFIG.USER_MANAGER_ADDRESS, contracts_1.ABIS.UserManager, userWallet);
        const tx = await userContract.updateUserInfo(data.email, data.country, data.metadata || '');
        return tx;
    }
    // ========== WRITE FUNCTIONS (ADMIN) ==========
    /**
     * Désactive un utilisateur
     */
    async deactivateUser(userId) {
        const tx = await this.adminContract.deactivateUser(userId);
        return tx;
    }
    /**
     * Réactive un utilisateur
     */
    async reactivateUser(userId) {
        const tx = await this.adminContract.reactivateUser(userId);
        return tx;
    }
    /**
     * Déverrouille un compte bloqué
     */
    async unlockAccount(userId) {
        const tx = await this.adminContract.unlockAccount(userId);
        return tx;
    }
    /**
     * Définit ou révoque les droits de créateur de compte
     */
    async setAccountCreator(creatorAddress, enabled) {
        const tx = await this.adminContract.setAccountCreator(creatorAddress, enabled);
        return tx;
    }
    /**
     * Met le contrat en pause
     */
    async pause() {
        const tx = await this.adminContract.pause();
        return tx;
    }
    /**
     * Réactive le contrat
     */
    async unpause() {
        const tx = await this.adminContract.unpause();
        return tx;
    }
    // ========== UTILITY FUNCTIONS ==========
    /**
     * Attend la confirmation d'une transaction
     */
    async waitForTransaction(tx) {
        const receipt = await tx.wait();
        return receipt;
    }
    /**
     * Convertit wei en ether
     */
    formatEther(value) {
        return ethers_1.ethers.formatEther(value);
    }
    /**
     * Convertit ether en wei
     */
    parseEther(value) {
        return ethers_1.ethers.parseEther(value);
    }
    /**
     * Convertit un timestamp en date lisible
     */
    formatTimestamp(timestamp) {
        return new Date(Number(timestamp) * 1000).toLocaleString();
    }
    /**
     * Vérifie si un mot de passe respecte les critères minimaux
     */
    validatePassword(password) {
        if (password.length < 8) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
        }
        return { valid: true };
    }
    /**
     * Vérifie si un email est valide
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Format d\'email invalide' };
        }
        return { valid: true };
    }
    /**
     * Vérifie si un code pays est valide (2 lettres)
     */
    validateCountryCode(country) {
        if (country.length !== 2) {
            return { valid: false, message: 'Le code pays doit contenir exactement 2 lettres' };
        }
        return { valid: true };
    }
}
exports.UserManagerService = UserManagerService;
