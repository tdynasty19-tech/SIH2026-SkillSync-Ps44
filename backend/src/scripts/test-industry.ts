import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { IndustryContact } from '../models/industry-contact.model';
import { StudentProfile } from '../models/student-profile.model';
import { Job } from '../models/job.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { UserRole } from '../constants/roles';
import { ApplicationStatus, OpportunityStatus, OpportunityType, WorkplaceType, EmploymentType } from '../constants/enums';
import { industryService } from '../services/industry.service';
import { opportunityService } from '../services/opportunity.service';
import { applicationService } from '../services/application.service';

export const runPhase9Tests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 9 INDUSTRY MODULE TESTS');
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

  const hash = await bcrypt.hash('IndustryPass123!', 10);

  // 1. Industry User A
  const userIndA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Apex',
    lastName: 'Technologies',
    email: `industry.apex.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  // 2. Industry User B (Attacker / Different Industry)
  const userIndB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Nexus',
    lastName: 'Global',
    email: `industry.nexus.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  // 3. Student User
  const userStudent = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Siddharth',
    lastName: 'Rao',
    email: `student.siddharth.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const studentProfile = await StudentProfile.create({
    userId: userStudent.id,
    collegeName: 'National Institute of Technology',
    profileCompletion: 85,
  });

  let indProfileA: any = null;
  let indProfileB: any = null;
  let contactA1Id = 0;
  let contactA2Id = 0;
  let jobAId = 0;
  let appId = 0;

  try {
    // ----------------------------------------------------
    // 1. Industry Profile Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Industry Profile Tests ---');

    await test('Industry A user can create profile', async () => {
      const profile = await industryService.createMyProfile(userIndA.id, {
        companyName: 'Apex Technologies Pvt Ltd',
        cin: `U72200KA${Date.now().toString().slice(-8)}PTC123456`,
        industryType: 'Enterprise Cloud Solutions',
        websiteUrl: 'https://apextech.example.com',
        location: 'Outer Ring Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        description: 'Pioneering next-generation enterprise distributed architectures.',
      });

      assert.ok(profile.id);
      assert.strictEqual(profile.userId, userIndA.id);
      assert.strictEqual(profile.companyName, 'Apex Technologies Pvt Ltd');
      assert.strictEqual(profile.verified, false); // verified remains server-controlled
      indProfileA = profile;
    });

    await test('Reject duplicate profile creation for same user', async () => {
      let errorCaught = false;
      try {
        await industryService.createMyProfile(userIndA.id, {
          companyName: 'Duplicate Apex',
          industryType: 'Software',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Duplicate profile creation must be rejected with 409 ConflictError');
    });

    await test('Industry A can retrieve own profile with user and contacts eager-loaded', async () => {
      const profile = await industryService.getMyProfile(userIndA.id);
      assert.strictEqual(profile.id, indProfileA.id);
      assert.strictEqual((profile as any).user?.email, userIndA.email);
      assert.ok(Array.isArray((profile as any).contacts));
    });

    await test('Industry A can update own profile', async () => {
      const updated = await industryService.updateMyProfile(userIndA.id, {
        description: 'Updated enterprise mission: AI and high-performance cloud computing.',
        websiteUrl: 'https://www.apextech.example.com',
      });

      assert.strictEqual(updated.description, 'Updated enterprise mission: AI and high-performance cloud computing.');
      assert.strictEqual(updated.websiteUrl, 'https://www.apextech.example.com');
    });

    await test('Security: Profile update protects against mass assignment of userId or verified', async () => {
      // Create Industry B profile
      indProfileB = await industryService.createMyProfile(userIndB.id, {
        companyName: 'Nexus Global Systems',
        industryType: 'Cybersecurity',
      });

      // Attempt to spoof userId or verified flag
      const updated = await industryService.updateMyProfile(userIndA.id, {
        companyName: 'Apex Technologies Pvt Ltd',
      } as any);

      // Verify userId was not reassigned to userIndB
      assert.strictEqual(updated.userId, userIndA.id);
      assert.strictEqual(updated.verified, false);
    });

    // ----------------------------------------------------
    // 2. Industry Contact Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Industry Contact Tests ---');

    await test('Industry A creates first contact as primary', async () => {
      const contact = await industryService.createContact(userIndA.id, {
        name: 'Rohan Deshmukh',
        designation: 'VP of Engineering',
        email: 'rohan.deshmukh@apextech.example.com',
        phone: '+919876543210',
        isPrimary: true,
      });

      assert.ok(contact.id);
      assert.strictEqual(contact.industryId, indProfileA.id);
      assert.strictEqual(contact.name, 'Rohan Deshmukh');
      assert.strictEqual(contact.isPrimary, true);
      contactA1Id = contact.id;
    });

    await test('Industry A creates second contact and sets as primary, unsetting the first', async () => {
      const contact = await industryService.createContact(userIndA.id, {
        name: 'Sunita Rao',
        designation: 'Head of Campus Relations',
        email: 'sunita.rao@apextech.example.com',
        phone: '+919876543211',
        isPrimary: true,
      });

      assert.ok(contact.id);
      assert.strictEqual(contact.isPrimary, true);
      contactA2Id = contact.id;

      // Verify contact 1 was automatically unset from primary
      const contact1 = await industryService.getContactById(userIndA.id, contactA1Id);
      assert.strictEqual(contact1.isPrimary, false);
    });

    await test('Industry A lists own contacts with pagination and search', async () => {
      const res = await industryService.getContacts(userIndA.id, {
        page: 1,
        limit: 10,
        search: 'Sunita',
      });

      assert.strictEqual(res.pagination.total, 1);
      assert.strictEqual(res.contacts[0].name, 'Sunita Rao');
    });

    await test('Industry A can retrieve contact by ID', async () => {
      const contact = await industryService.getContactById(userIndA.id, contactA2Id);
      assert.strictEqual(contact.id, contactA2Id);
      assert.strictEqual(contact.designation, 'Head of Campus Relations');
    });

    await test('Industry A can update contact details', async () => {
      const updated = await industryService.updateContact(userIndA.id, contactA1Id, {
        designation: 'Chief Technology Officer',
      });

      assert.strictEqual(updated.designation, 'Chief Technology Officer');
    });

    await test('CRITICAL SECURITY: Industry B cannot view Industry A contact (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await industryService.getContactById(userIndB.id, contactA1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true, 'Cross-tenant contact lookup must return 404');
    });

    await test('CRITICAL SECURITY: Industry B cannot update Industry A contact (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await industryService.updateContact(userIndB.id, contactA1Id, {
          name: 'Hacked Contact Name',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true, 'Cross-tenant contact update must return 404');
    });

    await test('CRITICAL SECURITY: Industry B cannot delete Industry A contact (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await industryService.deleteContact(userIndB.id, contactA1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true, 'Cross-tenant contact delete must return 404');
    });

    await test('Industry A can delete own contact', async () => {
      const res = await industryService.deleteContact(userIndA.id, contactA1Id);
      assert.strictEqual(res.message, 'Industry contact deleted successfully');

      let errorCaught = false;
      try {
        await industryService.getContactById(userIndA.id, contactA1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 3. Opportunity Ownership Integration Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Opportunity Ownership Integration Tests ---');

    await test('Industry A creates a job opportunity (server automatically sets industryId)', async () => {
      const job = await opportunityService.createJob(userIndA.id, {
        title: 'Principal Distributed Cloud Architect',
        description: 'Lead high-scale multi-region infrastructure and transaction routing.',
        workplaceType: WorkplaceType.HYBRID,
        employmentType: EmploymentType.FULL_TIME,
        openings: 3,
        applicationDeadline: '2028-12-31',
        status: OpportunityStatus.OPEN,
      });

      assert.ok(job.id);
      assert.strictEqual(job.industryId, indProfileA.id);
      jobAId = job.id;
    });

    await test('Industry A can update their own job opportunity', async () => {
      const updated = await opportunityService.updateJob(userIndA.id, jobAId, {
        openings: 5,
      });
      assert.strictEqual(updated.openings, 5);
    });

    await test('CRITICAL SECURITY: Industry B cannot modify Industry A job opportunity (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateJob(userIndB.id, jobAId, {
          title: 'Malicious Overwrite',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Non-owner organization cannot modify opportunity');
    });

    // ----------------------------------------------------
    // 4. Application Management Integration Tests
    // ----------------------------------------------------
    console.log('\n--- 4. Application Management Integration Tests ---');

    await test('Student submits application to Industry A job opportunity', async () => {
      const app = await applicationService.submitApplication(userStudent.id, {
        opportunityId: jobAId,
        opportunityType: OpportunityType.JOB,
        coverLetter: 'I am highly passionate about large scale cloud infrastructure.',
      });

      assert.ok(app.id);
      assert.strictEqual(app.status, ApplicationStatus.APPLIED);
      appId = app.id;
    });

    await test('Industry A can list applications for their job opportunity', async () => {
      const res = await applicationService.getOpportunityApplications(
        userIndA,
        OpportunityType.JOB,
        jobAId,
        { page: 1, limit: 10 }
      );

      assert.strictEqual(res.applications.length, 1);
      assert.strictEqual(res.applications[0].id, appId);
    });

    await test('CRITICAL SECURITY: Industry B cannot list applications for Industry A job (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await applicationService.getOpportunityApplications(
          userIndB,
          OpportunityType.JOB,
          jobAId,
          { page: 1, limit: 10 }
        );
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Industry B must be blocked with 403 Forbidden');
    });

    await test('Industry A transitions application status to UNDER_REVIEW', async () => {
      const updated = await applicationService.updateApplicationStatus(userIndA, appId, {
        status: ApplicationStatus.UNDER_REVIEW,
        reason: 'Profile qualified for review',
      });

      assert.strictEqual(updated.status, ApplicationStatus.UNDER_REVIEW);
    });

    await test('CRITICAL SECURITY: Student cannot modify application status', async () => {
      let errorCaught = false;
      try {
        await applicationService.updateApplicationStatus(userStudent, appId, {
          status: ApplicationStatus.SELECTED,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Student cannot update status');
    });

  } finally {
    // Cleanup created test records
    if (appId) {
      await ApplicationStatusHistory.destroy({ where: { applicationId: appId } });
      await Application.destroy({ where: { id: appId } });
    }
    if (jobAId) {
      await Job.destroy({ where: { id: jobAId } });
    }
    if (indProfileA?.id) {
      await IndustryContact.destroy({ where: { industryId: indProfileA.id } });
      await IndustryProfile.destroy({ where: { id: indProfileA.id } });
    }
    if (indProfileB?.id) {
      await IndustryContact.destroy({ where: { industryId: indProfileB.id } });
      await IndustryProfile.destroy({ where: { id: indProfileB.id } });
    }
    await StudentProfile.destroy({ where: { id: studentProfile.id } });
    await User.destroy({ where: { id: userStudent.id } });
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

runPhase9Tests().catch((err) => {
  console.error('Fatal Phase 9 test error:', err);
  process.exit(1);
});
