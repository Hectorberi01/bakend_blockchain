import { console } from "inspector";
import * as dotenv from 'dotenv';
import { BlockchainService } from "../services/BlockchainService";
dotenv.config();
export class BlockchainInitializer {
  private static instance: BlockchainInitializer;
  private blockchainService?: BlockchainService;

  private constructor() {}

  public static getInstance(): BlockchainInitializer {
    if (!BlockchainInitializer.instance) {
      BlockchainInitializer.instance = new BlockchainInitializer();
    }
    return BlockchainInitializer.instance;
  }

  async initialize(): Promise<BlockchainService> {
    try {
      if (this.blockchainService) return this.blockchainService;

      const network = process.env.NETWORK || 'localhost';
      const privateKey = process.env.DEFAULT_PRIVATE_KEY;

      // Validation de la configuration
      this.validateConfig(network, privateKey);

      // Créer le service blockchain
      this.blockchainService = new BlockchainService(network, privateKey);
      if (this.blockchainService.getSignerAddress()) {
        console.log(`   Signer: ${this.blockchainService.getSignerAddress()}`);
      } else {
        console.log(`   Signer: Non configuré (mode read-only)`);
      }

      // Vérifier la connexion
      await this.healthCheck();

      // Afficher les informations des contrats
      await this.displayContractInfo();

      return this.blockchainService;
    } catch (error: any) {
      console.error('❌ Échec d\'initialisation du service blockchain:', error.message);
      
      if (error.message.includes('Network')) {
        console.error('💡 Vérifiez la configuration du réseau dans CONTRACT_ADDRESSES');
      } else if (error.message.includes('private key')) {
        console.error('💡 Fournissez une clé privée valide ou utilisez le mode read-only');
      }
      
      throw error;
    }
  }

  private validateConfig(network: string, privateKey?: string): void {
    const validNetworks = ['localhost', 'sepolia', 'mainnet', 'goerli'];
    
    if (!validNetworks.includes(network)) {
      throw new Error(
        `Network invalide: ${network}. Valeurs acceptées: ${validNetworks.join(', ')}`
      );
    }

    // if (privateKey && !privateKey.startsWith('0x')) {
    //   throw new Error('La clé privée doit commencer par 0x');
    // }

    if (privateKey && privateKey.length !== 66) {
      console.warn('⚠️  La longueur de la clé privée semble incorrecte (attendu: 66 caractères)');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.blockchainService) {
        throw new Error('Service blockchain non initialisé');
      }

      const isConnected = await this.blockchainService.isConnected();
      
      if (isConnected) {
        console.log('✅ Health check blockchain: OK');
        
        // Récupérer des informations supplémentaires
        const blockNumber = await this.blockchainService['provider'].getBlockNumber();
        console.log(`   Block number: ${blockNumber}`);
        
        return true;
      } else {
        console.warn('⚠️  Connexion blockchain indisponible');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Health check blockchain: FAILED');
      console.error(`   Error: ${error.message}`);
      
      // Ne pas propager l'erreur en dev, juste avertir
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Continuation en mode dégradé (sans blockchain)');
        return false;
      }
      
      throw error;
    }
  }

  private async displayContractInfo(): Promise<void> {
    try {
      if (!this.blockchainService) return;

      console.log('\n📋 Contrats déployés:');
      
      const contracts = [
        { name: 'TestToken', address: this.blockchainService.testToken.target },
        { name: 'UserManager', address: this.blockchainService.userManager.target },
        { name: 'MultiWallet', address: this.blockchainService.multiWallet.target },
        { name: 'Treasury', address: this.blockchainService.treasury.target },
        { name: 'Exchange', address: this.blockchainService.exchange.target },
        { name: 'Escrow', address: this.blockchainService.escrow.target }
      ];

      contracts.forEach(contract => {
        console.log(`   ${contract.name.padEnd(15)}: ${contract.address}`);
      });
      console.log();
    } catch (error) {
      // Erreur non critique
      console.warn('⚠️  Impossible d\'afficher les informations des contrats');
    }
  }

  getService(): BlockchainService {
    if (!this.blockchainService) {
      throw new Error('Blockchain service not initialized. Call initialize() first.');
    }
    return this.blockchainService;
  }

  isInitialized(): boolean {
    return !!this.blockchainService;
  }

  async reconnect(): Promise<void> {
    console.log('🔄 Reconnexion au réseau blockchain...');
    this.blockchainService = undefined;
    await this.initialize();
  }
}

export const blockchainInitializer = BlockchainInitializer.getInstance();