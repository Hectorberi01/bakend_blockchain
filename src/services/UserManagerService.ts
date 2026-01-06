import {CreateUserForDto, UpdateUserDto, LinkWalletDto, LoginDto, ChangePasswordDto} from "../types/contrats";
import { ethers } from "ethers";
import {
    ABIS,
    CONFIG,
    getAccountCreatorWallet,
    getAdminWallet,
    getProvider,
    verifyContractDeployment
} from "../config/contracts";

export class UserManagerService {
    private contract: ethers.Contract;
    private adminContract: ethers.Contract;
    private accountCreatorContract: ethers.Contract;

    constructor() {
        const provider = getProvider();
        const adminWallet = getAdminWallet();
        const accountCreatorWallet = getAccountCreatorWallet();
        verifyContractDeployment();

        this.contract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            provider
        );

        this.adminContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            adminWallet
        );

        this.accountCreatorContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            accountCreatorWallet
        );
    }

    // ========== READ FUNCTIONS ==========

    /**
     * Récupère les informations d'un utilisateur par son ID
     */
    async getUserInfo(userId: string) {
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
    async getUserInfoByWallet(walletAddress: string) {
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
    async isWalletLinked(walletAddress: string): Promise<boolean> {
        return await this.contract.isWalletLinked(walletAddress);
    }

    /**
     * Vérifie si un utilisateur existe par son ID
     */
    async userExists(userId: string): Promise<boolean> {
        return await this.contract.userExists(userId);
    }

    /**
     * Vérifie si un email existe déjà
     */
    async emailExists(email: string): Promise<boolean> {
        return await this.contract.emailExists(email);
    }

    /**
     * Vérifie si un téléphone existe déjà
     */
    async phoneExists(phoneHash: string): Promise<boolean> {
        return await this.contract.phoneExists(phoneHash);
    }

    /**
     * Récupère l'ID utilisateur à partir d'un wallet
     */
    async getWalletToUserId(walletAddress: string): Promise<string> {
        return await this.contract.walletToUserId(walletAddress);
    }

    /**
     * Vérifie si un utilisateur est connecté
     */
    async isUserLoggedIn(walletAddress: string): Promise<boolean> {
        return await this.contract.isUserLoggedIn(walletAddress);
    }

    /**
     * Récupère les informations de session
     */
    async getSession(walletAddress: string) {
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
    async getTotalUsers(): Promise<bigint> {
        try {
            return await this.contract.getTotalUsers();
        } catch (error: any) {
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
    async getUserIds(offset: number = 0, limit: number = 100): Promise<string[]> {
        return await this.contract.getUserIds(offset, limit);
    }

    /**
     * Vérifie si une adresse est un créateur de compte autorisé
     */
    async isAccountCreator(address: string): Promise<boolean> {
        return await this.contract.isAccountCreator(address);
    }

    // ========== WRITE FUNCTIONS (ACCOUNT CREATOR) ==========

    /**
     * Crée un utilisateur sans wallet (par un account creator)
     */
    async createUserFor(data: CreateUserForDto): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.accountCreatorContract.createUserFor(
            data.email,
            data.country,
            data.phoneHash,
            data.password,
            data.metadata || ''
        );
        return tx;
    }

    // ========== WRITE FUNCTIONS (USER WITH WALLET) ==========

    /**
     * Lie un wallet à un compte utilisateur existant
     */
    async linkWalletToAccount(
        userWallet: ethers.Wallet,
        data: LinkWalletDto
    ): Promise<ethers.ContractTransactionResponse> {
        const userContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            userWallet
        );

        const tx = await userContract.linkWalletToAccount(
            data.email,
            data.password
        );
        return tx;
    }

    /**
     * Connecte un utilisateur avec email et mot de passe
     */
    async login(userWallet: ethers.Wallet, data: LoginDto): Promise<ethers.ContractTransactionResponse> {
        const userContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            userWallet
        );

        const tx = await userContract.login(
            data.email,
            data.password
        );
        return tx;
    }

    /**
     * Déconnecte l'utilisateur actuel
     */
    async logout(
        userWallet: ethers.Wallet
    ): Promise<ethers.ContractTransactionResponse> {
        const userContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            userWallet
        );

        const tx = await userContract.logout();
        return tx;
    }

    /**
     * Change le mot de passe de l'utilisateur connecté
     */
    async changePassword(userWallet: ethers.Wallet,email:string,data: ChangePasswordDto): Promise<ethers.ContractTransactionResponse> {
        const userContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            userWallet
        );

        const tx = await userContract.changePassword(
            email,
            data.oldPassword,
            data.newPassword
        );
        return tx;
    }

    /**
     * Met à jour les informations de l'utilisateur
     */
    async updateUserInfo(
        userWallet: ethers.Wallet,
        data: UpdateUserDto
    ): Promise<ethers.ContractTransactionResponse> {
        const userContract = new ethers.Contract(
            CONFIG.USER_MANAGER_ADDRESS,
            ABIS.UserManager,
            userWallet
        );

        const tx = await userContract.updateUserInfo(
            data.email,
            data.country,
            data.metadata || ''
        );
        return tx;
    }

    // ========== WRITE FUNCTIONS (ADMIN) ==========

    /**
     * Désactive un utilisateur
     */
    async deactivateUser(userId: string): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.adminContract.deactivateUser(userId);
        return tx;
    }

    /**
     * Réactive un utilisateur
     */
    async reactivateUser(userId: string): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.adminContract.reactivateUser(userId);
        return tx;
    }

    /**
     * Déverrouille un compte bloqué
     */
    async unlockAccount(userId: string): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.adminContract.unlockAccount(userId);
        return tx;
    }

    /**
     * Définit ou révoque les droits de créateur de compte
     */
    async setAccountCreator(
        creatorAddress: string,
        enabled: boolean
    ): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.adminContract.setAccountCreator(creatorAddress, enabled);
        return tx;
    }

    /**
     * Met le contrat en pause
     */
    async pause(): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.adminContract.pause();
        return tx;
    }

    /**
     * Réactive le contrat
     */
    async unpause(): Promise<ethers.ContractTransactionResponse> {
        const tx = await this.adminContract.unpause();
        return tx;
    }

    // ========== UTILITY FUNCTIONS ==========

    /**
     * Attend la confirmation d'une transaction
     */
    async waitForTransaction(tx: ethers.ContractTransactionResponse) {
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * Convertit wei en ether
     */
    formatEther(value: bigint): string {
        return ethers.formatEther(value);
    }

    /**
     * Convertit ether en wei
     */
    parseEther(value: string): bigint {
        return ethers.parseEther(value);
    }

    /**
     * Convertit un timestamp en date lisible
     */
    formatTimestamp(timestamp: bigint): string {
        return new Date(Number(timestamp) * 1000).toLocaleString();
    }

    /**
     * Vérifie si un mot de passe respecte les critères minimaux
     */
    validatePassword(password: string): { valid: boolean; message?: string } {
        if (password.length < 8) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
        }
        return { valid: true };
    }

    /**
     * Vérifie si un email est valide
     */
    validateEmail(email: string): { valid: boolean; message?: string } {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Format d\'email invalide' };
        }
        return { valid: true };
    }

    /**
     * Vérifie si un code pays est valide (2 lettres)
     */
    validateCountryCode(country: string): { valid: boolean; message?: string } {
        if (country.length !== 2) {
            return { valid: false, message: 'Le code pays doit contenir exactement 2 lettres' };
        }
        return { valid: true };
    }
}