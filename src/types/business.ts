import { BigNumberish } from 'ethers';

// ==================== AUTH & KYC ====================
export interface RegisterRequest {
  email: string;
  password: string;
  country: string;
  phoneNumber: string;
  metadata?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SiweVerifyRequest {
  message: string;
  signature: string;
}

export interface OtpRequest {
  phoneNumber: string;
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  code: string;
}

export interface KycSubmitRequest {
  documentType: string;
  documentNumber: string;
  documentImages: string[];
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  address: string;
  country: string;
  kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  userLevel: 'BASIC' | 'VERIFIED' | 'PREMIUM' | 'BUSINESS';
  isActive: boolean;
  createdAt: string;
}

// ==================== WALLETS ====================
export interface CreateWalletRequest {
  label: string;
  type: 'PERSONAL' | 'FAMILY' | 'BUSINESS' | 'SAVINGS';
  currency: string;
  dailyLimit?: number;
}

export interface WalletResponse {
  id: string;
  label: string;
  type: string;
  currency: string;
  balance: number;
  dailyLimit: number;
  dailySpent: number;
  isActive: boolean;
  createdAt: string;
  currencies: CurrencyBalance[];
}

export interface CurrencyBalance {
  currency: string;
  balance: number;
  lastUpdated: string;
}

export interface UpdateWalletLabelRequest {
  label: string;
}

// ==================== BENEFICIAIRES ====================
export interface CreateBeneficiaryRequest {
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  country: string;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
  };
  walletAddress?: string;
  metadata?: any;
}

export interface BeneficiaryResponse {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  country: string;
  bankAccount?: any;
  walletAddress?: string;
  isActive: boolean;
  createdAt: string;
}

// ==================== DEVISES & TAUX ====================
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isCrypto: boolean;
}

export interface ExchangeRate {
  base: string;
  quote: string;
  rate: number;
  spread: number;
  timestamp: string;
}

export interface RateRequest {
  base: string;
  quote: string;
}

// ==================== QUOTES ====================
export interface CreateQuoteRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  direction: 'BUY' | 'SELL';
}

export interface QuoteResponse {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  direction: string;
  exchangeRate: number;
  fees: {
    amount: number;
    percentage: number;
  };
  totalAmount: number;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  createdAt: string;
}

// ==================== TRANSFERTS ====================
export interface CreateTransferRequest {
  beneficiaryId?: string;
  walletId: string;
  amount: number;
  currency: string;
  description?: string;
  quoteId?: string;
  metadata?: any;
}

export interface TransferResponse {
  id: string;
  from: {
    walletId: string;
    address: string;
  };
  to: {
    beneficiaryId?: string;
    address: string;
  };
  amount: number;
  currency: string;
  fees: number;
  totalAmount: number;
  description?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionHash?: string;
  createdAt: string;
  completedAt?: string;
}

// ==================== SECURITE ====================
export interface OtpStartRequest {
  action: 'TRANSFER' | 'LOGIN' | 'KYC' | 'ADMIN';
  metadata?: any;
}

export interface SecurityOtpVerifyRequest {
  token: string;
  code: string;
}

export interface LockRequest {
  reason?: string;
}

// ==================== TRESORERIE & ADMIN ====================
export interface TreasuryBalance {
  currency: string;
  balance: number;
  lastUpdated: string;
}

export interface AdminRateRequest {
  currency: string;
  rate: number;
  spread: number;
}

export interface AdminFeeRequest {
  type: 'TRANSFER' | 'EXCHANGE' | 'WITHDRAWAL';
  currency: string;
  fixedFee?: number;
  percentageFee?: number;
}

export interface AdminExchangeRequest {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  spread: number;
  isActive: boolean;
}

// ==================== WEBHOOKS ====================
export interface WebhookKycRequest {
  userId: string;
  status: string;
  documents?: any[];
}

export interface WebhookOfframpRequest {
  transferId: string;
  status: string;
  transactionHash?: string;
}

export interface WebhookChainRequest {
  type: string;
  transactionHash: string;
  blockNumber: number;
  data: any;
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    blockchain: 'up' | 'down';
    redis: 'up' | 'down';
  };
  timestamp: string;
}