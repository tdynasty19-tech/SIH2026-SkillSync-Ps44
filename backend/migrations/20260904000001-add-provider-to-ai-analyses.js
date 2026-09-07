'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ai_analyses', 'provider', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'system',
      after: 'analysis_type',
    });

    await queryInterface.addIndex('ai_analyses', ['provider'], {
      name: 'ai_analyses_provider_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('ai_analyses', 'ai_analyses_provider_idx');
    await queryInterface.removeColumn('ai_analyses', 'provider');
  },
};
