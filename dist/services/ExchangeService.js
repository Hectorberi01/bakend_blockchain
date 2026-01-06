"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeService = void 0;
class ExchangeService {
    constructor(blockchain) {
        this.blockchain = blockchain;
    }
    async setExchangeRate(request) {
        try {
            // Définir le taux
            const rateResult = await this.blockchain.executeTransaction(this.blockchain.exchange, 'setExchangeRate', [request.currency, request.rate]);
            // Définir le spread
            await this.blockchain.executeTransaction(this.blockchain.exchange, 'setSpread', [request.currency, request.spreadBps]);
            // ✅ Conversion BigInt → string
            const safeResult = JSON.parse(JSON.stringify(rateResult, (_, value) => typeof value === "bigint" ? value.toString() : value));
            return {
                success: true,
                data: safeResult,
                timestamp: Date.now()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    async convertToToken(request) {
        try {
            const result = await this.blockchain.executeTransaction(this.blockchain.exchange, 'convertToToken', [request.currency, request.amount]);
            // ✅ Conversion BigInt → string
            const safeResult = JSON.parse(JSON.stringify(result, (_, value) => typeof value === "bigint" ? value.toString() : value));
            return {
                success: true,
                data: safeResult,
                timestamp: Date.now()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    async convertFromToken(request) {
        try {
            const result = await this.blockchain.executeTransaction(this.blockchain.exchange, 'convertFromToken', [request.currency, request.amount]);
            // ✅ Conversion BigInt → string
            const safeResult = JSON.parse(JSON.stringify(result, (_, value) => typeof value === "bigint" ? value.toString() : value));
            return {
                success: true,
                data: safeResult,
                timestamp: Date.now()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
}
exports.ExchangeService = ExchangeService;
