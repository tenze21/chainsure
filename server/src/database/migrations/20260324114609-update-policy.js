"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("policies", "status", {
      type: Sequelize.ENUM(
        "active",
        "pending",
        "payment_confirmed",
        "expired",
        "claimed",
        "cancelled",
        "invalidated",
      ),
      defaultValue: "pending", // was "active" — wrong, policy isn't active until NFT is minted
      allowNull: false,
    });

    await queryInterface.changeColumn("policies", "transaction_hash", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn("policies", "stripe_price_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.changeColumn("policies", "token_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("policies", "contract_address", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.changeColumn("policies", "signature", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("policies", "status", {
      type: Sequelize.ENUM(
        "active",
        "pending",
        "expired",
        "claimed",
        "cancelled",
        "invalidated",
      ),
      defaultValue: "active",
      allowNull: false,
    });

    await queryInterface.changeColumn("policies", "transaction_hash", {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn("policies", "stripe_price_id", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn("policies", "token_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn("policies", "contract_address", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn("policies", "signature", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
