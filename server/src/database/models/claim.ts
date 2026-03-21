/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Claim extends Model<InferAttributes<Claim>, InferCreationAttributes<Claim>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare policyId: ForeignKey<Policy["id"]>;
  declare status: CreationOptional<string>;
  declare priority: string | null;
  declare description: string;
  declare adminNote: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
  declare policy?: NonAttribute<Policy>;

  declare static associations: {
    user: Association<Claim, User>;
    policy: Association<Claim, Policy>;
  };
}

Claim.init(
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
    policyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "policies",
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
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: "Claim",
    tableName: "claims",
  },
);

import type { User } from "./user";
import type { Policy } from "./policy";
