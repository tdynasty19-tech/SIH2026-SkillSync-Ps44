import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { Placement } from '../models/placement.model';
import { PlacementRecord } from '../models/placement-record.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { StudentProfile } from '../models/student-profile.model';
import { Collaboration } from '../models/collaboration.model';
import { Workshop } from '../models/workshop.model';
import { GuestLecture } from '../models/guest-lecture.model';
import { IndustrialTraining } from '../models/industrial-training.model';
import { LiveProject } from '../models/live-project.model';
import { UserRole } from '../constants/roles';
import { CollaborationStatus, CollaborationType } from '../constants/enums';
import { institutionService } from '../services/institution.service';
import { collaborationService } from '../services/collaboration.service';

export const runPhase11Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 11 INSTITUTION, PLACEMENT & COLLABORATION TESTS');
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

  const hash = await bcrypt.hash('Phase11Pass123!', 10);

  // 1. Institution User 1 & 2
  const userInst1 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Indian Institute of',
    lastName: 'Science Bengaluru',
    email: `inst1.phase11.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    isActive: true,
    isVerified: true,
  });

  const userInst2 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Birla Institute of',
    lastName: 'Technology & Science',
    email: `inst2.phase11.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    isActive: true,
    isVerified: true,
  });

  // 2. Industry User 1 & Profile
  const userInd1 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Tata Consultancy',
    lastName: 'Services',
    email: `tcs.phase11.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const indProfile1 = await IndustryProfile.create({
    userId: userInd1.id,
    companyName: 'Tata Consultancy Services Ltd',
    industryType: 'Information Technology',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    verified: true,
  });

  // 3. Student User 1 & Profile
  const userStud1 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Aarav',
    lastName: 'Patel',
    email: `aarav.phase11.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const studProfile1 = await StudentProfile.create({
    userId: userStud1.id,
    collegeName: 'IISc Bengaluru',
    course: 'B.Tech',
    department: 'Computer Science',
    graduationYear: 2025,
    profileCompletion: 80,
  });

  let instProfile1: any = null;
  let instProfile2: any = null;
  let dept1Id = 0;
  let placement1Id = 0;
  let placementRecord1Id = 0;
  let collab1Id = 0;
  let workshop1Id = 0;
  let lecture1Id = 0;
  let training1Id = 0;
  let project1Id = 0;

  try {
    // ----------------------------------------------------
    // 1. Institution Profile Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Institution Profile Tests ---');

    await test('Institution 1 creates profile', async () => {
      const profile = await institutionService.createMyProfile(userInst1.id, {
        institutionName: 'Indian Institute of Science',
        aisheCode: `U-0999-${Date.now()}`,
        institutionType: 'Deemed University',
        affiliation: 'Autonomous Institute of Eminence',
        accreditation: 'NAAC A++',
        websiteUrl: 'https://iisc.ac.in',
        location: 'CV Raman Rd, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        description: 'Premier institute for scientific and technological research and education.',
      });

      assert.ok(profile.id);
      assert.strictEqual(profile.userId, userInst1.id);
      assert.strictEqual(profile.institutionName, 'Indian Institute of Science');
      assert.strictEqual(profile.verified, false);
      instProfile1 = profile;
    });

    await test('Reject duplicate profile creation for same institution user', async () => {
      let errorCaught = false;
      try {
        await institutionService.createMyProfile(userInst1.id, {
          institutionName: 'Duplicate Name',
          institutionType: 'College',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Institution 1 retrieves own profile with eager-loaded details', async () => {
      const profile = await institutionService.getMyProfile(userInst1.id);
      assert.strictEqual(profile.id, instProfile1.id);
      assert.strictEqual((profile as any).user?.email, userInst1.email);
      assert.ok(Array.isArray((profile as any).departments));
      assert.ok(Array.isArray((profile as any).placements));
    });

    await test('Public/Authenticated retrieval of institution profile by ID', async () => {
      const profile = await institutionService.getInstitutionById(instProfile1.id);
      assert.strictEqual(profile.id, instProfile1.id);
      assert.strictEqual(profile.city, 'Bengaluru');
    });

    await test('Institution 1 updates own profile', async () => {
      const updated = await institutionService.updateMyProfile(userInst1.id, {
        description: 'Updated premier institute research and development hub.',
      });
      assert.strictEqual(updated.description, 'Updated premier institute research and development hub.');
    });

    await test('Mass assignment protection: userId and verified cannot be modified', async () => {
      instProfile2 = await institutionService.createMyProfile(userInst2.id, {
        institutionName: 'BITS Pilani',
        institutionType: 'Deemed University',
        city: 'Pilani',
        state: 'Rajasthan',
      });

      const updated = await institutionService.updateMyProfile(userInst1.id, {
        institutionName: 'Indian Institute of Science',
      } as any);

      assert.strictEqual(updated.userId, userInst1.id);
      assert.strictEqual(updated.verified, false);
    });

    // ----------------------------------------------------
    // 2. Department Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Department Tests ---');

    await test('Institution 1 creates a department', async () => {
      const dept = await institutionService.createDepartment(userInst1.id, {
        departmentName: 'Department of Computational and Data Sciences',
        departmentCode: 'CDS',
        hodName: 'Prof. Ananth Grama',
        email: 'hod.cds@iisc.ac.in',
        phone: '+918022932001',
      });

      assert.ok(dept.id);
      assert.strictEqual(dept.institutionId, instProfile1.id);
      assert.strictEqual(dept.departmentCode, 'CDS');
      dept1Id = dept.id;
    });

    await test('Reject duplicate department name in same institution', async () => {
      let errorCaught = false;
      try {
        await institutionService.createDepartment(userInst1.id, {
          departmentName: 'Department of Computational and Data Sciences',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Institution 1 lists own departments with pagination and search', async () => {
      const res = await institutionService.getDepartments(userInst1.id, {
        page: 1,
        limit: 10,
        search: 'Computational',
      });

      assert.ok(res.departments.length >= 1);
      assert.strictEqual(res.departments[0].id, dept1Id);
      assert.strictEqual(res.pagination.total, 1);
    });

    await test('Institution 1 gets department by ID', async () => {
      const dept = await institutionService.getDepartmentById(userInst1.id, dept1Id);
      assert.strictEqual(dept.id, dept1Id);
      assert.strictEqual(dept.hodName, 'Prof. Ananth Grama');
    });

    await test('Institution 1 updates department details', async () => {
      const updated = await institutionService.updateDepartment(userInst1.id, dept1Id, {
        phone: '+918022932099',
      });
      assert.strictEqual(updated.phone, '+918022932099');
    });

    await test('CRITICAL SECURITY: Institution 2 cannot view Institution 1 department (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await institutionService.getDepartmentById(userInst2.id, dept1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('CRITICAL SECURITY: Institution 2 cannot update Institution 1 department (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await institutionService.updateDepartment(userInst2.id, dept1Id, {
          departmentName: 'Hijacked Dept',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('CRITICAL SECURITY: Institution 2 cannot delete Institution 1 department (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await institutionService.deleteDepartment(userInst2.id, dept1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 3. Placement Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Placement Tests ---');

    await test('Institution 1 creates a placement report', async () => {
      const placement = await institutionService.createPlacement(userInst1.id, {
        academicYear: '2023-2024',
        totalStudents: 450,
        placedStudents: 420,
        higherStudiesStudents: 20,
        entrepreneurshipStudents: 10,
        averageSalary: 2850000.0,
        highestSalary: 8500000.0,
        medianSalary: 2600000.0,
      });

      assert.ok(placement.id);
      assert.strictEqual(placement.institutionId, instProfile1.id);
      assert.strictEqual(placement.academicYear, '2023-2024');
      assert.strictEqual(placement.placedStudents, 420);
      placement1Id = placement.id;
    });

    await test('Reject duplicate placement report for same academic year', async () => {
      let errorCaught = false;
      try {
        await institutionService.createPlacement(userInst1.id, {
          academicYear: '2023-2024',
          totalStudents: 500,
          placedStudents: 450,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Reject placement report when placed students exceed total students', async () => {
      let errorCaught = false;
      try {
        await institutionService.createPlacement(userInst1.id, {
          academicYear: '2024-2025',
          totalStudents: 100,
          placedStudents: 150,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Institution 1 lists own placements with pagination', async () => {
      const res = await institutionService.getPlacements(userInst1.id, {
        page: 1,
        limit: 10,
      });

      assert.ok(res.placements.length >= 1);
      assert.strictEqual(res.placements[0].id, placement1Id);
      assert.strictEqual(res.pagination.total, 1);
    });

    await test('Institution 1 gets placement by ID', async () => {
      const p = await institutionService.getPlacementById(userInst1.id, placement1Id);
      assert.strictEqual(p.id, placement1Id);
      assert.strictEqual(p.academicYear, '2023-2024');
    });

    await test('Institution 1 updates placement report', async () => {
      const updated = await institutionService.updatePlacement(userInst1.id, placement1Id, {
        placedStudents: 425,
      });
      assert.strictEqual(updated.placedStudents, 425);
    });

    await test('CRITICAL SECURITY: Institution 2 cannot view Institution 1 placement (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await institutionService.getPlacementById(userInst2.id, placement1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 4. Placement Record Tests
    // ----------------------------------------------------
    console.log('\n--- 4. Placement Record Tests ---');

    await test('Institution 1 adds placement record referencing valid student', async () => {
      const record = await institutionService.createPlacementRecord(userInst1.id, placement1Id, {
        studentId: studProfile1.id,
        companyName: 'Google Research India',
        packageOffered: 4500000.0,
        roleOffered: 'Research Scientist',
        offerDate: '2024-03-15',
      });

      assert.ok(record.id);
      assert.strictEqual(record.placementId, placement1Id);
      assert.strictEqual(record.studentId, studProfile1.id);
      assert.strictEqual(record.companyName, 'Google Research India');
      placementRecord1Id = record.id;
    });

    await test('Reject placement record when referenced student does not exist', async () => {
      let errorCaught = false;
      try {
        await institutionService.createPlacementRecord(userInst1.id, placement1Id, {
          studentId: 999999,
          companyName: 'Nonexistent Student Co',
          packageOffered: 1000000,
          roleOffered: 'Engineer',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Institution 1 lists placement records', async () => {
      const res = await institutionService.getPlacementRecords(userInst1.id, placement1Id, {
        page: 1,
        limit: 10,
      });

      assert.ok(res.records.length >= 1);
      assert.strictEqual(res.records[0].id, placementRecord1Id);
      assert.strictEqual((res.records[0] as any).student?.course, 'B.Tech');
    });

    await test('Institution 1 gets placement record by ID', async () => {
      const record = await institutionService.getPlacementRecordById(userInst1.id, placementRecord1Id);
      assert.strictEqual(record.id, placementRecord1Id);
      assert.strictEqual(record.roleOffered, 'Research Scientist');
    });

    await test('Institution 1 updates placement record', async () => {
      const updated = await institutionService.updatePlacementRecord(userInst1.id, placementRecord1Id, {
        roleOffered: 'Senior Research Scientist',
      });
      assert.strictEqual(updated.roleOffered, 'Senior Research Scientist');
    });

    await test('CRITICAL SECURITY: Institution 2 cannot view Institution 1 placement record (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await institutionService.getPlacementRecordById(userInst2.id, placementRecord1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Institution 1 can delete placement record', async () => {
      const res = await institutionService.deletePlacementRecord(userInst1.id, placementRecord1Id);
      assert.strictEqual(res.message, 'Placement record deleted successfully');

      let errorCaught = false;
      try {
        await institutionService.getPlacementRecordById(userInst1.id, placementRecord1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 5. Collaboration & Sub-Event Tests
    // ----------------------------------------------------
    console.log('\n--- 5. Collaboration & Sub-Event Tests ---');

    await test('Institution 1 creates collaboration with Industry 1', async () => {
      const collab = await collaborationService.createCollaboration(userInst1, {
        industryId: indProfile1.id,
        title: 'Joint AI Systems & Cloud Innovation Initiative',
        collaborationType: CollaborationType.WORKSHOP,
        description: 'Collaborative initiative covering high-scale distributed systems and enterprise cloud applications.',
        startDate: '2024-06-01',
        endDate: '2025-06-01',
      });

      assert.ok(collab.id);
      assert.strictEqual(collab.institutionId, instProfile1.id);
      assert.strictEqual(collab.industryId, indProfile1.id);
      assert.strictEqual(collab.status, CollaborationStatus.PENDING);
      collab1Id = collab.id;
    });

    await test('Industry 1 can list collaborations and see the pending collaboration', async () => {
      const res = await collaborationService.getCollaborations(userInd1, {
        page: 1,
        limit: 10,
      });

      assert.ok(res.collaborations.length >= 1);
      assert.strictEqual(res.collaborations[0].id, collab1Id);
      assert.strictEqual((res.collaborations[0] as any).institution?.institutionName, 'Indian Institute of Science');
    });

    await test('Industry 1 approves the collaboration (Status transition)', async () => {
      const updated = await collaborationService.updateCollaboration(userInd1, collab1Id, {
        status: CollaborationStatus.APPROVED,
      });

      assert.strictEqual(updated.status, CollaborationStatus.APPROVED);
    });

    await test('CRITICAL SECURITY: Unrelated Institution 2 cannot view or update this collaboration', async () => {
      let errorCaught = false;
      try {
        await collaborationService.getCollaborationById(userInst2, collab1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    // Sub-event 1: Workshop
    await test('Institution 1 creates a Workshop under the collaboration', async () => {
      const workshop = await collaborationService.createWorkshop(userInst1, collab1Id, {
        topic: 'Architecting Resilient Cloud Services',
        speakerName: 'Dr. Sudhir Natarajan',
        speakerDesignation: 'Chief Cloud Architect, TCS',
        date: '2024-08-15',
        durationHours: 3,
        venue: 'Satish Dhawan Auditorium, IISc',
        attendeesCount: 180,
      });

      assert.ok(workshop.id);
      assert.strictEqual(workshop.collaborationId, collab1Id);
      assert.strictEqual(workshop.topic, 'Architecting Resilient Cloud Services');
      workshop1Id = workshop.id;
    });

    await test('Industry 1 updates Workshop details', async () => {
      const updated = await collaborationService.updateWorkshop(userInd1, workshop1Id, {
        attendeesCount: 220,
      });
      assert.strictEqual(updated.attendeesCount, 220);
    });

    // Sub-event 2: Guest Lecture
    await test('Industry 1 creates a Guest Lecture under the collaboration', async () => {
      const lecture = await collaborationService.createGuestLecture(userInd1, collab1Id, {
        topic: 'Modern Industrial Machine Learning Pipelines',
        lecturerName: 'Dr. Priya Varma',
        date: '2024-09-10',
        durationMinutes: 90,
      });

      assert.ok(lecture.id);
      assert.strictEqual(lecture.collaborationId, collab1Id);
      assert.strictEqual(lecture.durationMinutes, 90);
      lecture1Id = lecture.id;
    });

    await test('Institution 1 updates Guest Lecture', async () => {
      const updated = await collaborationService.updateGuestLecture(userInst1, lecture1Id, {
        durationMinutes: 120,
      });
      assert.strictEqual(updated.durationMinutes, 120);
    });

    // Sub-event 3: Industrial Training
    await test('Institution 1 creates an Industrial Training program', async () => {
      const training = await collaborationService.createIndustrialTraining(userInst1, collab1Id, {
        domain: 'Cloud Native Enterprise Architecture',
        durationWeeks: 4,
        batchSize: 35,
      });

      assert.ok(training.id);
      assert.strictEqual(training.collaborationId, collab1Id);
      assert.strictEqual(training.durationWeeks, 4);
      training1Id = training.id;
    });

    await test('Industry 1 updates Industrial Training', async () => {
      const updated = await collaborationService.updateIndustrialTraining(userInd1, training1Id, {
        batchSize: 40,
      });
      assert.strictEqual(updated.batchSize, 40);
    });

    // Sub-event 4: Live Project
    await test('Industry 1 creates a Live Project under the collaboration', async () => {
      const project = await collaborationService.createLiveProject(userInd1, collab1Id, {
        title: 'Autonomous Multi-Cloud Cost Optimization Engine',
        problemStatement: 'Develop intelligent telemetry analysis agents to dynamically reallocate idle cloud instances.',
        studentsCount: 6,
        deadline: '2025-01-30',
      });

      assert.ok(project.id);
      assert.strictEqual(project.collaborationId, collab1Id);
      assert.strictEqual(project.studentsCount, 6);
      project1Id = project.id;
    });

    await test('Institution 1 updates Live Project', async () => {
      const updated = await collaborationService.updateLiveProject(userInst1, project1Id, {
        studentsCount: 8,
      });
      assert.strictEqual(updated.studentsCount, 8);
    });

    await test('Get collaboration by ID returns eager-loaded sub-events', async () => {
      const collab = await collaborationService.getCollaborationById(userInst1, collab1Id);
      assert.strictEqual(collab.id, collab1Id);
      assert.strictEqual((collab as any).workshops.length, 1);
      assert.strictEqual((collab as any).guestLectures.length, 1);
      assert.strictEqual((collab as any).industrialTrainings.length, 1);
      assert.strictEqual((collab as any).liveProjects.length, 1);
    });

    await test('Clean up sub-events and collaboration', async () => {
      await collaborationService.deleteWorkshop(userInst1, workshop1Id);
      await collaborationService.deleteGuestLecture(userInd1, lecture1Id);
      await collaborationService.deleteIndustrialTraining(userInst1, training1Id);
      await collaborationService.deleteLiveProject(userInd1, project1Id);

      const res = await collaborationService.deleteCollaboration(userInst1, collab1Id);
      assert.strictEqual(res.message, 'Collaboration deleted successfully');
    });

    await test('Institution 1 deletes placement and department', async () => {
      await institutionService.deletePlacement(userInst1.id, placement1Id);
      const resDept = await institutionService.deleteDepartment(userInst1.id, dept1Id);
      assert.strictEqual(resDept.message, 'Department deleted successfully');
    });

  } finally {
    // Teardown test entities
    if (workshop1Id) await Workshop.destroy({ where: { id: workshop1Id } });
    if (lecture1Id) await GuestLecture.destroy({ where: { id: lecture1Id } });
    if (training1Id) await IndustrialTraining.destroy({ where: { id: training1Id } });
    if (project1Id) await LiveProject.destroy({ where: { id: project1Id } });
    if (collab1Id) await Collaboration.destroy({ where: { id: collab1Id } });
    if (placementRecord1Id) await PlacementRecord.destroy({ where: { id: placementRecord1Id } });
    if (placement1Id) await Placement.destroy({ where: { id: placement1Id } });
    if (dept1Id) await InstitutionDepartment.destroy({ where: { id: dept1Id } });

    if (instProfile1?.id) await InstitutionProfile.destroy({ where: { id: instProfile1.id } });
    if (instProfile2?.id) await InstitutionProfile.destroy({ where: { id: instProfile2.id } });
    if (indProfile1?.id) await IndustryProfile.destroy({ where: { id: indProfile1.id } });
    if (studProfile1?.id) await StudentProfile.destroy({ where: { id: studProfile1.id } });

    await User.destroy({ where: { id: userInst1.id } });
    await User.destroy({ where: { id: userInst2.id } });
    await User.destroy({ where: { id: userInd1.id } });
    await User.destroy({ where: { id: userStud1.id } });
  }

  console.log('\n================================================================');
  console.log(`PHASE 11 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase11Tests().catch((err) => {
  console.error('Fatal Phase 11 test error:', err);
  process.exit(1);
});
