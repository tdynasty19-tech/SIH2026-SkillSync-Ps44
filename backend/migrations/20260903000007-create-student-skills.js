'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_skills', {
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
      level: {
        type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
        allowNull: false,
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      years_of_experience: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_assessed_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('student_skills', ['student_id', 'skill_id'], {
      unique: true,
      name: 'student_skills_student_id_skill_id_unique',
    });
    await queryInterface.addIndex('student_skills', ['student_id'], { name: 'student_skills_student_id_idx' });
    await queryInterface.addIndex('student_skills', ['skill_id'], { name: 'student_skills_skill_id_idx' });
    await queryInterface.addIndex('student_skills', ['level'], { name: 'student_skills_level_idx' });
    await queryInterface.addIndex('student_skills', ['verified'], { name: 'student_skills_verified_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_skills');
  },
};
