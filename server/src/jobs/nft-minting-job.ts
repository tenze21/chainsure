import { logger } from "@config/logger";
import { Policy } from "@database/models/index";
import { mintPolicyNFT } from "@services/blockchain-service";

export function startMintingJob(): void {
  setInterval(async () => {
    // Find all policies waiting to be minted
    const pendingPolicies = await Policy.findAll({
      where: { status: "payment_confirmed" },
    });

    for (const policy of pendingPolicies) {
      try {
        const mintResult = await mintPolicyNFT(policy);

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
  }, 10_000); // runs every 10 seconds
}
