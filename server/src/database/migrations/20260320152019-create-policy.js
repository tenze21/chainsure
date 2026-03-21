"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("policies", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.UUID,
        // allowNull: true — an issued policy must survive template deletion.
        // A policy is a legal contract; it cannot vanish because a template was retired.
        allowNull: true,
        references: {
          model: "policy_templates",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
      status: {
        type: Sequelize.ENUM("active", "pending", "expired", "claimed", "cancelled", "invalidated"),
        allowNull: false,
        defaultValue: "active",
      },
      transaction_hash: {
        // Ethereum tx hashes are always 66 chars: "0x" + 64 hex chars
        type: Sequelize.STRING(66),
        allowNull: false,
        unique: true,
      },
      stripe_price_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      premium: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      deductible: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payout_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      token_id: {
        // The NFT token ID on the blockchain — INTEGER is fine for most ERC-721 contracts
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      contract_address: {
        // Ethereum contract addresses: "0x" + 40 hex chars = 42 chars
        type: Sequelize.STRING(42),
        allowNull: false,
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      revocation_note: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("policies");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_policies_status\";");
  },
};
