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
      // Holder details
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
      holder_cid: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      holder_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      holder_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      holder_contact_number: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      holder_dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      holder_gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      holder_marital_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      holder_address: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      holder_occupation: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      // Policy details
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      payment_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      billing_cycle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      coverage_amount: {
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
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "pending", "expired", "claimed", "cancelled", "invalidated"),
        allowNull: false,
        defaultValue: "active",
      },
      // Financial details
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

      // Blockchain / NFT

      transaction_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      token_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      contract_address: {
        type: Sequelize.STRING(255),
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
      // Timestamps
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
    // Clean up the ENUM type that Postgres creates as a standalone DB object
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_policies_status\";");
  },
};
