/* eslint-disable import/first */
import type { Association, CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: CreationOptional<string>;
  declare name: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare policyTemplates?: NonAttribute<PolicyTemplate[]>;

  declare static associations: {
    policyTemplates: Association<Category, PolicyTemplate>;
  };
};

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
  },
);

import type { PolicyTemplate } from "./policy-template";
