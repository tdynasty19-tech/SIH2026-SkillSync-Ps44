'use strict';

module.exports = {
  up: async (queryInterface) => {
    // 1. notifications: user feed filtered by unread and ordered by creation
    await queryInterface.addIndex('notifications', ['user_id', 'is_read', 'created_at'], {
      name: 'notifications_user_unread_created_idx',
    });

    // 2. applications: employer opportunity hiring funnel pipeline
    await queryInterface.addIndex('applications', ['opportunity_id', 'opportunity_type', 'status'], {
      name: 'applications_opp_type_status_idx',
    });

    // 3. applications: student application tracking filtered by status
    await queryInterface.addIndex('applications', ['student_id', 'status'], {
      name: 'applications_student_status_idx',
    });

    // 4. jobs: active open jobs listing within application deadline
    await queryInterface.addIndex('jobs', ['status', 'application_deadline'], {
      name: 'jobs_status_deadline_idx',
    });

    // 5. internships: active open internships listing within application deadline
    await queryInterface.addIndex('internships', ['status', 'application_deadline'], {
      name: 'internships_status_deadline_idx',
    });

    // 6. skill_gaps: student gap analysis filtered by status and sorted by priority
    await queryInterface.addIndex('skill_gaps', ['student_id', 'status', 'priority'], {
      name: 'skill_gaps_student_status_priority_idx',
    });

    // 7. assessment_attempts: student attempt lookup by assessment and status
    await queryInterface.addIndex('assessment_attempts', ['student_id', 'assessment_id', 'status'], {
      name: 'assessment_attempts_student_assessment_status_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('assessment_attempts', 'assessment_attempts_student_assessment_status_idx');
    await queryInterface.removeIndex('skill_gaps', 'skill_gaps_student_status_priority_idx');
    await queryInterface.removeIndex('internships', 'internships_status_deadline_idx');
    await queryInterface.removeIndex('jobs', 'jobs_status_deadline_idx');
    await queryInterface.removeIndex('applications', 'applications_student_status_idx');
    await queryInterface.removeIndex('applications', 'applications_opp_type_status_idx');
    await queryInterface.removeIndex('notifications', 'notifications_user_unread_created_idx');
  },
};
