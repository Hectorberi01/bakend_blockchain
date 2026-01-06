import { Contract, ContractTransactionResponse, BigNumberish, ContractRunner } from "ethers";

export interface MultiWalletExchangeContract {
  connect(runner?: ContractRunner | null): MultiWalletExchangeContract;
  depositFor(user: string, currency: string, amount: BigNumberish): Promise<ContractTransactionResponse>;
  withdrawFor(user: string, currency: string, amount: BigNumberish): Promise<ContractTransactionResponse>;
  convertFor(user: string, fromCurrency: string, toCurrency: string, amountIn: BigNumberish, exchangeRate: BigNumberish, spread: BigNumberish): Promise<ContractTransactionResponse>;
  transferFor(from: string, to: string, currency: string, amount: BigNumberish): Promise<ContractTransactionResponse>;


  getBalance(user: string, currency: string): Promise<bigint>;
  getUserCurrencies(user: string): Promise<[string[], bigint[]]>;

  exchangeRates(arg0: string | Uint8Array): Promise<bigint>;
  spreads(arg0: string | Uint8Array): Promise<bigint>;
  transferFeeBps(): Promise<bigint>;
  treasury(): Promise<string>;

  // --- Fonctions administratives ---
  setExchangeRate(currency: string, rate: BigNumberish): Promise<ContractTransactionResponse>;
  setSpread(currency: string, bps: BigNumberish): Promise<ContractTransactionResponse>;

  // --- Lecture utilitaire (si tu veux l’exposer via ABI) ---
  owner(): Promise<string>;
}