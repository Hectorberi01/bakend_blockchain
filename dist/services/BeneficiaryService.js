"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiaryService = void 0;
class BeneficiaryService {
    constructor() {
        this.beneficiaries = new Map();
    }
    async createBeneficiary(userId, request) {
        try {
            const beneficiary = {
                id: crypto.randomUUID(),
                name: request.name,
                email: request.email,
                phoneNumber: request.phoneNumber,
                address: request.address,
                country: request.country,
                bankAccount: request.bankAccount,
                walletAddress: request.walletAddress,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            this.beneficiaries.set(`${userId}-${beneficiary.id}`, beneficiary);
            return {
                success: true,
                data: beneficiary,
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
    async getBeneficiaries(userId) {
        try {
            const userBeneficiaries = Array.from(this.beneficiaries.entries())
                .filter(([key]) => key.startsWith(`${userId}-`))
                .map(([, beneficiary]) => beneficiary)
                .filter(b => b.isActive);
            return {
                success: true,
                data: userBeneficiaries,
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
    async deleteBeneficiary(userId, beneficiaryId) {
        try {
            const key = `${userId}-${beneficiaryId}`;
            const beneficiary = this.beneficiaries.get(key);
            if (!beneficiary) {
                return {
                    success: false,
                    error: 'Bénéficiaire non trouvé',
                    timestamp: Date.now()
                };
            }
            beneficiary.isActive = false;
            this.beneficiaries.set(key, beneficiary);
            return {
                success: true,
                data: true,
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
exports.BeneficiaryService = BeneficiaryService;
