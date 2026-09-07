'use strict';

/**
 * Baseline Seed Infrastructure
 * Provides minimal structural foundation data to verify seeder runner up/down functionality.
 * Full SIH demo scenario (e.g. Aarav Sharma) will be populated during the dedicated demo/seed phase.
 */
module.exports = {
  up: async (queryInterface) => {
    const existing = await queryInterface.rawSelect(
      'skill_categories',
      { where: { name: 'Technical Skills' } },
      ['id']
    );

    if (!existing) {
      await queryInterface.bulkInsert('skill_categories', [
        {
          name: 'Technical Skills',
          description: 'Core software engineering, architecture, and programming proficiencies',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Professional & Soft Skills',
          description: 'Communication, team leadership, problem solving, and analytical acumen',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Domain & Specialized Skills',
          description: 'Industry-specific, regulatory, research, and specialized domain knowledge',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      'skill_categories',
      {
        name: {
          [Sequelize.Op.in]: [
            'Technical Skills',
            'Professional & Soft Skills',
            'Domain & Specialized Skills',
          ],
        },
      },
      {}
    );
  },
};
