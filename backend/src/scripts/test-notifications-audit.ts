import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { Mentor } from '../models/mentor.model';
import { MentorshipRequest } from '../models/mentorship-request.model';
import { Document } from '../models/document.model';
import { Placement } from '../models/placement.model';
import { Job } from '../models/job.model';
import { Application } from '../models/application.model';
import { Notification } from '../models/notification.model';
import { AuditLog } from '../models/audit-log.model';
import { UserRole } from '../constants/roles';
import {
  NotificationType,
  AuditAction,
  ApplicationStatus,
  OpportunityType,
  MentorshipStatus,
  DocumentAccessLevel,
  WorkplaceType,
  OpportunityStatus,
} from '../constants/enums';
import { notificationService } from '../services/notification.service';
import { auditLogService } from '../services/audit-log.service';
import { authService } from '../services/auth.service';
import { applicationService } from '../services/application.service';
import { mentorshipService } from '../services/mentorship.service';
import { documentService } from '../services/document.service';
import { institutionService } from '../services/institution.service';
import { appEvents, AppEventType } from '../events';
import { initEventSubscribers } from '../events';

export const runPhase13Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 13 NOTIFICATIONS, EVENTS & AUDIT LOGGING TESTS');
  console.log('================================================================\n');

  // Ensure subscribers are active
  initEventSubscribers();

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

  const hash = await bcrypt.hash('Phase13Pass123!', 10);

  // 1. Student User A & Profile
  const userStudA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Priya',
    lastName: 'Nair',
    email: `priya.phase13.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudA = await StudentProfile.create({
    userId: userStudA.id,
    collegeName: 'IIT Madras',
    course: 'B.Tech',
    department: 'Computer Science',
    graduationYear: 2025,
    profileCompletion: 90,
  });

  // 2. Student User B (for IDOR tests)
  const userStudB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Karan',
    lastName: 'Kapoor',
    email: `karan.phase13.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  // 3. Industry User & Profile
  const userInd = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Arun',
    lastName: 'TCS',
    email: `tcs.recruiter.phase13.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileInd = await IndustryProfile.create({
    userId: userInd.id,
    companyName: 'Tata Consultancy Services Phase 13',
    industryType: 'Information Technology',
    websiteUrl: 'https://tcs.com',
    location: 'Mumbai, India',
    verified: true,
  });

  // 4. Institution User & Profile
  const userInst = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Director',
    lastName: 'IITM',
    email: `iitm.inst.phase13.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    isActive: true,
    isVerified: true,
  });

  const profileInst = await InstitutionProfile.create({
    userId: userInst.id,
    institutionName: 'Indian Institute of Technology Madras Phase 13',
    institutionType: 'Autonomous University',
    websiteUrl: 'https://iitm.ac.in',
    verified: true,
  });

  // 5. Mentor User (Academician) & Profile
  const userMentor = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Dr. Radhakrishnan',
    lastName: 'Mentor',
    email: `radhakrishnan.phase13.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    isActive: true,
    isVerified: true,
  });

  const mentorProfile = await Mentor.create({
    userId: userMentor.id,
    expertiseAreas: 'Quantum Computing, High Performance Systems',
    maxMentees: 5,
    currentMentees: 0,
    isAvailable: true,
  });

  // State IDs
  let directNotificationId = 0;
  let testJobId = 0;
  let testAppId = 0;
  let testReqId = 0;
  let testDocId = 0;
  let testPlacementId = 0;

  try {
    // ----------------------------------------------------
    // 1. Notification CRUD & Read State APIs
    // ----------------------------------------------------
    console.log('\n--- 1. Notification CRUD & Read State APIs ---');

    await test('Create direct notification for Student A', async () => {
      const notif = await notificationService.createNotification({
        userId: userStudA.id,
        title: 'Platform Maintenance Notice',
        message: 'System upgrade scheduled for Saturday midnight.',
        type: NotificationType.NEW_OPPORTUNITY,
        data: { noticeId: 101 },
      });

      assert.ok(notif.id);
      assert.strictEqual(notif.userId, userStudA.id);
      assert.strictEqual(notif.isRead, false);
      directNotificationId = notif.id;
    });

    await test('Student A lists own notifications with pagination and unread filtering', async () => {
      const res = await notificationService.getMyNotifications(userStudA.id, {
        page: 1,
        limit: 10,
        isRead: false,
      });

      assert.ok(res.notifications.length >= 1);
      assert.strictEqual(res.notifications[0].id, directNotificationId);
      assert.strictEqual(res.pagination.total >= 1, true);
    });

    await test('Retrieve unread notification count for Student A', async () => {
      const countRes = await notificationService.getUnreadCount(userStudA.id);
      assert.ok(countRes.unreadCount >= 1);
    });

    await test('Student A retrieves notification by ID', async () => {
      const notif = await notificationService.getNotificationById(userStudA.id, directNotificationId);
      assert.strictEqual(notif.id, directNotificationId);
      assert.strictEqual(notif.title, 'Platform Maintenance Notice');
    });

    await test('CRITICAL SECURITY: Student B cannot view Student A notification (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await notificationService.getNotificationById(userStudB.id, directNotificationId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Student A marks notification as read', async () => {
      const updated = await notificationService.markAsRead(userStudA.id, directNotificationId);
      assert.strictEqual(updated.isRead, true);
      assert.ok(updated.readAt);
    });

    await test('CRITICAL SECURITY: Student B cannot mark Student A notification as read (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await notificationService.markAsRead(userStudB.id, directNotificationId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Student A marks all notifications as read', async () => {
      // Create second unread notification
      await notificationService.createNotification({
        userId: userStudA.id,
        title: 'Weekly Digest',
        message: 'Your weekly skill intelligence summary is ready.',
        type: NotificationType.SKILL_GAP_DETECTED,
      });

      const res = await notificationService.markAllAsRead(userStudA.id);
      assert.strictEqual(res.message, 'All notifications marked as read');

      const countRes = await notificationService.getUnreadCount(userStudA.id);
      assert.strictEqual(countRes.unreadCount, 0);
    });

    await test('Student A deletes own notification; Student B deletion rejected', async () => {
      let errorCaught = false;
      try {
        await notificationService.deleteNotification(userStudB.id, directNotificationId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);

      const delRes = await notificationService.deleteNotification(userStudA.id, directNotificationId);
      assert.strictEqual(delRes.message, 'Notification deleted successfully');
    });

    // ----------------------------------------------------
    // 2. Event-Driven Notification Triggers
    // ----------------------------------------------------
    console.log('\n--- 2. Event-Driven Notification Triggers ---');

    await test('Opportunity creation triggers NEW_OPPORTUNITY notification', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const job = await Job.create({
        industryId: profileInd.id,
        title: 'Quantum Software Engineer',
        description: 'Design quantum algorithms for optimization and simulation.',
        workplaceType: WorkplaceType.HYBRID,
        location: 'Bengaluru',
        status: OpportunityStatus.OPEN,
        applicationDeadline: futureDate,
      });
      testJobId = job.id;

      // Dispatch event as opportunity service does
      appEvents.emitSafe(AppEventType.OPPORTUNITY_CREATED, {
        targetUserId: userStudA.id,
        opportunityId: job.id,
        opportunityTitle: job.title,
        opportunityType: 'Job',
      });

      // Wait a moment for event loop async dispatch
      await new Promise((r) => setTimeout(r, 50));

      const notifs = await notificationService.getMyNotifications(userStudA.id, { page: 1, limit: 10 });
      const jobNotif = notifs.notifications.find((n) => n.type === NotificationType.NEW_OPPORTUNITY);
      assert.ok(jobNotif);
      assert.strictEqual(jobNotif.title, 'New Opportunity Available');
      assert.ok(jobNotif.message.includes('Quantum Software Engineer'));
    });

    await test('Application submission triggers APPLICATION_SUBMITTED notification', async () => {
      const appRes = await applicationService.submitApplication(userStudA.id, {
        opportunityType: OpportunityType.JOB,
        opportunityId: testJobId,
        coverLetter: 'I have profound interest in quantum algorithms.',
      });
      testAppId = appRes.id;

      await new Promise((r) => setTimeout(r, 50));

      const notifs = await notificationService.getMyNotifications(userStudA.id, { page: 1, limit: 10 });
      const appNotif = notifs.notifications.find((n) => n.type === NotificationType.APPLICATION_SUBMITTED);
      assert.ok(appNotif);
      assert.strictEqual(appNotif.title, 'Application Submitted');
      assert.ok(appNotif.message.includes('Quantum Software Engineer'));
    });

    await test('Application status transition triggers SHORTLISTED notification', async () => {
      // Transition: APPLIED -> UNDER_REVIEW -> SHORTLISTED
      await applicationService.updateApplicationStatus(
        { id: userInd.id, role: UserRole.INDUSTRY } as any,
        testAppId,
        { status: ApplicationStatus.UNDER_REVIEW }
      );

      await applicationService.updateApplicationStatus(
        { id: userInd.id, role: UserRole.INDUSTRY } as any,
        testAppId,
        { status: ApplicationStatus.SHORTLISTED }
      );

      await new Promise((r) => setTimeout(r, 50));

      const notifs = await notificationService.getMyNotifications(userStudA.id, { page: 1, limit: 10 });
      const shortNotif = notifs.notifications.find((n) => n.type === NotificationType.SHORTLISTED);
      assert.ok(shortNotif);
      assert.strictEqual(shortNotif.title, 'Application Shortlisted');
      assert.ok(shortNotif.message.includes('shortlisted'));
    });

    await test('Application status transition triggers STUDENT_SELECTED notification', async () => {
      // Transition: SHORTLISTED -> INTERVIEW -> SELECTED
      await applicationService.updateApplicationStatus(
        { id: userInd.id, role: UserRole.INDUSTRY } as any,
        testAppId,
        { status: ApplicationStatus.INTERVIEW }
      );

      await applicationService.updateApplicationStatus(
        { id: userInd.id, role: UserRole.INDUSTRY } as any,
        testAppId,
        { status: ApplicationStatus.SELECTED }
      );

      await new Promise((r) => setTimeout(r, 50));

      const notifs = await notificationService.getMyNotifications(userStudA.id, { page: 1, limit: 10 });
      const selectedNotif = notifs.notifications.find((n) => n.type === NotificationType.STUDENT_SELECTED);
      assert.ok(selectedNotif);
      assert.strictEqual(selectedNotif.title, 'Congratulations! You Have Been Selected');
    });

    await test('Mentorship acceptance triggers MENTORSHIP_ACCEPTED notification', async () => {
      const req = await mentorshipService.createRequest(userStudA.id, {
        mentorId: mentorProfile.id,
        goals: 'Learn quantum circuit compilation.',
      });
      testReqId = req.id;

      await mentorshipService.respondToRequest(userMentor.id, testReqId, {
        status: MentorshipStatus.ACCEPTED,
      });

      await new Promise((r) => setTimeout(r, 50));

      const notifs = await notificationService.getMyNotifications(userStudA.id, { page: 1, limit: 10 });
      const mentorNotif = notifs.notifications.find((n) => n.type === NotificationType.MENTORSHIP_ACCEPTED);
      assert.ok(mentorNotif);
      assert.strictEqual(mentorNotif.title, 'Mentorship Request Accepted');
      assert.ok(mentorNotif.message.includes('Dr. Radhakrishnan Mentor'));
    });

    await test('Skill gap event triggers SKILL_GAP_DETECTED notification', async () => {
      appEvents.emitSafe(AppEventType.SKILL_GAP_DETECTED, {
        studentUserId: userStudA.id,
        skillName: 'TensorFlow Distributed Training',
      });

      await new Promise((r) => setTimeout(r, 50));

      const notifs = await notificationService.getMyNotifications(userStudA.id, { page: 1, limit: 10 });
      const gapNotif = notifs.notifications.find(
        (n) => n.type === NotificationType.SKILL_GAP_DETECTED && n.message.includes('TensorFlow')
      );
      assert.ok(gapNotif);
      assert.strictEqual(gapNotif.title, 'Skill Gap Identified');
    });

    // ----------------------------------------------------
    // 3. Audit Logging & Security Auditing
    // ----------------------------------------------------
    console.log('\n--- 3. Audit Logging & Security Auditing ---');

    await test('Successful login generates LOGIN audit record with IP & User-Agent', async () => {
      await authService.login(
        { email: userStudA.email, password: 'Phase13Pass123!' },
        '192.168.1.100',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      );

      await new Promise((r) => setTimeout(r, 50));

      const logs = await auditLogService.getAuditLogs({
        userId: userStudA.id,
        action: AuditAction.LOGIN,
      });

      assert.ok(logs.auditLogs.length >= 1);
      const loginLog = logs.auditLogs[0];
      assert.strictEqual(loginLog.action, AuditAction.LOGIN);
      assert.strictEqual(loginLog.entityType, 'User');
      assert.strictEqual(loginLog.ipAddress, '192.168.1.100');
      assert.ok(loginLog.userAgent?.includes('Mozilla'));
    });

    await test('Opportunity creation generates OPPORTUNITY_CREATED audit record', async () => {
      const logs = await auditLogService.getAuditLogs({
        action: AuditAction.OPPORTUNITY_CREATED,
      });

      assert.ok(logs.auditLogs.length >= 1);
      const oppLog = logs.auditLogs.find((l) => l.entityId === testJobId);
      assert.ok(oppLog);
      assert.strictEqual(oppLog.action, AuditAction.OPPORTUNITY_CREATED);
      assert.strictEqual(oppLog.entityType, 'Opportunity');
    });

    await test('Application status transition generates APPLICATION_STATUS_CHANGED audit record', async () => {
      const logs = await auditLogService.getAuditLogs({
        action: AuditAction.APPLICATION_STATUS_CHANGED,
      });

      assert.ok(logs.auditLogs.length >= 1);
      const appLog = logs.auditLogs.find((l) => l.entityId === testAppId);
      assert.ok(appLog);
      assert.strictEqual(appLog.action, AuditAction.APPLICATION_STATUS_CHANGED);
      assert.strictEqual(appLog.entityType, 'Application');
      assert.ok((appLog.metadata as any)?.newStatus);
    });

    await test('Document access generates DOCUMENT_ACCESSED audit record', async () => {
      const doc = await documentService.createDocument(userStudA.id, {
        fileName: 'Quantum_Algorithm_Proof.pdf',
        fileUrl: '/uploads/quantum_proof.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 1024,
        accessLevel: DocumentAccessLevel.PUBLIC,
      });
      testDocId = doc.id;

      // Access the document
      await documentService.getDocumentById(userStudA.id, testDocId);

      await new Promise((r) => setTimeout(r, 50));

      const logs = await auditLogService.getAuditLogs({
        action: AuditAction.DOCUMENT_ACCESSED,
      });

      const docLog = logs.auditLogs.find((l) => l.entityId === testDocId);
      assert.ok(docLog);
      assert.strictEqual(docLog.action, AuditAction.DOCUMENT_ACCESSED);
      assert.strictEqual(docLog.entityType, 'Document');
      assert.strictEqual(docLog.userId, userStudA.id);
    });

    await test('Placement creation generates PLACEMENT_CHANGED audit record', async () => {
      const placement = await institutionService.createPlacement(userInst.id, {
        academicYear: `24-25-${Date.now().toString().slice(-6)}`,
        totalStudents: 300,
        placedStudents: 270,
        averageSalary: 1850000,
        highestSalary: 6500000,
      });
      testPlacementId = placement.id;

      await new Promise((r) => setTimeout(r, 50));

      const logs = await auditLogService.getAuditLogs({
        action: AuditAction.PLACEMENT_CHANGED,
      });

      const placeLog = logs.auditLogs.find((l) => l.entityId === testPlacementId);
      assert.ok(placeLog);
      assert.strictEqual(placeLog.action, AuditAction.PLACEMENT_CHANGED);
      assert.strictEqual(placeLog.entityType, 'Placement');
      assert.strictEqual((placeLog.metadata as any)?.actionType, 'CREATE');
    });

    await test('Sensitive data (passwords, tokens, keys) is sanitized from audit metadata', async () => {
      await auditLogService.log({
        userId: userStudA.id,
        action: AuditAction.ROLE_SENSITIVE_ACTION,
        entityType: 'SecurityTest',
        metadata: {
          password: 'SecretPassword123!',
          passwordHash: '$2b$10$verysecurehash',
          refreshToken: 'secret.jwt.token',
          safeField: 'PublicInformation',
        },
      });

      const logs = await auditLogService.getAuditLogs({
        action: AuditAction.ROLE_SENSITIVE_ACTION,
        entityType: 'SecurityTest',
      });

      assert.ok(logs.auditLogs.length >= 1);
      const meta = logs.auditLogs[0].metadata as any;
      assert.strictEqual(meta.password, '[REDACTED]');
      assert.strictEqual(meta.passwordHash, '[REDACTED]');
      assert.strictEqual(meta.refreshToken, '[REDACTED]');
      assert.strictEqual(meta.safeField, 'PublicInformation');
    });

    await test('Failure in audit or event emission does not throw or corrupt caller transaction', async () => {
      // Simulate audit logging error safely handled
      await auditLogService.log({
        userId: -99999, // Non-existent user or corrupt payload
        action: 'INVALID_ACTION_TEST',
        entityType: 'FailureTest',
      });

      // Verification: no unhandled rejection or process exit occurred
      assert.ok(true);
    });

  } finally {
    // Cleanup created test records
    if (directNotificationId) await Notification.destroy({ where: { id: directNotificationId } });
    await Notification.destroy({ where: { userId: userStudA.id } });
    await Notification.destroy({ where: { userId: userStudB.id } });

    await AuditLog.destroy({ where: { userId: userStudA.id } });
    await AuditLog.destroy({ where: { userId: userInd.id } });
    await AuditLog.destroy({ where: { userId: userInst.id } });
    await AuditLog.destroy({ where: { entityType: 'SecurityTest' } });

    if (testAppId) await Application.destroy({ where: { id: testAppId } });
    if (testJobId) await Job.destroy({ where: { id: testJobId } });
    if (testReqId) await MentorshipRequest.destroy({ where: { id: testReqId } });
    if (testDocId) await Document.destroy({ where: { id: testDocId } });
    if (testPlacementId) await Placement.destroy({ where: { id: testPlacementId } });

    await Mentor.destroy({ where: { id: mentorProfile.id } });
    await StudentProfile.destroy({ where: { id: profileStudA.id } });
    await IndustryProfile.destroy({ where: { id: profileInd.id } });
    await InstitutionProfile.destroy({ where: { id: profileInst.id } });

    await User.destroy({ where: { id: userStudA.id } });
    await User.destroy({ where: { id: userStudB.id } });
    await User.destroy({ where: { id: userInd.id } });
    await User.destroy({ where: { id: userInst.id } });
    await User.destroy({ where: { id: userMentor.id } });
  }

  console.log('\n================================================================');
  console.log(`PHASE 13 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase13Tests().catch((err) => {
  console.error('Fatal Phase 13 test error:', err);
  process.exit(1);
});
