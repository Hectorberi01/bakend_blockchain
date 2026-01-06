// src/controllers/wallet.controller.ts
import { Request, Response } from 'express';
import { WalletType } from '../types/contrats';
import {WalletService} from "../services/MultiWalletService";
import bcrypt from "bcryptjs";
import {Repository} from "typeorm";
import {User} from "../entities";
import {AppDataSource} from "../config/database";

export class WalletController {
    private walletService: WalletService;
    private userRepository: Repository<User>;

    constructor() {
        this.walletService = new WalletService();
        this.userRepository = AppDataSource.getRepository(User);
    }

    createWallet = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

            const walletType = type || WalletType.PERSONAL;
            const walletCurrency = currency || 'XAF';

            // Valider le type de wallet
            if (!Object.values(WalletType).includes(walletType)) {
                return res.status(400).json({
                    error: 'Invalid wallet type'
                });
            }

            const wallet = await this.walletService.createWallet(
                decoded.userId,
                label,
                walletType,
                walletCurrency
            );

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

        } catch (error: any) {
            console.error('Create wallet error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    getUserWallets = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

        } catch (error: any) {
            console.error('Get wallets error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    getWalletById = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

        } catch (error: any) {
            console.error('Get wallet error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    getWalletBalance = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

        } catch (error: any) {
            console.error('Get balance error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    updateBalance = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

            const updatedBalance = await this.walletService.updateBalance(
                Number(walletId),
                currency,
                amount,
                operation
            );

            res.json({
                success: true,
                data:updatedBalance,
                message: 'Balance updated successfully'
            });

        } catch (error: any) {
            console.error('Update balance error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    setDefaultWallet = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

        } catch (error: any) {
            console.error('Set default wallet error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    updateWalletLabel = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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

        } catch (error: any) {
            console.error('Update wallet label error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    exportPrivateKey = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
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
            const user = await this.userRepository.findOne({ where: { id: decoded.userId }});
            if (!user) {
                return res.status(404).json({})
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
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

        } catch (error: any) {
            console.error('Export private key error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    getUserCurrencies = async (req: Request, res: Response) => {
        try {
            const { address } = req.params;
            const result = await this.walletService.getUserCurrencies(address);
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    getUserBalance = async (req: Request, res: Response) => {
        try {
            const { address, currency } = req.params;
            const result = await this.walletService.getUserBalance(address, currency);
            res.json({ currency, balance: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    addCurrency = async (req: Request, res: Response) => {
        try {
            const { currency } = req.body;
            const { walletId } = req.params;
            const txHash = await this.walletService.addCurrencyToWallet(parseInt(walletId), currency);
            res.json({ txHash });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    deposit = async (req: Request, res: Response) => {
        try {
            const { walletId, currency, amount } = req.body;
            const tx = await this.walletService.deposit(walletId, currency, amount);
            res.json({ txHash: tx });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    convert=async (req: Request, res: Response) => {
        try{
            console.log("req.body", req.body);
            const {walletId,fromCurrency, toCurrency, amount, exchangeRate, spread} = req.body;
            const tx = await this.walletService.convert(parseInt(walletId), fromCurrency, toCurrency, amount, exchangeRate, spread);
            console.log("Conversion transaction hash:", tx);
            res.json({ txHash: tx });
        }catch(err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    transfer = async (req: Request, res: Response) => {
        try {
            const { walletId, toAddress, currency, amount } = req.body;
            const txHash = await this.walletService.transfer(walletId, toAddress, currency, amount);
            res.json({ txHash });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    withdraw = async (req: Request, res: Response) => {
        try {
            console.log("Withdraw request body:", req.body);
            const { walletId, currency, amount } = req.body;
            const txHash = await this.walletService.withdraw(walletId, currency, amount);
            res.json({ txHash });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    //Lire les taux
   getExchangeRate = async (req: Request, res: Response) => {
        try {
            const { currency } = req.params;
            const rate = await this.walletService.getExchangeRate(currency);
            res.json({ currency, rate });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    //Configurer un taux (admin)
    setExchangeRate = async (req: Request, res: Response) => {
        try {
            const { currency, rate } = req.body;
            const txHash = await this.walletService.setExchangeRate(currency, rate);
            res.json({ txHash });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    //Lire / définir le spread
    getSpread = async (req: Request, res: Response) => {
        try {
            const { currency } = req.params;
            const spread = await this.walletService.getSpread(currency);
            res.json({ currency, spread });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };
    setSpread = async (req: Request, res: Response) => {
        try {
            const { currency, bps } = req.body;
            const txHash = await this.walletService.setSpread(currency, bps);
            res.json({ txHash });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };
}