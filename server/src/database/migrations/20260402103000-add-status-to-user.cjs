"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.ENUM("active", "suspended"),
      allowNull: false,
      defaultValue: "active",
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn("users", "status");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_users_status\";");
  },
};
