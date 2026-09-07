import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { authService } from '../services/auth.service';
import { academicianService } from '../services/academician.service';
import { studentAffiliationService } from '../services/student-affiliation.service';
import { analyticsService } from '../services/analytics.service';
import { analyticsRepository } from '../repositories/analytics.repository';
import { User } from '../models/user.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { StudentProfile } from '../models/student-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { UserRole } from '../constants/roles';
import { StudentAffiliationStatus } from '../constants/enums';

export const runPhaseASecurityTests = async () => {
  console.log('\n====================================================');
  console.log('STARTING PHASE A ACADEMIC SCOPE SECURITY TESTS');
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
      if (error.stack) {
        console.error(error.stack);
      }
      failed++;
    }
  };

  const suffix = Date.now();
  const password = 'PhaseASecurePass123!';
  const hash = await bcrypt.hash(password, 10);

  // Track created entity IDs for clean teardown
  const createdUserIds: number[] = [];
  const createdInstitutionIds: number[] = [];
  const createdDepartmentIds: number[] = [];
  const createdStudentProfileIds: number[] = [];
  const createdAcademicianProfileIds: number[] = [];

  try {
    // ----------------------------------------------------
    // SETUP: 2 Institutions, 2 Departments each
    // ----------------------------------------------------
    // Institution A
    const userInstA = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Institution',
      lastName: 'Alpha',
      email: `inst-alpha-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userInstA.id);

    const instA = await InstitutionProfile.create({
      userId: userInstA.id,
      institutionName: `Institution Alpha ${suffix}`,
      institutionType: 'University',
      verified: true,
    });
    createdInstitutionIds.push(instA.id);

    const deptA_CS = await InstitutionDepartment.create({
      institutionId: instA.id,
      departmentName: 'Computer Science',
    });
    createdDepartmentIds.push(deptA_CS.id);

    const deptA_EE = await InstitutionDepartment.create({
      institutionId: instA.id,
      departmentName: 'Electrical Engineering',
    });
    createdDepartmentIds.push(deptA_EE.id);

    // Institution B
    const userInstB = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Institution',
      lastName: 'Beta',
      email: `inst-beta-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userInstB.id);

    const instB = await InstitutionProfile.create({
      userId: userInstB.id,
      institutionName: `Institution Beta ${suffix}`,
      institutionType: 'University',
      verified: true,
    });
    createdInstitutionIds.push(instB.id);

    const deptB_CS = await InstitutionDepartment.create({
      institutionId: instB.id,
      departmentName: 'Computer Science',
    });
    createdDepartmentIds.push(deptB_CS.id);

    // ----------------------------------------------------
    // SETUP: Students with various affiliation statuses
    // ----------------------------------------------------
    // Helper to register student
    const registerStudent = async (tag: string) => {
      const reg = await authService.register({
        firstName: 'Student',
        lastName: tag,
        email: `student-${tag.toLowerCase()}-${suffix}@example.com`,
        password,
        role: UserRole.STUDENT,
      });
      const userId = (reg.user as any).id as number;
      createdUserIds.push(userId);
      const studentProfile = await StudentProfile.findOne({ where: { userId } });
      if (studentProfile) {
        createdStudentProfileIds.push(studentProfile.id);
      }
      return { userId, profile: studentProfile! };
    };

    // Student 1: Verified in Inst A, Dept CS
    const student1 = await registerStudent('VerifiedA_CS');
    await StudentInstitutionAffiliation.create({
      studentId: student1.profile.id,
      institutionId: instA.id,
      departmentId: deptA_CS.id,
      enrollmentNumber: `ENR-1-${suffix}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
    });

    // Student 2: Pending in Inst A, Dept CS
    const student2 = await registerStudent('PendingA_CS');
    await StudentInstitutionAffiliation.create({
      studentId: student2.profile.id,
      institutionId: instA.id,
      departmentId: deptA_CS.id,
      enrollmentNumber: `ENR-2-${suffix}`,
      status: StudentAffiliationStatus.PENDING,
      requestedAt: new Date(),
    });

    // Student 3: Rejected in Inst A, Dept CS
    const student3 = await registerStudent('RejectedA_CS');
    await StudentInstitutionAffiliation.create({
      studentId: student3.profile.id,
      institutionId: instA.id,
      departmentId: deptA_CS.id,
      enrollmentNumber: `ENR-3-${suffix}`,
      status: StudentAffiliationStatus.REJECTED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      rejectionReason: 'Invalid documentation',
    });

    // Student 4: Verified in Inst A, Dept EE (Different department, same inst)
    const student4 = await registerStudent('VerifiedA_EE');
    await StudentInstitutionAffiliation.create({
      studentId: student4.profile.id,
      institutionId: instA.id,
      departmentId: deptA_EE.id,
      enrollmentNumber: `ENR-4-${suffix}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
    });

    // Student 5: Verified in Inst B, Dept CS (Different institution)
    const student5 = await registerStudent('VerifiedB_CS');
    await StudentInstitutionAffiliation.create({
      studentId: student5.profile.id,
      institutionId: instB.id,
      departmentId: deptB_CS.id,
      enrollmentNumber: `ENR-5-${suffix}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
    });

    // Student 6: Legacy/unaffiliated student (free-text department CS, but NO verified affiliation)
    const student6 = await registerStudent('LegacyUnaffiliated');
    await student6.profile.update({
      collegeName: 'Institution Alpha Legacy',
      department: 'Computer Science',
    });

    // ----------------------------------------------------
    // SETUP: Academicians
    // ----------------------------------------------------
    // Academician 1: In Inst A, Dept CS (Relational)
    const userAcad1 = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Prof',
      lastName: 'ValidCS',
      email: `acad-valid-cs-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.ACADEMICIAN,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userAcad1.id);

    const acadProfile1 = await AcademicianProfile.create({
      userId: userAcad1.id,
      institutionId: instA.id,
      departmentId: deptA_CS.id,
      designation: 'Associate Professor',
      verified: true,
    });
    createdAcademicianProfileIds.push(acadProfile1.id);

    // Academician 2: In Inst A, but NO departmentId (Unassigned / Missing Dept)
    const userAcad2 = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Prof',
      lastName: 'NoDept',
      email: `acad-no-dept-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.ACADEMICIAN,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userAcad2.id);

    const acadProfile2 = await AcademicianProfile.create({
      userId: userAcad2.id,
      institutionId: instA.id,
      departmentId: null,
      department: 'Computer Science', // text only
      designation: 'Lecturer',
      verified: true,
    });
    createdAcademicianProfileIds.push(acadProfile2.id);

    // Academician 3: No institution at all (Independent)
    const userAcad3 = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Prof',
      lastName: 'Independent',
      email: `acad-independent-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.ACADEMICIAN,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userAcad3.id);

    const acadProfile3 = await AcademicianProfile.create({
      userId: userAcad3.id,
      institutionId: null,
      departmentId: null,
      designation: 'Independent Researcher',
      verified: true,
    });
    createdAcademicianProfileIds.push(acadProfile3.id);

    // ====================================================
    // TEST SUITE: PHASE A SECURITY PROPERTIES
    // ====================================================

    // Test 1: Academician creation with departmentId alone (no department text) succeeds
    await test('1. Academician creation without free-text department succeeds', async () => {
      const userNewAcad = await User.create({
        uuid: crypto.randomUUID(),
        firstName: 'Prof',
        lastName: 'NewDeptId',
        email: `acad-new-dept-${suffix}@example.com`,
        passwordHash: hash,
        role: UserRole.ACADEMICIAN,
        isVerified: true,
        isActive: true,
      });
      createdUserIds.push(userNewAcad.id);

      const profile = await academicianService.createMyProfile(userNewAcad.id, {
        institutionId: instA.id,
        departmentId: deptA_CS.id,
        designation: 'Assistant Professor',
      });
      createdAcademicianProfileIds.push(profile.id);

      assert.strictEqual(profile.departmentId, deptA_CS.id);
      assert.strictEqual(profile.institutionId, instA.id);
      assert.strictEqual(profile.designation, 'Assistant Professor');
    });

    // Test 2: Academician profile update with departmentId works
    await test('2. Academician profile update with departmentId works', async () => {
      const updated = await academicianService.updateMyProfile(userAcad1.id, {
        departmentId: deptA_EE.id,
      });
      assert.strictEqual(updated.departmentId, deptA_EE.id);

      // Revert back to deptA_CS for subsequent tests
      await academicianService.updateMyProfile(userAcad1.id, {
        departmentId: deptA_CS.id,
      });
    });

    // Test 3: Cross-institution departmentId rejection
    await test('3. Cross-institution department assignment is rejected with 400', async () => {
      await assert.rejects(
        () =>
          academicianService.updateMyProfile(userAcad1.id, {
            departmentId: deptB_CS.id, // belongs to instB, but userAcad1 is in instA
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /department does not belong to the/i);
          return true;
        }
      );
    });

    // Test 4: Academician with missing departmentId sees 0 students (fails closed)
    await test('4. Academician with missing departmentId fails closed (0 students)', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad2.id);
      assert.strictEqual(dashboard.departmentStats.totalStudents, 0);
      assert.strictEqual(dashboard.departmentStats.students.length, 0);
    });

    // Test 5: Academician without institution sees 0 students (fails closed)
    await test('5. Academician without institution fails closed (0 students)', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad3.id);
      assert.strictEqual(dashboard.departmentStats.totalStudents, 0);
      assert.strictEqual(dashboard.departmentStats.students.length, 0);
    });

    // Test 6: Academician with valid departmentId sees only VERIFIED students in that dept
    await test('6. Academician sees ONLY verified students in their relational department', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      assert.strictEqual(dashboard.departmentStats.totalStudents, 1);
      assert.strictEqual(dashboard.departmentStats.students[0].id, student1.profile.id);
    });

    // Test 7: PENDING affiliations are excluded from academician scope
    await test('7. PENDING affiliations are excluded from academician scope', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      const studentIdsInScope = dashboard.departmentStats.students.map((s: any) => s.id);
      assert.strictEqual(studentIdsInScope.includes(student2.profile.id), false);
    });

    // Test 8: REJECTED affiliations are excluded from academician scope
    await test('8. REJECTED affiliations are excluded from academician scope', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      const studentIdsInScope = dashboard.departmentStats.students.map((s: any) => s.id);
      assert.strictEqual(studentIdsInScope.includes(student3.profile.id), false);
    });

    // Test 9: Students in different department of same institution are excluded
    await test('9. Students in different department of same institution are excluded', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      const studentIdsInScope = dashboard.departmentStats.students.map((s: any) => s.id);
      assert.strictEqual(studentIdsInScope.includes(student4.profile.id), false);
    });

    // Test 10: Students in different institution are excluded
    await test('10. Students in different institution are excluded', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      const studentIdsInScope = dashboard.departmentStats.students.map((s: any) => s.id);
      assert.strictEqual(studentIdsInScope.includes(student5.profile.id), false);
    });

    // Test 11: Free-text department match with NO verified affiliation is excluded
    await test('11. Free-text department match with NO verified affiliation is excluded', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      const studentIdsInScope = dashboard.departmentStats.students.map((s: any) => s.id);
      assert.strictEqual(studentIdsInScope.includes(student6.profile.id), false);
    });

    // Test 12: Academician dashboard displays relational department name
    await test('12. Academician dashboard displays relational department name', async () => {
      const dashboard = await analyticsRepository.getAcademicianDashboardData(userAcad1.id);
      assert.strictEqual(dashboard.academician.department, 'Computer Science');
      assert.strictEqual(dashboard.departmentStats.departmentName, 'Computer Science');
    });

    // Test 13: Institutional analytics overview counts ONLY verified students
    await test('13. Institutional analytics overview counts ONLY verified students', async () => {
      const overview = await analyticsRepository.getInstitutionStudentOverview(instA.id);
      // Institution A has 2 verified students (student1 in CS, student4 in EE)
      // student2 is pending, student3 is rejected, student6 is unaffiliated
      assert.strictEqual(overview.totalStudents, 2);
    });

    // Test 14: Institutional student skill analytics grants access ONLY to verified students
    await test('14. Institutional analytics allows access to verified student', async () => {
      const analytics = await analyticsService.getStudentSkillAnalytics(student1.profile.id, {
        id: userInstA.id,
        role: UserRole.INSTITUTION,
      });
      assert.strictEqual(analytics.studentId, student1.profile.id);
    });

    // Test 15: Institutional analytics rejects access for pending/rejected/cross-inst students
    await test('15. Institutional analytics rejects non-verified or other-institution students (403)', async () => {
      // Pending student in same institution -> 403
      await assert.rejects(
        () =>
          analyticsService.getStudentSkillAnalytics(student2.profile.id, {
            id: userInstA.id,
            role: UserRole.INSTITUTION,
          }),
        (err: any) => err.statusCode === 403
      );

      // Rejected student in same institution -> 403
      await assert.rejects(
        () =>
          analyticsService.getStudentSkillAnalytics(student3.profile.id, {
            id: userInstA.id,
            role: UserRole.INSTITUTION,
          }),
        (err: any) => err.statusCode === 403
      );

      // Verified student in Institution B requested by Institution A -> 403
      await assert.rejects(
        () =>
          analyticsService.getStudentSkillAnalytics(student5.profile.id, {
            id: userInstA.id,
            role: UserRole.INSTITUTION,
          }),
        (err: any) => err.statusCode === 403
      );
    });

  } finally {
    // ----------------------------------------------------
    // TEARDOWN: Clean up all created test data
    // ----------------------------------------------------
    if (createdStudentProfileIds.length > 0) {
      await StudentInstitutionAffiliation.destroy({
        where: { studentId: createdStudentProfileIds },
      });
      await StudentProfile.destroy({
        where: { id: createdStudentProfileIds },
      });
    }

    if (createdAcademicianProfileIds.length > 0) {
      await AcademicianProfile.destroy({
        where: { id: createdAcademicianProfileIds },
      });
    }

    if (createdDepartmentIds.length > 0) {
      await InstitutionDepartment.destroy({
        where: { id: createdDepartmentIds },
      });
    }

    if (createdInstitutionIds.length > 0) {
      await InstitutionProfile.destroy({
        where: { id: createdInstitutionIds },
      });
    }

    if (createdUserIds.length > 0) {
      await User.destroy({
        where: { id: createdUserIds },
      });
    }
  }

  console.log(`\nPHASE A SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED\n`);
  if (failed > 0) {
    throw new Error(`Phase A security tests failed: ${failed}`);
  }
};

if (require.main === module) {
  runPhaseASecurityTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
