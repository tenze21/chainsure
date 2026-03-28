"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("policy_templates", "billing_cycle", {
      type: Sequelize.ENUM("yearly", "monthly"),
      allowNull: true,
    });
  },

  async down(queryInterface, _Sequelize) {
    queryInterface.removeColumn("policy_templates", "billing_cycle");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_policy_templates_billing_cycle\";");
  },
};
