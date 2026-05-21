"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subscriptions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      policy_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // enforces the one-to-one: a policy has exactly one subscription
        references: {
          model: "policies",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      stripe_subscription_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "past_due", "canceled", "pending"),
        allowNull: false,
      },
      next_billing_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      current_period_end: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("subscriptions");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_subscriptions_status\";");
  },
};
