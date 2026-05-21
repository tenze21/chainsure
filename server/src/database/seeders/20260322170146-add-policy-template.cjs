"use strict";

const { v4: uuidv4 } = require("uuid");

const categories = {
  health: {
    id: uuidv4(),
    name: "Health Insurance",
    created_at: new Date(),
    updated_at: new Date(),
  },
  vehicle: {
    id: uuidv4(),
    name: "Vehicle Insurance",
    created_at: new Date(),
    updated_at: new Date(),
  },
  property: {
    id: uuidv4(),
    name: "Property Insurance",
    created_at: new Date(),
    updated_at: new Date(),
  },
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.bulkInsert("categories", Object.values(categories));

    await queryInterface.bulkInsert("policy_templates", [
      // ── Health Insurance Templates (4) ──────────────────────────────────
      {
        id: uuidv4(),
        name: "Basic Care Health Plan",
        category_id: categories.health.id,
        description:
          "An affordable entry-level health insurance plan designed for young adults and individuals with low medical risk. Covers routine checkups, emergency visits, and common outpatient procedures with a straightforward claims process.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 25000.00,
        coverage_details:
          "Covers outpatient consultations, emergency room visits, basic diagnostic tests (blood work, X-rays), generic prescription medications, and one annual preventive health screening. Hospitalization covered up to 10 days per year.",
        eligibility:
          "Open to individuals aged 18–45 with no pre-existing chronic conditions. Applicants must be residents of the country and pass a basic health declaration form. No medical exam required for coverage amounts below $25,000.",
        limitations:
          "Does not cover dental or vision care, elective cosmetic procedures, fertility treatments, experimental therapies, or mental health inpatient care. Pre-existing conditions diagnosed within the past 24 months are excluded from coverage.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Family Shield Comprehensive Plan",
        category_id: categories.health.id,
        description:
          "A comprehensive family health insurance plan that extends protection to a policyholder and up to four dependents. Designed to handle both routine medical needs and unexpected major health events for households of all sizes.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 100000.00,
        coverage_details:
          "Covers inpatient hospitalization, ICU stays, specialist consultations, surgeries, maternity care (from week 20 of pregnancy), newborn care for the first 90 days, diagnostic imaging (MRI, CT scans), and prescribed medications. Includes a $500 annual dental allowance per member.",
        eligibility:
          "Primary policyholder must be aged 21–60. Dependents may include a spouse and children under 21. Each member undergoes a health declaration; members over 50 require a basic health screening. Maximum of 5 members per policy.",
        limitations:
          "Cosmetic and elective surgeries are excluded. Maternity benefits apply only after a 10-month waiting period from policy start. Mental health outpatient visits are capped at 10 sessions per year. Pre-existing conditions are covered only after a 12-month waiting period.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "SeniorCare Plus Plan",
        category_id: categories.health.id,
        description:
          "A specialized health insurance plan tailored for senior citizens aged 60 and above. Provides extensive coverage for age-related illnesses, chronic disease management, and long-term care needs, giving seniors and their families peace of mind.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 75000.00,
        coverage_details:
          "Covers hospitalization, chronic disease management visits (diabetes, hypertension, arthritis), specialist consultations, physiotherapy (up to 20 sessions/year), prescription medications for chronic conditions, ambulance services, and one annual full-body health assessment.",
        eligibility:
          "Open to individuals aged 60–80. A mandatory medical examination is required prior to enrollment. Applicants with more than two active chronic conditions may be subject to adjusted premiums. Proof of age and residency required.",
        limitations:
          "Does not cover organ transplants, experimental cancer treatments, or conditions arising from substance abuse. Coverage for pre-existing conditions begins only after an 18-month waiting period. ICU coverage is limited to 15 days per policy year.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Critical Guard Lump Sum Plan",
        category_id: categories.health.id,
        description:
          "A fixed-benefit critical illness plan that pays out a lump sum upon diagnosis of any covered life-threatening condition. Intended to supplement existing health coverage by providing financial relief for lost income and non-medical expenses during recovery.",
        payment_type: "fixed",
        coverage_amount: 50000.00,
        coverage_details:
          "Pays a one-time lump sum benefit upon first diagnosis of any of the following: cancer (stage II or above), heart attack, stroke, kidney failure requiring dialysis, major organ transplant, coronary artery bypass surgery, or permanent total disability resulting from illness.",
        eligibility:
          "Available to individuals aged 18–55 with no prior diagnosis of any covered critical illness. A medical declaration form is required. Applicants with a family history of hereditary conditions may be required to submit additional documentation.",
        limitations:
          "Benefit is payable only once per lifetime per policyholder. Diagnosis must be confirmed by a licensed specialist and supported by clinical evidence. Conditions diagnosed within the first 90 days of policy inception are not eligible for payout. Does not cover terminal illness with a prognosis of less than 12 months.",
        duration: null,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ── Vehicle Insurance Templates (3) ──────────────────────────────────
      {
        id: uuidv4(),
        name: "Third-Party Basic Motor Cover",
        category_id: categories.vehicle.id,
        description:
          "A legally mandated minimum motor insurance plan providing coverage for liability to third parties. Suitable for older vehicles or budget-conscious drivers who need to meet regulatory requirements without paying for comprehensive coverage.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 15000.00,
        coverage_details:
          "Covers legal liability for bodily injury or death of a third party and damage to third-party property arising from an accident involving the insured vehicle. Includes legal defense costs up to $2,000 per incident.",
        eligibility:
          "Available to any licensed driver aged 18 or above with a valid vehicle registration. Vehicles must be roadworthy and pass an annual inspection. High-risk drivers with more than three traffic violations in the past two years may be subject to loading premiums.",
        limitations:
          "Does not cover damage to the insured's own vehicle, theft, fire, flood, or any losses to the policyholder's own property. Accidents caused under the influence of alcohol or controlled substances are excluded from all benefits.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Comprehensive Auto 360 Plan",
        category_id: categories.vehicle.id,
        description:
          "A full-spectrum vehicle insurance plan offering the broadest protection available for private passenger vehicles. Covers your vehicle, third-party liabilities, and personal accident benefits in a single consolidated policy.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 80000.00,
        coverage_details:
          "Covers accidental damage to the insured vehicle, total loss and theft, third-party bodily injury and property damage, natural disasters (flood, storm, earthquake), fire damage, windshield replacement, 24/7 roadside assistance, and personal accident benefits of up to $10,000 for the driver.",
        eligibility:
          "Available for private passenger vehicles not older than 10 years. The primary driver must hold a valid license for a minimum of 2 years. Vehicles with modifications that affect safety ratings must be declared at the time of application.",
        limitations:
          "Racing, off-road driving, and commercial use of the insured vehicle are not covered. Depreciation of parts is deducted from repair claims for vehicles older than 5 years. Accessories not factory-fitted are covered only if declared and listed in the policy schedule.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Commercial Fleet Protect Plan",
        category_id: categories.vehicle.id,
        description:
          "Designed for businesses operating a fleet of commercial vehicles, this plan covers multiple vehicles under a single policy with consolidated premium billing. Ideal for logistics companies, delivery services, and transport operators.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 500000.00,
        coverage_details:
          "Covers all registered fleet vehicles for third-party liability, accidental damage, theft, fire, and cargo loss up to $10,000 per vehicle per incident. Includes driver personal accident cover and 24/7 breakdown assistance for the entire fleet. Fleet size must be declared at inception.",
        eligibility:
          "Available to registered businesses with a minimum fleet of 5 vehicles. All vehicles must be commercially registered and used exclusively for business purposes. Drivers must hold valid commercial vehicle licenses. Annual fleet audit required at renewal.",
        limitations:
          "Personal use of fleet vehicles by employees is not covered under this policy. Vehicles added to the fleet mid-term require a policy endorsement before coverage applies. Claims arising from overloading or carrying undeclared cargo types are excluded.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ── Property Insurance Templates (3) ──────────────────────────────────
      {
        id: uuidv4(),
        name: "Home Owner Essential Plan",
        category_id: categories.property.id,
        description:
          "A foundational home insurance plan for residential property owners. Covers the structure of the home and attached fixtures against common perils, giving homeowners basic financial protection against unexpected damage or loss.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 150000.00,
        coverage_details:
          "Covers structural damage from fire, lightning, explosion, storm, and burst pipes. Includes loss or damage to permanently installed fixtures and fittings, external gates and walls, and temporary relocation costs of up to $3,000 if the home becomes uninhabitable due to a covered event.",
        eligibility:
          "Available to property owners of residential dwellings. The property must be used primarily as a private residence and must not be left vacant for more than 60 consecutive days. A property valuation may be required for insured values above $200,000.",
        limitations:
          "Contents, furniture, and personal belongings are not covered under this plan. Damage arising from gradual deterioration, poor maintenance, or construction defects is excluded. Flood coverage requires an optional add-on rider.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Landlord Guard Rental Property Plan",
        category_id: categories.property.id,
        description:
          "Specifically designed for property owners who rent out residential units. Protects against structural damage, loss of rental income, and liability claims from tenants, ensuring landlords are financially secure even during difficult tenancy situations.",
        payment_type: "recurring",
        billing_cycle: "monthly",
        coverage_amount: 200000.00,
        coverage_details:
          "Covers structural and fixture damage caused by tenants, fire, natural disasters, and vandalism. Includes loss of rental income for up to 6 months if the property becomes uninhabitable due to a covered event. Landlord liability cover of up to $50,000 for bodily injury or property damage claims by third parties on the premises.",
        eligibility:
          "Available to individual or corporate owners of residential rental properties. Property must be legally registered for rental use. A current tenancy agreement must be in place at the time of application. Properties must meet local building safety codes.",
        limitations:
          "Tenant's personal belongings are not covered. Loss of rent due to a tenant's voluntary vacation or non-payment without a covered peril is excluded. Damage caused by illegal activities conducted on the premises voids the claim for that incident.",
        duration: 365,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Business Premises All-Risk Plan",
        category_id: categories.property.id,
        description:
          "A broad commercial property insurance plan for business owners who want comprehensive protection for their premises, inventory, and equipment. Covers a wide range of perils under a single all-risk policy to minimize coverage gaps.",
        payment_type: "fixed",
        coverage_amount: 750000.00,
        coverage_details:
          "Covers the physical structure of the business premises, interior improvements and fit-outs, business equipment and machinery, stock and inventory, electronic equipment, signage, and business interruption losses for up to 3 months following a covered event. Glass breakage and money in safe are also included.",
        eligibility:
          "Available to legally registered businesses operating from a fixed commercial premises. A business registration certificate and recent property valuation are required. High-risk industries (fuel storage, chemical manufacturing) are subject to a separate underwriting review.",
        limitations:
          "Losses arising from employee dishonesty or fraud require a separate fidelity guarantee rider. Damage from cyber incidents, data loss, or computer system failures is excluded. Inventory claims require itemized stock records to be maintained and submitted at the time of claim.",
        duration: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete("policy_templates", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
