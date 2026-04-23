/* eslint-disable jsdoc/check-access */
import type { Request, Response } from "express";
import type { Hex } from "viem";
import { Category, Policy, PolicyTemplate, Proposal, sequelize, User } from "@database/models";
import { ERROR_CODES } from "@lib/constants";
import { CreatePolicySchema } from "@lib/schemas";
import asyncHandler from "@middlewares/async-handler";
import { AppError } from "@middlewares/error-handler";
import { createStripeProduct, deleteStripeProduct } from "@services/stripe-service";
import { buildPolicyHash, signPolicyHash } from "@utils/crypto";

/**
 * @desc Create policy
 * @route POST /api/policy/:proposalId
 * @access Private(Admin)
 */
export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreatePolicySchema.parse(req.body);

  const proposalId = req.params.proposalId as string;
  const proposal = await Proposal.findOne({ where: { id: proposalId }, include: [{ model: User, as: "user" }, { model: PolicyTemplate, as: "policyTemplate", include: [{ model: Category, as: "category" }] }] });

  /**
   * @dev There needs to be a proposal to create a policy
   */
  if (!proposal) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy proposal not found", 404);
  }

  /**
   * @dev To create a policy associated with a prposal the prpsal needs to be in pending status
   */
  if (proposal.status !== "pending") {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Proposal status in not pending", 400);
  }

  /** @dev check if any of the user details required for policy drafting is missing */
  if (!proposal.user?.cid || !proposal.user.occupation || !proposal.user.dob || !proposal.user.gender || !proposal.user.contactNumber || !proposal.user.maritalStatus || !proposal.user.address) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Incomplete user profile", 400);
  }

  /** check if any of the template details required for the policy drafting is missing */
  if (!proposal.policyTemplate?.name || !proposal.policyTemplate?.category.name || !proposal.policyTemplate.description || !proposal.policyTemplate.paymentType || !proposal.policyTemplate.coverageAmount || !proposal.policyTemplate.coverageDetails || !proposal.policyTemplate.eligibility || !proposal.policyTemplate.limitations) {
    throw new AppError(ERROR_CODES.MISSING_REQUIRED_DATA, "Missing template data", 400);
  }

  const policyDetails = {
    userId: proposal.user?.id,
    holderCid: proposal.user?.cid,
    holderName: proposal.user.fullName,
    holderEmail: proposal.user.email,
    holderContactNumber: proposal.user.contactNumber,
    holderDob: proposal.user.dob,
    holderGender: proposal.user.gender,
    holderMaritalStatus: proposal.user.maritalStatus,
    holderAddress: proposal.user.address,
    holderOccupation: proposal.user.occupation,
    name: proposal.policyTemplate.name,
    category: proposal.policyTemplate.category.name,
    description: proposal.policyTemplate.description,
    paymentType: proposal.policyTemplate.paymentType,
    billingCycle: proposal.policyTemplate.billingCycle,
    coverageAmount: proposal.policyTemplate.coverageAmount,
    coverageDetails: proposal.policyTemplate.coverageDetails,
    eligibility: proposal.policyTemplate.eligibility,
    limitations: proposal.policyTemplate.limitations,
    duration: proposal.policyTemplate.duration,
    premium: validatedData.premium,
    deductible: validatedData.deductable,
  };

  /** @dev if the payment type is recurring create a stripe product */
  let stripePriceId: string | null = null;
  if (proposal.policyTemplate?.paymentType === "recurring") {
    stripePriceId = await createStripeProduct(proposal.policyTemplate, validatedData.premium);
  }

  const result = await sequelize.transaction(async (t) => {
    // Re-fetch with a lock to prevent race condition
    const lockedProposal = await Proposal.findOne({
      where: { id: proposalId, status: "pending" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!lockedProposal) {
      if (stripePriceId) {
        await deleteStripeProduct(stripePriceId);
      }
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Proposal is no longer pending", 400);
    }

    const policy = await Policy.create({
      ...policyDetails,
    }, {
      transaction: t,
    });

    const hash: Hex = buildPolicyHash({
      id: policy.id,
      userId: policy.userId,
      holderCid: policy.holderCid,
      holderName: policy.holderName,
      name: policy.name,
      category: policy.category,
      coverageAmount: Number(policy.coverageAmount),
      premium: Number(policy.premium),
      deductible: Number(policy.deductible),
      coverageDetails: policy.coverageDetails,
      eligibility: policy.eligibility,
      limitations: policy.limitations,
      duration: policy.duration,
      createdAt: policy.createdAt,
    });

    const signature: Hex = await signPolicyHash(hash);

    const signedPolicy = await policy.update({ signature, stripePriceId }, { transaction: t });

    await lockedProposal.update({ status: "approved" }, { transaction: t });

    return signedPolicy;
  });

  res.status(201).json({
    success: true,
    message: "Policy created successfully",
    data: result,
  });
});
