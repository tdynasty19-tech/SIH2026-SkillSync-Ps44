import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { institutionService } from '../services/institution.service';
import { User } from '../models/user.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicProgram } from '../models/academic-program.model';
import { UserRole } from '../constants/roles';
import { DegreeLevel } from '../constants/enums';

export const runAcademicProgramTests = async () => {
  console.log('\n====================================================');
  console.log('STARTING PHASE B ACADEMIC PROGRAM TESTS');
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
  const password = 'ProgramPass123!';
  const hash = await bcrypt.hash(password, 10);

  const createdUserIds: number[] = [];
  const createdInstitutionIds: number[] = [];
  const createdDepartmentIds: number[] = [];
  const createdProgramIds: number[] = [];

  try {
    // ----------------------------------------------------
    // SETUP: 2 Institutions, 2 Departments in Inst A, 1 in Inst B
    // ----------------------------------------------------
    // Institution A User & Profile
    const userInstA = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Institution',
      lastName: 'Alpha',
      email: `inst-prog-a-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userInstA.id);

    const instA = await InstitutionProfile.create({
      userId: userInstA.id,
      institutionName: `Institution Program A ${suffix}`,
      institutionType: 'University',
      verified: true,
    });
    createdInstitutionIds.push(instA.id);

    // Departments for Inst A
    const deptA_CS = await InstitutionDepartment.create({
      institutionId: instA.id,
      departmentName: `Computer Science ${suffix}`,
      departmentCode: 'CS',
    });
    createdDepartmentIds.push(deptA_CS.id);

    const deptA_EE = await InstitutionDepartment.create({
      institutionId: instA.id,
      departmentName: `Electrical Engineering ${suffix}`,
      departmentCode: 'EE',
    });
    createdDepartmentIds.push(deptA_EE.id);

    // Institution B User & Profile (Different Institution)
    const userInstB = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Institution',
      lastName: 'Beta',
      email: `inst-prog-b-${suffix}@example.com`,
      passwordHash: hash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    });
    createdUserIds.push(userInstB.id);

    const instB = await InstitutionProfile.create({
      userId: userInstB.id,
      institutionName: `Institution Program B ${suffix}`,
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

    // ----------------------------------------------------
    // TESTS
    // ----------------------------------------------------

    let createdProgramA: any = null;

    // Test 1: Institution A creates Academic Program in its own Department (CS)
    await test('1. Institution creates Academic Program in its own Department', async () => {
      createdProgramA = await institutionService.createProgram(userInstA.id, {
        departmentId: deptA_CS.id,
        programName: 'Bachelor of Technology in Computer Science',
        programCode: 'BTECH-CS',
        degreeLevel: DegreeLevel.UNDERGRADUATE,
        durationYears: 4.0,
        totalSemesters: 8,
        description: 'Core 4-year undergraduate degree program',
        isActive: true,
      });
      createdProgramIds.push(createdProgramA.id);

      assert.strictEqual(createdProgramA.programName, 'Bachelor of Technology in Computer Science');
      assert.strictEqual(createdProgramA.programCode, 'BTECH-CS');
      assert.strictEqual(createdProgramA.degreeLevel, DegreeLevel.UNDERGRADUATE);
      assert.strictEqual(createdProgramA.departmentId, deptA_CS.id);
      assert.strictEqual(createdProgramA.institutionId, instA.id);
      assert.strictEqual(createdProgramA.isActive, true);
    });

    // Test 2: Reject creating program with department from another institution (Cross-institution prevention)
    await test('2. Reject program creation with department from another institution', async () => {
      await assert.rejects(
        () =>
          institutionService.createProgram(userInstA.id, {
            departmentId: deptB_CS.id, // belongs to Inst B!
            programName: 'Master of Technology in CS',
            degreeLevel: DegreeLevel.POSTGRADUATE,
            durationYears: 2.0,
            totalSemesters: 4,
            isActive: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /Department does not belong to your institution/i);
          return true;
        }
      );
    });

    // Test 3: Reject duplicate programName within same department
    await test('3. Reject duplicate program name within the same department', async () => {
      await assert.rejects(
        () =>
          institutionService.createProgram(userInstA.id, {
            departmentId: deptA_CS.id,
            programName: 'Bachelor of Technology in Computer Science', // duplicate
            degreeLevel: DegreeLevel.UNDERGRADUATE,
            durationYears: 4.0,
            totalSemesters: 8,
            isActive: true,
          }),
        (err: any) => {
          assert.strictEqual(err.statusCode, 409);
          assert.match(err.message, /already exists in this department/i);
          return true;
        }
      );
    });

    // Test 4: Same program name in a different department of same institution is allowed
    await test('4. Same program name allowed in a different department', async () => {
      const progEE = await institutionService.createProgram(userInstA.id, {
        departmentId: deptA_EE.id,
        programName: 'Bachelor of Technology in Computer Science', // same name, different dept
        degreeLevel: DegreeLevel.UNDERGRADUATE,
        durationYears: 4.0,
        totalSemesters: 8,
        isActive: true,
      });
      createdProgramIds.push(progEE.id);
      assert.strictEqual(progEE.departmentId, deptA_EE.id);
    });

    // Test 5: List and filter programs for Institution A
    await test('5. List and filter programs with pagination and filters', async () => {
      const result = await institutionService.getPrograms(userInstA.id, {
        page: 1,
        limit: 10,
        departmentId: deptA_CS.id,
      });
      assert.strictEqual(result.programs.length, 1);
      assert.strictEqual(result.programs[0].id, createdProgramA.id);
      assert.strictEqual(result.programs[0].department.id, deptA_CS.id);
    });

    // Test 6: Search programs by keyword
    await test('6. Search programs by keyword', async () => {
      const result = await institutionService.getPrograms(userInstA.id, {
        page: 1,
        limit: 10,
        search: 'BTECH',
      });
      assert.strictEqual(result.programs.length, 1);
      assert.strictEqual(result.programs[0].programCode, 'BTECH-CS');
    });

    // Test 7: Retrieve single program by ID with department details
    await test('7. Retrieve program by ID', async () => {
      const program = await institutionService.getProgramById(userInstA.id, createdProgramA.id);
      assert.strictEqual(program.id, createdProgramA.id);
      assert.strictEqual(program.programName, 'Bachelor of Technology in Computer Science');
      assert.strictEqual(program.department.id, deptA_CS.id);
    });

    // Test 8: IDOR Protection - Institution B cannot view Institution A program
    await test('8. IDOR: Institution B cannot view Institution A program (404)', async () => {
      await assert.rejects(
        () => institutionService.getProgramById(userInstB.id, createdProgramA.id),
        (err: any) => err.statusCode === 404
      );
    });

    // Test 9: Update program details
    await test('9. Institution updates program details', async () => {
      const updated = await institutionService.updateProgram(userInstA.id, createdProgramA.id, {
        programName: 'B.Tech in Computer Science and Engineering',
        programCode: 'BTECH-CSE',
        durationYears: 4.0,
      });
      assert.strictEqual(updated.programName, 'B.Tech in Computer Science and Engineering');
      assert.strictEqual(updated.programCode, 'BTECH-CSE');
    });

    // Test 10: IDOR Protection - Institution B cannot update Institution A program
    await test('10. IDOR: Institution B cannot update Institution A program (404)', async () => {
      await assert.rejects(
        () =>
          institutionService.updateProgram(userInstB.id, createdProgramA.id, {
            programName: 'Hacked Program Name',
          }),
        (err: any) => err.statusCode === 404
      );
    });

    // Test 11: Discovery endpoint returns active programs for valid department
    await test('11. Discovery endpoint returns active department programs', async () => {
      const programs = await institutionService.getDepartmentPrograms(instA.id, deptA_CS.id);
      assert.strictEqual(programs.length, 1);
      assert.strictEqual(programs[0].id, createdProgramA.id);
    });

    // Test 12: Discovery endpoint rejects mismatched department and institution
    await test('12. Discovery endpoint rejects mismatched department and institution (404)', async () => {
      await assert.rejects(
        () => institutionService.getDepartmentPrograms(instB.id, deptA_CS.id),
        (err: any) => err.statusCode === 404
      );
    });

    // Test 13: IDOR Protection - Institution B cannot delete Institution A program
    await test('13. IDOR: Institution B cannot delete Institution A program (404)', async () => {
      await assert.rejects(
        () => institutionService.deleteProgram(userInstB.id, createdProgramA.id),
        (err: any) => err.statusCode === 404
      );
    });

    // Test 14: Institution A deletes own program
    await test('14. Institution A deletes own program', async () => {
      const result = await institutionService.deleteProgram(userInstA.id, createdProgramA.id);
      assert.strictEqual(result.message, 'Academic program deleted successfully');

      // Verify it no longer exists
      await assert.rejects(
        () => institutionService.getProgramById(userInstA.id, createdProgramA.id),
        (err: any) => err.statusCode === 404
      );
    });

  } finally {
    // ----------------------------------------------------
    // TEARDOWN: Clean up all created test data
    // ----------------------------------------------------
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

  console.log(`\nACADEMIC PROGRAM TEST SUMMARY: ${passed} PASSED, ${failed} FAILED\n`);
  if (failed > 0) {
    throw new Error(`Academic program tests failed: ${failed}`);
  }
};

if (require.main === module) {
  runAcademicProgramTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
