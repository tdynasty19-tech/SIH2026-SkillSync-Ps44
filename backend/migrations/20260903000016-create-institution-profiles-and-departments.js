'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. institution_profiles
    await queryInterface.createTable('institution_profiles', {
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
      institution_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      aishe_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      institution_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      affiliation: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      accreditation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      website_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'India',
      },
      description: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('institution_profiles', ['user_id'], { unique: true, name: 'institution_profiles_user_id_unique' });
    await queryInterface.addIndex('institution_profiles', ['institution_name'], { name: 'institution_profiles_institution_name_idx' });
    await queryInterface.addIndex('institution_profiles', ['institution_type'], { name: 'institution_profiles_institution_type_idx' });
    await queryInterface.addIndex('institution_profiles', ['city'], { name: 'institution_profiles_city_idx' });

    // 2. institution_departments
    await queryInterface.createTable('institution_departments', {
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
      department_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      department_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      hod_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
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

    await queryInterface.addIndex('institution_departments', ['institution_id', 'department_name'], {
      unique: true,
      name: 'institution_departments_inst_id_dept_name_unique',
    });
    await queryInterface.addIndex('institution_departments', ['institution_id'], { name: 'institution_departments_institution_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('institution_departments');
    await queryInterface.dropTable('institution_profiles');
  },
};
