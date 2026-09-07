'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('skill_assessments', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      difficulty: {
        type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
        allowNull: false,
      },
      duration_minutes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 30,
      },
      passing_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 60.0,
      },
      total_questions: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 10,
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

    await queryInterface.addIndex('skill_assessments', ['skill_id'], { name: 'skill_assessments_skill_id_idx' });
    await queryInterface.addIndex('skill_assessments', ['difficulty'], { name: 'skill_assessments_difficulty_idx' });
    await queryInterface.addIndex('skill_assessments', ['is_active'], { name: 'skill_assessments_is_active_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('skill_assessments');
  },
};
