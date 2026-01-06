import { BlockchainService } from "./BlockchainService";
/*
export class EscrowService {
  constructor(private blockchain: BlockchainService) {}

  async createEscrow(request: CreateEscrowRequest): Promise<ApiResponse<TransactionResult>> {
    try {
      // Créer le hash du secret
      const secretHash = this.blockchain.keccak256(request.secret);

      const result = await this.blockchain.executeTransaction(
        this.blockchain.escrow,
        'createEscrow',
        [request.receiver, request.amount, secretHash]
      );

      return {
        success: true,
        data: result,
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

  async releaseEscrow(request: ReleaseEscrowRequest): Promise<ApiResponse<TransactionResult>> {
    try {
      const result = await this.blockchain.executeTransaction(
        this.blockchain.escrow,
        'release',
        [request.escrowId, request.secret]
      );

      return {
        success: true,
        data: result,
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

  async getEscrowData(escrowId: string): Promise<ApiResponse<EscrowData>> {
    try {
      const escrowData = await this.blockchain.callView(
        this.blockchain.escrow,
        'escrows',
        [escrowId]
      );

      const data: EscrowData = {
        sender: escrowData.sender,
        receiver: escrowData.receiver,
        amount: escrowData.amount,
        secretHash: escrowData.secretHash,
        released: escrowData.released
      };

      return {
        success: true,
        data: data,
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

  async getEscrowCount(): Promise<ApiResponse<string>> {
    try {
      const count = await this.blockchain.callView(
        this.blockchain.escrow,
        'escrowCount',
        []
      );

      return {
        success: true,
        data: count.toString(),
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
*/