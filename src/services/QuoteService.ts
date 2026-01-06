import { ApiResponse, CreateQuoteRequest, QuoteResponse } from "../types/business";
import { CurrencyService } from "./CurrencyService";

export class QuoteService {
  private quotes: Map<string, QuoteResponse> = new Map();

  constructor(private currencyService: CurrencyService) {}

  async createQuote(request: CreateQuoteRequest): Promise<ApiResponse<QuoteResponse>> {
    try {
      // Récupérer le taux de change
      const rateResult = await this.currencyService.getExchangeRate(request.fromCurrency, request.toCurrency);
      
      if (!rateResult.success) {
        return {
          success: false,
          error: rateResult.error,
          timestamp: Date.now()
        };
      }

      const exchangeRate = rateResult.data!;
      const baseAmount = request.amount;
      const convertedAmount = baseAmount * exchangeRate.rate;
      
      // Calculer les frais (simulation)
      const feePercentage = 0.005; // 0.5%
      const feeAmount = convertedAmount * feePercentage;
      const totalAmount = request.direction === 'BUY' ? convertedAmount + feeAmount : convertedAmount - feeAmount;

      const quote: QuoteResponse = {
        id: crypto.randomUUID(),
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        amount: baseAmount,
        direction: request.direction,
        exchangeRate: exchangeRate.rate,
        fees: {
          amount: feeAmount,
          percentage: feePercentage * 100
        },
        totalAmount,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      this.quotes.set(quote.id, quote);

      return {
        success: true,
        data: quote,
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

  async getQuote(quoteId: string): Promise<ApiResponse<QuoteResponse>> {
    try {
      const quote = this.quotes.get(quoteId);
      
      if (!quote) {
        return {
          success: false,
          error: 'Devis non trouvé',
          timestamp: Date.now()
        };
      }

      // Vérifier l'expiration
      if (new Date(quote.expiresAt) < new Date()) {
        quote.status = 'EXPIRED';
        this.quotes.set(quoteId, quote);
      }

      return {
        success: true,
        data: quote,
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