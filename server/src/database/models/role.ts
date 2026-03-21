/* eslint-disable import/first */
import type { Association, CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/config/database";

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<string>;
  declare name: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare users?: NonAttribute<User[]>;

  declare static associations: {
    users: Association<Role, User>;
  };
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
    modelName: "Role",
    tableName: "roles",
  },
);

import type { User } from "./user";
