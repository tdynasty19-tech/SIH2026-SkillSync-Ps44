import assert from 'assert';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { Notification } from '../models/notification.model';
import { analyticsService } from '../services/analytics.service';
import { notificationService } from '../services/notification.service';
import { UserRole } from '../constants/roles';
import { NotificationType } from '../constants/enums';

export const runPhase3ETests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 3E DASHBOARDS + NOTIFICATIONS TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) {
        console.error(err.stack);
      }
      failed++;
    }
  };

  // Find demo users for each role
  const studentUser = await User.findOne({ where: { role: UserRole.STUDENT } });
  assert.ok(studentUser, 'Demo student user should exist in database');

  const industryUser = await User.findOne({ where: { role: UserRole.INDUSTRY } });
  assert.ok(industryUser, 'Demo industry user should exist in database');

  const academicianUser = await User.findOne({ where: { role: UserRole.ACADEMICIAN } });
  assert.ok(academicianUser, 'Demo academician user should exist in database');

  const institutionUser = await User.findOne({ where: { role: UserRole.INSTITUTION } });
  assert.ok(institutionUser, 'Demo institution user should exist in database');

  // Test 1: Student Dashboard
  await test('Student Dashboard: Returns real profile, skill intelligence, assessment overview, and applications', async () => {
    const dashboard = await analyticsService.getStudentDashboard(studentUser.id);

    assert.ok(typeof dashboard.profileCompletion === 'number', 'profileCompletion must be a number');
    assert.ok(dashboard.skillSummary, 'Must contain skillSummary');
    assert.ok(typeof dashboard.skillSummary.totalSkills === 'number', 'totalSkills must be a number');
    assert.ok(dashboard.skillSummary.skillLevels, 'skillLevels distribution must exist');
    assert.ok(Array.isArray(dashboard.topSkills), 'topSkills must be an array');

    assert.ok(dashboard.assessmentOverview, 'assessmentOverview must exist');
    assert.ok(typeof dashboard.assessmentOverview.totalAttempts === 'number', 'totalAttempts must be a number');
    assert.ok(Array.isArray(dashboard.assessmentOverview.recentAttempts), 'recentAttempts must be an array');

    assert.ok(Array.isArray(dashboard.skillGaps), 'skillGaps must be an array');
    assert.ok(Array.isArray(dashboard.recommendedCareers), 'recommendedCareers must be an array');
    assert.ok(Array.isArray(dashboard.recentApplications), 'recentApplications must be an array');
    assert.ok(dashboard.notifications, 'notifications count must exist');
    assert.ok(typeof dashboard.notifications.unreadCount === 'number', 'unreadCount must be a number');
  });

  // Test 2: Industry Dashboard
  await test('Industry Dashboard: Returns recruitment funnel, opportunity breakdown, and candidate intelligence', async () => {
    const dashboard = await analyticsService.getIndustryDashboard(industryUser.id);

    assert.ok(typeof dashboard.activeOpportunities === 'number', 'activeOpportunities must be number');
    assert.ok(typeof dashboard.totalApplications === 'number', 'totalApplications must be number');
    assert.ok(dashboard.opportunityBreakdown, 'opportunityBreakdown must exist');
    assert.ok(dashboard.opportunityBreakdown.jobs, 'jobs breakdown must exist');
    assert.ok(dashboard.opportunityBreakdown.internships, 'internships breakdown must exist');
    assert.ok(dashboard.opportunityBreakdown.projects, 'projects breakdown must exist');

    assert.ok(dashboard.hiringFunnel, 'hiringFunnel pipeline must exist');
    assert.ok(typeof dashboard.hiringFunnel.totalApplied === 'number', 'hiringFunnel.totalApplied must be number');
    assert.ok(typeof dashboard.hiringFunnel.shortlisted === 'number', 'hiringFunnel.shortlisted must be number');
    assert.ok(typeof dashboard.hiringFunnel.offeredOrAccepted === 'number', 'hiringFunnel.offeredOrAccepted must be number');

    assert.ok(Array.isArray(dashboard.topCandidateSkills), 'topCandidateSkills must be an array');
  });

  // Test 3: Academician Dashboard
  await test('Academician Dashboard: Returns mentee stats, department student skill distribution, and workshops', async () => {
    const dashboard = await analyticsService.getAcademicianDashboard(academicianUser.id);

    assert.ok(dashboard.academician, 'academician details must exist');
    assert.ok(dashboard.academician.department, 'department must exist');
    assert.ok(dashboard.mentorship, 'mentorship stats must exist');
    assert.ok(typeof dashboard.mentorship.activeMentees === 'number', 'activeMentees must be number');
    assert.ok(typeof dashboard.mentorship.maxMentees === 'number', 'maxMentees must be number');

    assert.ok(dashboard.departmentStats, 'departmentStats must exist');
    assert.ok(typeof dashboard.departmentStats.totalStudents === 'number', 'totalStudents must be number');
    assert.ok(dashboard.departmentStats.skillDistribution, 'skillDistribution must exist');
    assert.ok(Array.isArray(dashboard.departmentStats.topSkills), 'topSkills must be an array');
    assert.ok(Array.isArray(dashboard.departmentStats.commonSkillGaps), 'commonSkillGaps must be an array');
    assert.ok(Array.isArray(dashboard.workshops), 'workshops must be an array');
  });

  // Test 4: Institution Dashboard
  await test('Institution Dashboard: Returns student KPIs, skill distribution, placement trends, and partnerships', async () => {
    const dashboard = await analyticsService.getInstitutionDashboard(institutionUser.id);

    assert.ok(dashboard.studentStats, 'studentStats must exist');
    assert.ok(typeof dashboard.studentStats.totalStudents === 'number', 'totalStudents must be number');
    assert.ok(dashboard.skillStats, 'skillStats must exist');
    assert.ok(dashboard.skillStats.skillLevelDistribution, 'skillLevelDistribution must exist');

    assert.ok(dashboard.placementStats, 'placementStats must exist');
    assert.ok(typeof dashboard.placementStats.placementRate === 'number', 'placementRate must be number');
    assert.ok(dashboard.industryStats, 'industryStats must exist');
    assert.ok(typeof dashboard.industryStats.industryConnectionsCount === 'number', 'industryConnectionsCount must be number');
    assert.ok(dashboard.collaborationStats, 'collaborationStats must exist');
  });

  // Test 5: Notification System CRUD & Unread Count
  await test('Notification System: Creation, listing, unread count, mark as read, mark all read, and IDOR isolation', async () => {
    // Clean initial unread count
    const initialRes = await notificationService.getUnreadCount(studentUser.id);
    const initialUnread = initialRes.unreadCount;

    // Create a new notification for student
    const createdNotification = await Notification.create({
      userId: studentUser.id,
      title: 'New Skill Assessment Result',
      message: 'Your React.js Skill Assessment has been verified. Score: 85%.',
      type: NotificationType.APPLICATION_SUBMITTED,
      data: { score: 85, skillName: 'React.js' },
      isRead: false,
    });

    // Verify unread count increased by 1
    const newRes = await notificationService.getUnreadCount(studentUser.id);
    assert.strictEqual(newRes.unreadCount, initialUnread + 1, 'Unread count should increment by 1');

    // List notifications
    const listResult = await notificationService.getMyNotifications(studentUser.id, { page: 1, limit: 10 });
    assert.ok(listResult.notifications.length > 0, 'Should return notifications');
    const found = listResult.notifications.find((n: any) => n.id === createdNotification.id);
    assert.ok(found, 'Created notification must be in list');

    // IDOR check: other user cannot mark this notification as read
    let idorPrevented = false;
    try {
      await notificationService.markAsRead(industryUser.id, createdNotification.id);
    } catch (e) {
      idorPrevented = true;
    }
    assert.ok(idorPrevented, 'Unauthorized user should NOT be able to mark another user\'s notification as read');

    // Mark as read by rightful owner
    const readResult = await notificationService.markAsRead(studentUser.id, createdNotification.id);
    assert.strictEqual(readResult.isRead, true, 'Notification should be marked as read');

    // Verify unread count reverted
    const afterReadRes = await notificationService.getUnreadCount(studentUser.id);
    assert.strictEqual(afterReadRes.unreadCount, initialUnread, 'Unread count should revert after mark as read');

    // Mark all as read
    await notificationService.markAllAsRead(studentUser.id);
    const finalRes = await notificationService.getUnreadCount(studentUser.id);
    assert.strictEqual(finalRes.unreadCount, 0, 'Unread count should be 0 after markAllAsRead');

    // Cleanup created notification
    await createdNotification.destroy();
  });

  console.log('\n================================================================');
  console.log(`PHASE 3E TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runPhase3ETests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
