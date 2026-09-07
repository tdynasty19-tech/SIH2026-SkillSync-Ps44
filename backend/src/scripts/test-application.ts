import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { UserRole } from '../constants/roles';
import { ApplicationStatus, OpportunityStatus, OpportunityType, WorkplaceType, EmploymentType } from '../constants/enums';
import { applicationService } from '../services/application.service';

export const runPhase8Tests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 8 APPLICATION SYSTEM TESTS');
  console.log('=============================================\n');

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

  const hash = await bcrypt.hash('TestPass123!', 10);

  // 1. Industry User A
  const userIndA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Nova',
    lastName: 'Tech',
    email: `industry.nova.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileIndA = await IndustryProfile.create({
    userId: userIndA.id,
    companyName: 'Nova Technologies Ltd',
    industryType: 'Software',
    location: 'Bangalore, India',
    verified: true,
  });

  // 2. Industry User B (Attacker / Unrelated organization)
  const userIndB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Zephyr',
    lastName: 'Inc',
    email: `industry.zephyr.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileIndB = await IndustryProfile.create({
    userId: userIndB.id,
    companyName: 'Zephyr Systems',
    industryType: 'Hardware',
    location: 'Pune, India',
    verified: true,
  });

  // 3. Student User A
  const userStudentA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Alice',
    lastName: 'Sharma',
    email: `student.alice.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudentA = await StudentProfile.create({
    userId: userStudentA.id,
    collegeName: 'National Institute of Engineering',
    profileCompletion: 80,
  });

  // 4. Student User B (Unrelated student)
  const userStudentB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Bob',
    lastName: 'Verma',
    email: `student.bob.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudentB = await StudentProfile.create({
    userId: userStudentB.id,
    collegeName: 'State Technical University',
    profileCompletion: 70,
  });

  // 5. Test Opportunities
  // Job 1: Active Open Job with future deadline
  const openJob = await Job.create({
    industryId: profileIndA.id,
    title: 'Distributed Systems Architect',
    description: 'Design low latency high-throughput distributed transaction engines.',
    workplaceType: WorkplaceType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    openings: 2,
    applicationDeadline: new Date('2028-12-31'),
    status: OpportunityStatus.OPEN,
  });

  // Job 2: Expired Job with past deadline
  const expiredJob = await Job.create({
    industryId: profileIndA.id,
    title: 'Legacy Cobol Maintainer',
    description: 'Expired position from last year.',
    workplaceType: WorkplaceType.ON_SITE,
    employmentType: EmploymentType.CONTRACT,
    openings: 1,
    applicationDeadline: new Date('2020-01-01'),
    status: OpportunityStatus.OPEN,
  });

  // Job 3: Closed Job
  const closedJob = await Job.create({
    industryId: profileIndA.id,
    title: 'Closed Research Fellow',
    description: 'This opportunity has been closed.',
    workplaceType: WorkplaceType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    openings: 1,
    status: OpportunityStatus.CLOSED,
  });

  // Internship 1: Active Internship for alternative branch testing
  const openInternship = await Internship.create({
    industryId: profileIndA.id,
    title: 'Cloud Infrastructure Intern',
    description: 'Hands-on automated infrastructure management with Terraform.',
    durationMonths: 6,
    openings: 2,
    applicationDeadline: new Date('2028-06-30'),
    status: OpportunityStatus.OPEN,
  });

  let createdAppId = 0;
  let branchAppId = 0;

  try {
    // ----------------------------------------------------
    // 1. Application Submission Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Application Submission Tests ---');

    await test('Student A submits application to open job (status APPLIED with initial history)', async () => {
      const app = await applicationService.submitApplication(userStudentA.id, {
        opportunityId: openJob.id,
        opportunityType: OpportunityType.JOB,
        coverLetter: 'I am thrilled to apply for the Distributed Systems Architect position.',
        resumeUrl: 'https://cdn.example.com/resumes/alice_sharma.pdf',
      });

      assert.ok(app.id);
      assert.strictEqual(app.studentId, profileStudentA.id);
      assert.strictEqual(app.opportunityId, openJob.id);
      assert.strictEqual(app.opportunityType, OpportunityType.JOB);
      assert.strictEqual(app.status, ApplicationStatus.APPLIED);
      assert.strictEqual(app.coverLetter, 'I am thrilled to apply for the Distributed Systems Architect position.');

      createdAppId = app.id;

      // Verify initial status history entry
      const histories = await ApplicationStatusHistory.findAll({ where: { applicationId: app.id } });
      assert.strictEqual(histories.length, 1);
      assert.strictEqual(histories[0].fromStatus, null);
      assert.strictEqual(histories[0].toStatus, ApplicationStatus.APPLIED);
      assert.strictEqual(histories[0].changedByUserId, userStudentA.id);
    });

    await test('Reject duplicate application from same student for same opportunity', async () => {
      let errorCaught = false;
      try {
        await applicationService.submitApplication(userStudentA.id, {
          opportunityId: openJob.id,
          opportunityType: OpportunityType.JOB,
          coverLetter: 'Trying to apply a second time.',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Duplicate application must be rejected with 409 ConflictError');
    });

    await test('Reject application submission after opportunity deadline has passed', async () => {
      let errorCaught = false;
      try {
        await applicationService.submitApplication(userStudentA.id, {
          opportunityId: expiredJob.id,
          opportunityType: OpportunityType.JOB,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Applying past deadline must be rejected with 409 ConflictError');
    });

    await test('Reject application submission to a CLOSED opportunity', async () => {
      let errorCaught = false;
      try {
        await applicationService.submitApplication(userStudentA.id, {
          opportunityId: closedJob.id,
          opportunityType: OpportunityType.JOB,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Applying to closed opportunity must be rejected with 409 ConflictError');
    });

    await test('Reject non-student user attempting to submit student application', async () => {
      let errorCaught = false;
      try {
        await applicationService.submitApplication(userIndA.id, {
          opportunityId: openJob.id,
          opportunityType: OpportunityType.JOB,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404); // student profile not found
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 2. Student Application Access & IDOR Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Student Application Access & IDOR Tests ---');

    await test('Student A can view their own application list', async () => {
      const res = await applicationService.getMyApplications(userStudentA.id, {
        page: 1,
        limit: 10,
      });

      assert.ok(res.applications.length >= 1);
      assert.strictEqual(res.applications[0].id, createdAppId);
      assert.strictEqual((res.applications[0] as any).opportunity?.title, 'Distributed Systems Architect');
      assert.strictEqual(res.pagination.page, 1);
    });

    await test('Student A can view single application details with eager-loaded history', async () => {
      const app = await applicationService.getMyApplicationById(userStudentA.id, createdAppId);
      assert.strictEqual(app.id, createdAppId);
      assert.strictEqual((app as any).statusHistory.length, 1);
      assert.strictEqual((app as any).statusHistory[0].toStatus, ApplicationStatus.APPLIED);
    });

    await test('CRITICAL SECURITY: Student B cannot view Student A application (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await applicationService.getMyApplicationById(userStudentB.id, createdAppId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true, 'Accessing another student application must return 404 Not Found');
    });

    // ----------------------------------------------------
    // 3. Opportunity Owner Review & IDOR Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Opportunity Owner Review & IDOR Tests ---');

    await test('Opportunity Owner (Industry A) can list applications for their job', async () => {
      const res = await applicationService.getOpportunityApplications(
        userIndA,
        OpportunityType.JOB,
        openJob.id,
        { page: 1, limit: 10 }
      );

      assert.ok(res.applications.length >= 1);
      assert.strictEqual(res.applications[0].id, createdAppId);
      assert.strictEqual((res.applications[0] as any).student.user.firstName, 'Alice');
    });

    await test('Opportunity Owner (Industry A) can view full application review details', async () => {
      const app = await applicationService.getOpportunityApplicationById(userIndA, createdAppId);
      assert.strictEqual(app.id, createdAppId);
      assert.strictEqual((app as any).student.collegeName, 'National Institute of Engineering');
    });

    await test('CRITICAL SECURITY: Industry B cannot list applications for Industry A opportunity (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await applicationService.getOpportunityApplications(
          userIndB,
          OpportunityType.JOB,
          openJob.id,
          { page: 1, limit: 10 }
        );
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Unauthorized organization must be blocked with 403 Forbidden');
    });

    await test('CRITICAL SECURITY: Industry B cannot review Industry A application details', async () => {
      let errorCaught = false;
      try {
        await applicationService.getOpportunityApplicationById(userIndB, createdAppId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('CRITICAL SECURITY: Student cannot update application status', async () => {
      let errorCaught = false;
      try {
        await applicationService.updateApplicationStatus(userStudentA, createdAppId, {
          status: ApplicationStatus.UNDER_REVIEW,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Student cannot change application status');
    });

    // ----------------------------------------------------
    // 4. Status Transition Engine Tests (Mainline Lifecycle)
    // ----------------------------------------------------
    console.log('\n--- 4. Status Transition Engine Tests (Mainline Lifecycle) ---');

    await test('Invalid Transition: APPLIED -> SELECTED directly is rejected', async () => {
      let errorCaught = false;
      try {
        await applicationService.updateApplicationStatus(userIndA, createdAppId, {
          status: ApplicationStatus.SELECTED,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Skipping stages must fail with 409 ConflictError');
    });

    await test('Invalid Transition: APPLIED -> REJECTED directly is rejected', async () => {
      let errorCaught = false;
      try {
        await applicationService.updateApplicationStatus(userIndA, createdAppId, {
          status: ApplicationStatus.REJECTED,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Valid Transition: APPLIED -> UNDER_REVIEW', async () => {
      const updated = await applicationService.updateApplicationStatus(userIndA, createdAppId, {
        status: ApplicationStatus.UNDER_REVIEW,
        reason: 'Resume matches initial requirements, moving to review.',
      });

      assert.strictEqual(updated.status, ApplicationStatus.UNDER_REVIEW);

      const histories = await ApplicationStatusHistory.findAll({
        where: { applicationId: createdAppId },
        order: [['createdAt', 'ASC']],
      });
      assert.strictEqual(histories.length, 2);
      assert.strictEqual(histories[1].fromStatus, ApplicationStatus.APPLIED);
      assert.strictEqual(histories[1].toStatus, ApplicationStatus.UNDER_REVIEW);
      assert.strictEqual(histories[1].reason, 'Resume matches initial requirements, moving to review.');
    });

    await test('Valid Transition: UNDER_REVIEW -> SHORTLISTED', async () => {
      const updated = await applicationService.updateApplicationStatus(userIndA, createdAppId, {
        status: ApplicationStatus.SHORTLISTED,
        reason: 'Technical screening passed.',
      });

      assert.strictEqual(updated.status, ApplicationStatus.SHORTLISTED);

      const histories = await ApplicationStatusHistory.findAll({
        where: { applicationId: createdAppId },
        order: [['createdAt', 'ASC']],
      });
      assert.strictEqual(histories.length, 3);
      assert.strictEqual(histories[2].fromStatus, ApplicationStatus.UNDER_REVIEW);
      assert.strictEqual(histories[2].toStatus, ApplicationStatus.SHORTLISTED);
    });

    await test('Valid Transition: SHORTLISTED -> INTERVIEW', async () => {
      const updated = await applicationService.updateApplicationStatus(userIndA, createdAppId, {
        status: ApplicationStatus.INTERVIEW,
        reason: 'Invited to architectural whiteboard round.',
      });

      assert.strictEqual(updated.status, ApplicationStatus.INTERVIEW);

      const histories = await ApplicationStatusHistory.findAll({
        where: { applicationId: createdAppId },
        order: [['createdAt', 'ASC']],
      });
      assert.strictEqual(histories.length, 4);
      assert.strictEqual(histories[3].fromStatus, ApplicationStatus.SHORTLISTED);
      assert.strictEqual(histories[3].toStatus, ApplicationStatus.INTERVIEW);
    });

    await test('Valid Transition: INTERVIEW -> SELECTED (Terminal State)', async () => {
      const updated = await applicationService.updateApplicationStatus(userIndA, createdAppId, {
        status: ApplicationStatus.SELECTED,
        reason: 'Candidate selected for offer rollout.',
      });

      assert.strictEqual(updated.status, ApplicationStatus.SELECTED);

      const histories = await ApplicationStatusHistory.findAll({
        where: { applicationId: createdAppId },
        order: [['createdAt', 'ASC']],
      });
      assert.strictEqual(histories.length, 5);
      assert.strictEqual(histories[4].fromStatus, ApplicationStatus.INTERVIEW);
      assert.strictEqual(histories[4].toStatus, ApplicationStatus.SELECTED);
    });

    await test('Terminal State Invariant: SELECTED cannot transition back to APPLIED or UNDER_REVIEW', async () => {
      let errorCaught = false;
      try {
        await applicationService.updateApplicationStatus(userIndA, createdAppId, {
          status: ApplicationStatus.UNDER_REVIEW,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Terminal state mutations must be rejected');
    });

    // ----------------------------------------------------
    // 5. Status Transition Engine Tests (Rejection Branches)
    // ----------------------------------------------------
    console.log('\n--- 5. Status Transition Engine Tests (Rejection Branches) ---');

    await test('Rejection Branch: Student A submits application to internship, transitions to UNDER_REVIEW then REJECTED', async () => {
      const branchApp = await applicationService.submitApplication(userStudentA.id, {
        opportunityId: openInternship.id,
        opportunityType: OpportunityType.INTERNSHIP,
      });
      branchAppId = branchApp.id;

      // Move to UNDER_REVIEW
      await applicationService.updateApplicationStatus(userIndA, branchAppId, {
        status: ApplicationStatus.UNDER_REVIEW,
      });

      // Move to REJECTED
      const rejectedApp = await applicationService.updateApplicationStatus(userIndA, branchAppId, {
        status: ApplicationStatus.REJECTED,
        reason: 'Profile does not meet specific cloud engineering requirements.',
      });

      assert.strictEqual(rejectedApp.status, ApplicationStatus.REJECTED);

      const histories = await ApplicationStatusHistory.findAll({
        where: { applicationId: branchAppId },
        order: [['createdAt', 'ASC']],
      });
      assert.strictEqual(histories.length, 3);
      assert.strictEqual(histories[2].fromStatus, ApplicationStatus.UNDER_REVIEW);
      assert.strictEqual(histories[2].toStatus, ApplicationStatus.REJECTED);
      assert.strictEqual(histories[2].reason, 'Profile does not meet specific cloud engineering requirements.');
    });

    await test('Terminal State Invariant: REJECTED application cannot be resurrected to SHORTLISTED or SELECTED', async () => {
      let errorCaught = false;
      try {
        await applicationService.updateApplicationStatus(userIndA, branchAppId, {
          status: ApplicationStatus.SHORTLISTED,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Resurrecting rejected application must be rejected with 409 ConflictError');
    });

  } finally {
    // Cleanup created test records
    if (createdAppId) {
      await ApplicationStatusHistory.destroy({ where: { applicationId: createdAppId } });
      await Application.destroy({ where: { id: createdAppId } });
    }
    if (branchAppId) {
      await ApplicationStatusHistory.destroy({ where: { applicationId: branchAppId } });
      await Application.destroy({ where: { id: branchAppId } });
    }
    await Job.destroy({ where: { id: openJob.id } });
    await Job.destroy({ where: { id: expiredJob.id } });
    await Job.destroy({ where: { id: closedJob.id } });
    await Internship.destroy({ where: { id: openInternship.id } });
    await StudentProfile.destroy({ where: { id: profileStudentA.id } });
    await StudentProfile.destroy({ where: { id: profileStudentB.id } });
    await IndustryProfile.destroy({ where: { id: profileIndA.id } });
    await IndustryProfile.destroy({ where: { id: profileIndB.id } });
    await User.destroy({ where: { id: userStudentA.id } });
    await User.destroy({ where: { id: userStudentB.id } });
    await User.destroy({ where: { id: userIndA.id } });
    await User.destroy({ where: { id: userIndB.id } });
  }

  console.log('\n=============================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase8Tests().catch((err) => {
  console.error('Fatal Phase 8 test error:', err);
  process.exit(1);
});
