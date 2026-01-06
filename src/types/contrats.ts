// Types pour les contrats

export interface ContractAddresses {
  testToken: string;
  userManager: string;
  multiWallet: string;
  treasury: string;
  exchange: string;
  escrow: string;
}

// ========== USER MANAGER TYPES ==========

export interface UserInfo {
  userId: string;
  email: string;
  country: string;
  phoneHash: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: bigint;
  lastLoginDate: bigint;
  failedLoginAttempts: bigint;
  metadata: string;
}

export interface SessionInfo {
  isActive: boolean;
  loginTime: bigint;
  lastActivity: bigint;
  email: string;
}

// DTO pour la création d'utilisateur par un account creator
export interface CreateUserForDto {
  email: string;
  country: string;
  phoneHash: string;
  password: string;
  metadata?: string;
}

// DTO pour lier un wallet à un compte
export interface LinkWalletDto {
  email: string;
  password: string;
}

// DTO pour le login
export interface LoginDto {
  email: string;
  password: string;
}

// DTO pour changer le mot de passe
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// DTO pour mettre à jour les informations utilisateur
export interface UpdateUserDto {
  email: string;
  country: string;
  metadata?: string;
}

// DTO pour l'inscription directe (si nécessaire)
export interface RegisterUserDto {
  email: string;
  country: string;
  phoneHash: string;
  metadata?: string;
}

// ========== WALLET TYPES ==========

export enum WalletType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
  SAVINGS = 'SAVINGS',
  SHARED = 'SHARED'
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
}

export interface WalletInfo {
  walletId: bigint;
  owner: string;
  label: string;
  walletType: WalletType;
  currency: string;
  balance: bigint;
  dailySpentLimit: bigint;
  dailySpent: bigint;
  lastSpendDate: bigint;
  status: WalletStatus;
  createdAt: bigint;
  lastActivity: bigint;
  metadata: string;
}

export interface CreateWalletDto {
  label: string;
  walletType: WalletType;
  currency: string;
  dailySpentLimit: string; // En ether (sera converti en wei)
  metadata?: string;
}

export interface UpdateWalletDto {
  walletId: number;
  newLabel: string;
  newDailyLimit: string; // En ether
  newMetadata?: string;
}

export interface BalanceUpdateDto {
  walletId: number;
  currency: string;
  amount: string; // En ether
}

// ========== DEPRECATED (limites transférées supprimées) ==========
// Ces types sont conservés pour rétrocompatibilité mais ne sont plus utilisés

export interface SetLimitsDto {
  dailyLimit: string;
  monthlyLimit: string;
}

export interface CustomLimitsDto {
  userAddress: string;
  dailyLimit: string;
  monthlyLimit: string;
}

// ========== UTILITY TYPES ==========

export interface TransactionReceipt {
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  status: number;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  blockExplorer?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// ========== RESPONSE TYPES ==========

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// ========== EVENT TYPES ==========

export interface UserCreatedEvent {
  userId: string;
  email: string;
  country: string;
  timestamp: bigint;
}

export interface WalletLinkedEvent {
  userId: string;
  walletAddress: string;
  timestamp: bigint;
}

export interface UserLoggedInEvent {
  wallet: string;
  email: string;
  timestamp: bigint;
}

export interface UserLoggedOutEvent {
  wallet: string;
  email: string;
  timestamp: bigint;
}

export interface LoginAttemptEvent {
  wallet: string;
  success: boolean;
  timestamp: bigint;
}

export interface AccountLockedEvent {
  wallet: string;
  timestamp: bigint;
}

export interface PasswordChangedEvent {
  wallet: string;
  timestamp: bigint;
}

// ========== VALIDATION TYPES ==========

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface UserValidation {
  email: ValidationResult;
  password: ValidationResult;
  country: ValidationResult;
}

// ========== QUERY FILTERS ==========

export interface UserFilter {
  isActive?: boolean;
  country?: string;
  searchEmail?: string;
  createdAfter?: number;
  createdBefore?: number;
}

export interface WalletFilter {
  owner?: string;
  walletType?: WalletType;
  status?: WalletStatus;
  currency?: string;
  minBalance?: string;
}

// ========== STATISTICS TYPES ==========

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedAccounts: number;
  usersWithWallet: number;
  usersWithoutWallet: number;
}

export interface WalletStatistics {
  totalWallets: number;
  activeWallets: number;
  frozenWallets: number;
  closedWallets: number;
  totalBalance: string;
  averageBalance: string;
}

// ========== HELPER TYPES ==========

export type UserId = string; // bytes32
export type WalletAddress = string; // address (0x...)
export type TransactionHash = string; // 0x...

export interface UserWithWallet extends UserInfo {
  hasWallet: boolean;
  isLoggedIn: boolean;
  sessionInfo?: SessionInfo;
}

// ========== ERROR TYPES ==========

export enum ErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  PHONE_EXISTS = 'PHONE_EXISTS',
  WALLET_ALREADY_LINKED = 'WALLET_ALREADY_LINKED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  NOT_LOGGED_IN = 'NOT_LOGGED_IN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface ContractError {
  code: ErrorCode;
  message: string;
  details?: any;
  transactionHash?: string;
}

// ========== ADMIN TYPES ==========

export interface AdminAction {
  action: 'deactivate' | 'reactivate' | 'unlock' | 'setCreator';
  targetUserId?: string;
  targetAddress?: string;
  params?: any;
  executedBy: string;
  executedAt: number;
}

export interface AccountCreatorInfo {
  address: string;
  isEnabled: boolean;
  usersCreated: number;
  addedAt: number;
}

// ========== BATCH OPERATIONS ==========

export interface BatchCreateUsersDto {
  users: CreateUserForDto[];
}

export interface BatchCreateUsersResult {
  successful: UserCreatedEvent[];
  failed: {
    user: CreateUserForDto;
    error: string;
  }[];
}
import { BigNumberish } from 'ethers';

// ========== EXPORT TYPES ==========

export interface UserExportData {
  userId: string;
  email: string;
  country: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: string;
  lastLoginDate: string;
  metadata: any;
}

export interface WalletExportData {
  walletId: string;
  owner: string;
  label: string;
  walletType: string;
  currencies: string[];
  balances: { [currency: string]: string };
  status: string;
  createdAt: string;
}

// ========== AUDIT TYPES ==========

export interface AuditLog {
  eventType: string;
  userId?: string;
  walletAddress?: string;
  action: string;
  params?: any;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface AuditFilter {
  eventType?: string;
  userId?: string;
  walletAddress?: string;
  fromBlock?: number;
  toBlock?: number;
  fromDate?: number;
  toDate?: number;
}

export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: BigNumberish;
  status?: number;
}

export interface SetExchangeRateRequest {
  currency: string;
  rate: BigNumberish;
  spreadBps: BigNumberish;
}

export interface ConvertRequest {
  currency: string;
  amount: BigNumberish;
  fromToken?: boolean;
}