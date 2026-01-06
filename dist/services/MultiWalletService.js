"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const database_1 = require("../config/database");
const MultiWalletExchange_json_1 = __importDefault(require("../abis/MultiWalletExchange.json"));
const ethers_1 = require("ethers");
const CryptoService_1 = require("./CryptoService");
const contrats_1 = require("../types/contrats");
const entities_1 = require("../entities");
class WalletService {
    constructor() {
        this.rpcUrl = process.env.SEPOLIA_RPC_URL;
        this.walletRepository = database_1.AppDataSource.getRepository(entities_1.Wallet);
        this.balanceRepository = database_1.AppDataSource.getRepository(entities_1.WalletBalance);
        this.userRepository = database_1.AppDataSource.getRepository(entities_1.User);
        this.cryptoService = new CryptoService_1.CryptoService();
        const adminPrivateKey = process.env.DEFAULT_PRIVATE_KEY;
        this.provider = new ethers_1.ethers.JsonRpcProvider(this.rpcUrl);
        const adminWallet = new ethers_1.ethers.Wallet(adminPrivateKey, this.provider);
        const address = process.env.EXCHANGE_CONTRACT;
        this.contract = new ethers_1.ethers.Contract(address, MultiWalletExchange_json_1.default.abi, adminWallet);
    }
    //Créer un nouveau portefeuille pour un utilisateur
    async createWallet(userId, label, type = contrats_1.WalletType.PERSONAL, currency) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error("user does not exist");
        }
        const ethWallet = ethers_1.ethers.Wallet.createRandom();
        const privateKeyEncrypted = this.cryptoService.encrypt(ethWallet.privateKey);
        const existingWallets = await this.walletRepository.count({ where: { user } });
        const isDefault = existingWallets === 0;
        const wallet = this.walletRepository.create({
            address: ethWallet.address,
            privateKeyEncrypted,
            walletType: type,
            label,
            isDefault,
            user,
            status: contrats_1.WalletStatus.ACTIVE,
        });
        await this.walletRepository.save(wallet);
        return wallet;
    }
    //Récupérer et décrypter le portefeuille d’un utilisateur
    async getDecryptedWallet(walletId) {
        const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        const privateKey = this.cryptoService.decrypt(wallet.privateKeyEncrypted);
        console.log("privateKey", privateKey);
        return new ethers_1.ethers.Wallet(privateKey);
    }
    //Lister tous les portefeuilles d’un utilisateur
    async getUserWallets(userId) {
        console.log("userId", userId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        console.log("user", user);
        if (!user) {
            throw new Error("user does not exist");
        }
        return await this.walletRepository.find({
            where: { user: { id: userId } },
            relations: ['balances'],
            order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
    }
    async getWalletById(walletId) {
        return await this.walletRepository.findOne({
            where: { id: walletId },
            relations: ['balances'],
        });
    }
    //Obtenir le solde d’une devise spécifique dans un portefeuille
    async getBalance(walletId, currency) {
        const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
        console.log("wallet", wallet);
        if (!wallet) {
            throw new Error("wallet not found");
        }
        const normalizedCurrency = currency?.trim().toUpperCase();
        const balance = await this.balanceRepository
            .createQueryBuilder('b')
            .leftJoin('b.wallet', 'w')
            .where('w.id = :walletId', { walletId })
            .andWhere('UPPER(TRIM(b.currency)) = :curr', { curr: normalizedCurrency })
            .getOne();
        if (!balance) {
            throw new Error("balance not found");
        }
        return balance;
    }
    //Mettre à jour le solde d’une devise dans un portefeuille
    async updateBalance(walletId, currency, amount, operation) {
        let balance = await this.getBalance(walletId, currency);
        const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        if (!balance) {
            balance = this.balanceRepository.create({
                currency,
                balance: '0',
                wallet: wallet,
            });
        }
        const currentBalance = parseFloat(balance.balance);
        const changeAmount = parseFloat(amount);
        if (operation === 'add') {
            balance.balance = (currentBalance + changeAmount).toFixed(8);
        }
        else {
            if (currentBalance < changeAmount) {
                throw new Error('Insufficient balance');
            }
            balance.balance = (currentBalance - changeAmount).toFixed(8);
        }
        return await this.balanceRepository.save(balance);
    }
    async getUserCurrencies(userWalletAddress) {
        const supportedCurrencies = ["EUR", "USD", "XOF", "USDT", "ETH"];
        const defaultCurrency = "EUR";
        const results = [];
        const walletEntity = await this.walletRepository.findOne({
            where: { address: userWalletAddress },
            relations: ["balances"],
        });
        if (!walletEntity)
            throw new Error(`Wallet introuvable pour l'adresse ${userWalletAddress}`);
        for (const currency of supportedCurrencies) {
            const balanceOnChain = await this.contract.getBalance(userWalletAddress, currency);
            const formattedRaw = ethers_1.ethers.formatUnits(balanceOnChain, 18);
            const formatted = Number.parseFloat(formattedRaw).toFixed(4);
            let balanceEntity = walletEntity.balances?.find((b) => b.currency === currency);
            //Anti-duplication + création devise par défaut
            if (currency === defaultCurrency) {
                const existing = await this.balanceRepository.findOne({
                    where: {
                        wallet: { id: walletEntity.id },
                        currency: defaultCurrency,
                    },
                });
                if (!existing) {
                    const newBalance = this.balanceRepository.create({
                        wallet: walletEntity,
                        currency: defaultCurrency,
                        balance: formatted,
                    });
                    await this.balanceRepository.save(newBalance);
                    balanceEntity = newBalance;
                }
                else {
                    balanceEntity = existing;
                }
            }
            //Création pour les autres devises uniquement si balance > 0
            if (!balanceEntity && balanceOnChain > 0n) {
                balanceEntity = this.balanceRepository.create({
                    wallet: walletEntity,
                    currency,
                    balance: formatted,
                });
                await this.balanceRepository.save(balanceEntity);
            }
            //Mise à jour
            if (balanceEntity && balanceEntity.balance !== formatted) {
                balanceEntity.balance = formatted;
                await this.balanceRepository.save(balanceEntity);
            }
            if (balanceEntity)
                results.push({ currency, balance: balanceEntity.balance });
        }
        return results;
    }
    // --- Lire le solde d’une seule devise ---
    async getUserBalance(userWalletAddress, currency) {
        console.log('userWalletAddress, currency');
        const balance = await this.contract.getBalance(userWalletAddress, currency);
        return ethers_1.ethers.formatUnits(balance, 18);
    }
    async addCurrencyToWallet(walletId, currency) {
        console.log("walletId:", walletId);
        const walletEntity = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!walletEntity)
            throw new Error("Wallet introuvable en base");
        const amount = "0.01";
        console.log("currency", currency);
        await this.deposit(walletId, currency, amount);
        const result = this.balanceRepository.create({
            currency,
            balance: amount,
            wallet: walletEntity,
        });
        await this.balanceRepository.save(result);
        //return tx.hash;
    }
    async deposit(walletId, currency, amount) {
        try {
            const userWallet = await this.getDecryptedWallet(walletId);
            const userAddress = userWallet.address;
            const adminWallet = new ethers_1.ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY, this.provider);
            const adminBalance = await this.provider.getBalance(adminWallet.address);
            if (adminBalance < ethers_1.ethers.parseEther("0.001")) {
                throw new Error("Admin wallet has insufficient ETH for gas fees");
            }
            const tx = await this.contract.connect(adminWallet).depositFor(userAddress, currency, ethers_1.ethers.parseUnits(amount, 18));
            // Attendre la confirmation
            const receipt = await tx.wait(1);
            return tx.hash;
        }
        catch (error) {
            console.error("Error during deposit:", error);
            throw error;
        }
    }
    async convert(walletId, from, to, amount, exchangeRate, spread = 25) {
        try {
            // Récupérer l'adresse utilisateur
            const userWallet = await this.getDecryptedWallet(walletId);
            const userAddress = userWallet.address;
            const adminWallet = new ethers_1.ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY, this.provider);
            const amountWei = ethers_1.ethers.parseUnits(amount, 18);
            const rateWei = ethers_1.ethers.parseUnits(exchangeRate, 18);
            // L'admin signe la transaction avec convertFor
            const tx = await this.contract.connect(adminWallet).convertFor(userAddress, from, to, amountWei, rateWei, spread);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error("Error during conversion:", error);
            throw error;
        }
    }
    //Transfert
    async transfer(walletId, toAddress, currency, amount) {
        try {
            // Récupérer l'adresse de l'expéditeur
            const userWallet = await this.getDecryptedWallet(walletId);
            const fromAddress = userWallet.address;
            const adminWallet = new ethers_1.ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY, this.provider);
            // L'admin signe la transaction avec transferFor
            const tx = await this.contract.connect(adminWallet).transferFor(fromAddress, toAddress, currency, ethers_1.ethers.parseUnits(amount, 18));
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error("Error during transfer:", error);
            throw error;
        }
    }
    // retirer des fonds
    async withdraw(walletId, currency, amount) {
        try {
            const userWallet = await this.getDecryptedWallet(walletId);
            const userAddress = userWallet.address;
            const adminWallet = new ethers_1.ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY, this.provider);
            console.log("Withdrawing for user:", userAddress);
            console.log("Admin paying gas:", adminWallet.address);
            const tx = await this.contract.connect(adminWallet).withdrawFor(userAddress, currency, ethers_1.ethers.parseUnits(amount, 18));
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error("Error during withdrawal:", error);
            throw error;
        }
    }
    // --- Lecture des taux de change ---
    async getExchangeRate(currency) {
        const key = ethers_1.ethers.id(currency);
        const rate = await this.contract.exchangeRates(key);
        return Number(rate);
    }
    // --- Lecture du spread (marge en basis points) ---
    async getSpread(currency) {
        const key = ethers_1.ethers.id(currency);
        const spread = await this.contract.spreads(key);
        return Number(spread);
    }
    // --- Configuration admin : définir un taux ---
    async setExchangeRate(currency, rate) {
        const tx = await this.contract.setExchangeRate(currency, rate);
        await tx.wait();
        return tx.hash;
    }
    // --- Configuration admin : définir un spread ---
    async setSpread(currency, bps) {
        const tx = await this.contract.setSpread(currency, bps);
        await tx.wait();
        return tx.hash;
    }
}
exports.WalletService = WalletService;
