/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Proposal extends Model<InferAttributes<Proposal>, InferCreationAttributes<Proposal>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare templateId: ForeignKey<PolicyTemplate["id"]>;
  declare status: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
  declare policyTemplate?: NonAttribute<PolicyTemplate>;
  declare proposalAttributes?: NonAttribute<ProposalAttribute[]>;

  declare static associations: {
    user: Association<Proposal, User>;
    policyTemplate: Association<Proposal, PolicyTemplate>;
    proposalAttributes: Association<Proposal, ProposalAttribute>;
  };
}

Proposal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "policy_templates",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
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
    modelName: "Proposal",
    tableName: "proposals",
  },
);

import type { User } from "./user";
import type { PolicyTemplate } from "./policy-template";
import type { ProposalAttribute } from "./proposal-attribute";
