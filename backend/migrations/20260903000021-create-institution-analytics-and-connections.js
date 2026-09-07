'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. skill_analytics
    await queryInterface.createTable('skill_analytics', {
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
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      skill_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'skills',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      total_assessed_students: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      average_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      proficient_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      gap_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: false,
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

    await queryInterface.addIndex('skill_analytics', ['institution_id'], { name: 'skill_analytics_institution_id_idx' });
    await queryInterface.addIndex('skill_analytics', ['department'], { name: 'skill_analytics_department_idx' });
    await queryInterface.addIndex('skill_analytics', ['skill_id'], { name: 'skill_analytics_skill_id_idx' });
    await queryInterface.addIndex('skill_analytics', ['academic_year'], { name: 'skill_analytics_academic_year_idx' });

    // 2. industry_connections
    await queryInterface.createTable('industry_connections', {
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
      industry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'industry_profiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      connection_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'MOU',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('industry_connections', ['institution_id', 'industry_id'], {
      unique: true,
      name: 'industry_connections_inst_ind_unique',
    });
    await queryInterface.addIndex('industry_connections', ['institution_id'], { name: 'industry_connections_institution_id_idx' });
    await queryInterface.addIndex('industry_connections', ['industry_id'], { name: 'industry_connections_industry_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('industry_connections');
    await queryInterface.dropTable('skill_analytics');
  },
};
