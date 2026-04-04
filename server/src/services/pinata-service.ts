import type { Policy } from "@database/models";
import type { NFTMetadata, PinataResponse } from "@/lib/types";
import env from "@config/env";
import { logger } from "@/config/logger";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";

function buildNFTMetadata(policy: Policy): NFTMetadata {
  let imageCid: string = "";
  switch (policy.category) {
    case "Health Insurance":
      imageCid = env.HEALTH_INSURANCE_IMAGE_CID;
      break;
    case "Vehicle Insurance":
      imageCid = env.VEHICLE_INSURANCE_IMAGE_CID;
      break;
    case "Property Insurance":
      imageCid = env.PROPERTY_INSURANCE_IMAGE_CID;
      break;
    default:
      break;
  }

  return {
    name: `${policy.name} #${policy.id.slice(0, 8).toUpperCase()}`,
    description: policy.description,
    image: `ipfs://${imageCid}`,
    attributes: [
      { trait_type: "Policy ID", value: policy.id },
      { trait_type: "Category", value: policy.category },
      { trait_type: "Coverage Amount", value: String(policy.coverageAmount) },
      { trait_type: "Payment Type", value: policy.paymentType },
      { trait_type: "Issue Date", value: new Date().toISOString().slice(0, 10) },
      ...(policy.duration
        ? [{ trait_type: "Duration (days)", value: String(policy.duration) }]
        : []),
    ],
  };
}

export async function pinPolicyMetadata(policy: Policy): Promise<string> {
  const metadata = buildNFTMetadata(policy);

  const body = JSON.stringify({
    pinataContent: metadata,
    pinataMetadata: {
      name: `policy-${policy.id}.json`,
      keyvalues: {
        policyId: policy.id,
        userId: policy.userId,
      },
    },
    pinataOptions: {
      cidVersion: 1,
    },
  });

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.PINATA_JWT}`,
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error(
      { policyId: policy.id, status: response.status, error },
      "Failed to pin metadata to IPFS",
    );
    throw new AppError(ERROR_CODES.PINATA_ERROR, `Pinata API error: ${response.status} ${error}`, 500);
  }

  const data = await response.json() as PinataResponse;

  logger.info(
    { policyId: policy.id, cid: data.IpfsHash, pinSize: data.PinSize },
    "Policy metadata pinned to IPFS",
  );
  return data.IpfsHash;
}
