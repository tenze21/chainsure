import type { Policy, Wallet } from "@database/models";
import type { MintResult } from "@lib/types";
import type { Hash } from "viem";
import { client } from "@config/ethereum-client";
import { logger } from "@config/logger";
import { parseEventLogs } from "viem";
import env from "@/config/env";
import { chainsureTokenAbi } from "@/contract/chainsure-token";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";

export async function mintPolicyNFT(policy: Policy, wallet: Wallet, cid: string): Promise<MintResult> {
  const { request } = await client.simulateContract({
    address: env.CONTRACT_ADDRESS,
    abi: chainsureTokenAbi,
    functionName: "issuePolicy",
    args: [
      wallet.walletAddress,
      policy.signature!,
      `https://${env.PINATA_GATEWAY}/ipfs/${cid}`,
    ],
  });

  const hash: Hash = await client.writeContract(request);

  const receipt = await client.waitForTransactionReceipt({ hash });

  const events = parseEventLogs({
    abi: chainsureTokenAbi,
    eventName: "PolicyIssued",
    logs: receipt.logs,
    strict: true,
  });

  if (!events.length) {
    logger.error({ policyId: policy.id }, "Failed to mint NFT");
    throw new AppError(ERROR_CODES.ETHEREUM_ERROR, "Policy issue event not emitted", 500);
  }

  // With strict: true, args are guaranteed to be fully defined
  const tokenId = events[0]?.args.tokenId;

  if (tokenId === undefined) {
    logger.error({ policyId: policy.id }, "TokenId not found in mint event");
    throw new AppError(ERROR_CODES.ETHEREUM_ERROR, "tokenId missing from PolicyIssued event", 500);
  }

  logger.info({ policyId: policy.id }, "Policy NFT minted successfully");

  return {
    tokenId,
    transactionHash: hash,
    contractAddress: env.CONTRACT_ADDRESS,
  };
}
