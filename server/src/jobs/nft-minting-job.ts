import type { MintResult } from "@/lib/types";
import { logger } from "@config/logger";
import { Policy, Wallet } from "@database/models/index";
import { mintPolicyNFT } from "@services/blockchain-service";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";
import { pinPolicyMetadata } from "@/services/pinata-service";

export function startMintingJob(): void {
  setInterval(async () => {
    // Find all policies waiting to be minted
    const pendingPolicies = await Policy.findAll({
      where: { status: "payment_confirmed" },
    });

    for (const policy of pendingPolicies) {
      try {
        const wallet = await Wallet.findOne({ where: { userId: policy.userId } });
        if (!wallet) {
          throw new AppError(ERROR_CODES.NOT_FOUND, "No wallet associated with user", 404);
        }
        const cid = await pinPolicyMetadata(policy);

        const mintResult: MintResult = await mintPolicyNFT(policy, wallet, cid);

        await policy.update({
          status: "active",
          tokenId: mintResult.tokenId,
          transactionHash: mintResult.transactionHash,
          contractAddress: mintResult.contractAddress,
        });
        logger.info({ policyId: policy.id, tokenID: mintResult.tokenId }, "Policy NFT minted successfully");
      }
      catch (error) {
        // Don't crash the job — log and move to the next policy
        logger.error({ err: error, policyId: policy.id }, "NFT minting failed for policy");
      }
    }
  }, 30_000); // runs every 30 seconds
}
