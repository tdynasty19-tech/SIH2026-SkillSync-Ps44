'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('skill_gaps', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      target_role_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'career_roles',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      current_level: {
        type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
        allowNull: true,
      },
      required_level: {
        type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
        allowNull: false,
      },
      current_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      required_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      gap_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED'),
        allowNull: false,
        defaultValue: 'OPEN',
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

    await queryInterface.addIndex('skill_gaps', ['student_id'], { name: 'skill_gaps_student_id_idx' });
    await queryInterface.addIndex('skill_gaps', ['skill_id'], { name: 'skill_gaps_skill_id_idx' });
    await queryInterface.addIndex('skill_gaps', ['target_role_id'], { name: 'skill_gaps_target_role_id_idx' });
    await queryInterface.addIndex('skill_gaps', ['priority'], { name: 'skill_gaps_priority_idx' });
    await queryInterface.addIndex('skill_gaps', ['status'], { name: 'skill_gaps_status_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('skill_gaps');
  },
};
