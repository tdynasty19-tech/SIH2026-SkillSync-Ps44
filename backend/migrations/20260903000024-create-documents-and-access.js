'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. documents
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      owner_user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING(1024),
        allowNull: false,
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      file_size_bytes: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      access_level: {
        type: Sequelize.ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED'),
        allowNull: false,
        defaultValue: 'PRIVATE',
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

    await queryInterface.addIndex('documents', ['owner_user_id'], { name: 'documents_owner_user_id_idx' });
    await queryInterface.addIndex('documents', ['access_level'], { name: 'documents_access_level_idx' });

    // 2. document_access
    await queryInterface.createTable('document_access', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      document_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      grantee_user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      can_view: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      can_edit: {
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

    await queryInterface.addIndex('document_access', ['document_id', 'grantee_user_id'], {
      unique: true,
      name: 'document_access_doc_id_grantee_unique',
    });
    await queryInterface.addIndex('document_access', ['document_id'], { name: 'document_access_document_id_idx' });
    await queryInterface.addIndex('document_access', ['grantee_user_id'], { name: 'document_access_grantee_id_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('document_access');
    await queryInterface.dropTable('documents');
  },
};
