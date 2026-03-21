"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("proposal_attributes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      proposal_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "proposals",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      field_name: {
        // Stores the dynamic field key — e.g. "vehicleRegistration", "preExistingCondition"
        type: Sequelize.STRING,
        allowNull: false,
      },
      field_value: {
        // TEXT instead of STRING because values can be long (e.g. free-text descriptions)
        type: Sequelize.TEXT,
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
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("proposal_attributes");
  },
};
