'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. placements
    await queryInterface.createTable('placements', {
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
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      total_students: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      placed_students: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      higher_studies_students: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      entrepreneurship_students: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      average_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      highest_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      median_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
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

    await queryInterface.addIndex('placements', ['institution_id', 'academic_year'], {
      unique: true,
      name: 'placements_inst_id_academic_year_unique',
    });
    await queryInterface.addIndex('placements', ['institution_id'], { name: 'placements_institution_id_idx' });

    // 2. placement_records
    await queryInterface.createTable('placement_records', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      placement_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'placements',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      student_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'student_profiles',
          key: 'id',
        },
        onDelete: 'RESTRICT', // Protected historical record
        onUpdate: 'CASCADE',
      },
      company_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      package_offered: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      role_offered: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      offer_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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

    await queryInterface.addIndex('placement_records', ['placement_id'], { name: 'placement_records_placement_id_idx' });
    await queryInterface.addIndex('placement_records', ['student_id'], { name: 'placement_records_student_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('placement_records');
    await queryInterface.dropTable('placements');
  },
};
