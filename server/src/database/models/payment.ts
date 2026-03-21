/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare policyId: ForeignKey<Policy["id"]>;
  declare subscriptionId: ForeignKey<Subscription["id"]>;
  declare stripeInvoiceId: string;
  declare amount: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
  declare policy?: NonAttribute<Policy>;
  declare subscription?: NonAttribute<Subscription>;

  declare static associations: {
    user: Association<Payment, User>;
    policy: Association<Payment, Policy>;
    subscription: Association<Payment, Subscription>;
  };
}

Payment.init(
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
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "subscriptions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    stripeInvoiceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
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
    modelName: "Payment",
    tableName: "payments",
  },
);

import type { Policy } from "./policy";
import type { Subscription } from "./subscription";
import type { User } from "./user";
