"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        // SET NULL: deleting a role should not wipe out users — just clear the FK
        // NOTE: if you change this to SET NULL, also set allowNull: true above
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      cid: {
        type: Sequelize.STRING(11),
        allowNull: true,
        unique: true,
      },
      dob: {
        // DATEONLY stores as DATE in postgres (no time component)
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: true,
      },
      contact_number: {
        // BIGINT because phone numbers can exceed 32-bit integer range
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      marital_status: {
        type: Sequelize.ENUM("single", "married", "divorced", "widowed"),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "users_email_unique",
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_users_gender\";");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_users_marital_status\";");
  },
};
