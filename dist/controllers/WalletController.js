"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const contrats_1 = require("../types/contrats");
const MultiWalletService_1 = require("../services/MultiWalletService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const entities_1 = require("../entities");
const database_1 = require("../config/database");
class WalletController {
    constructor() {
        this.createWallet = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { label, type, currency } = req.body;
                // Validations
                if (!label) {
                    return res.status(400).json({
                        error: 'Missing required field: label'
                    });
                }
                const walletType = type || contrats_1.WalletType.PERSONAL;
                const walletCurrency = currency || 'XAF';
                // Valider le type de wallet
                if (!Object.values(contrats_1.WalletType).includes(walletType)) {
                    return res.status(400).json({
                        error: 'Invalid wallet type'
                    });
                }
                const wallet = await this.walletService.createWallet(decoded.userId, label, walletType, walletCurrency);
                console.log('✅ Wallet created:', wallet.address);
                res.status(201).json({
                    success: true,
                    data: {
                        walletId: wallet.id,
                        address: wallet.address,
                        label: wallet.label,
                        type: wallet.walletType,
                        isDefault: wallet.isDefault,
                        status: wallet.status,
                        message: 'Wallet created successfully'
                    }
                });
            }
            catch (error) {
                console.error('Create wallet error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.getUserWallets = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const wallets = await this.walletService.getUserWallets(decoded.userId);
                res.json({
                    success: true,
                    data: {
                        total: wallets.length,
                        wallets: wallets.map(w => ({
                            id: w.id,
                            address: w.address,
                            label: w.label,
                            type: w.walletType,
                            status: w.status,
                            isDefault: w.isDefault,
                            balances: w.balances,
                            createdAt: w.createdAt
                        }))
                    }
                });
            }
            catch (error) {
                console.error('Get wallets error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.getWalletById = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { walletId } = req.params;
                if (!walletId || isNaN(Number(walletId))) {
                    return res.status(400).json({
                        error: 'Invalid wallet ID'
                    });
                }
                // Récupérer tous les wallets de l'utilisateur
                //const userWallets = await this.walletService.getUserWallets(decoded.userId);
                // Vérifier que le wallet appartient à l'utilisateur
                //const wallet = userWallets.find(w => w.id === Number(walletId));
                const wallet = await this.walletService.getWalletById(Number(walletId));
                if (!wallet) {
                    return res.status(404).json({
                        error: 'Wallet not found or access denied'
                    });
                }
                res.json({
                    success: true,
                    data: {
                        id: wallet.id,
                        address: wallet.address,
                        label: wallet.label,
                        type: wallet.walletType,
                        status: wallet.status,
                        isDefault: wallet.isDefault,
                        balances: wallet.balances,
                        createdAt: wallet.createdAt
                    }
                });
            }
            catch (error) {
                console.error('Get wallet error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.getWalletBalance = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { walletId, currency } = req.params;
                if (!walletId || isNaN(Number(walletId))) {
                    return res.status(400).json({
                        error: 'Invalid wallet ID'
                    });
                }
                // Vérifier que le wallet appartient à l'utilisateur
                const userWallets = await this.walletService.getUserWallets(decoded.userId);
                const wallet = userWallets.find(w => w.id === Number(walletId));
                if (!wallet) {
                    return res.status(404).json({
                        error: 'Wallet not found or access denied'
                    });
                }
                const balance = await this.walletService.getBalance(Number(walletId), currency);
                if (!balance) {
                    return res.status(404).json({
                        error: `No balance found for currency ${currency}`
                    });
                }
                res.json({
                    success: true,
                    data: balance
                });
            }
            catch (error) {
                console.error('Get balance error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.updateBalance = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { walletId } = req.params;
                const { currency, amount, operation } = req.body;
                // Validations
                if (!walletId || isNaN(Number(walletId))) {
                    return res.status(400).json({
                        error: 'Invalid wallet ID'
                    });
                }
                if (!currency || !amount || !operation) {
                    return res.status(400).json({
                        error: 'Missing required fields: currency, amount, operation'
                    });
                }
                if (operation !== 'add' && operation !== 'subtract') {
                    return res.status(400).json({
                        error: 'Invalid operation. Must be "add" or "subtract"'
                    });
                }
                if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                    return res.status(400).json({
                        error: 'Invalid amount'
                    });
                }
                const userWallets = await this.walletService.getUserWallets(decoded.userId);
                const wallet = userWallets.find(w => w.id === Number(walletId));
                if (!wallet) {
                    return res.status(404).json({
                        error: 'Wallet not found or access denied'
                    });
                }
                const updatedBalance = await this.walletService.updateBalance(Number(walletId), currency, amount, operation);
                res.json({
                    success: true,
                    data: updatedBalance,
                    message: 'Balance updated successfully'
                });
            }
            catch (error) {
                console.error('Update balance error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.setDefaultWallet = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { walletId } = req.params;
                if (!walletId || isNaN(Number(walletId))) {
                    return res.status(400).json({
                        error: 'Invalid wallet ID'
                    });
                }
                const userWallets = await this.walletService.getUserWallets(decoded.userId);
                const wallet = userWallets.find(w => w.id === Number(walletId));
                if (!wallet) {
                    return res.status(404).json({
                        error: 'Wallet not found or access denied'
                    });
                }
                for (const w of userWallets) {
                    if (w.id !== Number(walletId) && w.isDefault) {
                        w.isDefault = false;
                        await this.walletService['walletRepository'].save(w);
                    }
                }
                wallet.isDefault = true;
                await this.walletService['walletRepository'].save(wallet);
                res.json({
                    success: true,
                    data: {
                        walletId: wallet.id,
                        message: 'Default wallet updated successfully'
                    }
                });
            }
            catch (error) {
                console.error('Set default wallet error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.updateWalletLabel = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { walletId } = req.params;
                const { label } = req.body;
                if (!walletId || isNaN(Number(walletId))) {
                    return res.status(400).json({
                        error: 'Invalid wallet ID'
                    });
                }
                if (!label || label.trim().length === 0) {
                    return res.status(400).json({
                        error: 'Label is required'
                    });
                }
                // Vérifier que le wallet appartient à l'utilisateur
                const userWallets = await this.walletService.getUserWallets(decoded.userId);
                const wallet = userWallets.find(w => w.id === Number(walletId));
                if (!wallet) {
                    return res.status(404).json({
                        error: 'Wallet not found or access denied'
                    });
                }
                // Mettre à jour le label
                wallet.label = label.trim();
                await this.walletService['walletRepository'].save(wallet);
                res.json({
                    success: true,
                    data: {
                        walletId: wallet.id,
                        label: wallet.label,
                        message: 'Wallet label updated successfully'
                    }
                });
            }
            catch (error) {
                console.error('Update wallet label error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.exportPrivateKey = async (req, res) => {
            try {
                const authReq = req;
                const decoded = authReq.user;
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Authentication required'
                    });
                }
                const { walletId } = req.params;
                const { password } = req.body;
                if (!walletId || isNaN(Number(walletId))) {
                    return res.status(400).json({
                        error: 'Invalid wallet ID'
                    });
                }
                if (!password) {
                    return res.status(400).json({
                        error: 'Password confirmation required'
                    });
                }
                // TODO: Vérifier le mot de passe de l'utilisateur
                const user = await this.userRepository.findOne({ where: { id: decoded.userId } });
                if (!user) {
                    return res.status(404).json({});
                }
                const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
                if (!isPasswordValid) {
                    return res.status(401).json({ error: 'Invalid password' });
                }
                // Vérifier que le wallet appartient à l'utilisateur
                const userWallets = await this.walletService.getUserWallets(decoded.userId);
                const wallet = userWallets.find(w => w.id === Number(walletId));
                if (!wallet) {
                    return res.status(404).json({
                        error: 'Wallet not found or access denied'
                    });
                }
                const decryptedWallet = await this.walletService.getDecryptedWallet(Number(walletId));
                res.json({
                    success: true,
                    data: {
                        walletId: wallet.id,
                        address: wallet.address,
                        privateKey: decryptedWallet.privateKey,
                        warning: 'Never share your private key with anyone. Store it securely.'
                    }
                });
            }
            catch (error) {
                console.error('Export private key error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.getUserCurrencies = async (req, res) => {
            try {
                const { address } = req.params;
                const result = await this.walletService.getUserCurrencies(address);
                res.json(result);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.getUserBalance = async (req, res) => {
            try {
                const { address, currency } = req.params;
                const result = await this.walletService.getUserBalance(address, currency);
                res.json({ currency, balance: result });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.addCurrency = async (req, res) => {
            try {
                const { currency } = req.body;
                const { walletId } = req.params;
                const txHash = await this.walletService.addCurrencyToWallet(parseInt(walletId), currency);
                res.json({ txHash });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.deposit = async (req, res) => {
            try {
                const { walletId, currency, amount } = req.body;
                const tx = await this.walletService.deposit(walletId, currency, amount);
                res.json({ txHash: tx });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.convert = async (req, res) => {
            try {
                console.log("req.body", req.body);
                const { walletId, fromCurrency, toCurrency, amount, exchangeRate, spread } = req.body;
                const tx = await this.walletService.convert(parseInt(walletId), fromCurrency, toCurrency, amount, exchangeRate, spread);
                console.log("Conversion transaction hash:", tx);
                res.json({ txHash: tx });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.transfer = async (req, res) => {
            try {
                const { walletId, toAddress, currency, amount } = req.body;
                const txHash = await this.walletService.transfer(walletId, toAddress, currency, amount);
                res.json({ txHash });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.withdraw = async (req, res) => {
            try {
                console.log("Withdraw request body:", req.body);
                const { walletId, currency, amount } = req.body;
                const txHash = await this.walletService.withdraw(walletId, currency, amount);
                res.json({ txHash });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        //Lire les taux
        this.getExchangeRate = async (req, res) => {
            try {
                const { currency } = req.params;
                const rate = await this.walletService.getExchangeRate(currency);
                res.json({ currency, rate });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        //Configurer un taux (admin)
        this.setExchangeRate = async (req, res) => {
            try {
                const { currency, rate } = req.body;
                const txHash = await this.walletService.setExchangeRate(currency, rate);
                res.json({ txHash });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        //Lire / définir le spread
        this.getSpread = async (req, res) => {
            try {
                const { currency } = req.params;
                const spread = await this.walletService.getSpread(currency);
                res.json({ currency, spread });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.setSpread = async (req, res) => {
            try {
                const { currency, bps } = req.body;
                const txHash = await this.walletService.setSpread(currency, bps);
                res.json({ txHash });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        };
        this.walletService = new MultiWalletService_1.WalletService();
        this.userRepository = database_1.AppDataSource.getRepository(entities_1.User);
    }
}
exports.WalletController = WalletController;
