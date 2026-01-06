import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import ExchangeABI from '../abis/MultiWalletExchange.json';
import { ethers, N } from 'ethers';
import { CryptoService } from './CryptoService';
import { WalletStatus, WalletType } from "../types/contrats";
import { User, Wallet, WalletBalance } from "../entities";
import { NETWORKS } from "../config/contracts";
import { MultiWalletExchangeContract } from './interfaces/MultiWalletExchangeContract';

export class WalletService {
  private walletRepository: Repository<Wallet>;
  private balanceRepository: Repository<WalletBalance>;
  private cryptoService: CryptoService;
  private userRepository: Repository<User>;

  private provider: ethers.JsonRpcProvider | ethers.FallbackProvider;
  private signer?: ethers.Wallet;
  private contract: MultiWalletExchangeContract;
  private rpcUrl = process.env.SEPOLIA_RPC_URL!;
  constructor() {
    this.walletRepository = AppDataSource.getRepository(Wallet);
    this.balanceRepository = AppDataSource.getRepository(WalletBalance);
    this.userRepository = AppDataSource.getRepository(User);
    this.cryptoService = new CryptoService();

    const adminPrivateKey = process.env.DEFAULT_PRIVATE_KEY!;

    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    const adminWallet = new ethers.Wallet(adminPrivateKey, this.provider);
    const address = process.env.EXCHANGE_CONTRACT!;

    this.contract = new ethers.Contract(address, ExchangeABI.abi, adminWallet) as unknown as MultiWalletExchangeContract;

  }

  //Créer un nouveau portefeuille pour un utilisateur
  async createWallet(userId: number, label: string, type: WalletType = WalletType.PERSONAL, currency: 'XAF'
  ): Promise<Wallet> {

    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) { throw new Error("user does not exist"); }

    const ethWallet = ethers.Wallet.createRandom();
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
      status: WalletStatus.ACTIVE,
    });

    await this.walletRepository.save(wallet);
    return wallet;
  }

  //Récupérer et décrypter le portefeuille d’un utilisateur
  async getDecryptedWallet(walletId: number): Promise<ethers.Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const privateKey = this.cryptoService.decrypt(wallet.privateKeyEncrypted);
    console.log("privateKey", privateKey);
    return new ethers.Wallet(privateKey);
  }

  //Lister tous les portefeuilles d’un utilisateur
  async getUserWallets(userId: number): Promise<Wallet[]> {
    console.log("userId", userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    console.log("user", user);
    if (!user) { throw new Error("user does not exist"); }

    return await this.walletRepository.find({
      where: { user: { id: userId } },
      relations: ['balances'],
      order: { isDefault: 'DESC', createdAt: 'DESC' }
    });
  }

  async getWalletById(walletId: number): Promise<Wallet | null> {
    return await this.walletRepository.findOne({
      where: { id: walletId },
      relations: ['balances'],
    });
  }

  //Obtenir le solde d’une devise spécifique dans un portefeuille
  async getBalance(walletId: number, currency: string): Promise<WalletBalance | null> {
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
  async updateBalance(walletId: number, currency: string, amount: string, operation: 'add' | 'subtract'): Promise<WalletBalance> {
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
    } else {
      if (currentBalance < changeAmount) {
        throw new Error('Insufficient balance');
      }
      balance.balance = (currentBalance - changeAmount).toFixed(8);
    }

    return await this.balanceRepository.save(balance);
  }

  async getUserCurrencies(userWalletAddress: string) {
    const supportedCurrencies = ["EUR", "USD", "XOF", "USDT", "ETH"];
    const defaultCurrency = "EUR";

    const results: { currency: string; balance: string }[] = [];

    const walletEntity = await this.walletRepository.findOne({
      where: { address: userWalletAddress },
      relations: ["balances"],
    });

    if (!walletEntity)
      throw new Error(`Wallet introuvable pour l'adresse ${userWalletAddress}`);

    for (const currency of supportedCurrencies) {
      const balanceOnChain = await this.contract.getBalance(userWalletAddress, currency);
      const formattedRaw = ethers.formatUnits(balanceOnChain, 18);
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
        } else {
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
  async getUserBalance(userWalletAddress: string, currency: string) {
    console.log('userWalletAddress, currency');
    const balance: bigint = await this.contract.getBalance(userWalletAddress, currency);
    return ethers.formatUnits(balance, 18);
  }

  async addCurrencyToWallet(walletId: number, currency: string) {

    console.log("walletId:", walletId);
    const walletEntity = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!walletEntity) throw new Error("Wallet introuvable en base");

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


  async deposit(walletId: number, currency: string, amount: string) {
    try {
      const userWallet = await this.getDecryptedWallet(walletId);
      const userAddress = userWallet.address;

      const adminWallet = new ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY!, this.provider);

      const adminBalance = await this.provider.getBalance(adminWallet.address);

      if (adminBalance < ethers.parseEther("0.001")) {
        throw new Error("Admin wallet has insufficient ETH for gas fees");
      }
      const tx = await this.contract.connect(adminWallet).depositFor(userAddress, currency, ethers.parseUnits(amount, 18));

      // Attendre la confirmation
      const receipt = await tx.wait(1);

      return tx.hash;

    } catch (error: any) {
      console.error("Error during deposit:", error);
      throw error;
    }
  }

  async convert(
    walletId: number, from: string, to: string,
    amount: string, exchangeRate: string, spread: number = 25) {

    try {
      // Récupérer l'adresse utilisateur
      const userWallet = await this.getDecryptedWallet(walletId);
      const userAddress = userWallet.address;

      const adminWallet = new ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY!, this.provider);

      const amountWei = ethers.parseUnits(amount, 18);
      const rateWei = ethers.parseUnits(exchangeRate, 18);

      // L'admin signe la transaction avec convertFor
      const tx = await (this.contract.connect(adminWallet) as any).convertFor(
        userAddress,
        from,
        to,
        amountWei,
        rateWei,
        spread
      );

      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error("Error during conversion:", error);
      throw error;
    }
  }

  //Transfert
  async transfer(walletId: number, toAddress: string, currency: string, amount: string) {
    try {
      // Récupérer l'adresse de l'expéditeur
      const userWallet = await this.getDecryptedWallet(walletId);
      const fromAddress = userWallet.address;

      const adminWallet = new ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY!, this.provider);

      // L'admin signe la transaction avec transferFor
      const tx = await (this.contract.connect(adminWallet) as any).transferFor(
        fromAddress,
        toAddress,
        currency,
        ethers.parseUnits(amount, 18)
      );

      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error("Error during transfer:", error);
      throw error;
    }
  }

  // retirer des fonds
  async withdraw(walletId: number, currency: string, amount: string) {
    try {
      const userWallet = await this.getDecryptedWallet(walletId);
      const userAddress = userWallet.address;

      const adminWallet = new ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY!, this.provider);
      console.log("Withdrawing for user:", userAddress);
      console.log("Admin paying gas:", adminWallet.address);

      const tx = await (this.contract.connect(adminWallet) as any).withdrawFor(
        userAddress,
        currency,
        ethers.parseUnits(amount, 18)
      );

      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error("Error during withdrawal:", error);
      throw error;
    }
  }

  // --- Lecture des taux de change ---
  async getExchangeRate(currency: string) {
    const key = ethers.id(currency);
    const rate: bigint = await this.contract.exchangeRates(key);
    return Number(rate);
  }

  // --- Lecture du spread (marge en basis points) ---
  async getSpread(currency: string) {
    const key = ethers.id(currency);
    const spread: bigint = await this.contract.spreads(key);
    return Number(spread);
  }

  // --- Configuration admin : définir un taux ---
  async setExchangeRate(currency: string, rate: number) {
    const tx = await this.contract.setExchangeRate(currency, rate);
    await tx.wait();
    return tx.hash;
  }

  // --- Configuration admin : définir un spread ---
  async setSpread(currency: string, bps: number) {
    const tx = await this.contract.setSpread(currency, bps);
    await tx.wait();
    return tx.hash;
  }
}