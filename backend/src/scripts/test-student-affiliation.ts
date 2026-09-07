import assert from 'assert';
import '../models';
import { authService } from '../services/auth.service';
import { studentAffiliationService } from '../services/student-affiliation.service';
import { analyticsService } from '../services/analytics.service';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { UserRole } from '../constants/roles';
import { StudentAffiliationStatus } from '../constants/enums';

export const runStudentAffiliationTests = async () => {
  console.log('\n====================================================');
  console.log('STARTING STUDENT INSTITUTIONAL AFFILIATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (error: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${error.message}`);
      failed++;
    }
  };

  const suffix = Date.now();
  const password = 'AffiliationPass123!';
  const institutionUserA = await User.create({
    uuid: `00000000-0000-4000-8000-${String(suffix).slice(-12).padStart(12, '0')}`,
    firstName: 'Institution',
    lastName: 'A',
    email: `affiliation-inst-a-${suffix}@example.com`,
    passwordHash: password,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });
  const institutionUserB = await User.create({
    uuid: `00000000-0000-4000-8001-${String(suffix + 1).slice(-12).padStart(12, '0')}`,
    firstName: 'Institution',
    lastName: 'B',
    email: `affiliation-inst-b-${suffix}@example.com`,
    passwordHash: password,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });
  const institutionA = await InstitutionProfile.create({
    userId: institutionUserA.id,
    institutionName: `Affiliation Institution A ${suffix}`,
    institutionType: 'University',
    verified: true,
  });
  const institutionB = await InstitutionProfile.create({
    userId: institutionUserB.id,
    institutionName: `Affiliation Institution B ${suffix}`,
    institutionType: 'University',
    verified: true,
  });
  const departmentA = await InstitutionDepartment.create({
    institutionId: institutionA.id,
    departmentName: 'Computer Science',
  });
  const departmentB = await InstitutionDepartment.create({
    institutionId: institutionB.id,
    departmentName: 'Computer Science',
  });

  const studentARegistration = await authService.register({
    firstName: 'Student',
    lastName: 'A',
    email: `affiliation-student-a-${suffix}@example.com`,
    password,
    role: UserRole.STUDENT,
  });
  const studentBRegistration = await authService.register({
    firstName: 'Student',
    lastName: 'B',
    email: `affiliation-student-b-${suffix}@example.com`,
    password,
    role: UserRole.STUDENT,
  });
  const studentCRegistration = await authService.register({
    firstName: 'Student',
    lastName: 'C',
    email: `affiliation-student-c-${suffix}@example.com`,
    password,
    role: UserRole.STUDENT,
  });
  const studentDRegistration = await authService.register({
    firstName: 'Student',
    lastName: 'D',
    email: `affiliation-student-d-${suffix}@example.com`,
    password,
    role: UserRole.STUDENT,
  });
  const studentERegistration = await authService.register({
    firstName: 'Student',
    lastName: 'E',
    email: `affiliation-student-e-${suffix}@example.com`,
    password,
    role: UserRole.STUDENT,
  });

  const studentAUserId = (studentARegistration.user as any).id as number;
  const studentBUserId = (studentBRegistration.user as any).id as number;
  const studentCUserId = (studentCRegistration.user as any).id as number;
  const studentDUserId = (studentDRegistration.user as any).id as number;
  const studentEUserId = (studentERegistration.user as any).id as number;
  const studentA = (await StudentProfile.findOne({ where: { userId: studentAUserId } }))!;
  const studentB = (await StudentProfile.findOne({ where: { userId: studentBUserId } }))!;
  const studentC = (await StudentProfile.findOne({ where: { userId: studentCUserId } }))!;
  const studentD = (await StudentProfile.findOne({ where: { userId: studentDUserId } }))!;
  const studentE = (await StudentProfile.findOne({ where: { userId: studentEUserId } }))!;

  try {
    await test('Student registration creates an account and profile without affiliation', async () => {
      assert.ok(studentAUserId);
      assert.ok(studentA);
      const affiliations = await StudentInstitutionAffiliation.findAll({ where: { studentId: studentA.id } });
      assert.strictEqual(affiliations.length, 0);
    });

    await test('Student can create a pending affiliation request', async () => {
      const result = await studentAffiliationService.createRequest(studentAUserId, {
        institutionId: institutionA.id,
        departmentId: departmentA.id,
        enrollmentNumber: ' enr-001 ',
      });
      assert.strictEqual(result.status, StudentAffiliationStatus.PENDING);
      assert.strictEqual(result.enrollmentNumber, 'ENR-001');
      assert.strictEqual(result.studentId, studentA.id);
    });

    await test('Department from another institution is rejected', async () => {
      await assert.rejects(
        () => studentAffiliationService.createRequest(studentCUserId, {
          institutionId: institutionA.id,
          departmentId: departmentB.id,
          enrollmentNumber: 'ENR-002',
        }),
        (error: any) => error.statusCode === 400
      );
      assert.strictEqual(await StudentInstitutionAffiliation.count({ where: { studentId: studentC.id } }), 0);
    });

    await test('Student cannot self-verify an affiliation', async () => {
      const affiliations = await studentAffiliationService.getMyAffiliations(studentAUserId, { page: 1, limit: 20 });
      assert.strictEqual(affiliations.affiliations[0].status, StudentAffiliationStatus.PENDING);
    });

    await test('Institution A sees only its own pending affiliations', async () => {
      await studentAffiliationService.createRequest(studentBUserId, {
        institutionId: institutionB.id,
        departmentId: departmentB.id,
        enrollmentNumber: 'ENR-002',
      });
      await studentAffiliationService.createRequest(studentCUserId, {
        institutionId: institutionB.id,
        departmentId: departmentB.id,
        enrollmentNumber: 'ENR-003',
      });

      const result = await studentAffiliationService.getInstitutionRequests(institutionUserA.id, {
        status: StudentAffiliationStatus.PENDING,
        page: 1,
        limit: 20,
      });
      assert.strictEqual(result.affiliations.length, 1);
      assert.strictEqual(result.affiliations[0].institutionId, institutionA.id);
      assert.strictEqual(result.affiliations[0].studentId, studentA.id);
    });

    await test('Institution cannot verify another institution affiliation', async () => {
      const institutionBAffiliation = await StudentInstitutionAffiliation.findOne({
        where: { studentId: studentB.id, institutionId: institutionB.id },
      });
      await assert.rejects(
        () => studentAffiliationService.verify(institutionUserA.id, institutionBAffiliation!.id),
        (error: any) => error.statusCode === 404
      );
      const unchanged = await StudentInstitutionAffiliation.findByPk(institutionBAffiliation!.id);
      assert.strictEqual(unchanged!.status, StudentAffiliationStatus.PENDING);
    });

    await test('Institution verifies a valid pending affiliation', async () => {
      const affiliation = await StudentInstitutionAffiliation.findOne({
        where: { studentId: studentA.id, institutionId: institutionA.id },
      });
      const verified = await studentAffiliationService.verify(institutionUserA.id, affiliation!.id);
      assert.strictEqual(verified.status, StudentAffiliationStatus.VERIFIED);
      assert.strictEqual(verified.reviewedByUserId, institutionUserA.id);
      assert.ok(verified.reviewedAt);
    });

    await test('Institution rejects a pending affiliation with a reason', async () => {
      const affiliation = await StudentInstitutionAffiliation.findOne({
        where: { studentId: studentB.id, institutionId: institutionB.id },
      });
      const rejected = await studentAffiliationService.reject(institutionUserB.id, affiliation!.id, {
        rejectionReason: 'Enrollment details could not be verified',
      });
      assert.strictEqual(rejected.status, StudentAffiliationStatus.REJECTED);
      assert.strictEqual(rejected.reviewedByUserId, institutionUserB.id);
      assert.ok(rejected.reviewedAt);
      assert.strictEqual(rejected.rejectionReason, 'Enrollment details could not be verified');
    });

    await test('Duplicate enrollment is rejected within the same institution', async () => {
      await assert.rejects(
        () => studentAffiliationService.createRequest(studentEUserId, {
          institutionId: institutionA.id,
          departmentId: departmentA.id,
          enrollmentNumber: 'ENR-001',
        }),
        (error: any) => error.statusCode === 409
      );
    });

    await test('Same enrollment number is allowed at a different institution', async () => {
      const affiliation = await studentAffiliationService.createRequest(studentDUserId, {
        institutionId: institutionB.id,
        departmentId: departmentB.id,
        enrollmentNumber: 'ENR-001',
      });
      assert.strictEqual(affiliation.status, StudentAffiliationStatus.PENDING);
    });

    await test('Free-text college name does not grant institution access', async () => {
      await studentD.update({ collegeName: institutionA.institutionName });
      await assert.rejects(
        () => analyticsService.getStudentSkillAnalytics(studentD.id, {
          id: institutionUserA.id,
          role: UserRole.INSTITUTION,
        }),
        (error: any) => error.statusCode === 403
      );
    });

    await test('Verified affiliation grants institution-scoped analytics access', async () => {
      const analytics = await analyticsService.getStudentSkillAnalytics(studentA.id, {
        id: institutionUserA.id,
        role: UserRole.INSTITUTION,
      });
      assert.strictEqual(analytics.studentId, studentA.id);
    });

    await test('Institution B cannot access Institution A verified student', async () => {
      await assert.rejects(
        () => analyticsService.getStudentSkillAnalytics(studentA.id, {
          id: institutionUserB.id,
          role: UserRole.INSTITUTION,
        }),
        (error: any) => error.statusCode === 403
      );
    });

    await test('Pending and rejected affiliations do not grant institutional analytics access', async () => {
      await assert.rejects(
        () => analyticsService.getStudentSkillAnalytics(studentD.id, {
          id: institutionUserB.id,
          role: UserRole.INSTITUTION,
        }),
        (error: any) => error.statusCode === 403
      );
      await assert.rejects(
        () => analyticsService.getStudentSkillAnalytics(studentB.id, {
          id: institutionUserB.id,
          role: UserRole.INSTITUTION,
        }),
        (error: any) => error.statusCode === 403
      );
    });
  } finally {
    await StudentInstitutionAffiliation.destroy({ where: { studentId: [studentA.id, studentB.id, studentC.id, studentD.id, studentE.id] } });
    await StudentProfile.destroy({ where: { id: [studentA.id, studentB.id, studentC.id, studentD.id, studentE.id] } });
    await InstitutionDepartment.destroy({ where: { id: [departmentA.id, departmentB.id] } });
    await InstitutionProfile.destroy({ where: { id: [institutionA.id, institutionB.id] } });
    await User.destroy({ where: { id: [studentAUserId, studentBUserId, studentCUserId, studentDUserId, studentEUserId, institutionUserA.id, institutionUserB.id] } });
  }

  console.log(`\nAFFILIATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED\n`);
  if (failed > 0) {
    throw new Error(`Student affiliation tests failed: ${failed}`);
  }
};

if (require.main === module) {
  runStudentAffiliationTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
