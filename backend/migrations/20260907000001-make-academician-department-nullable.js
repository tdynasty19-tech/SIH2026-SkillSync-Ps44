'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('academician_profiles', 'department', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Populate any NULL values before making NOT NULL again
    await queryInterface.sequelize.query(
      "UPDATE academician_profiles SET department = 'General' WHERE department IS NULL"
    );
    await queryInterface.changeColumn('academician_profiles', 'department', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });
  },
};
