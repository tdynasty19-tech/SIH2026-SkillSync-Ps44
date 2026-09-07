'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. ai_analyses
    await queryInterface.createTable('ai_analyses', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      analysis_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      input_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      output_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      confidence_score: {
        type: Sequelize.DECIMAL(5, 2),
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

    await queryInterface.addIndex('ai_analyses', ['user_id'], { name: 'ai_analyses_user_id_idx' });
    await queryInterface.addIndex('ai_analyses', ['analysis_type'], { name: 'ai_analyses_type_idx' });

    // 2. career_recommendations
    await queryInterface.createTable('career_recommendations', {
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
      career_role_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'career_roles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      match_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      reasoning: {
        type: Sequelize.JSON,
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

    await queryInterface.addIndex('career_recommendations', ['student_id'], { name: 'career_recs_student_id_idx' });
    await queryInterface.addIndex('career_recommendations', ['career_role_id'], { name: 'career_recs_role_id_idx' });

    // 3. opportunity_matches
    await queryInterface.createTable('opportunity_matches', {
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
      opportunity_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      opportunity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      match_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      breakdown: {
        type: Sequelize.JSON,
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

    await queryInterface.addIndex('opportunity_matches', ['student_id', 'opportunity_id', 'opportunity_type'], {
      unique: true,
      name: 'opportunity_matches_student_opp_unique',
    });
    await queryInterface.addIndex('opportunity_matches', ['student_id'], { name: 'opportunity_matches_student_id_idx' });
    await queryInterface.addIndex('opportunity_matches', ['opportunity_id'], { name: 'opportunity_matches_opp_id_idx' });

    // 4. learning_recommendations
    await queryInterface.createTable('learning_recommendations', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      resource_url: {
        type: Sequelize.STRING(1024),
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      duration: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'MEDIUM',
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

    await queryInterface.addIndex('learning_recommendations', ['student_id'], { name: 'learning_recs_student_id_idx' });
    await queryInterface.addIndex('learning_recommendations', ['skill_id'], { name: 'learning_recs_skill_id_idx' });
    await queryInterface.addIndex('learning_recommendations', ['priority'], { name: 'learning_recs_priority_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('learning_recommendations');
    await queryInterface.dropTable('opportunity_matches');
    await queryInterface.dropTable('career_recommendations');
    await queryInterface.dropTable('ai_analyses');
  },
};
