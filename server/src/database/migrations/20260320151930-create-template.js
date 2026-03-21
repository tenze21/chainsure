"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("policy_templates", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category_id: {
        type: Sequelize.UUID,
        // allowNull: true — a template can survive its category being deleted
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      payment_type: {
        type: Sequelize.ENUM("fixed", "recurring"),
        allowNull: false,
      },
      coverage_amount: {
        // DECIMAL(10,2): up to 99,999,999.99 — adjust precision if needed
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      coverage_details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      eligibility: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      limitations: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      duration: {
        // Nullable: some policies may be open-ended (e.g., life insurance)
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.dropTable("policy_templates");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_policy_templates_payment_type\";");
  },
};
