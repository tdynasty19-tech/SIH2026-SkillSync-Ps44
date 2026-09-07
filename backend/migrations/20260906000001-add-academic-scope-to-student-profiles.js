'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('student_profiles', 'institution_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'institution_profiles',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('student_profiles', 'department_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'institution_departments',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('student_profiles', ['institution_id', 'department_id'], {
      name: 'student_profiles_institution_department_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('student_profiles', 'student_profiles_institution_department_idx');
    await queryInterface.removeColumn('student_profiles', 'department_id');
    await queryInterface.removeColumn('student_profiles', 'institution_id');
  },
};
