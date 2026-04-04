"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.bulkInsert("policies", [
      {
        id: uuidv4(),
        user_id: "bdbedb9b-4a14-4937-bd0a-ba18d47e1808",
        holder_cid: "11906340054",
        holder_name: "Tenzin Choda",
        holder_email: "tenzin@gmail.com",
        holder_contact_number: "17736234",
        holder_dob: "1987-05-21",
        holder_gender: "male",
        holder_marital_status: "married",
        holder_address: "Dechencholing, Thimphu",
        holder_occupation: "Software Engineer",
        name: "BasicCare Health Plan",
        category: "Health Insurance",
        description: "An affordable entry-level health insurance plan designed for young adults and individuals with low medical risk. Covers routine checkups, emergency visits, and common outpatient procedures with a straightforward claims process.",
        payment_type: "recurring",
        coverage_amount: 25000.00,
        coverage_details: "Covers outpatient consultations, emergency room visits, basic diagnostic tests (blood work, X-rays), generic prescription medications, and one annual preventive health screening. Hospitalization covered up to 10 days per year.",
        eligibility: "Open to individuals aged 18–45 with no pre-existing chronic conditions. Applicants must be residents of the country and pass a basic health declaration form. No medical exam required for coverage amounts below $25,000.",
        limitations: "Does not cover dental or vision care, elective cosmetic procedures, fertility treatments, experimental therapies, or mental health inpatient care. Pre-existing conditions diagnosed within the past 24 months are excluded from coverage.",
        duration: 365,
        status: "payment_confirmed",
        premium: 1000,
        deductible: 5000,
      },
      {
        id: uuidv4(),
        user_id: "c37a608e-a0e2-4007-893f-c514d6cf2d59",
        holder_cid: "11906000054",
        holder_name: "Tshering Tobgay",
        holder_email: "tshering@gmail.com",
        holder_contact_number: "17736234",
        holder_dob: "1987-05-21",
        holder_gender: "male",
        holder_marital_status: "married",
        holder_address: "Jamkhar, Trashiyangtsi",
        holder_occupation: "Doctor",
        name: "BasicCare Health Plan",
        category: "Health Insurance",
        description: "An affordable entry-level health insurance plan designed for young adults and individuals with low medical risk. Covers routine checkups, emergency visits, and common outpatient procedures with a straightforward claims process.",
        payment_type: "recurring",
        coverage_amount: 25000.00,
        coverage_details: "Covers outpatient consultations, emergency room visits, basic diagnostic tests (blood work, X-rays), generic prescription medications, and one annual preventive health screening. Hospitalization covered up to 10 days per year.",
        eligibility: "Open to individuals aged 18–45 with no pre-existing chronic conditions. Applicants must be residents of the country and pass a basic health declaration form. No medical exam required for coverage amounts below $25,000.",
        limitations: "Does not cover dental or vision care, elective cosmetic procedures, fertility treatments, experimental therapies, or mental health inpatient care. Pre-existing conditions diagnosed within the past 24 months are excluded from coverage.",
        duration: 365,
        status: "payment_confirmed",
        premium: 1000,
        deductible: 5000,
      },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete("policies", null, {});
  },
};
