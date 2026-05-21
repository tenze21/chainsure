import type { Request, Response } from "express";
import { client } from "@config/ethereum-client";
import env from "@/config/env";
import { chainsureTokenAbi } from "@/contract/chainsure-token";
import asyncHandler from "@/middlewares/async-handler";

/**
 * @desc Get NFT metadata
 * @route POST /api/explorer/:tokenId
 * @access Public
 */
export const getNFT = asyncHandler(async (req: Request, res: Response) => {
  const tokenId = BigInt(req.params.tokenId as string);

  const tokenURI = await client.readContract({
    address: env.CONTRACT_ADDRESS,
    abi: chainsureTokenAbi,
    functionName: "tokenURI",
    args: [tokenId],
  });

  const owner = await client.readContract({
    address: env.CONTRACT_ADDRESS,
    abi: chainsureTokenAbi,
    functionName: "ownerOf",
    args: [tokenId],
  });

  const isInvalid = await client.readContract({
    address: env.CONTRACT_ADDRESS,
    abi: chainsureTokenAbi,
    functionName: "isPolicyInvalid",
    args: [tokenId],
  });

  const response = await fetch(tokenURI);
  const metadata = await response.text();
  const metadataObj = JSON.parse(metadata);

  res.status(200).json({
    sucess: true,
    data: { ...metadataObj, owner, isInvalid },
  });
});
