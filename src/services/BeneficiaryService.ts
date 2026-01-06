import { ApiResponse, BeneficiaryResponse, CreateBeneficiaryRequest } from "../types/business";

export class BeneficiaryService {
  private beneficiaries: Map<string, BeneficiaryResponse> = new Map();
  constructor() {}

  async createBeneficiary(userId: string, request: CreateBeneficiaryRequest): Promise<ApiResponse<BeneficiaryResponse>> {
    try {
      const beneficiary: BeneficiaryResponse = {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async getBeneficiaries(userId: string): Promise<ApiResponse<BeneficiaryResponse[]>> {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async deleteBeneficiary(userId: string, beneficiaryId: string): Promise<ApiResponse<boolean>> {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}