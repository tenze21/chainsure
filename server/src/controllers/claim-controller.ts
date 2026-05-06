import type { Request, Response } from "express";
import type { Hash } from "viem";
import { logger } from "@config/logger";
import env from "@/config/env";
import { client } from "@/config/ethereum-client";
import { chainsureTokenAbi } from "@/contract/chainsure-token";
import { Claim, Policy, sequelize } from "@/database/models";
import { ERROR_CODES } from "@/lib/constants";
import { ClaimPolicySchema } from "@/lib/schemas";
import asyncHandler from "@/middlewares/async-handler";
import { AppError } from "@/middlewares/error-handler";

/**
 * @desc Request to claim policy
 * @route POST /api/claim/:policyId
 * @access Private(User)
 */
export const claimPolicy = asyncHandler(async (req: Request, res: Response) => {
  const policyId = req.params.policyId as string;
  const policy = await Policy.findByPk(policyId);
  const userId = req.user.id;
  if (!policy) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy not found", 404);
  }
  if (policy.userId !== userId) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Policy owned by another user", 400);
  }

  const isClaimExist = await Claim.findOne({ where: { policyId: policy.id } });
  if (isClaimExist) {
    throw new AppError(ERROR_CODES.REDUNDANT_REQUEST, "A claim has already been filed for the policy", 400);
  }

  const validatedData = ClaimPolicySchema.parse(req.body);

  const claim = await Claim.create({ ...validatedData, userId, policyId: policy.id });
  res.status(201).json({
    success: true,
    message: "Claim created successfully",
    data: { claim },
  });
});

/**
 * @desc Approve policy claim
 * @route PATCH /api/claim/approve/:claimId
 * @access Private(Admin)
 */
export const approveClaim = asyncHandler(async (req: Request, res: Response) => {
  const claimId = req.params.claimId as string;
  const claim = await Claim.findByPk(claimId);
  if (!claim) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Claim not found", 404);
  }

  const policy = await Policy.findByPk(claim.policyId);
  if (!policy) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy not found for claim", 404);
  }

  /** @dev update policy and claim status in database */
  await sequelize.transaction(async (t) => {
    await claim.update({ status: "approved" }, { transaction: t });
    await policy.update({ status: "claimed" }, { transaction: t });
  });

  /** @dev Invalidate claimed policy on-chain */
  const { request } = await client.simulateContract({
    address: env.CONTRACT_ADDRESS,
    abi: chainsureTokenAbi,
    functionName: "invalidatePolicy",
    args: [policy.tokenId!],
  });

  const hash: Hash = await client.writeContract(request);

  logger.info({ transaction: hash }, "Policy invalidated onchain");

  res.status(200).json({
    success: true,
    message: "Claim approved successfully",
  });
});

/**
 * @desc Reject policy claim
 * @route PATCH /api/claim/reject/:claimId
 * @access Private(Admin)
 */
export const rejectClaim = asyncHandler(async (req: Request, res: Response) => {
  const claimId = req.params.claimId as string;
  const claim = await Claim.findByPk(claimId);
  if (!claim) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Claim not found", 404);
  }

  const policy = await Policy.findByPk(claim.policyId);
  if (!policy) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy not found for claim", 404);
  }

  await claim.update({ status: "rejected" });

  res.status(200).json({
    success: true,
    message: "Claim rejected successfully",
  });
});

/**
 * @desc Get claims
 * @route GET /api/claim/
 * @access Private(Admin)
 */
export const getClaims = asyncHandler(async (req: Request, res: Response) => {
  const claims = await Claim.findAll({ order: [["createdAt", "DESC"]] });

  res.status(200).json({
    success: true,
    data: { claims },
  });
});
