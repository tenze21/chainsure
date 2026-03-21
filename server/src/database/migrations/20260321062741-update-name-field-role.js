"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("roles", "name", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.sequelize.query(
      // eslint-disable-next-line style/quotes, style/comma-dangle
      'DROP TYPE IF EXISTS "enum_roles_name";'
    );
  },

  async down(queryInterface, _Sequelize) {
  // Step 1: Recreate the ENUM type
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_roles_name" AS ENUM ('admin', 'user');`,
    );

    // Step 2: Change the column back, explicitly casting
    await queryInterface.sequelize.query(`
    ALTER TABLE "roles"
    ALTER COLUMN "name" TYPE "enum_roles_name"
    USING "name"::"enum_roles_name";
  `);
  },
};
