import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { AcademicInstitutionAssociation } from '../models/academic-institution-association.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { FacultyOpportunity } from '../models/faculty-opportunity.model';
import { UserRole } from '../constants/roles';
import { OpportunityStatus } from '../constants/enums';
import { academicianService } from '../services/academician.service';
import { opportunityService } from '../services/opportunity.service';

export const runPhase10Tests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 10 ACADEMICIAN MODULE TESTS');
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

  const hash = await bcrypt.hash('AcademicPass123!', 10);

  // 1. Institution 1 User & Profile
  const userInst1 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Indian Institute of',
    lastName: 'Technology Madras',
    email: `inst1.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    isActive: true,
    isVerified: true,
  });

  const instProfile1 = await InstitutionProfile.create({
    userId: userInst1.id,
    institutionName: 'IIT Madras',
    institutionType: 'University',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    verified: true,
  });

  // 2. Institution 2 User & Profile (Different Institution)
  const userInst2 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'National Institute of',
    lastName: 'Technology Karnataka',
    email: `inst2.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    isActive: true,
    isVerified: true,
  });

  const instProfile2 = await InstitutionProfile.create({
    userId: userInst2.id,
    institutionName: 'NITK Surathkal',
    institutionType: 'Autonomous',
    city: 'Surathkal',
    state: 'Karnataka',
    country: 'India',
    verified: true,
  });

  const department1 = await InstitutionDepartment.create({
    institutionId: instProfile1.id,
    departmentName: 'Computer Science & Engineering',
  });
  const department2 = await InstitutionDepartment.create({
    institutionId: instProfile2.id,
    departmentName: 'Information Technology',
  });

  // 3. Academician User A (Affiliated with IIT Madras)
  const userAcadA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Prof. Rajesh',
    lastName: 'Kulkarni',
    email: `academician.rajesh.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    isActive: true,
    isVerified: true,
  });

  // 4. Academician User B (Affiliated with NITK Surathkal)
  const userAcadB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Dr. Meenakshi',
    lastName: 'Sundaram',
    email: `academician.meenakshi.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    isActive: true,
    isVerified: true,
  });

  // 5. Unaffiliated Academician User C
  const userAcadC = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Dr. Vikram',
    lastName: 'Patil',
    email: `academician.vikram.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    isActive: true,
    isVerified: true,
  });

  let acadProfileA: any = null;
  let acadProfileB: any = null;
  let acadProfileC: any = null;
  let assocA1Id = 0;
  let facultyOppAId = 0;

  try {
    // ----------------------------------------------------
    // 1. Academician Profile Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Academician Profile Tests ---');

    await test('Academician A user creates profile affiliated with Institution 1', async () => {
      const profile = await academicianService.createMyProfile(userAcadA.id, {
        department: 'Computer Science & Engineering',
        designation: 'Professor & Dean of Research',
        qualification: 'Ph.D. in High Performance Computing',
        specialization: 'Distributed Computing and Fault Tolerant Systems',
        experienceYears: 14.5,
        bio: 'Senior researcher specializing in fault-tolerant distributed consensus protocols.',
        researchInterests: 'Raft, Paxos, Multi-datacenter state machine replication.',
        publications: 'Over 45 international peer-reviewed journal papers (IEEE TPDS, ACM TOCS).',
        linkedinUrl: 'https://linkedin.com/in/prof-rajesh-kulkarni',
        googleScholarUrl: 'https://scholar.google.com/citations?user=kulkarni123',
        institutionId: instProfile1.id,
        departmentId: department1.id,
      });

      assert.ok(profile.id);
      assert.strictEqual(profile.userId, userAcadA.id);
      assert.strictEqual(profile.department, 'Computer Science & Engineering');
      assert.strictEqual(profile.institutionId, instProfile1.id);
      assert.strictEqual(profile.verified, false);
      acadProfileA = profile;
    });

    await test('Reject academician department assignment from another institution', async () => {
      let errorCaught = false;
      try {
        await academicianService.updateMyProfile(userAcadA.id, {
          departmentId: department2.id,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Reject duplicate profile creation for same academician user', async () => {
      let errorCaught = false;
      try {
        await academicianService.createMyProfile(userAcadA.id, {
          department: 'Mathematics',
          designation: 'Professor',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Duplicate profile creation must return 409 ConflictError');
    });

    await test('Academician A retrieves own profile with user, institution, and associations eager-loaded', async () => {
      const profile = await academicianService.getMyProfile(userAcadA.id);
      assert.strictEqual(profile.id, acadProfileA.id);
      assert.strictEqual((profile as any).user?.email, userAcadA.email);
      assert.strictEqual((profile as any).institution?.institutionName, 'IIT Madras');
      assert.ok(Array.isArray((profile as any).associations));
    });

    await test('Academician A updates own profile', async () => {
      const updated = await academicianService.updateMyProfile(userAcadA.id, {
        bio: 'Updated bio: Leading national quantum distributed algorithms initiatives.',
      });

      assert.strictEqual(updated.bio, 'Updated bio: Leading national quantum distributed algorithms initiatives.');
    });

    await test('Mass assignment protection: Profile update protects against tampering with userId or verified', async () => {
      acadProfileB = await academicianService.createMyProfile(userAcadB.id, {
        department: 'Information Technology',
        designation: 'Associate Professor',
        institutionId: instProfile2.id,
        departmentId: department2.id,
      });

      const updated = await academicianService.updateMyProfile(userAcadA.id, {
        department: 'Computer Science & Engineering',
      } as any);

      assert.strictEqual(updated.userId, userAcadA.id);
      assert.strictEqual(updated.verified, false);
    });

    // ----------------------------------------------------
    // 2. Institution Association Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Institution Association Tests ---');

    await test('Academician A creates an institution association with Institution 2 (Visiting Faculty)', async () => {
      const assoc = await academicianService.createAssociation(userAcadA.id, {
        institutionId: instProfile2.id,
        designation: 'Distinguished Visiting Fellow',
        department: 'School of Advanced Computing',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        isCurrent: true,
      });

      assert.ok(assoc.id);
      assert.strictEqual(assoc.academicianId, acadProfileA.id);
      assert.strictEqual(assoc.institutionId, instProfile2.id);
      assert.strictEqual(assoc.designation, 'Distinguished Visiting Fellow');
      assert.strictEqual((assoc as any).institution?.institutionName, 'NITK Surathkal');
      assocA1Id = assoc.id;
    });

    await test('Reject association creation with end date before start date', async () => {
      let errorCaught = false;
      try {
        await academicianService.createAssociation(userAcadA.id, {
          institutionId: instProfile1.id,
          designation: 'Guest Lecturer',
          department: 'Mathematics',
          startDate: '2025-01-01',
          endDate: '2024-01-01',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true, 'End date before start date must be rejected');
    });

    await test('Academician A lists own associations with pagination', async () => {
      const res = await academicianService.getAssociations(userAcadA.id, {
        page: 1,
        limit: 10,
      });

      assert.ok(res.associations.length >= 1);
      assert.strictEqual(res.associations[0].id, assocA1Id);
      assert.strictEqual(res.pagination.total, 1);
    });

    await test('Academician A retrieves association by ID', async () => {
      const assoc = await academicianService.getAssociationById(userAcadA.id, assocA1Id);
      assert.strictEqual(assoc.id, assocA1Id);
      assert.strictEqual(assoc.designation, 'Distinguished Visiting Fellow');
    });

    await test('Academician A updates association details', async () => {
      const updated = await academicianService.updateAssociation(userAcadA.id, assocA1Id, {
        designation: 'Senior Visiting Professor',
      });

      assert.strictEqual(updated.designation, 'Senior Visiting Professor');
    });

    await test('CRITICAL SECURITY: Academician B cannot view Academician A association (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await academicianService.getAssociationById(userAcadB.id, assocA1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true, 'Cross-academician association lookup must return 404');
    });

    await test('CRITICAL SECURITY: Academician B cannot update Academician A association (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await academicianService.updateAssociation(userAcadB.id, assocA1Id, {
          designation: 'Hijacked Designation',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('CRITICAL SECURITY: Academician B cannot delete Academician A association (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await academicianService.deleteAssociation(userAcadB.id, assocA1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Academician A can delete own association', async () => {
      const res = await academicianService.deleteAssociation(userAcadA.id, assocA1Id);
      assert.strictEqual(res.message, 'Academic institution association removed successfully');

      let errorCaught = false;
      try {
        await academicianService.getAssociationById(userAcadA.id, assocA1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 3. Faculty Opportunity Management Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Faculty Opportunity Management Tests ---');

    await test('Affiliated Academician A creates a faculty opportunity for their institution', async () => {
      const opp = await opportunityService.createFacultyOpportunity(userAcadA, {
        title: 'Postdoctoral Research Fellowship in Distributed Cloud Architecture',
        description: 'Two-year funded research position exploring high-throughput multi-region transaction consensus.',
        department: 'Computer Science & Engineering',
        eligibility: 'Ph.D. in Computer Science or related discipline with publications in premier systems conferences.',
        applicationDeadline: '2028-12-31',
        status: OpportunityStatus.OPEN,
      });

      assert.ok(opp.id);
      assert.strictEqual(opp.institutionId, instProfile1.id);
      assert.strictEqual(opp.title, 'Postdoctoral Research Fellowship in Distributed Cloud Architecture');
      facultyOppAId = opp.id;
    });

    await test('Reject faculty opportunity creation by unaffiliated Academician C', async () => {
      acadProfileC = await academicianService.createMyProfile(userAcadC.id, {
        department: 'Independent Research',
        designation: 'Independent Scholar',
      });

      let errorCaught = false;
      try {
        await opportunityService.createFacultyOpportunity(userAcadC, {
          title: 'Unauthorized Opportunity',
          description: 'Desc',
          department: 'CS',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400); // ValidationError: must be affiliated
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Owner Academician A can update faculty opportunity', async () => {
      const updated = await opportunityService.updateFacultyOpportunity(userAcadA, facultyOppAId, {
        description: 'Updated research position with added grant funding details.',
      });

      assert.strictEqual(updated.description, 'Updated research position with added grant funding details.');
    });

    await test('CRITICAL SECURITY: Academician B (different institution) cannot update Academician A faculty opportunity', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateFacultyOpportunity(userAcadB, facultyOppAId, {
          title: 'Malicious Update',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Non-owner academician must be rejected with 403 Forbidden');
    });

    await test('Authorized user can list and retrieve faculty opportunities with pagination', async () => {
      const res = await opportunityService.getFacultyOpportunities({
        page: 1,
        limit: 10,
        department: 'Computer Science & Engineering',
      });

      assert.ok(res.facultyOpportunities.length >= 1);
      assert.strictEqual(res.facultyOpportunities[0].id, facultyOppAId);

      const single = await opportunityService.getFacultyOpportunityById(facultyOppAId);
      assert.strictEqual(single.id, facultyOppAId);
      assert.strictEqual((single as any).institution?.institutionName, 'IIT Madras');
    });

    await test('Owner Academician A can delete faculty opportunity', async () => {
      const res = await opportunityService.deleteFacultyOpportunity(userAcadA, facultyOppAId);
      assert.strictEqual(res.message, 'Faculty opportunity deleted successfully');

      let errorCaught = false;
      try {
        await opportunityService.getFacultyOpportunityById(facultyOppAId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

  } finally {
    // Cleanup created test records
    if (assocA1Id) {
      await AcademicInstitutionAssociation.destroy({ where: { id: assocA1Id } });
    }
    if (facultyOppAId) {
      await FacultyOpportunity.destroy({ where: { id: facultyOppAId } });
    }
    if (acadProfileA?.id) {
      await AcademicInstitutionAssociation.destroy({ where: { academicianId: acadProfileA.id } });
      await AcademicianProfile.destroy({ where: { id: acadProfileA.id } });
    }
    if (acadProfileB?.id) {
      await AcademicInstitutionAssociation.destroy({ where: { academicianId: acadProfileB.id } });
      await AcademicianProfile.destroy({ where: { id: acadProfileB.id } });
    }
    if (acadProfileC?.id) {
      await AcademicianProfile.destroy({ where: { id: acadProfileC.id } });
    }
    await InstitutionProfile.destroy({ where: { id: instProfile1.id } });
    await InstitutionProfile.destroy({ where: { id: instProfile2.id } });
    await InstitutionDepartment.destroy({ where: { id: [department1.id, department2.id] } });
    await User.destroy({ where: { id: userAcadA.id } });
    await User.destroy({ where: { id: userAcadB.id } });
    await User.destroy({ where: { id: userAcadC.id } });
    await User.destroy({ where: { id: userInst1.id } });
    await User.destroy({ where: { id: userInst2.id } });
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

runPhase10Tests().catch((err) => {
  console.error('Fatal Phase 10 test error:', err);
  process.exit(1);
});
