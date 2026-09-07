import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { StudentProfile } from '../models/student-profile.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { LearningProgram } from '../models/learning-program.model';
import { FacultyOpportunity } from '../models/faculty-opportunity.model';
import { FDP } from '../models/fdp.model';
import { ResearchOpportunity } from '../models/research-opportunity.model';
import { ConsultancyOpportunity } from '../models/consultancy-opportunity.model';
import { UserRole } from '../constants/roles';
import { OpportunityStatus, WorkplaceType, EmploymentType } from '../constants/enums';
import { opportunityService } from '../services/opportunity.service';

export const runPhase7Tests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 7 OPPORTUNITY SYSTEM TESTS');
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

  // Setup: Create test users and profiles
  const hash = await bcrypt.hash('TestPass123!', 10);

  // 1. Industry User A
  const userIndA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Acme',
    lastName: 'Corp',
    email: `industry.a.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileIndA = await IndustryProfile.create({
    userId: userIndA.id,
    companyName: 'Acme Technologies Inc',
    industryType: 'Information Technology',
    location: 'Bangalore, India',
    city: 'Bangalore',
    state: 'Karnataka',
    verified: true,
  });

  // 2. Industry User B
  const userIndB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Beta',
    lastName: 'Solutions',
    email: `industry.b.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  const profileIndB = await IndustryProfile.create({
    userId: userIndB.id,
    companyName: 'Beta Solutions Ltd',
    industryType: 'Software Development',
    location: 'Hyderabad, India',
    city: 'Hyderabad',
    state: 'Telangana',
    verified: true,
  });

  // 3. Institution User
  const userInst = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Apex',
    lastName: 'University',
    email: `institution.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INSTITUTION,
    isActive: true,
    isVerified: true,
  });

  const profileInst = await InstitutionProfile.create({
    userId: userInst.id,
    institutionName: 'Apex Institute of Technology',
    institutionType: 'Engineering College',
    location: 'Delhi, India',
    city: 'New Delhi',
    state: 'Delhi',
    verified: true,
  });

  // 4. Student User
  const userStudent = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'John',
    lastName: 'Doe',
    email: `student.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudent = await StudentProfile.create({
    userId: userStudent.id,
    collegeName: 'Apex Institute of Technology',
    profileCompletion: 50,
  });

  // Test state IDs
  let createdJobId = 0;
  let createdInternshipId = 0;
  let createdProjectId = 0;
  let createdLearningProgramId = 0;
  let createdFacultyOppId = 0;
  let createdFDPId = 0;
  let createdResearchOppId = 0;
  let createdConsultancyOppId = 0;

  try {
    // ----------------------------------------------------
    // 1. Job Module Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Job Module Tests ---');

    await test('Industry A creates a job opportunity (server sets industryId)', async () => {
      const futureDate = '2027-12-31';
      const job = await opportunityService.createJob(userIndA.id, {
        title: 'Senior Backend Engineer',
        description: 'Design and build resilient microservices and distributed APIs.',
        requirements: '5+ years Node.js and distributed systems experience.',
        workplaceType: WorkplaceType.HYBRID,
        employmentType: EmploymentType.FULL_TIME,
        location: 'Bangalore, India',
        city: 'Bangalore',
        state: 'Karnataka',
        salaryMin: 1800000,
        salaryMax: 2800000,
        openings: 3,
        applicationDeadline: futureDate,
        status: OpportunityStatus.OPEN,
      });

      assert.ok(job.id);
      assert.strictEqual(job.industryId, profileIndA.id);
      assert.strictEqual(job.title, 'Senior Backend Engineer');
      assert.strictEqual(job.openings, 3);
      createdJobId = job.id;
    });

    await test('Reject job creation with past application deadline', async () => {
      let errorCaught = false;
      try {
        await opportunityService.createJob(userIndA.id, {
          title: 'Expired Job Posting',
          description: 'This job should be rejected due to past deadline.',
          applicationDeadline: '2020-01-01',
          openings: 1,
          status: OpportunityStatus.OPEN,
          workplaceType: WorkplaceType.ON_SITE,
          employmentType: EmploymentType.FULL_TIME,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true, 'Past deadline must be rejected with 400 ValidationError');
    });

    await test('List jobs supports search, workplaceType filter, and pagination', async () => {
      const res = await opportunityService.getJobs({
        search: 'Backend',
        workplaceType: WorkplaceType.HYBRID,
        page: 1,
        limit: 10,
      });

      assert.ok(res.jobs.length >= 1);
      assert.strictEqual(res.jobs[0].id, createdJobId);
      assert.strictEqual((res.jobs[0] as any).industry.companyName, 'Acme Technologies Inc');
      assert.strictEqual(res.pagination.page, 1);
    });

    await test('Get job details by ID returns eager-loaded industry profile', async () => {
      const job = await opportunityService.getJobById(createdJobId);
      assert.strictEqual(job.id, createdJobId);
      assert.ok((job as any).industry);
      assert.strictEqual((job as any).industry.id, profileIndA.id);
    });

    await test('CRITICAL SECURITY: Industry B cannot update Industry A job (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateJob(userIndB.id, createdJobId, {
          title: 'Tampered Job Title By Attacker',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true, 'Cross-user job update must be blocked with 403');
    });

    await test('Owner Industry A can update job details', async () => {
      const updated = await opportunityService.updateJob(userIndA.id, createdJobId, {
        title: 'Lead Backend Engineer',
        openings: 5,
      });

      assert.strictEqual(updated.title, 'Lead Backend Engineer');
      assert.strictEqual(updated.openings, 5);
    });

    // ----------------------------------------------------
    // 2. Internship Module Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Internship Module Tests ---');

    await test('Industry A creates an internship opportunity', async () => {
      const internship = await opportunityService.createInternship(userIndA.id, {
        title: 'Full Stack Web Development Intern',
        description: 'Build modern user-facing portals and REST API endpoints.',
        requirements: 'Proficiency in JavaScript, TypeScript, and React/Node.',
        durationMonths: 6,
        stipend: 35000,
        workplaceType: WorkplaceType.REMOTE,
        location: 'Remote, India',
        openings: 4,
        applicationDeadline: '2027-06-30',
        startDate: '2027-07-01',
        status: OpportunityStatus.OPEN,
      });

      assert.ok(internship.id);
      assert.strictEqual(internship.industryId, profileIndA.id);
      assert.strictEqual(internship.durationMonths, 6);
      assert.strictEqual(Number(internship.stipend), 35000);
      createdInternshipId = internship.id;
    });

    await test('List internships returns active opportunities', async () => {
      const res = await opportunityService.getInternships({
        search: 'Full Stack',
        page: 1,
        limit: 10,
      });

      assert.ok(res.internships.length >= 1);
      assert.strictEqual(res.internships[0].id, createdInternshipId);
    });

    await test('CRITICAL SECURITY: Industry B cannot update Industry A internship (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateInternship(userIndB.id, createdInternshipId, {
          title: 'Tampered Internship',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Owner Industry A can update internship stipend and duration', async () => {
      const updated = await opportunityService.updateInternship(userIndA.id, createdInternshipId, {
        stipend: 40000,
        durationMonths: 8,
      });

      assert.strictEqual(Number(updated.stipend), 40000);
      assert.strictEqual(updated.durationMonths, 8);
    });

    // ----------------------------------------------------
    // 3. Project Module Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Project Module Tests ---');

    await test('Industry A creates an industry project opportunity', async () => {
      const project = await opportunityService.createProject(userIndA.id, {
        title: 'Edge AI Computer Vision Gateway',
        description: 'Deploy real-time inference on edge IoT nodes.',
        deliverables: 'Architecture blueprint, firmware binaries, and validation test suite.',
        durationWeeks: 12,
        budget: 500000,
        status: OpportunityStatus.OPEN,
      });

      assert.ok(project.id);
      assert.strictEqual(project.industryId, profileIndA.id);
      assert.strictEqual(project.durationWeeks, 12);
      createdProjectId = project.id;
    });

    await test('List projects returns projects list', async () => {
      const res = await opportunityService.getProjects({
        search: 'Computer Vision',
        page: 1,
        limit: 10,
      });

      assert.ok(res.projects.length >= 1);
      assert.strictEqual(res.projects[0].id, createdProjectId);
    });

    await test('CRITICAL SECURITY: Industry B cannot update Industry A project', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateProject(userIndB.id, createdProjectId, {
          budget: 1000,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 4. Learning Program Module Tests
    // ----------------------------------------------------
    console.log('\n--- 4. Learning Program Module Tests ---');

    await test('Institution creates a certified learning program', async () => {
      const prog = await opportunityService.createLearningProgram(userInst, {
        title: 'Cloud Native Microservices & Kubernetes',
        description: 'Hands-on industrial container orchestration certification.',
        curriculum: 'Docker, Podman, Kubernetes, Istio, Observability.',
        durationHours: 60,
        mode: 'ONLINE',
        cost: 4999,
        status: OpportunityStatus.OPEN,
      });

      assert.ok(prog.id);
      assert.strictEqual(prog.institutionId, profileInst.id);
      assert.ok(!prog.industryId);
      createdLearningProgramId = prog.id;
    });

    await test('List learning programs returns programs with institution profile', async () => {
      const res = await opportunityService.getLearningPrograms({
        search: 'Kubernetes',
        page: 1,
        limit: 10,
      });

      assert.ok(res.learningPrograms.length >= 1);
      assert.strictEqual(res.learningPrograms[0].id, createdLearningProgramId);
      assert.strictEqual((res.learningPrograms[0] as any).institution.institutionName, 'Apex Institute of Technology');
    });

    await test('CRITICAL SECURITY: Industry A cannot update Institution learning program', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateLearningProgram(userIndA, createdLearningProgramId, {
          cost: 0,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 5. Faculty Opportunity Module Tests
    // ----------------------------------------------------
    console.log('\n--- 5. Faculty Opportunity Module Tests ---');

    await test('Institution creates a faculty fellowship opportunity', async () => {
      const opp = await opportunityService.createFacultyOpportunity(userInst, {
        title: 'Visiting Professor of Artificial Intelligence',
        description: 'Teach graduate level reinforcement learning courses and mentor researchers.',
        department: 'Computer Science and Engineering',
        eligibility: 'Ph.D. in Computer Science with top tier publications.',
        applicationDeadline: '2027-11-30',
        status: OpportunityStatus.OPEN,
      });

      assert.ok(opp.id);
      assert.strictEqual(opp.institutionId, profileInst.id);
      assert.strictEqual(opp.department, 'Computer Science and Engineering');
      createdFacultyOppId = opp.id;
    });

    await test('List faculty opportunities with department filter', async () => {
      const res = await opportunityService.getFacultyOpportunities({
        department: 'Computer Science',
        page: 1,
        limit: 10,
      });

      assert.ok(res.facultyOpportunities.length >= 1);
      assert.strictEqual(res.facultyOpportunities[0].id, createdFacultyOppId);
    });

    // ----------------------------------------------------
    // 6. FDP (Faculty Development Program) Module Tests
    // ----------------------------------------------------
    console.log('\n--- 6. FDP Module Tests ---');

    await test('Institution creates an FDP', async () => {
      const fdp = await opportunityService.createFDP(userInst, {
        title: 'National FDP on Quantum Computing and Algorithms',
        description: 'Advanced pedagogical methods and simulator labs for quantum computing.',
        startDate: '2027-08-10',
        endDate: '2027-08-15',
        mode: 'HYBRID',
        venue: 'Main Auditorium, Apex Campus',
        status: OpportunityStatus.OPEN,
      });

      assert.ok(fdp.id);
      assert.strictEqual(fdp.institutionId, profileInst.id);
      createdFDPId = fdp.id;
    });

    await test('Reject FDP creation when endDate is before startDate', async () => {
      let errorCaught = false;
      try {
        await opportunityService.createFDP(userInst, {
          title: 'Invalid FDP Dates',
          description: 'This should fail validation because end is before start.',
          startDate: '2027-09-10',
          endDate: '2027-09-01',
          mode: 'ONLINE',
          status: OpportunityStatus.OPEN,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true, 'endDate before startDate must be rejected with 400');
    });

    await test('List FDPs returns active FDPs', async () => {
      const res = await opportunityService.getFDPs({
        search: 'Quantum',
        page: 1,
        limit: 10,
      });

      assert.ok(res.fdps.length >= 1);
      assert.strictEqual(res.fdps[0].id, createdFDPId);
    });

    // ----------------------------------------------------
    // 7. Research Opportunity Module Tests
    // ----------------------------------------------------
    console.log('\n--- 7. Research Opportunity Module Tests ---');

    await test('Institution creates a research opportunity', async () => {
      const research = await opportunityService.createResearchOpportunity(userInst, {
        title: 'Next-Generation Solid-State Battery Electrolytes',
        fieldOfStudy: 'Materials Science & Renewable Energy',
        description: 'Synthesizing novel polymer matrix electrolytes for elevated thermal stability.',
        fundingAmount: 1500000,
        durationMonths: 24,
        status: OpportunityStatus.OPEN,
      });

      assert.ok(research.id);
      assert.strictEqual(research.institutionId, profileInst.id);
      assert.strictEqual(research.fieldOfStudy, 'Materials Science & Renewable Energy');
      createdResearchOppId = research.id;
    });

    await test('List research opportunities with fieldOfStudy filter', async () => {
      const res = await opportunityService.getResearchOpportunities({
        fieldOfStudy: 'Materials Science',
        page: 1,
        limit: 10,
      });

      assert.ok(res.researchOpportunities.length >= 1);
      assert.strictEqual(res.researchOpportunities[0].id, createdResearchOppId);
    });

    // ----------------------------------------------------
    // 8. Consultancy Opportunity Module Tests
    // ----------------------------------------------------
    console.log('\n--- 8. Consultancy Opportunity Module Tests ---');

    await test('Industry A creates a consultancy opportunity for academia', async () => {
      const consult = await opportunityService.createConsultancyOpportunity(userIndA.id, {
        title: 'High-Temperature Metallurgy Process Optimization',
        domain: 'Metallurgical Engineering',
        problemStatement: 'Excessive slag formation during secondary refining stages causing yield reduction.',
        expectedOutcome: 'Slag composition mathematical model and process control algorithms.',
        budget: 750000,
        status: OpportunityStatus.OPEN,
      });

      assert.ok(consult.id);
      assert.strictEqual(consult.industryId, profileIndA.id);
      assert.strictEqual(consult.domain, 'Metallurgical Engineering');
      createdConsultancyOppId = consult.id;
    });

    await test('List consultancy opportunities with domain filter', async () => {
      const res = await opportunityService.getConsultancyOpportunities({
        domain: 'Metallurgical',
        page: 1,
        limit: 10,
      });

      assert.ok(res.consultancyOpportunities.length >= 1);
      assert.strictEqual(res.consultancyOpportunities[0].id, createdConsultancyOppId);
    });

    await test('CRITICAL SECURITY: Industry B cannot update Industry A consultancy opportunity', async () => {
      let errorCaught = false;
      try {
        await opportunityService.updateConsultancyOpportunity(userIndB.id, createdConsultancyOppId, {
          title: 'Hacked Consultancy Problem',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 9. Deletion & Cleanup Tests
    // ----------------------------------------------------
    console.log('\n--- 9. Opportunity Deletion Tests ---');

    await test('Industry A can delete their job opportunity', async () => {
      const res = await opportunityService.deleteJob(userIndA.id, createdJobId);
      assert.ok(res.message);

      const deleted = await Job.findByPk(createdJobId);
      assert.strictEqual(deleted, null);
    });

    await test('Industry A can delete their internship opportunity', async () => {
      const res = await opportunityService.deleteInternship(userIndA.id, createdInternshipId);
      assert.ok(res.message);

      const deleted = await Internship.findByPk(createdInternshipId);
      assert.strictEqual(deleted, null);
    });

    await test('Industry A can delete their project opportunity', async () => {
      const res = await opportunityService.deleteProject(userIndA.id, createdProjectId);
      assert.ok(res.message);

      const deleted = await Project.findByPk(createdProjectId);
      assert.strictEqual(deleted, null);
    });

    await test('Institution can delete their learning program', async () => {
      const res = await opportunityService.deleteLearningProgram(userInst, createdLearningProgramId);
      assert.ok(res.message);

      const deleted = await LearningProgram.findByPk(createdLearningProgramId);
      assert.strictEqual(deleted, null);
    });

    await test('Institution can delete their faculty opportunity', async () => {
      const res = await opportunityService.deleteFacultyOpportunity(userInst, createdFacultyOppId);
      assert.ok(res.message);

      const deleted = await FacultyOpportunity.findByPk(createdFacultyOppId);
      assert.strictEqual(deleted, null);
    });

    await test('Institution can delete their FDP', async () => {
      const res = await opportunityService.deleteFDP(userInst, createdFDPId);
      assert.ok(res.message);

      const deleted = await FDP.findByPk(createdFDPId);
      assert.strictEqual(deleted, null);
    });

    await test('Institution can delete their research opportunity', async () => {
      const res = await opportunityService.deleteResearchOpportunity(userInst, createdResearchOppId);
      assert.ok(res.message);

      const deleted = await ResearchOpportunity.findByPk(createdResearchOppId);
      assert.strictEqual(deleted, null);
    });

    await test('Industry A can delete their consultancy opportunity', async () => {
      const res = await opportunityService.deleteConsultancyOpportunity(userIndA.id, createdConsultancyOppId);
      assert.ok(res.message);

      const deleted = await ConsultancyOpportunity.findByPk(createdConsultancyOppId);
      assert.strictEqual(deleted, null);
    });

  } finally {
    // Cleanup profiles & users
    await StudentProfile.destroy({ where: { id: profileStudent.id } });
    await IndustryProfile.destroy({ where: { id: profileIndA.id } });
    await IndustryProfile.destroy({ where: { id: profileIndB.id } });
    await InstitutionProfile.destroy({ where: { id: profileInst.id } });
    await User.destroy({ where: { id: userIndA.id } });
    await User.destroy({ where: { id: userIndB.id } });
    await User.destroy({ where: { id: userInst.id } });
    await User.destroy({ where: { id: userStudent.id } });
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

runPhase7Tests().catch((err) => {
  console.error('Fatal Phase 7 test error:', err);
  process.exit(1);
});
