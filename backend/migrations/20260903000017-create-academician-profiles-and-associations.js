'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. academician_profiles
    await queryInterface.createTable('academician_profiles', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      institution_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'institution_profiles',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      qualification: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      specialization: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      experience_years: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      research_interests: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      publications: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      google_scholar_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('academician_profiles', ['user_id'], { unique: true, name: 'academician_profiles_user_id_unique' });
    await queryInterface.addIndex('academician_profiles', ['institution_id'], { name: 'academician_profiles_institution_id_idx' });
    await queryInterface.addIndex('academician_profiles', ['department'], { name: 'academician_profiles_department_idx' });

    // 2. academic_institution_associations
    await queryInterface.createTable('academic_institution_associations', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      academician_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'academician_profiles',
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
      designation: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      is_current: {
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

    await queryInterface.addIndex('academic_institution_associations', ['academician_id'], { name: 'academic_associations_academician_id_idx' });
    await queryInterface.addIndex('academic_institution_associations', ['institution_id'], { name: 'academic_associations_institution_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('academic_institution_associations');
    await queryInterface.dropTable('academician_profiles');
  },
};
