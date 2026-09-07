'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('academic_programs', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      institution_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'institution_profiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      department_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'institution_departments',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      program_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      program_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      degree_level: {
        type: Sequelize.ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'DOCTORATE', 'CERTIFICATE'),
        allowNull: false,
        defaultValue: 'UNDERGRADUATE',
      },
      duration_years: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 4.0,
      },
      total_semesters: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 8,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('academic_programs', ['institution_id'], {
      name: 'academic_programs_institution_id_idx',
    });
    await queryInterface.addIndex('academic_programs', ['department_id'], {
      name: 'academic_programs_department_id_idx',
    });
    await queryInterface.addIndex('academic_programs', ['institution_id', 'department_id'], {
      name: 'academic_programs_institution_department_idx',
    });
    await queryInterface.addIndex('academic_programs', ['department_id', 'program_name'], {
      name: 'academic_programs_dept_program_name_unique',
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('academic_programs');
  },
};
