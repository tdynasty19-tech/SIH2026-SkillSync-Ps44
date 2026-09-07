'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('academician_profiles');
    if (!columns.department_id) {
      await queryInterface.addColumn('academician_profiles', 'department_id', {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'institution_departments',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }

    const indexes = await queryInterface.showIndex('academician_profiles');
    if (!indexes.some((index) => index.name === 'academician_profiles_department_id_idx')) {
      await queryInterface.addIndex('academician_profiles', ['department_id'], {
        name: 'academician_profiles_department_id_idx',
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('academician_profiles', 'academician_profiles_department_id_idx');
    await queryInterface.removeColumn('academician_profiles', 'department_id');
  },
};