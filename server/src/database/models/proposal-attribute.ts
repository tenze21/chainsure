/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class ProposalAttribute extends Model<InferAttributes<ProposalAttribute>, InferCreationAttributes<ProposalAttribute>> {
  declare id: CreationOptional<string>;
  declare proposalId: ForeignKey<Proposal["id"]>;
  declare fieldName: string;
  declare fieldValue: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare proposal?: NonAttribute<Proposal>;

  declare static associations: {
    proposal: Association<ProposalAttribute, Proposal>;
  };
}

ProposalAttribute.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    proposalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "proposals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldValue: {
      type: DataTypes.TEXT,
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
    modelName: "ProposalAttribute",
    tableName: "proposal_attributes",
  },
);

import type { Proposal } from "./proposal";
