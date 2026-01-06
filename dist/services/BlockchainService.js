"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../config/contracts");
class BlockchainService {
    //constructeur
    constructor(networkName = 'sepolia', privateKey) {
        this.contracts = {};
        this.providerBackoff = new Map();
        const envRpc = process.env.SEPOLIA_RPC_URL;
        const network = contracts_1.NETWORKS[networkName];
        if (!network && !envRpc)
            throw new Error(`Network ${networkName} not supported and no SEPOLIA_RPC_URL provided`);
        if (envRpc) {
            console.log("✅ Using SEPOLIA_RPC_URL from .env:", envRpc);
            this.provider = new ethers_1.ethers.JsonRpcProvider(envRpc);
        }
        else {
            this.provider = this.createFallbackProvider(network);
        }
        this.signer = new ethers_1.ethers.Wallet(process.env.DEFAULT_PRIVATE_KEY, this.provider);
        this.initializeContracts();
    }
    /*** Créer un provider avec fallback automatique*/
    /*** Créer un provider avec fallback automatique et timeout étendu (compatible ethers v6) */
    createFallbackProvider(network) {
        const envUrls = [
            process.env.SEPOLIA_RPC_URL,
            process.env.ALCHEMY_SEPOLIA_RPC,
            process.env.INFURA_SEPOLIA_RPC,
            process.env.TENDERLY_SEPOLIA_RPC,
            process.env.PUBLICNODE_SEPOLIA_RPC
        ].filter(Boolean);
        const urls = (network.rpcUrls && network.rpcUrls.length)
            ? network.rpcUrls.slice()
            : (envUrls.length
                ? envUrls
                : (network.rpcUrl ? [network.rpcUrl] : []));
        const now = Date.now();
        const activeUrls = urls.filter((u) => {
            const until = this.providerBackoff.get(u) || 0;
            return until <= now;
        });
        // Si aucun provider "actif", on retente avec toutes les urls (on évite de staller l'app)
        const finalUrls = activeUrls.length ? activeUrls : urls;
        // 🧩 Création des providers avec timeout manuel
        const providers = finalUrls.map((u) => {
            const provider = new ethers_1.JsonRpcProvider(u);
            // Patch du timeout manuel (Ethers v6 ne permet plus de le passer en options)
            const originalSend = provider.send.bind(provider);
            provider.send = async (method, params) => {
                return await Promise.race([
                    originalSend(method, params),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("⏱️ RPC timeout after 60s")), 60000)),
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
        return new ethers_1.ethers.FallbackProvider(providers.map((p) => ({ provider: p, priority: 1, weight: 1 })), 1 // quorum : 1 provider qui répond suffit
        );
    }
    /*** Exécuter une transaction avec retry automatique*/
    async executeTransaction(contract, methodName, args, overrides) {
        console.log("signer", this.signer);
        if (!this.signer) {
            throw new Error('Signer required for transactions');
        }
        const contractWithSigner = contract.connect(this.signer);
        const maxRetries = 3;
        let lastError;
        try {
            const gasLimit = await this.estimateGas(contract, methodName, args);
            const gasPrice = await this.getGasPrice();
            const tx = await contract[methodName](...args, {
                gasLimit: gasLimit + BigInt(50000),
                gasPrice,
                ...overrides
            });
            console.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait(contracts_1.DEFAULT_CONFIG.confirmations);
            return {
                hash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
                status: receipt.status
            };
        }
        catch (error) {
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
    async callView(contract, methodName, args = []) {
        const maxRetries = 3;
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }
                return await contract[methodName](...args);
            }
            catch (error) {
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
    isRateLimitError(error) {
        const message = error.message?.toLowerCase() || '';
        const code = error.code;
        return (code === 'SERVER_ERROR' ||
            code === 'NETWORK_ERROR' ||
            message.includes('rate limit') ||
            message.includes('429') ||
            message.includes('too many requests'));
    }
    /*** Détecter si c'est une erreur de nonce*/
    isNonceError(error) {
        const message = error.message?.toLowerCase() || '';
        return message.includes('nonce') || message.includes('replacement');
    }
    /*** Obtenir le gas price avec fallback*/
    async getGasPrice() {
        try {
            const feeData = await this.provider.getFeeData();
            return feeData.gasPrice || BigInt(contracts_1.DEFAULT_CONFIG.gasPrice);
        }
        catch (error) {
            console.warn('Failed to get gas price, using default');
            return BigInt(contracts_1.DEFAULT_CONFIG.gasPrice);
        }
    }
    /*** Estimer le gas avec fallback*/
    async estimateGas(contract, methodName, args) {
        try {
            return await contract[methodName].estimateGas(...args);
        }
        catch (error) {
            console.warn(`Gas estimation failed for ${methodName}, using default`);
            return BigInt(contracts_1.DEFAULT_CONFIG.gasLimit);
        }
    }
    /*** Utilitaire sleep*/
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    initializeContracts() {
        const signerOrProvider = this.signer || this.provider;
        console.log('Initialisation des contrats...');
        this.contracts = {
            testToken: new ethers_1.Contract(contracts_1.CONTRACT_ADDRESSES.testToken, contracts_1.ABIS.TestToken, signerOrProvider),
            userManager: new ethers_1.Contract(contracts_1.CONTRACT_ADDRESSES.userManager, contracts_1.ABIS.UserManager, signerOrProvider),
            multiWallet: new ethers_1.Contract(contracts_1.CONTRACT_ADDRESSES.multiWallet, contracts_1.ABIS.MultiWallet, signerOrProvider),
            treasury: new ethers_1.Contract(contracts_1.CONTRACT_ADDRESSES.treasury, contracts_1.ABIS.TreasuryContract, signerOrProvider),
            exchange: new ethers_1.Contract(contracts_1.CONTRACT_ADDRESSES.exchange, contracts_1.ABIS.ExchangeContract, signerOrProvider),
            escrow: new ethers_1.Contract(contracts_1.CONTRACT_ADDRESSES.escrow, contracts_1.ABIS.EscrowServiceOTP, signerOrProvider)
        };
    }
    get testToken() {
        return this.contracts.testToken;
    }
    get userManager() {
        return this.contracts.userManager;
    }
    get multiWallet() {
        return this.contracts.multiWallet;
    }
    get treasury() {
        return this.contracts.treasury;
    }
    get exchange() {
        return this.contracts.exchange;
    }
    get escrow() {
        return this.contracts.escrow;
    }
    setSigner(privateKey) {
        this.signer = new ethers_1.Wallet(privateKey, this.provider);
        this.initializeContracts();
    }
    removeSigner() {
        this.signer = undefined;
        this.initializeContracts();
    }
    async isConnected() {
        try {
            await this.provider.getBlockNumber();
            return true;
        }
        catch {
            return false;
        }
    }
    getSignerAddress() {
        return this.signer?.address || null;
    }
    async getBalance(address) {
        const balance = await this.provider.getBalance(address);
        return ethers_1.ethers.formatEther(balance);
    }
    parseEther(value) { return ethers_1.ethers.parseEther(value); }
    formatEther(value) { return ethers_1.ethers.formatEther(value); }
    keccak256(data) { return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(data)); }
}
exports.BlockchainService = BlockchainService;
