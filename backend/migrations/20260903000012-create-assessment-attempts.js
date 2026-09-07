'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_attempts', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      assessment_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'skill_assessments',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED'),
        allowNull: false,
        defaultValue: 'IN_PROGRESS',
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

    await queryInterface.addIndex('assessment_attempts', ['assessment_id'], { name: 'assessment_attempts_assessment_id_idx' });
    await queryInterface.addIndex('assessment_attempts', ['student_id'], { name: 'assessment_attempts_student_id_idx' });
    await queryInterface.addIndex('assessment_attempts', ['status'], { name: 'assessment_attempts_status_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('assessment_attempts');
  },
};
