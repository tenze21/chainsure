/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Policy extends Model<InferAttributes<Policy>, InferCreationAttributes<Policy>> {
  declare id: CreationOptional<string>;
  declare templateId: ForeignKey<PolicyTemplate["id"]>;
  declare userId: ForeignKey<User["id"]>;
  declare status: string;
  declare transactionHash: string;
  declare stripePriceId: string;
  declare premium: number;
  declare deductible: number;
  declare payoutAmount: number | null;
  declare tokenID: number;
  declare contractAddress: string;
  declare signature: string;
  declare recvocationNote: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
  declare template?: NonAttribute<PolicyTemplate>;
  declare claim?: NonAttribute<Claim>;
  declare subscription?: NonAttribute<Subscription>;
  declare payments?: NonAttribute<Payment[]>;

  declare static associations: {
    user: Association<Policy, User>;
    template: Association<Policy, PolicyTemplate>;
    claim: Association<Policy, Claim>;
    subscription: Association<Policy, Subscription>;
    payments: Association<Policy, Payment>;
  };
}

Policy.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    status: {
      type: DataTypes.ENUM("active", "pending", "expired", "claimed", "cancelled", "invalidated"),
      defaultValue: "active",
      allowNull: false,
    },
    transactionHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
      unique: true,
    },
    stripePriceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    premium: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deductible: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payoutAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tokenID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recvocationNote: {
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
    modelName: "Policy",
    tableName: "policies",
  },
);

import type { PolicyTemplate } from "./policy-template";
import type { User } from "./user";
import type { Claim } from "./claim";
import type { Subscription } from "./subscription";
import type { Payment } from "./payment";
