"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainInitializer = exports.BlockchainInitializer = void 0;
const inspector_1 = require("inspector");
const dotenv = __importStar(require("dotenv"));
const BlockchainService_1 = require("../services/BlockchainService");
dotenv.config();
class BlockchainInitializer {
    constructor() { }
    static getInstance() {
        if (!BlockchainInitializer.instance) {
            BlockchainInitializer.instance = new BlockchainInitializer();
        }
        return BlockchainInitializer.instance;
    }
    async initialize() {
        try {
            if (this.blockchainService)
                return this.blockchainService;
            const network = process.env.NETWORK || 'localhost';
            const privateKey = process.env.DEFAULT_PRIVATE_KEY;
            // Validation de la configuration
            this.validateConfig(network, privateKey);
            // Créer le service blockchain
            this.blockchainService = new BlockchainService_1.BlockchainService(network, privateKey);
            if (this.blockchainService.getSignerAddress()) {
                inspector_1.console.log(`   Signer: ${this.blockchainService.getSignerAddress()}`);
            }
            else {
                inspector_1.console.log(`   Signer: Non configuré (mode read-only)`);
            }
            // Vérifier la connexion
            await this.healthCheck();
            // Afficher les informations des contrats
            await this.displayContractInfo();
            return this.blockchainService;
        }
        catch (error) {
            inspector_1.console.error('❌ Échec d\'initialisation du service blockchain:', error.message);
            if (error.message.includes('Network')) {
                inspector_1.console.error('💡 Vérifiez la configuration du réseau dans CONTRACT_ADDRESSES');
            }
            else if (error.message.includes('private key')) {
                inspector_1.console.error('💡 Fournissez une clé privée valide ou utilisez le mode read-only');
            }
            throw error;
        }
    }
    validateConfig(network, privateKey) {
        const validNetworks = ['localhost', 'sepolia', 'mainnet', 'goerli'];
        if (!validNetworks.includes(network)) {
            throw new Error(`Network invalide: ${network}. Valeurs acceptées: ${validNetworks.join(', ')}`);
        }
        // if (privateKey && !privateKey.startsWith('0x')) {
        //   throw new Error('La clé privée doit commencer par 0x');
        // }
        if (privateKey && privateKey.length !== 66) {
            inspector_1.console.warn('⚠️  La longueur de la clé privée semble incorrecte (attendu: 66 caractères)');
        }
    }
    async healthCheck() {
        try {
            if (!this.blockchainService) {
                throw new Error('Service blockchain non initialisé');
            }
            const isConnected = await this.blockchainService.isConnected();
            if (isConnected) {
                inspector_1.console.log('✅ Health check blockchain: OK');
                // Récupérer des informations supplémentaires
                const blockNumber = await this.blockchainService['provider'].getBlockNumber();
                inspector_1.console.log(`   Block number: ${blockNumber}`);
                return true;
            }
            else {
                inspector_1.console.warn('⚠️  Connexion blockchain indisponible');
                return false;
            }
        }
        catch (error) {
            inspector_1.console.error('❌ Health check blockchain: FAILED');
            inspector_1.console.error(`   Error: ${error.message}`);
            // Ne pas propager l'erreur en dev, juste avertir
            if (process.env.NODE_ENV === 'development') {
                inspector_1.console.warn('⚠️  Continuation en mode dégradé (sans blockchain)');
                return false;
            }
            throw error;
        }
    }
    async displayContractInfo() {
        try {
            if (!this.blockchainService)
                return;
            inspector_1.console.log('\n📋 Contrats déployés:');
            const contracts = [
                { name: 'TestToken', address: this.blockchainService.testToken.target },
                { name: 'UserManager', address: this.blockchainService.userManager.target },
                { name: 'MultiWallet', address: this.blockchainService.multiWallet.target },
                { name: 'Treasury', address: this.blockchainService.treasury.target },
                { name: 'Exchange', address: this.blockchainService.exchange.target },
                { name: 'Escrow', address: this.blockchainService.escrow.target }
            ];
            contracts.forEach(contract => {
                inspector_1.console.log(`   ${contract.name.padEnd(15)}: ${contract.address}`);
            });
            inspector_1.console.log();
        }
        catch (error) {
            // Erreur non critique
            inspector_1.console.warn('⚠️  Impossible d\'afficher les informations des contrats');
        }
    }
    getService() {
        if (!this.blockchainService) {
            throw new Error('Blockchain service not initialized. Call initialize() first.');
        }
        return this.blockchainService;
    }
    isInitialized() {
        return !!this.blockchainService;
    }
    async reconnect() {
        inspector_1.console.log('🔄 Reconnexion au réseau blockchain...');
        this.blockchainService = undefined;
        await this.initialize();
    }
}
exports.BlockchainInitializer = BlockchainInitializer;
exports.blockchainInitializer = BlockchainInitializer.getInstance();
