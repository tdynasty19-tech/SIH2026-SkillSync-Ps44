'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. industry_profiles
    await queryInterface.createTable('industry_profiles', {
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
      company_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      cin: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      industry_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
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

    await queryInterface.addIndex('industry_profiles', ['user_id'], { unique: true, name: 'industry_profiles_user_id_unique' });
    await queryInterface.addIndex('industry_profiles', ['company_name'], { name: 'industry_profiles_company_name_idx' });
    await queryInterface.addIndex('industry_profiles', ['industry_type'], { name: 'industry_profiles_industry_type_idx' });
    await queryInterface.addIndex('industry_profiles', ['location'], { name: 'industry_profiles_location_idx' });
    await queryInterface.addIndex('industry_profiles', ['city'], { name: 'industry_profiles_city_idx' });

    // 2. industry_contacts
    await queryInterface.createTable('industry_contacts', {
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
      contact_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      is_primary: {
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

    await queryInterface.addIndex('industry_contacts', ['industry_id'], { name: 'industry_contacts_industry_id_idx' });
    await queryInterface.addIndex('industry_contacts', ['email'], { name: 'industry_contacts_email_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('industry_contacts');
    await queryInterface.dropTable('industry_profiles');
  },
};
