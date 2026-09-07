import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { authService } from '../services/auth.service';
import { institutionService } from '../services/institution.service';
import { User } from '../models/user.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicProgram } from '../models/academic-program.model';
import { AcademicBatch } from '../models/academic-batch.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { StudentAcademicEnrollment } from '../models/student-academic-enrollment.model';
import { UserRole } from '../constants/roles';
import { DegreeLevel, EnrollmentStatus, StudentAffiliationStatus } from '../constants/enums';

export const runBatchAndEnrollmentTests = async () => {
  console.log('\n====================================================');
  console.log('STARTING PHASE C BATCH & ENROLLMENT TESTS');
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
  const password = 'BatchPass123!';
  const hash = await bcrypt.hash(password, 10);

  const createdUserIds: number[] = [];
  const createdInstitutionIds: number[] = [];
  const createdDepartmentIds: number[] = [];
  const createdProgramIds: number[] = [];
  const createdBatchIds: number[] = [];
  const createdStudentProfileIds: number[] = [];
  const createdEnrollmentIds: number[] = [];

  try {
    // ----------------------------------------------------
    // SETUP: 2 Institutions, Departments, Programs
    // ----------------------------------------------------
    // Institution A
    const userInstA = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Institution',
      lastName: 'Alpha',
      email: `inst-batch-a-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userInstA.id);

    const instA = await InstitutionProfile.create({
      userId: userInstA.id,
      institutionName: `Institution Batch A ${suffix}`,
      institutionType: 'University',
      verified: true,
    });
    createdInstitutionIds.push(instA.id);

    const deptA_CS = await InstitutionDepartment.create({
      institutionId: instA.id,
      departmentName: `Computer Science ${suffix}`,
      departmentCode: 'CS',
    });
    createdDepartmentIds.push(deptA_CS.id);

    const programA_CSE = await AcademicProgram.create({
      institutionId: instA.id,
      departmentId: deptA_CS.id,
      programName: `B.Tech CSE ${suffix}`,
      programCode: 'BTECH-CSE',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      durationYears: 4.0,
      totalSemesters: 8,
      isActive: true,
    });
    createdProgramIds.push(programA_CSE.id);

    // Institution B
    const userInstB = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Institution',
      lastName: 'Beta',
      email: `inst-batch-b-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userInstB.id);

    const instB = await InstitutionProfile.create({
      userId: userInstB.id,
      institutionName: `Institution Batch B ${suffix}`,
      institutionType: 'University',
      verified: true,
    });
    createdInstitutionIds.push(instB.id);

    const deptB_CS = await InstitutionDepartment.create({
      institutionId: instB.id,
      departmentName: `Computer Science ${suffix}`,
      departmentCode: 'CS',
    });
    createdDepartmentIds.push(deptB_CS.id);

    const programB_CSE = await AcademicProgram.create({
      institutionId: instB.id,
      departmentId: deptB_CS.id,
      programName: `B.Tech CSE ${suffix}`,
      programCode: 'BTECH-CSE',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      durationYears: 4.0,
      totalSemesters: 8,
      isActive: true,
    });
    createdProgramIds.push(programB_CSE.id);

    // Students
    const regStudent1 = await authService.register({
      firstName: 'Alice',
      lastName: 'Verified',
      email: `alice-batch-${suffix}@example.com`,
      password,
      role: UserRole.STUDENT,
    });
    const userStudent1Id = (regStudent1.user as any).id;
    createdUserIds.push(userStudent1Id);
    const studentProfile1 = await StudentProfile.findOne({ where: { userId: userStudent1Id } });
    createdStudentProfileIds.push(studentProfile1!.id);

    // Give Student 1 a verified affiliation with Institution A, Dept CS
    await StudentInstitutionAffiliation.create({
      studentId: studentProfile1!.id,
      institutionId: instA.id,
      departmentId: deptA_CS.id,
      enrollmentNumber: `ENR-ALICE-${suffix}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
    });

    const regStudent2 = await authService.register({
      firstName: 'Bob',
      lastName: 'Unaffiliated',
      email: `bob-batch-${suffix}@example.com`,
      password,
      role: UserRole.STUDENT,
    });
    const userStudent2Id = (regStudent2.user as any).id;
    createdUserIds.push(userStudent2Id);
    const studentProfile2 = await StudentProfile.findOne({ where: { userId: userStudent2Id } });
    createdStudentProfileIds.push(studentProfile2!.id);

    const regStudent3 = await authService.register({
      firstName: 'Charlie',
      lastName: 'InstBVerified',
      email: `charlie-batch-${suffix}@example.com`,
      password,
      role: UserRole.STUDENT,
    });
    const userStudent3Id = (regStudent3.user as any).id;
    createdUserIds.push(userStudent3Id);
    const studentProfile3 = await StudentProfile.findOne({ where: { userId: userStudent3Id } });
    createdStudentProfileIds.push(studentProfile3!.id);

    // Give Student 3 a verified affiliation with Institution B
    await StudentInstitutionAffiliation.create({
      studentId: studentProfile3!.id,
      institutionId: instB.id,
      departmentId: deptB_CS.id,
      enrollmentNumber: `ENR-CHARLIE-${suffix}`,
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
    });

    // ----------------------------------------------------
    // TESTS: BATCHES
    // ----------------------------------------------------
    let batchA1: any = null;

    // Test 1: Institution A creates an Academic Batch under its program
    await test('1. Institution creates Academic Batch under its program', async () => {
      batchA1 = await institutionService.createBatch(userInstA.id, {
        programId: programA_CSE.id,
        batchName: '2022-2026',
        startYear: 2022,
        endYear: 2026,
        currentSemester: 5,
        isActive: true,
      });
      createdBatchIds.push(batchA1.id);

      assert.strictEqual(batchA1.batchName, '2022-2026');
      assert.strictEqual(batchA1.programId, programA_CSE.id);
      assert.strictEqual(batchA1.departmentId, deptA_CS.id);
      assert.strictEqual(batchA1.institutionId, instA.id);
      assert.strictEqual(batchA1.currentSemester, 5);
    });

    // Test 2: Reject cross-institution program batch creation
    await test('2. Reject batch creation with program from another institution (400)', async () => {
      await assert.rejects(
        () =>
          institutionService.createBatch(userInstA.id, {
            programId: programB_CSE.id, // belongs to Inst B!
            batchName: '2023-2027',
            startYear: 2023,
            endYear: 2027,
            currentSemester: 1,
            isActive: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /Program does not belong to your institution/i);
          return true;
        }
      );
    });

    // Test 3: Reject duplicate batch name under same program
    await test('3. Reject duplicate batch name under same program (409)', async () => {
      await assert.rejects(
        () =>
          institutionService.createBatch(userInstA.id, {
            programId: programA_CSE.id,
            batchName: '2022-2026', // duplicate
            startYear: 2022,
            endYear: 2026,
            currentSemester: 1,
            isActive: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 409);
          assert.match(err.message, /already exists in this program/i);
          return true;
        }
      );
    });

    // Test 4: List and filter batches for Institution A
    await test('4. List and filter batches with pagination', async () => {
      const result = await institutionService.getBatches(userInstA.id, {
        page: 1,
        limit: 10,
        programId: programA_CSE.id,
      });
      assert.strictEqual(result.batches.length, 1);
      assert.strictEqual(result.batches[0].id, batchA1.id);
    });

    // Test 5: IDOR Protection on Batches
    await test('5. IDOR: Institution B cannot view Institution A batch (404)', async () => {
      await assert.rejects(
        () => institutionService.getBatchById(userInstB.id, batchA1.id),
        (err: any) => err.statusCode === 404
      );
    });

    // ----------------------------------------------------
    // TESTS: STUDENT ACADEMIC ENROLLMENT
    // ----------------------------------------------------
    let enrollment1: any = null;

    // Test 6: Institution A enrolls verified student into Academic Batch
    await test('6. Institution enrolls verified student into Academic Batch', async () => {
      enrollment1 = await institutionService.createEnrollment(userInstA.id, {
        studentId: studentProfile1!.id,
        batchId: batchA1.id,
        enrollmentNumber: `ENR-ALICE-${suffix}`,
        rollNumber: 'CS-2022-001',
        status: EnrollmentStatus.ACTIVE,
        currentSemester: 5,
        isCurrent: true,
      });
      createdEnrollmentIds.push(enrollment1.id);

      assert.strictEqual(enrollment1.studentId, studentProfile1!.id);
      assert.strictEqual(enrollment1.batchId, batchA1.id);
      assert.strictEqual(enrollment1.programId, programA_CSE.id);
      assert.strictEqual(enrollment1.departmentId, deptA_CS.id);
      assert.strictEqual(enrollment1.institutionId, instA.id);
      assert.strictEqual(enrollment1.status, EnrollmentStatus.ACTIVE);
      assert.strictEqual(enrollment1.isCurrent, true);
    });

    // Test 7: Reject enrolling student without verified affiliation
    await test('7. Reject enrolling student without verified affiliation (400)', async () => {
      await assert.rejects(
        () =>
          institutionService.createEnrollment(userInstA.id, {
            studentId: studentProfile2!.id, // unaffiliated
            batchId: batchA1.id,
            enrollmentNumber: `ENR-BOB-${suffix}`,
            status: EnrollmentStatus.ACTIVE,
            currentSemester: 1,
            isCurrent: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /must have a VERIFIED institutional affiliation/i);
          return true;
        }
      );
    });

    // Test 8: Reject cross-institution student enrollment (Student affiliated with Inst B into Inst A's batch)
    await test('8. Reject cross-institution student enrollment (400)', async () => {
      await assert.rejects(
        () =>
          institutionService.createEnrollment(userInstA.id, {
            studentId: studentProfile3!.id, // verified in Inst B, not A!
            batchId: batchA1.id,
            enrollmentNumber: `ENR-CHARLIE-${suffix}`,
            status: EnrollmentStatus.ACTIVE,
            currentSemester: 1,
            isCurrent: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /must have a VERIFIED institutional affiliation/i);
          return true;
        }
      );
    });

    // Test 9: Reject duplicate enrollment in same batch
    await test('9. Reject duplicate enrollment in same batch (409)', async () => {
      await assert.rejects(
        () =>
          institutionService.createEnrollment(userInstA.id, {
            studentId: studentProfile1!.id, // already enrolled in batchA1
            batchId: batchA1.id,
            enrollmentNumber: `ENR-ALICE-DUP-${suffix}`,
            status: EnrollmentStatus.ACTIVE,
            currentSemester: 1,
            isCurrent: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 409);
          assert.match(err.message, /already enrolled in this batch/i);
          return true;
        }
      );
    });

    // Test 10: Student retrieves authoritative academic context
    await test('10. Student retrieves authoritative academic context', async () => {
      const context = await institutionService.getStudentAcademicContext(userStudent1Id);
      assert.strictEqual(context.studentId, studentProfile1!.id);
      assert.ok(context.activeEnrollment);
      assert.strictEqual(context.activeEnrollment.batchId, batchA1.id);
      assert.strictEqual(context.activeEnrollment.program.id, programA_CSE.id);
      assert.strictEqual(context.activeEnrollment.department.id, deptA_CS.id);
      assert.strictEqual(context.activeEnrollment.institution.id, instA.id);
    });

    // Test 11: Institution lists and filters enrollments by batch
    await test('11. Institution lists and filters enrollments by batch', async () => {
      const result = await institutionService.getEnrollments(userInstA.id, {
        page: 1,
        limit: 10,
        batchId: batchA1.id,
      });
      assert.strictEqual(result.enrollments.length, 1);
      assert.strictEqual(result.enrollments[0].studentId, studentProfile1!.id);
      assert.strictEqual(result.enrollments[0].enrollmentNumber, `ENR-ALICE-${suffix}`);
    });

    // Test 12: IDOR Protection on Enrollments
    await test('12. IDOR: Institution B cannot view Institution A enrollment (404)', async () => {
      await assert.rejects(
        () => institutionService.getEnrollmentById(userInstB.id, enrollment1.id),
        (err: any) => err.statusCode === 404
      );
    });

    // Test 13: Institution updates enrollment details
    await test('13. Institution updates enrollment details', async () => {
      const updated = await institutionService.updateEnrollment(userInstA.id, enrollment1.id, {
        currentSemester: 6,
        status: EnrollmentStatus.ACTIVE,
      });
      assert.strictEqual(updated.currentSemester, 6);
    });

    // Test 14: Discovery endpoint returns program batches
    await test('14. Discovery endpoint returns program batches', async () => {
      const batches = await institutionService.getProgramBatches(instA.id, programA_CSE.id);
      assert.strictEqual(batches.length, 1);
      assert.strictEqual(batches[0].id, batchA1.id);
    });

  } finally {
    // ----------------------------------------------------
    // TEARDOWN: Clean up all created test data
    // ----------------------------------------------------
    if (createdEnrollmentIds.length > 0) {
      await StudentAcademicEnrollment.destroy({
        where: { id: createdEnrollmentIds },
      });
    }

    if (createdStudentProfileIds.length > 0) {
      await StudentInstitutionAffiliation.destroy({
        where: { studentId: createdStudentProfileIds },
      });
      await StudentProfile.destroy({
        where: { id: createdStudentProfileIds },
      });
    }

    if (createdBatchIds.length > 0) {
      await AcademicBatch.destroy({
        where: { id: createdBatchIds },
      });
    }

    if (createdProgramIds.length > 0) {
      await AcademicProgram.destroy({
        where: { id: createdProgramIds },
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

  console.log(`\nBATCH & ENROLLMENT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED\n`);
  if (failed > 0) {
    throw new Error(`Batch & enrollment tests failed: ${failed}`);
  }
};

if (require.main === module) {
  runBatchAndEnrollmentTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
