import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentEducation } from '../models/student-education.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentCertification } from '../models/student-certification.model';
import { StudentExperience } from '../models/student-experience.model';
import { StudentAchievement } from '../models/student-achievement.model';
import { StudentInterest } from '../models/student-interest.model';
import { StudentLanguage } from '../models/student-language.model';
import { Skill } from '../models/skill.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioProject } from '../models/portfolio-project.model';
import { UserRole } from '../constants/roles';
import { StudentSkillLevel } from '../constants/enums';
import { studentService } from '../services/student.service';
import { portfolioService } from '../services/portfolio.service';

export const runStudentTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 5 STUDENT MODULE TESTS');
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

  // Setup: Create two distinct student users for ownership testing
  const salt = 10;
  const hash = await bcrypt.hash('TestPass123!', salt);

  const studentUserA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Student',
    lastName: 'One',
    email: `student.a.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const studentUserB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Student',
    lastName: 'Two',
    email: `student.b.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  // Create active skill for testing
  const testSkill = await Skill.create({
    name: `Node.js Testing Skill ${Date.now()}`,
    slug: `nodejs-test-skill-${Date.now()}`,
    isActive: true,
  });

  let createdEducationId = 0;
  let createdSkillId = 0;
  let createdCertId = 0;
  let createdExpId = 0;
  let createdAchId = 0;
  let createdIntId = 0;
  let createdLangId = 0;
  let createdProjectId = 0;

  try {
    // ----------------------------------------------------
    // 1. Profile Tests
    // ----------------------------------------------------
    console.log('\n--- 1. Student Profile Tests ---');

    await test('Create student profile succeeds and computes initial profile completion', async () => {
      const profile = await studentService.createProfile(studentUserA.id, {
        headline: 'Aspiring Full Stack Engineer',
        bio: 'Passionate computer science student.',
        gender: 'Male',
        location: 'Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        collegeName: 'BMS College of Engineering',
        department: 'Computer Science',
        course: 'B.Tech',
        currentSemester: 7,
        graduationYear: 2027,
        cgpa: 8.9,
        githubUrl: 'https://github.com/studentone',
        linkedinUrl: 'https://linkedin.com/in/studentone',
        careerGoal: 'Software Development Engineer',
        availabilityStatus: 'Actively Looking',
      });

      assert.strictEqual(profile.userId, studentUserA.id);
      assert.strictEqual(profile.headline, 'Aspiring Full Stack Engineer');
      assert.ok(profile.profileCompletion > 0, 'Profile completion must be calculated');
      assert.ok(profile.profileCompletion <= 100, 'Profile completion must be <= 100');
    });

    await test('Duplicate student profile creation is rejected with ConflictError', async () => {
      let errorCaught = false;
      try {
        await studentService.createProfile(studentUserA.id, {
          headline: 'Duplicate Profile Attempt',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true, 'Duplicate profile should be rejected');
    });

    await test('Get student profile returns authoritative profile with updated completion', async () => {
      const profile = await studentService.getProfile(studentUserA.id);
      assert.strictEqual(profile.userId, studentUserA.id);
      assert.strictEqual(profile.collegeName, 'BMS College of Engineering');
    });

    await test('Update student profile updates fields and recalculates completion', async () => {
      const updated = await studentService.updateProfile(studentUserA.id, {
        bio: 'Updated bio with additional details.',
        resumeUrl: 'https://example.com/resume.pdf',
      });

      assert.strictEqual(updated.bio, 'Updated bio with additional details.');
      assert.strictEqual(updated.resumeUrl, 'https://example.com/resume.pdf');
    });

    // ----------------------------------------------------
    // 2. Education Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Education Tests ---');

    await test('Add education record succeeds and recalculates completion', async () => {
      const edu = await studentService.addEducation(studentUserA.id, {
        institutionName: 'BMS College of Engineering',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science and Engineering',
        startYear: 2023,
        endYear: 2027,
        grade: '8.9 CGPA',
        description: 'Specializing in distributed systems.',
      });

      assert.ok(edu.id);
      assert.strictEqual(edu.institutionName, 'BMS College of Engineering');
      createdEducationId = edu.id;
    });

    await test('Get education records returns paginated list', async () => {
      const result = await studentService.getEducation(studentUserA.id, 1, 10);
      assert.ok(result.education.length > 0);
      assert.strictEqual(result.pagination.total, 1);
    });

    await test('Update education record succeeds for owner', async () => {
      const updated = await studentService.updateEducation(studentUserA.id, createdEducationId, {
        grade: '9.0 CGPA',
      });
      assert.strictEqual(updated.grade, '9.0 CGPA');
    });

    await test('Student B cannot modify Student A education record (ownership enforcement)', async () => {
      let errorCaught = false;
      try {
        // Student B has no profile yet or tries to modify Student A's edu record
        await studentService.updateEducation(studentUserB.id, createdEducationId, {
          grade: '0.0 CGPA',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404, 'Must return 404 when record does not belong to user');
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 3. Skills Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Skills Tests ---');

    await test('Add skill enforces unverified default and null score (trusted score protection)', async () => {
      const skill = await studentService.addSkill(studentUserA.id, {
        skillId: testSkill.id,
        level: StudentSkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
      });

      assert.ok(skill.id);
      assert.strictEqual(skill.skillId, testSkill.id);
      assert.strictEqual(skill.verified, false, 'Manual skill must not be marked verified');
      assert.strictEqual(skill.score, null, 'Self-reported score must be null');
      createdSkillId = skill.id;
    });

    await test('Duplicate skill addition is rejected with ConflictError', async () => {
      let errorCaught = false;
      try {
        await studentService.addSkill(studentUserA.id, {
          skillId: testSkill.id,
          level: StudentSkillLevel.ADVANCED,
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Update skill level succeeds for owner', async () => {
      const updated = await studentService.updateSkill(studentUserA.id, createdSkillId, {
        level: StudentSkillLevel.ADVANCED,
        yearsOfExperience: 3,
      });
      assert.strictEqual(updated.level, StudentSkillLevel.ADVANCED);
      assert.strictEqual(Number(updated.yearsOfExperience), 3);
    });

    await test('Get skills returns list with skill relationship', async () => {
      const result = await studentService.getSkills(studentUserA.id, 1, 10);
      assert.ok(result.skills.length > 0);
      assert.strictEqual((result.skills[0] as any).skill.name, testSkill.name);
    });

    // ----------------------------------------------------
    // 4. Certifications Tests
    // ----------------------------------------------------
    console.log('\n--- 4. Certifications Tests ---');

    await test('Add certification succeeds and persists expirationDate', async () => {
      const cert = await studentService.addCertification(studentUserA.id, {
        title: 'AWS Certified Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2025-06-01',
        expirationDate: '2028-06-01',
        credentialId: 'AWS-12345678',
        credentialUrl: 'https://aws.amazon.com/verify/12345678',
      });
      assert.ok(cert.id);
      assert.strictEqual(cert.title, 'AWS Certified Cloud Practitioner');
      createdCertId = cert.id;
    });

    await test('Update certification succeeds for owner', async () => {
      const updated = await studentService.updateCertification(studentUserA.id, createdCertId, {
        title: 'AWS Certified Solutions Architect Associate',
      });
      assert.strictEqual(updated.title, 'AWS Certified Solutions Architect Associate');
    });

    // ----------------------------------------------------
    // 5. Experience Tests
    // ----------------------------------------------------
    console.log('\n--- 5. Experience Tests ---');

    await test('Add experience succeeds with companyName', async () => {
      const exp = await studentService.addExperience(studentUserA.id, {
        title: 'Software Engineering Intern',
        companyName: 'Tech Innovations Corp',
        location: 'Bengaluru',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        isCurrent: false,
        description: 'Developed backend REST APIs.',
      });
      assert.ok(exp.id);
      assert.strictEqual(exp.companyName, 'Tech Innovations Corp');
      createdExpId = exp.id;
    });

    await test('Update experience succeeds for owner', async () => {
      const updated = await studentService.updateExperience(studentUserA.id, createdExpId, {
        title: 'Lead Software Engineering Intern',
      });
      assert.strictEqual(updated.title, 'Lead Software Engineering Intern');
    });

    // ----------------------------------------------------
    // 6. Achievements Tests
    // ----------------------------------------------------
    console.log('\n--- 6. Achievements Tests ---');

    await test('Add achievement succeeds', async () => {
      const ach = await studentService.addAchievement(studentUserA.id, {
        title: 'Smart India Hackathon Finalist',
        description: 'Selected among top 5 national finalists.',
        date: '2025-09-01',
      });
      assert.ok(ach.id);
      assert.strictEqual(ach.title, 'Smart India Hackathon Finalist');
      createdAchId = ach.id;
    });

    // ----------------------------------------------------
    // 7. Interests & Languages Tests
    // ----------------------------------------------------
    console.log('\n--- 7. Interests & Languages Tests ---');

    await test('Add interest succeeds with interestArea', async () => {
      const interest = await studentService.addInterest(studentUserA.id, {
        interestArea: 'Cloud Computing & Distributed Systems',
      });
      assert.ok(interest.id);
      assert.strictEqual(interest.interestArea, 'Cloud Computing & Distributed Systems');
      createdIntId = interest.id;
    });

    await test('Add language succeeds', async () => {
      const lang = await studentService.addLanguage(studentUserA.id, {
        language: 'English',
        proficiency: 'Fluent',
      });
      assert.ok(lang.id);
      assert.strictEqual(lang.language, 'English');
      createdLangId = lang.id;
    });

    // ----------------------------------------------------
    // 8. Portfolio Foundation Tests
    // ----------------------------------------------------
    console.log('\n--- 8. Portfolio Foundation Tests ---');

    await test('Create portfolio foundation succeeds for student', async () => {
      const portfolio = await portfolioService.createPortfolio(studentUserA.id, {
        customDomain: 'aarav.dev',
        theme: 'modern_dark',
        isPublished: true,
      });

      assert.ok(portfolio.id);
      assert.strictEqual(portfolio.customDomain, 'aarav.dev');
    });

    await test('Duplicate portfolio creation is rejected with ConflictError', async () => {
      let errorCaught = false;
      try {
        await portfolioService.createPortfolio(studentUserA.id, {
          customDomain: 'another.dev',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Get portfolio retrieves student portfolio foundation', async () => {
      const portfolio = await portfolioService.getPortfolio(studentUserA.id);
      assert.strictEqual(portfolio.customDomain, 'aarav.dev');
    });

    await test('Add portfolio project succeeds and enforces ownership', async () => {
      const project = await portfolioService.addProject(studentUserA.id, {
        title: 'Skill Intelligence Platform',
        description: 'Scalable platform connecting academia with industry.',
        projectUrl: 'https://github.com/project',
        technologies: 'Node.js, Express, TypeScript, MySQL',
      });
      assert.ok(project.id);
      assert.strictEqual(project.title, 'Skill Intelligence Platform');
      createdProjectId = project.id;
    });

    await test('Delete portfolio project succeeds for owner', async () => {
      const result = await portfolioService.deleteProject(studentUserA.id, createdProjectId);
      assert.ok(result.message);
    });

    // ----------------------------------------------------
    // 9. Deletion & Cleanup Sub-Entity Tests
    // ----------------------------------------------------
    console.log('\n--- 9. Sub-entity Deletion Tests ---');

    await test('Delete education succeeds', async () => {
      const res = await studentService.deleteEducation(studentUserA.id, createdEducationId);
      assert.ok(res.message);
    });

    await test('Delete skill succeeds', async () => {
      const res = await studentService.deleteSkill(studentUserA.id, createdSkillId);
      assert.ok(res.message);
    });

    await test('Delete certification succeeds', async () => {
      const res = await studentService.deleteCertification(studentUserA.id, createdCertId);
      assert.ok(res.message);
    });

    await test('Delete experience succeeds', async () => {
      const res = await studentService.deleteExperience(studentUserA.id, createdExpId);
      assert.ok(res.message);
    });

    await test('Delete achievement succeeds', async () => {
      const res = await studentService.deleteAchievement(studentUserA.id, createdAchId);
      assert.ok(res.message);
    });

    await test('Delete interest succeeds', async () => {
      const res = await studentService.deleteInterest(studentUserA.id, createdIntId);
      assert.ok(res.message);
    });

    await test('Delete language succeeds', async () => {
      const res = await studentService.deleteLanguage(studentUserA.id, createdLangId);
      assert.ok(res.message);
    });

  } finally {
    // Cleanup created test records in reverse order
    const profA = await StudentProfile.findOne({ where: { userId: studentUserA.id } });
    if (profA) {
      await Portfolio.destroy({ where: { studentId: profA.id } });
      await StudentProfile.destroy({ where: { id: profA.id } });
    }
    await testSkill.destroy();
    await studentUserA.destroy();
    await studentUserB.destroy();
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

runStudentTests().catch((err) => {
  console.error('Fatal student test error:', err);
  process.exit(1);
});
