"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "salt", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, _Sequelize) {
    queryInterface.removeColumn("users", "salt");
  },
};
