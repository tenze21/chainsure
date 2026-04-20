"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'payment_confirmed' to the policy status enum
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_policies_status" ADD VALUE 'payment_confirmed' BEFORE 'expired';`
    );
  },

  async down(queryInterface, _Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values, so we can't revert this
    // If you need to rollback, you'll need to recreate the enum type manually
  },
};
