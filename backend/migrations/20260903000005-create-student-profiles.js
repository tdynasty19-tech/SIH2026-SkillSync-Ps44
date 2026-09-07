'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_profiles', {
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
      student_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      headline: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING(20),
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
      college_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      course: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      specialization: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      current_semester: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
      },
      graduation_year: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      cgpa: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      },
      resume_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      github_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      portfolio_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      profile_completion: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      career_goal: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      availability_status: {
        type: Sequelize.STRING(50),
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

    await queryInterface.addIndex('student_profiles', ['user_id'], { unique: true, name: 'student_profiles_user_id_unique' });
    await queryInterface.addIndex('student_profiles', ['college_name'], { name: 'student_profiles_college_name_idx' });
    await queryInterface.addIndex('student_profiles', ['department'], { name: 'student_profiles_department_idx' });
    await queryInterface.addIndex('student_profiles', ['graduation_year'], { name: 'student_profiles_graduation_year_idx' });
    await queryInterface.addIndex('student_profiles', ['location'], { name: 'student_profiles_location_idx' });
    await queryInterface.addIndex('student_profiles', ['city'], { name: 'student_profiles_city_idx' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_profiles');
  },
};
