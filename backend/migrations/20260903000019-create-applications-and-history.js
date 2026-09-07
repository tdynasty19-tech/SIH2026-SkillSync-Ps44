'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. applications
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'student_profiles',
          key: 'id',
        },
        onDelete: 'RESTRICT', // Protected historical record
        onUpdate: 'CASCADE',
      },
      opportunity_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      opportunity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'APPLIED',
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      resume_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      match_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    await queryInterface.addIndex('applications', ['student_id', 'opportunity_id', 'opportunity_type'], {
      unique: true,
      name: 'applications_student_opp_unique',
    });
    await queryInterface.addIndex('applications', ['student_id'], { name: 'applications_student_id_idx' });
    await queryInterface.addIndex('applications', ['opportunity_id'], { name: 'applications_opportunity_id_idx' });
    await queryInterface.addIndex('applications', ['status'], { name: 'applications_status_idx' });
    await queryInterface.addIndex('applications', ['created_at'], { name: 'applications_created_at_idx' });

    // 2. application_status_histories
    await queryInterface.createTable('application_status_histories', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      application_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'applications',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      from_status: {
        type: Sequelize.ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'),
        allowNull: true,
      },
      to_status: {
        type: Sequelize.ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'),
        allowNull: false,
      },
      changed_by_user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('application_status_histories', ['application_id'], { name: 'app_status_hist_app_id_idx' });
    await queryInterface.addIndex('application_status_histories', ['changed_by_user_id'], { name: 'app_status_hist_user_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('application_status_histories');
    await queryInterface.dropTable('applications');
  },
};
