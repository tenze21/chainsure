/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class PolicyTemplate extends Model<InferAttributes<PolicyTemplate>, InferCreationAttributes<PolicyTemplate>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare categoryId: ForeignKey<Category["id"]>;
  declare description: string;
  declare paymentType: string;
  declare coverageAmount: number;
  declare coverageDetails: string;
  declare eligibility: string;
  declare limitations: string;
  declare duration: number | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare category: NonAttribute<Category>;
  declare proposal: NonAttribute<Proposal>;

  declare static associations: {
    category: Association<PolicyTemplate, Category>;
    proposal: Association<PolicyTemplate, Proposal>;
  };
}

PolicyTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    paymentType: {
      type: DataTypes.ENUM("fixed", "recurring"),
      allowNull: false,
    },
    coverageAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    coverageDetails: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eligibility: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    limitations: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: "PolicyTemplate",
    tableName: "policy_templates",
  },
);

import type { Category } from "./category";
import type { Proposal } from "./proposal";
