'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. collaborations
    await queryInterface.createTable('collaborations', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      collaboration_type: {
        type: Sequelize.ENUM('WORKSHOP', 'GUEST_LECTURE', 'INDUSTRIAL_TRAINING', 'LIVE_PROJECT'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
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

    await queryInterface.addIndex('collaborations', ['industry_id'], { name: 'collaborations_industry_id_idx' });
    await queryInterface.addIndex('collaborations', ['institution_id'], { name: 'collaborations_institution_id_idx' });
    await queryInterface.addIndex('collaborations', ['collaboration_type'], { name: 'collaborations_type_idx' });
    await queryInterface.addIndex('collaborations', ['status'], { name: 'collaborations_status_idx' });

    // 2. workshops
    await queryInterface.createTable('workshops', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      collaboration_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'collaborations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      topic: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      speaker_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      speaker_designation: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      duration_hours: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      venue: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      attendees_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.addIndex('workshops', ['collaboration_id'], { name: 'workshops_collaboration_id_idx' });

    // 3. guest_lectures
    await queryInterface.createTable('guest_lectures', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      collaboration_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'collaborations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      topic: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      lecturer_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      duration_minutes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 60,
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
    await queryInterface.addIndex('guest_lectures', ['collaboration_id'], { name: 'guest_lectures_collaboration_id_idx' });

    // 4. industrial_trainings
    await queryInterface.createTable('industrial_trainings', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      collaboration_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'collaborations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      domain: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      duration_weeks: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 2,
      },
      batch_size: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 20,
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
    await queryInterface.addIndex('industrial_trainings', ['collaboration_id'], { name: 'industrial_trainings_collab_id_idx' });

    // 5. live_projects
    await queryInterface.createTable('live_projects', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      collaboration_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'collaborations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      problem_statement: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      students_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      deadline: {
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
    await queryInterface.addIndex('live_projects', ['collaboration_id'], { name: 'live_projects_collaboration_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('live_projects');
    await queryInterface.dropTable('industrial_trainings');
    await queryInterface.dropTable('guest_lectures');
    await queryInterface.dropTable('workshops');
    await queryInterface.dropTable('collaborations');
  },
};
