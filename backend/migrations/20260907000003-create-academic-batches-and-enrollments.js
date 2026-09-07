'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create academic_batches table
    await queryInterface.createTable('academic_batches', {
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
      department_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'institution_departments',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      program_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'academic_programs',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      batch_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      start_year: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      end_year: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      current_semester: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
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

    await queryInterface.addIndex('academic_batches', ['institution_id'], {
      name: 'academic_batches_institution_id_idx',
    });
    await queryInterface.addIndex('academic_batches', ['department_id'], {
      name: 'academic_batches_department_id_idx',
    });
    await queryInterface.addIndex('academic_batches', ['program_id'], {
      name: 'academic_batches_program_id_idx',
    });
    await queryInterface.addIndex('academic_batches', ['program_id', 'batch_name'], {
      name: 'academic_batches_program_batch_name_unique',
      unique: true,
    });

    // 2. Create student_academic_enrollments table
    await queryInterface.createTable('student_academic_enrollments', {
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
      department_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'institution_departments',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      program_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'academic_programs',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      batch_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'academic_batches',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      enrollment_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      roll_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('ENROLLED', 'ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      current_semester: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      enrolled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      completed_at: {
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

    await queryInterface.addIndex('student_academic_enrollments', ['student_id'], {
      name: 'enrollments_student_id_idx',
    });
    await queryInterface.addIndex('student_academic_enrollments', ['batch_id'], {
      name: 'enrollments_batch_id_idx',
    });
    await queryInterface.addIndex('student_academic_enrollments', ['institution_id'], {
      name: 'enrollments_institution_id_idx',
    });
    await queryInterface.addIndex('student_academic_enrollments', ['batch_id', 'student_id'], {
      name: 'enrollments_batch_student_unique',
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_academic_enrollments');
    await queryInterface.dropTable('academic_batches');
  },
};
