"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert("roles", [
      { name: "user" },
      { name: "admin" },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.bulkDelete("roles", null, {});
  },
};
