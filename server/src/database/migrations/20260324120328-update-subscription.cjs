"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("subscriptions", "status", {
      type: Sequelize.ENUM("active", "past_due", "canceled", "pending"),
      allowNull: false,
    });

    await queryInterface.addColumn("subscriptions", "stripe_price_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("subscriptions", "status", {
      type: Sequelize.ENUM("paid", "pending", "lapsed"),
      allowNull: false,
    });

    // Remove stripe_price_id
    await queryInterface.removeColumn("subscriptions", "stripe_price_id");
  },
};
