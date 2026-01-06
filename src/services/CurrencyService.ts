import { ApiResponse, Currency, ExchangeRate } from "../types/business";
import { ExchangeService } from "./ExchangeService";

export class CurrencyService {
  private currencies: Currency[] = [
    { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isActive: true, isCrypto: false },
    { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isActive: true, isCrypto: false },
    { code: 'XOF', name: 'CFA Franc BCEAO', symbol: 'CFA', decimals: 0, isActive: true, isCrypto: false },
    { code: 'XAF', name: 'CFA Franc BEAC', symbol: 'FCFA', decimals: 0, isActive: true, isCrypto: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isActive: true, isCrypto: false },
    { code: 'AFRT', name: 'AfriTransfer Token', symbol: 'AFRT', decimals: 18, isActive: true, isCrypto: true }
  ];

  private exchangeRates: Map<string, ExchangeRate> = new Map();

  constructor(private exchange: ExchangeService) {
    // Initialiser quelques taux de change
    this.exchangeRates.set('EUR-USD', {
      base: 'EUR',
      quote: 'USD',
      rate: 1.10,
      spread: 0.01,
      timestamp: new Date().toISOString()
    });
    
    this.exchangeRates.set('EUR-XOF', {
      base: 'EUR',
      quote: 'XOF',
      rate: 655.957,
      spread: 0.02,
      timestamp: new Date().toISOString()
    });
  }

  async getCurrencies(): Promise<ApiResponse<Currency[]>> {
    return {
      success: true,
      data: this.currencies.filter(c => c.isActive),
      timestamp: Date.now()
    };
  }

  async getExchangeRate(base: string, quote: string): Promise<ApiResponse<ExchangeRate>> {
    try {
      const key = `${base}-${quote}`;
      const rate = this.exchangeRates.get(key);
      
      if (!rate) {
        // Essayer l'inverse
        const reverseKey = `${quote}-${base}`;
        const reverseRate = this.exchangeRates.get(reverseKey);
        
        if (reverseRate) {
          const inversedRate: ExchangeRate = {
            base: base,
            quote: quote,
            rate: 1 / reverseRate.rate,
            spread: reverseRate.spread,
            timestamp: reverseRate.timestamp
          };
          
          return {
            success: true,
            data: inversedRate,
            timestamp: Date.now()
          };
        }

        return {
          success: false,
          error: `Taux de change non disponible pour ${base}/${quote}`,
          timestamp: Date.now()
        };
      }

      return {
        success: true,
        data: rate,
        timestamp: Date.now()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async updateExchangeRate(base: string, quote: string, rate: number, spread: number): Promise<ApiResponse<boolean>> {
    try {
      const exchangeRate: ExchangeRate = {
        base,
        quote,
        rate,
        spread,
        timestamp: new Date().toISOString()
      };

      this.exchangeRates.set(`${base}-${quote}`, exchangeRate);

      return {
        success: true,
        data: true,
        timestamp: Date.now()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}