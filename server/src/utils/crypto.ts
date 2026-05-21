import type { PolicySignatureInput } from "@lib/types";
import type { Hex } from "viem";
import bcrypt from "bcrypt";
import { encodeAbiParameters, keccak256, toBytes } from "viem";
import { account } from "@/config/ethereum-client";

/**
 * Hash a password using bcrypt
 *
 * bcrypt is used for the SERVER-SIDE hash layer
 * This is the second hash (client sends Argon2 hash, we hash it again)
 *
 * @param password - The password to hash (already Argon2 hashed from client)
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRound = 12;
  return bcrypt.hash(password, saltRound);
}

/**
 * Verify a password against a hash
 *
 * @param password - Plain password to verify
 * @param hash - Stored hash to compare against
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * @param policy policy details needed to be include in the signature
 * @returns hash of the abi encoded details
 */
export function buildPolicyHash(policy: PolicySignatureInput): Hex {
  const encoded = encodeAbiParameters(
    [
      { name: "id", type: "string" },
      { name: "userId", type: "string" },
      { name: "holderCid", type: "string" },
      { name: "holderName", type: "string" },
      { name: "name", type: "string" },
      { name: "category", type: "string" },
      { name: "coverageAmount", type: "uint256" },
      { name: "premium", type: "uint256" },
      { name: "deductible", type: "uint256" },
      { name: "coverageDetails", type: "string" },
      { name: "eligibility", type: "string" },
      { name: "limitations", type: "string" },
      { name: "duration", type: "uint256" },
      { name: "createdAt", type: "uint256" },
    ],
    [
      policy.id,
      policy.userId,
      policy.holderCid,
      policy.holderName,
      policy.name,
      policy.category,
      BigInt(Math.round(policy.coverageAmount * 100)),
      BigInt(Math.round(policy.premium * 100)),
      BigInt(Math.round(policy.deductible * 100)),
      policy.coverageDetails,
      policy.eligibility,
      policy.limitations,
      BigInt(policy.duration ?? 0),
      BigInt(Math.floor(policy.createdAt.getTime() / 1000)),
    ],
  );

  return keccak256(encoded);
}

/**
 * @param policyHash Hash to be signed
 * @returns signature of the hash
 */
export async function signPolicyHash(policyHash: Hex): Promise<Hex> {
  const signature = await account.signMessage({
    message: { raw: toBytes(policyHash) },
  });

  return signature;
}
