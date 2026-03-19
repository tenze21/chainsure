/* eslint-disable ts/consistent-type-imports */
/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare emailVerified: CreationOptional<boolean>;
  declare roleId: ForeignKey<Role["id"]>;
  declare cid: CreationOptional<string>;
  declare dob: CreationOptional<Date>;
  declare gender: CreationOptional<string>;
  declare contactNumber: CreationOptional<number>;
  declare maritalStatus: CreationOptional<string>;
  declare address: CreationOptional<string>;
  declare passwordHash: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare wallet?: NonAttribute<Wallet>;
  declare role?: NonAttribute<Role>;
  declare policies?: NonAttribute<Policy[]>;
  declare claims?: NonAttribute<Claim[]>;
  declare subscriptions?: NonAttribute<Subscription[]>;
  declare payments?: NonAttribute<Payment[]>;
  declare proposals?: NonAttribute<Proposal[]>;

  declare static associations: {
    wallet: Association<User, Wallet>;
    role: Association<User, Role>;
    policies: Association<User, Policy>;
    claims: Association<User, Claim>;
    subscriptions: Association<User, Subscription>;
    payments: Association<User, Payment>;
    proposals: Association<User, Proposal>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    cid: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    contactNumber: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    maritalStatus: {
      type: DataTypes.ENUM("single", "married", "divorced", "widowed"),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
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
    modelName: "User",
    tableName: "users",
  },
);

import type { Wallet } from "./wallet";
import type { Role } from "./role";
import type { Policy } from "./policy";
import type { Claim } from "./claim";
import type { Subscription } from "./subscription";
import type { Payment } from "./payment";
import type { Proposal } from "./proposal";
