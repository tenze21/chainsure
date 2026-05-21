"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("payments", "stripe_invoice_id");

    // 2. Add stripe_payment_intent_id for fixed one-time payments (pi_xxx)
    await queryInterface.addColumn("payments", "stripe_payment_intent_id", {
      type: Sequelize.STRING,
      allowNull: true, // null for recurring payments
    });

    // 3. Add stripe_invoice_id back as nullable for recurring payments (in_xxx)
    await queryInterface.addColumn("payments", "stripe_invoice_id", {
      type: Sequelize.STRING,
      allowNull: true, // null for fixed payments
    });

    // 4. Add status to track payment outcome
    await queryInterface.addColumn("payments", "status", {
      type: Sequelize.ENUM("pending", "succeeded", "failed"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("payments", "stripe_payment_intent_id");
    await queryInterface.removeColumn("payments", "stripe_invoice_id");
    await queryInterface.removeColumn("payments", "status");

    // Restore the original non-nullable stripe_invoice_id
    await queryInterface.addColumn("payments", "stripe_invoice_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
