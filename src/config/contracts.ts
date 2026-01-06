import { ContractAddresses } from "../types/contrats";
import ExchangeContract from "../abis/ExchangeContract.json";
import dotenv from 'dotenv';
import {ethers} from "ethers";

dotenv.config();

// Configuration des réseaux
export const NETWORKS = {
    localhost: {
        name: 'Localhost',
        rpcUrl: 'http://127.0.0.1:8545',
        chainId: 1337
    },
    remix: {
        name: 'Remix VM',
        rpcUrl: 'https://remix-ide.netlify.app',
        chainId: 1337
    },
    sepolia: {
        name: 'Sepolia Testnet',
        chainId: 11155111,
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.gateway.tenderly.co',
        blockExplorer: 'https://sepolia.etherscan.io',
        nativeCurrency: {name: 'Sepolia Ether', symbol: 'SEP', decimals: 18}
    },

};

// Adresses des contrats (à modifier avec vos adresses déployées)
export const CONTRACT_ADDRESSES: ContractAddresses = {
    testToken: process.env.TEST_TOKEN_ADDRESS!,
    userManager: process.env.USER_MANAGER_ADDRESS!,
    multiWallet: process.env.MULTI_WALLET_ADDRESS!,
    treasury: process.env.TREASURY_ADDRESS!,
    exchange: process.env.EXCHANGE_ADDRESS!,
    escrow: process.env.ESCROW_ADDRESS!
};

// ABIs simplifiées pour les contrats
export const ABIS = {
    TestToken: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function mint(address to, uint256 amount)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ],

    UserManager: [
        // ========== EVENTS ==========
        "event UserCreated(bytes32 indexed userId, string email, string country, uint256 timestamp)",
        "event WalletLinkedToUser(bytes32 indexed userId, address indexed walletAddress, uint256 timestamp)",
        "event UserUpdated(bytes32 indexed userId, string email, string country, uint256 timestamp)",
        "event UserDeactivated(bytes32 indexed userId, uint256 timestamp)",
        "event UserReactivated(bytes32 indexed userId, uint256 timestamp)",
        "event UserLoggedIn(address indexed wallet, string email, uint256 timestamp)",
        "event UserLoggedOut(address indexed wallet, string email, uint256 timestamp)",
        "event AccountCreatorAdded(address indexed creator, uint256 timestamp)",
        "event AccountCreatorRemoved(address indexed creator, uint256 timestamp)",
        "event LoginAttempt(address indexed wallet, bool success, uint256 timestamp)",
        "event AccountLocked(address indexed wallet, uint256 timestamp)",
        "event AccountUnlocked(bytes32 indexed userId, uint256 timestamp)",
        "event PasswordChanged(address indexed wallet, uint256 timestamp)",

        // ========== READ FUNCTIONS - User Info ==========
        "function users(bytes32) view returns (bytes32 userId, string email, string country, string phoneHash, address walletAddress, bool isActive, uint256 createdAt, uint256 lastLoginDate, uint256 failedLoginAttempts, string metadata)",
        "function getUserInfo(bytes32 userId) view returns (tuple(bytes32 userId, string email, string country, string phoneHash, address walletAddress, bool isActive, uint256 createdAt, uint256 lastLoginDate, uint256 failedLoginAttempts, string metadata))",
        "function getUserInfoByWallet(address wallet) view returns (tuple(bytes32 userId, string email, string country, string phoneHash, address walletAddress, bool isActive, uint256 createdAt, uint256 lastLoginDate, uint256 failedLoginAttempts, string metadata))",

        // ========== READ FUNCTIONS - Mappings ==========
        "function userExists(bytes32) view returns (bool)",
        "function walletToUserId(address) view returns (bytes32)",
        "function isWalletLinked(address) view returns (bool)",
        "function emailExists(string) view returns (bool)",
        "function phoneExists(string) view returns (bool)",
        "function accountCreators(address) view returns (bool)",

        // ========== READ FUNCTIONS - Session ==========
        "function activeSessions(address) view returns (bool isActive, uint256 loginTime, uint256 lastActivity, string email)",
        "function isUserLoggedIn(address wallet) view returns (bool)",
        "function getSession(address wallet) view returns (tuple(bool isActive, uint256 loginTime, uint256 lastActivity, string email))",

        // ========== READ FUNCTIONS - Lists ==========
        "function getTotalUsers() view returns (uint256)",
        "function getUserIds(uint256 offset, uint256 limit) view returns (bytes32[])",
        "function isAccountCreator(address addr) view returns (bool)",

        // ========== WRITE FUNCTIONS - Account Creator ==========
        "function createUserFor(string email, string country, string phoneHash, string password, string metadata) returns (bytes32)",

        // ========== WRITE FUNCTIONS - User ==========
        "function linkWalletToAccount(string email, string password)",
        "function login(string email, string password) returns (bool)",
        "function logout() returns (bool)",
        "function changePassword(string email, string oldPassword, string newPassword) returns (bool)",
        "function updateUserInfo(string email, string country, string metadata)",

        // ========== WRITE FUNCTIONS - Admin ==========
        "function deactivateUser(bytes32 userId)",
        "function reactivateUser(bytes32 userId)",
        "function unlockAccount(bytes32 userId)",
        "function setAccountCreator(address creator, bool enabled)",
        "function pause()",
        "function unpause()"
    ],


    MultiWallet: [
        "function createWallet(string label, uint8 walletType, string currency, uint256 dailySpentLimit, string metadata) returns (uint256)",
        "function updateWallet(uint256 walletId, string newLabel, uint256 newDailyLimit, string newMetadata)",
        "function changeWalletStatus(uint256 walletId, uint8 newStatus)",
        "function setActiveWallet(uint256 walletId)",
        "function addCurrency(uint256 walletId, string currency)",
        "function removeCurrency(uint256 walletId, string currency)",
        "function updateBalance(uint256 walletId, string currency, uint256 amount)",
        "function addToBalance(uint256 walletId, string currency, uint256 amount)",
        "function subtractFromBalance(uint256 walletId, string currency, uint256 amount) returns (bool)",
        "function getWalletInfo(uint256 walletId) view returns (tuple(uint256 walletId, address owner, string label, uint8 walletType, string currency, uint256 balance, uint256 dailySpentLimit, uint256 dailySpent, uint256 lastSpendDate, uint8 status, uint256 createdAt, uint256 lastActivity, string metadata))",
        "function getUserWallets(address user) view returns (uint256[])",
        "function getUserWalletsDetails(address user) view returns (tuple(uint256 walletId, address owner, string label, uint8 walletType, string currency, uint256 balance, uint256 dailySpentLimit, uint256 dailySpent, uint256 lastSpendDate, uint8 status, uint256 createdAt, uint256 lastActivity, string metadata)[])",
        "function getBalance(uint256 walletId, string currency) view returns (uint256)",
        "function getWalletCurrencies(uint256 walletId) view returns (string[])",
        "function getRemainingDailyLimit(uint256 walletId) view returns (uint256)",
        "function getTotalWallets() view returns (uint256)",
        "function activeWallet(address user) view returns (uint256)",
        "event WalletCreated(address indexed owner, uint256 indexed walletId, string label, uint8 walletType, string currency, uint256 timestamp)",
        "event WalletUpdated(uint256 indexed walletId, string newLabel, uint256 newDailyLimit, uint256 timestamp)",
        "event WalletStatusChanged(uint256 indexed walletId, uint8 oldStatus, uint8 newStatus, uint256 timestamp)",
        "event BalanceUpdated(uint256 indexed walletId, string currency, uint256 oldBalance, uint256 newBalance, uint256 timestamp)"
    ],

    TreasuryContract: [
        "function depositFees(address from, uint256 amount)",
        "function getBalance() view returns (uint256)",
        "function withdraw(address to, uint256 amount)",
        "event FeesDeposited(address from, uint256 amount)",
        "event Withdrawn(address to, uint256 amount)"
    ],

  ExchangeContract: ExchangeContract.abi,

    EscrowServiceOTP: [
        "function createEscrow(address receiver, uint256 amount, bytes32 secretHash) returns (uint256)",
        "function release(uint256 escrowId, string secret)",
        "function escrows(uint256) view returns (tuple(address sender, address receiver, uint256 amount, bytes32 secretHash, bool released))",
        "function escrowCount() view returns (uint256)",
        "event EscrowCreated(uint256 escrowId, address sender, address receiver, uint256 amount)",
        "event Released(uint256 escrowId, address receiver)"
    ]
};

// Configuration par défaut
export const DEFAULT_CONFIG = {
    network: process.env.NETWORK || 'localhost',
    gasLimit: '3000000',
    gasPrice: '20000000000', // 20 Gwei
    confirmations: 1
};

export const CONFIG = {
    PRIVATE_KEY: process.env.DEFAULT_PRIVATE_KEY || '',
    ACCOUNT_CREATOR_PRIVATE_KEY: process.env.ACCOUNT_CREATOR_PRIVATE_KEY || process.env.DEFAULT_PRIVATE_KEY || '',
    USER_MANAGER_ADDRESS: process.env.USER_MANAGER_ADDRESS || '',
    ADMIN_ADDRESS: process.env.ADDRESS || '',
    NETWORK: process.env.NETWORK || 'sepolia'
};

if (!CONFIG.USER_MANAGER_ADDRESS) {
    throw new Error('❌ USER_MANAGER_ADDRESS is not set in .env file');
}

if (!CONFIG.PRIVATE_KEY) {
    throw new Error('❌ DEFAULT_PRIVATE_KEY is not set in .env file');
}

console.log('✅ Configuration loaded:');
console.log('  - Network:', CONFIG.NETWORK);
console.log('  - User Manager Contract:', CONFIG.USER_MANAGER_ADDRESS);
console.log('  - Admin Address:', CONFIG.ADMIN_ADDRESS);

// Initialiser le provider
// Initialiser le provider
export const getProvider = () => {
    const network = CONFIG.NETWORK as keyof typeof NETWORKS;
    const rpcUrl = NETWORKS[network]?.rpcUrl || NETWORKS.sepolia.rpcUrl;
    return new ethers.JsonRpcProvider(rpcUrl);
};

// Initialiser le wallet admin
export const getAdminWallet = () => {
    const provider = getProvider();
    return new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
};

// Initialiser le wallet account creator
export const getAccountCreatorWallet = () => {
    const provider = getProvider();
    const privateKey = CONFIG.ACCOUNT_CREATOR_PRIVATE_KEY || CONFIG.PRIVATE_KEY;
    return new ethers.Wallet(privateKey, provider);
};

// ✅ Fonction de vérification du déploiement
export const verifyContractDeployment = async () => {
    try {
        const provider = getProvider();
        const code = await provider.getCode(CONFIG.USER_MANAGER_ADDRESS);

        if (code === '0x') {
            throw new Error(`No contract deployed at ${CONFIG.USER_MANAGER_ADDRESS}`);
        }

        console.log('✅ Contract verified at:', CONFIG.USER_MANAGER_ADDRESS);
        console.log('   Code length:', code.length);
        return true;
    } catch (error) {
        console.error('❌ Contract verification failed:', error);
        return false;
    }
};