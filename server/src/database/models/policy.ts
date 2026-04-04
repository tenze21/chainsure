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
  declare billingCycle: string | null;
  declare coverageAmount: number;
  declare coverageDetails: string;
  declare eligibility: string;
  declare limitations: string;
  declare duration: number | null;
  declare status: CreationOptional<string>;
  declare transactionHash: string | null;
  declare stripePriceId: string | null;
  declare premium: number;
  declare deductible: number;
  declare payoutAmount: number | null;
  declare tokenId: bigint | null;
  declare contractAddress: string | null;
  declare signature: string | null;
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
      allowNull: true,
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
      type: DataTypes.ENUM("active", "pending", "payment_confirmed", "expired", "claimed", "cancelled", "invalidated"),
      defaultValue: "pending",
      allowNull: false,
    },
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    stripePriceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contractAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
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
