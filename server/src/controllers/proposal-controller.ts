import type { Request, Response } from "express";
import { Category, PolicyTemplate, Proposal, ProposalAttribute, sequelize, User } from "@database/models/index";
import asyncHandler from "@middlewares/async-handler";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";

/**
 * @desc Create proposal
 * @route POST /api/proposal/:templateId
 * @access Private
 */
export const createProposal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const templateId = req.params.templateId as string;
  const { attributes } = req.body;

  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Missing proposal attributes", 400);
  }

  const template = await PolicyTemplate.findOne({ where: { id: templateId } });
  if (!template) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy template not found", 404);
  }

  const user = await User.findByPk(userId);
  if (!user?.cid || !user.occupation || !user.dob || !user.gender || !user.contactNumber || !user.maritalStatus || !user.address) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Incomplete user profile", 400);
  }

  const result = await sequelize.transaction(async (t) => {
    const proposal = await Proposal.create(
      { userId, templateId },
      { transaction: t },
    );

    const attributeRecords = Object.entries(attributes).map(([fieldName, fieldValue]) => ({
      proposalId: proposal.id,
      fieldName,
      fieldValue: String(fieldValue),
    }));

    await ProposalAttribute.bulkCreate(attributeRecords, { transaction: t });

    return proposal;
  });

  const proposalWithAttributes = await Proposal.findByPk(result.id, {
    include: [{ model: ProposalAttribute, as: "proposalAttributes" }],
  });

  res.status(201).json({
    success: true,
    data: {
      proposalWithAttributes,
      message: "Propsal created sucessfully",
    },
  });
});

/**
 * @desc Get proposals
 * @route GET /api/proposal/user/
 * @access Private
 */
export const getUserProposals = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const proposals = await Proposal.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: PolicyTemplate,
        as: "policyTemplate",
        include: [
          {
            model: Category,
            as: "category",
          },
        ],
      },
    ],
  });

  const userProposals = proposals.map(proposal => ({
    status: proposal.status,
    name: proposal.policyTemplate?.name,
    category: proposal.policyTemplate?.category.name,
    createdAt: proposal.createdAt,
  }));

  res.status(200).json({
    success: true,
    data: { userProposals },
  });
});

/**
 * @desc Get proposals
 * @route GET /api/proposal/admin/
 * @access Private(admin)
 */
export const getProposals = asyncHandler(async (_req: Request, res: Response) => {
  const proposals = await Proposal.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: PolicyTemplate,
        as: "policyTemplate",
        include: [
          {
            model: Category,
            as: "category",
          },
        ],
      },
    ],
  });

  const userProposals = proposals.map(proposal => ({
    status: proposal.status,
    name: proposal.policyTemplate?.name,
    category: proposal.policyTemplate?.category.name,
    createdAt: proposal.createdAt,
  }));

  res.status(200).json({
    success: true,
    data: { userProposals },
  });
});

/**
 * @desc Get proposal
 * @route GET /api/proposal/:id
 * @access Private
 */
export const getProposal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const proposalId = req.params.id as string;

  const proposal = await Proposal.findOne({
    where: {
      id: proposalId,
      userId,
    },
    include: [{
      model: PolicyTemplate,
      as: "policyTemplate",
    }, {
      model: User,
      as: "user",
    }],
  });

  if (!proposal) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Proposal not found", 404);
  }

  const proposalAttributes = await ProposalAttribute.findAll({ where: { proposalId } });

  res.status(200).json({
    success: true,
    data: {
      proposal,
      proposalAttributes,
    },
  });
});

/**
 * @desc Reject proposal
 * @route PATCH /api/proposal/:id
 * @access Private(Admin)
 */
export const rejectProposal = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = req.params.id as string;

  const proposal = await Proposal.findByPk(proposalId);
  if (!proposal) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Propsal not found", 404);
  }

  await proposal.update({ status: "rejected" });

  res.status(200).json({
    success: true,
    message: "Proposal rejected succesfully",
  });
});
