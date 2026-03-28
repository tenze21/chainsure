import type { Request, Response } from "express";
import { Category, PolicyTemplate } from "@/database/models/index";
import { ERROR_CODES } from "@/lib/constants";
import { CreateTemplateSchema, UpdateTemplateSchema } from "@/lib/schemas";
import asyncHandler from "@/middlewares/async-handler";
import { AppError } from "@/middlewares/error-handler";

/**
 * @desc Create new category
 * @route POST /api/template/category
 * @access Private(admin)
 */
export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const categoryName = req.body.name;
  if (!categoryName) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "category name is required", 400);
  }

  const isExistingCategory = await Category.findOne({ where: { name: categoryName } });
  if (isExistingCategory) {
    throw new AppError(ERROR_CODES.CATEGORY_ALREADY_EXIST, "category already exist", 400);
  }

  const category = await Category.create({
    name: categoryName,
  });

  res.status(201).json({
    success: true,
    data: {
      newCategory: category.name,
      message: "New category created successfully.",
    },
  });
});

/**
 * @desc Get all categories
 * @route GET /api/template/category
 * @access Private(Admin)
 */
export const getCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.findAll({ order: ["name"] });
  res.status(200).json({
    success: true,
    data: { categories },
  });
});

/**
 * @desc Create policy templates
 * @route POST /api/template/
 * @access Private(Admin)
 */
export const createTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = CreateTemplateSchema.parse(req.body);

  const categoryExist = await Category.findOne({ where: { name: validatedData.category } });
  if (!categoryExist) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, `category ${validatedData.category} doesn't exist`, 400);
  }

  const categoryId = categoryExist.id;
  const policyTemplate = await PolicyTemplate.create({
    categoryId,
    ...validatedData,
  });

  res.status(201).json({
    success: true,
    data: { policyTemplate },
  });
});

/**
 * @desc Get policy templates
 * @route GET /api/template/
 * @access Public
 */
export const getTemplates = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const templates = await PolicyTemplate.findAll({ order: ["name"] });
  res.status(200).json({
    success: true,
    data: { templates },
  });
});

/**
 * @desc Get a templete by id
 * @route GET /api/template/:id
 * @access Public
 */
export const getTemplateById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const template = await PolicyTemplate.findOne({ where: { id } });
  if (!template) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy template not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { template },
  });
});

/**
 * @desc Update a template detail
 * @route PATCH /api/template/:id
 * @access Private(Admin)
 */
export const updateTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const validatedData = UpdateTemplateSchema.parse(req.body);

  const template = await PolicyTemplate.findOne({ where: { id } });
  if (!template) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy template not found", 404);
  }

  const updatedTemplate = await template.update(validatedData);

  res.status(200).json({
    success: true,
    data: { updatedTemplate },
  });
});
