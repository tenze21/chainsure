/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import type { Hex } from "viem";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Wallet extends Model<InferAttributes<Wallet>, InferCreationAttributes<Wallet>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare walletAddress: Hex;
  declare encryptedPrivateKey: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;

  declare static associations: {
    user: Association<Wallet, User>;
  };
}

Wallet.init(
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
    walletAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
      unique: true,
      validate: {
        is: /^0x[a-fA-F0-9]{40}$/,
      },
    },
    encryptedPrivateKey: {
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
    modelName: "Wallet",
    tableName: "wallets",
  },
);

import type { User } from "./user";
