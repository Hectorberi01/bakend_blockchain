import { ethers, Contract, Wallet, JsonRpcProvider, FallbackProvider } from 'ethers';
import { ABIS, CONTRACT_ADDRESSES, NETWORKS, DEFAULT_CONFIG } from '../config/contracts';

import { TransactionResult } from '../types/contrats';

export class BlockchainService {

    // variable
    private provider: ethers.JsonRpcProvider | ethers.FallbackProvider;
    private signer?: ethers.Wallet;
    private contracts: { [key: string]: Contract } = {};
    private providerBackoff: Map<string, number> = new Map();
    //constructeur
    constructor(networkName: string = 'sepolia', privateKey?: string) {
        const envRpc = process.env.SEPOLIA_RPC_URL;
        const network = NETWORKS[networkName as keyof typeof NETWORKS];

        if (!network && !envRpc)
            throw new Error(`Network ${networkName} not supported and no SEPOLIA_RPC_URL provided`);

        if (envRpc) {
            console.log("✅ Using SEPOLIA_RPC_URL from .env:", envRpc);
            this.provider = new ethers.JsonRpcProvider(envRpc);
        } else {
            this.provider = this.createFallbackProvider(network);
        }

        this.signer = new ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY!, this.provider);
        this.initializeContracts();
    }

    /*** Créer un provider avec fallback automatique*/
    /*** Créer un provider avec fallback automatique et timeout étendu (compatible ethers v6) */
    private createFallbackProvider(network: { rpcUrl?: string; rpcUrls?: string[] }) {
        const envUrls = [
            process.env.SEPOLIA_RPC_URL,
            process.env.ALCHEMY_SEPOLIA_RPC,
            process.env.INFURA_SEPOLIA_RPC,
            process.env.TENDERLY_SEPOLIA_RPC,
            process.env.PUBLICNODE_SEPOLIA_RPC
        ].filter(Boolean) as string[];

        const urls =
            (network.rpcUrls && network.rpcUrls.length)
                ? network.rpcUrls.slice()
                : (envUrls.length
                    ? envUrls
                    : (network.rpcUrl ? [network.rpcUrl] : [])
                );

        const now = Date.now();
        const activeUrls = urls.filter((u) => {
            const until = this.providerBackoff.get(u) || 0;
            return until <= now;
        });

        // Si aucun provider "actif", on retente avec toutes les urls (on évite de staller l'app)
        const finalUrls = activeUrls.length ? activeUrls : urls;

        // 🧩 Création des providers avec timeout manuel
        const providers = finalUrls.map((u) => {
            const provider = new JsonRpcProvider(u);

            // Patch du timeout manuel (Ethers v6 ne permet plus de le passer en options)
            const originalSend = provider.send.bind(provider);
            provider.send = async (method: string, params: any[]) => {
                return await Promise.race([
                    originalSend(method, params),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("⏱️ RPC timeout after 60s")), 60000)
                    ),
                ]);
            };

            return provider;
        });

        if (providers.length === 1) {
            console.log(`✅ Provider unique utilisé : ${finalUrls[0]}`);
            return providers[0];
        }

        // 🔁 Fallback provider
        console.log(`✅ FallbackProvider actif avec ${providers.length} URLs`);
        return new ethers.FallbackProvider(
            providers.map((p) => ({ provider: p, priority: 1, weight: 1 })),
            1 // quorum : 1 provider qui répond suffit
        );
    }



    /*** Exécuter une transaction avec retry automatique*/
    async executeTransaction(contract: Contract, methodName: any, args: any[], overrides?: any): Promise<TransactionResult> {
        console.log("signer", this.signer);
        if (!this.signer) {
            throw new Error('Signer required for transactions');
        }

        const contractWithSigner = contract.connect(this.signer);
        const maxRetries = 3;
        let lastError: any;

        try {
            const gasLimit = await this.estimateGas(contract, methodName, args);
            const gasPrice = await this.getGasPrice();

            const tx = await contract[methodName](...args, {
                gasLimit: gasLimit + BigInt(50000),
                gasPrice,
                ...overrides
            });

            console.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait(DEFAULT_CONFIG.confirmations);

            return {
                hash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
                status: receipt.status
            };
        } catch (error: any) {
            lastError = error;
            // Si c'est une erreur de rate limit, attendre plus longtemps
            if (this.isRateLimitError(error)) {
                console.log('Rate limit detected, waiting longer...');
                await this.sleep(5000);
            }
            else if (this.isNonceError(error)) {
                throw error;
            }
        }
        // }

        throw new Error(`Transaction failed after ${maxRetries} attempts: ${lastError.message}`);
    }

    /*** Appel de fonction view avec retry*/
    async callView(contract: Contract, methodName: string, args: any[] = []): Promise<any> {
        const maxRetries = 3;
        let lastError: any;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }

                return await contract[methodName](...args);
            } catch (error: any) {
                lastError = error;
                console.error(`View call attempt ${attempt + 1} failed:`, error.message);

                if (this.isRateLimitError(error)) {
                    await this.sleep(5000);
                }
            }
        }

        throw new Error(`View call failed after ${maxRetries} attempts: ${lastError.message}`);
    }

    /*** Détecter si c'est une erreur de rate limit*/
    private isRateLimitError(error: any): boolean {
        const message = error.message?.toLowerCase() || '';
        const code = error.code;

        return (
            code === 'SERVER_ERROR' ||
            code === 'NETWORK_ERROR' ||
            message.includes('rate limit') ||
            message.includes('429') ||
            message.includes('too many requests')
        );
    }

    /*** Détecter si c'est une erreur de nonce*/
    private isNonceError(error: any): boolean {
        const message = error.message?.toLowerCase() || '';
        return message.includes('nonce') || message.includes('replacement');
    }

    /*** Obtenir le gas price avec fallback*/
    async getGasPrice(): Promise<bigint> {
        try {
            const feeData = await this.provider.getFeeData();
            return feeData.gasPrice || BigInt(DEFAULT_CONFIG.gasPrice);
        } catch (error) {
            console.warn('Failed to get gas price, using default');
            return BigInt(DEFAULT_CONFIG.gasPrice);
        }
    }

    /*** Estimer le gas avec fallback*/
    async estimateGas(contract: Contract, methodName: string, args: any[]): Promise<bigint> {
        try {
            return await contract[methodName].estimateGas(...args);
        } catch (error) {
            console.warn(`Gas estimation failed for ${methodName}, using default`);
            return BigInt(DEFAULT_CONFIG.gasLimit);
        }
    }

    /*** Utilitaire sleep*/
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private initializeContracts(): void {
        const signerOrProvider = this.signer || this.provider;

        console.log('Initialisation des contrats...');

        this.contracts = {
            testToken: new Contract(CONTRACT_ADDRESSES.testToken, ABIS.TestToken, signerOrProvider),
            userManager: new Contract(CONTRACT_ADDRESSES.userManager, ABIS.UserManager, signerOrProvider),
            multiWallet: new Contract(CONTRACT_ADDRESSES.multiWallet, ABIS.MultiWallet, signerOrProvider),
            treasury: new Contract(CONTRACT_ADDRESSES.treasury, ABIS.TreasuryContract, signerOrProvider),
            exchange: new Contract(CONTRACT_ADDRESSES.exchange, ABIS.ExchangeContract, signerOrProvider),
            escrow: new Contract(CONTRACT_ADDRESSES.escrow, ABIS.EscrowServiceOTP, signerOrProvider)
        };
    }

    get testToken(): Contract {
        return this.contracts.testToken;
    }

    get userManager(): Contract {
        return this.contracts.userManager;
    }

    get multiWallet(): Contract {
        return this.contracts.multiWallet;
    }

    get treasury(): Contract {
        return this.contracts.treasury;
    }

    get exchange(): Contract {
        return this.contracts.exchange;
    }

    get escrow(): Contract {
        return this.contracts.escrow;
    }

    setSigner(privateKey: string): void {
        this.signer = new Wallet(privateKey, this.provider);
        this.initializeContracts();
    }

    removeSigner(): void {
        this.signer = undefined;
        this.initializeContracts();
    }

    async isConnected(): Promise<boolean> {
        try {
            await this.provider.getBlockNumber();
            return true;
        } catch {
            return false;
        }
    }

    getSignerAddress(): string | null {
        return this.signer?.address || null;
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    parseEther(value: string): bigint {return ethers.parseEther(value);}
    formatEther(value: bigint): string {return ethers.formatEther(value);}
    keccak256(data: string): string {return ethers.keccak256(ethers.toUtf8Bytes(data));}
}