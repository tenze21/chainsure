/* eslint-disable perfectionist/sort-imports */
/* eslint-disable import/first */
import type { Association, CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare profilePicture: string | null;
  declare email: string;
  declare emailVerified: CreationOptional<boolean>;
  declare status: CreationOptional<string>;
  declare roleId: ForeignKey<Role["id"]>;
  declare fullName: string;
  declare cid: string | null;
  declare occupation: string | null;
  declare dob: Date | null;
  declare gender: string | null;
  declare contactNumber: string | null;
  declare maritalStatus: string | null;
  declare address: string | null;
  declare passwordHash: string;
  declare salt: string;
  declare stripeCustomerId: string | null;

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

/** add user full name */
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
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
    status: {
      type: DataTypes.ENUM("active", "suspended"),
      defaultValue: "active",
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cid: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: true,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.STRING(100),
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
    salt: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
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
    modelName: "User",
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
  },
);

import type { Wallet } from "./wallet";
import type { Role } from "./role";
import type { Policy } from "./policy";
import type { Claim } from "./claim";
import type { Subscription } from "./subscription";
import type { Payment } from "./payment";
import type { Proposal } from "./proposal";
