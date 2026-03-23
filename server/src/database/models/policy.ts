/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Policy extends Model<InferAttributes<Policy>, InferCreationAttributes<Policy>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare holderCid: string;
  declare holderName: string;
  declare holderEmail: string;
  declare holderContactNumber: string;
  declare holderDob: Date;
  declare holderGender: string;
  declare holderMaritalStatus: string;
  declare holderAddress: string;
  declare holderOccupation: string;
  declare name: string;
  declare category: string;
  declare description: string;
  declare paymentType: string;
  declare billingCycle: string;
  declare coverageAmount: number;
  declare coverageDetails: string;
  declare eligibility: string;
  declare limitations: string;
  declare duration: number | null;
  declare status: CreationOptional<string>;
  declare transactionHash: string;
  declare stripePriceId: string;
  declare premium: number;
  declare deductible: number;
  declare payoutAmount: number | null;
  declare tokenID: number;
  declare contractAddress: string;
  declare signature: string;
  declare revocationNote: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
  declare claim?: NonAttribute<Claim>;
  declare subscription?: NonAttribute<Subscription>;
  declare payments?: NonAttribute<Payment[]>;

  declare static associations: {
    user: Association<Policy, User>;
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
    holderCid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    holderName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    holderEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    holderContactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    holderDob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    holderGender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    holderMaritalStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    holderAddress: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    holderOccupation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    paymentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    billingCycle: {
      type: DataTypes.STRING,
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
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "pending", "expired", "claimed", "cancelled", "invalidated"),
      defaultValue: "active",
      allowNull: false,
    },
    transactionHash: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    revocationNote: {
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

import type { User } from "./user";
import type { Claim } from "./claim";
import type { Subscription } from "./subscription";
import type { Payment } from "./payment";
