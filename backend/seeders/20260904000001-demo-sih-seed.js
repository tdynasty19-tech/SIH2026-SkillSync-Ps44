'use strict';

/**
 * Phase 20 SIH Demo Seeder
 * Populates the authoritative Aarav Sharma demo scenario and core role demo accounts.
 */
module.exports = {
  up: async () => {
    // Dynamically require the compiled demo seed script
    const { runDemoSeed } = require('../dist/scripts/seed-demo');
    await runDemoSeed();
  },

  down: async (queryInterface, Sequelize) => {
    // Safe deterministic cleanup for demo accounts (guarded against production)
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Rollback of demo seed is forbidden in production environment');
    }
    const demoEmails = [
      'demo.student@sih.gov.in',
      'demo.industry@sih.gov.in',
      'demo.academician@sih.gov.in',
      'demo.institution@sih.gov.in',
    ];
    await queryInterface.bulkDelete(
      'users',
      {
        email: {
          [Sequelize.Op.in]: demoEmails,
        },
      },
      {}
    );
  },
};
