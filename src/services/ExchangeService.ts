import { ApiResponse, ConvertRequest, SetExchangeRateRequest, TransactionResult } from "../types/contrats";
import { BlockchainService } from "./BlockchainService";

export class ExchangeService {
  constructor(private blockchain: BlockchainService) { }

  async setExchangeRate(request: SetExchangeRateRequest) {
    try {
      // Définir le taux
      const rateResult = await this.blockchain.executeTransaction(
        this.blockchain.exchange,
        'setExchangeRate',
        [request.currency, request.rate]
      );

      // Définir le spread
      await this.blockchain.executeTransaction(
        this.blockchain.exchange,
        'setSpread',
        [request.currency, request.spreadBps]
      );

      // ✅ Conversion BigInt → string
      const safeResult = JSON.parse(JSON.stringify(rateResult, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ));

      return {
        success: true,
        data: safeResult,
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

  async convertToToken(request: ConvertRequest) {
    try {
      const result = await this.blockchain.executeTransaction(
        this.blockchain.exchange,
        'convertToToken',
        [request.currency, request.amount]
      );

      // ✅ Conversion BigInt → string
      const safeResult = JSON.parse(JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ));

      return {
        success: true,
        data: safeResult,
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

  async convertFromToken(request: ConvertRequest){
    try {
      const result = await this.blockchain.executeTransaction(
        this.blockchain.exchange,
        'convertFromToken',
        [request.currency, request.amount]
      );

      // ✅ Conversion BigInt → string
      const safeResult = JSON.parse(JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ));

      return {
        success: true,
        data: safeResult,
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
