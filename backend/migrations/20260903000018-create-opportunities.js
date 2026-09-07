'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. jobs
    await queryInterface.createTable('jobs', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      workplace_type: {
        type: Sequelize.ENUM('REMOTE', 'HYBRID', 'ON_SITE'),
        allowNull: false,
        defaultValue: 'ON_SITE',
      },
      employment_type: {
        type: Sequelize.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'),
        allowNull: false,
        defaultValue: 'FULL_TIME',
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
      salary_min: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      salary_max: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      openings: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      application_deadline: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('jobs', ['industry_id'], { name: 'jobs_industry_id_idx' });
    await queryInterface.addIndex('jobs', ['status'], { name: 'jobs_status_idx' });
    await queryInterface.addIndex('jobs', ['workplace_type'], { name: 'jobs_workplace_type_idx' });
    await queryInterface.addIndex('jobs', ['employment_type'], { name: 'jobs_employment_type_idx' });
    await queryInterface.addIndex('jobs', ['location'], { name: 'jobs_location_idx' });
    await queryInterface.addIndex('jobs', ['application_deadline'], { name: 'jobs_application_deadline_idx' });

    // 2. internships
    await queryInterface.createTable('internships', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration_months: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 3,
      },
      stipend: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      workplace_type: {
        type: Sequelize.ENUM('REMOTE', 'HYBRID', 'ON_SITE'),
        allowNull: false,
        defaultValue: 'ON_SITE',
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      openings: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      application_deadline: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('internships', ['industry_id'], { name: 'internships_industry_id_idx' });
    await queryInterface.addIndex('internships', ['status'], { name: 'internships_status_idx' });
    await queryInterface.addIndex('internships', ['location'], { name: 'internships_location_idx' });
    await queryInterface.addIndex('internships', ['application_deadline'], { name: 'internships_application_deadline_idx' });

    // 3. projects
    await queryInterface.createTable('projects', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      deliverables: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration_weeks: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      budget: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('projects', ['industry_id'], { name: 'projects_industry_id_idx' });
    await queryInterface.addIndex('projects', ['status'], { name: 'projects_status_idx' });

    // 4. learning_programs
    await queryInterface.createTable('learning_programs', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      industry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'industry_profiles',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      curriculum: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration_hours: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      mode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ONLINE',
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('learning_programs', ['industry_id'], { name: 'learning_programs_industry_id_idx' });
    await queryInterface.addIndex('learning_programs', ['institution_id'], { name: 'learning_programs_institution_id_idx' });
    await queryInterface.addIndex('learning_programs', ['status'], { name: 'learning_programs_status_idx' });

    // 5. faculty_opportunities
    await queryInterface.createTable('faculty_opportunities', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      industry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'industry_profiles',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      eligibility: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      application_deadline: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('faculty_opportunities', ['institution_id'], { name: 'faculty_opps_institution_id_idx' });
    await queryInterface.addIndex('faculty_opportunities', ['industry_id'], { name: 'faculty_opps_industry_id_idx' });
    await queryInterface.addIndex('faculty_opportunities', ['department'], { name: 'faculty_opps_department_idx' });
    await queryInterface.addIndex('faculty_opportunities', ['application_deadline'], { name: 'faculty_opps_deadline_idx' });
    await queryInterface.addIndex('faculty_opportunities', ['status'], { name: 'faculty_opps_status_idx' });

    // 6. fdps
    await queryInterface.createTable('fdps', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      industry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'industry_profiles',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      mode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ONLINE',
      },
      venue: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('fdps', ['institution_id'], { name: 'fdps_institution_id_idx' });
    await queryInterface.addIndex('fdps', ['industry_id'], { name: 'fdps_industry_id_idx' });
    await queryInterface.addIndex('fdps', ['status'], { name: 'fdps_status_idx' });

    // 7. research_opportunities
    await queryInterface.createTable('research_opportunities', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      industry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'industry_profiles',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      field_of_study: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      funding_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      duration_months: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('research_opportunities', ['institution_id'], { name: 'research_opps_institution_id_idx' });
    await queryInterface.addIndex('research_opportunities', ['industry_id'], { name: 'research_opps_industry_id_idx' });
    await queryInterface.addIndex('research_opportunities', ['status'], { name: 'research_opps_status_idx' });

    // 8. consultancy_opportunities
    await queryInterface.createTable('consultancy_opportunities', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      domain: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      problem_statement: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      expected_outcome: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      budget: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'),
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

    await queryInterface.addIndex('consultancy_opportunities', ['industry_id'], { name: 'consultancy_opps_industry_id_idx' });
    await queryInterface.addIndex('consultancy_opportunities', ['status'], { name: 'consultancy_opps_status_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('consultancy_opportunities');
    await queryInterface.dropTable('research_opportunities');
    await queryInterface.dropTable('fdps');
    await queryInterface.dropTable('faculty_opportunities');
    await queryInterface.dropTable('learning_programs');
    await queryInterface.dropTable('projects');
    await queryInterface.dropTable('internships');
    await queryInterface.dropTable('jobs');
  },
};
