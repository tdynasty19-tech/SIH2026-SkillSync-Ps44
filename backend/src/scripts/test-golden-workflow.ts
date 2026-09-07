import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicProgram } from '../models/academic-program.model';
import { AcademicBatch } from '../models/academic-batch.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { StudentAcademicEnrollment } from '../models/student-academic-enrollment.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { AcademicInstitutionAssociation } from '../models/academic-institution-association.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { Job } from '../models/job.model';
import { SkillCategory } from '../models/skill-category.model';
import { Skill } from '../models/skill.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';

import { authService } from '../services/auth.service';
import { studentService } from '../services/student.service';
import { institutionService } from '../services/institution.service';
import { assessmentService } from '../services/assessment.service';
import { skillGapService } from '../services/skill-gap.service';
import { careerService } from '../services/career.service';
import { matchingService } from '../services/matching.service';
import { applicationService } from '../services/application.service';
import { analyticsService } from '../services/analytics.service';
import { academicianService } from '../services/academician.service';

import { UserRole } from '../constants/roles';
import {
  StudentAffiliationStatus,
  DegreeLevel,
  EnrollmentStatus,
  StudentSkillLevel,
  AssessmentQuestionType,
  ApplicationStatus,
  OpportunityStatus,
  OpportunityType,
  WorkplaceType,
  EmploymentType,
} from '../constants/enums';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runGoldenWorkflow() {
  console.log('===============================================================');
  console.log('PHASE I — GOLDEN WORKFLOW END-TO-END VERIFICATION');
  console.log('===============================================================\n');

  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('GoldenPass123!', 10);

  // ----------------------------------------------------
  // 1. INSTITUTION & ACADEMIC HIERARCHY JOURNEY
  // ----------------------------------------------------
  console.log('--- 1. Institution & Academic Hierarchy Workflow ---');

  const instUser = await User.create({
    firstName: 'Golden',
    lastName: 'University',
    email: `golden.inst.${timestamp}@test.edu`,
    passwordHash,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });

  const instProfile = await InstitutionProfile.create({
    userId: instUser.id,
    institutionName: `Golden Tech Institute ${timestamp}`,
    institutionType: 'University',
    location: 'Bangalore, Karnataka',
    verified: true,
  });

  // Department
  const dept = await InstitutionDepartment.create({
    institutionId: instProfile.id,
    departmentName: 'Computer Science & AI',
    departmentCode: `CSAI-${timestamp}`,
  });
  assert(dept.institutionId === instProfile.id, 'Institution created Department');

  // Academic Program
  const program = await AcademicProgram.create({
    institutionId: instProfile.id,
    departmentId: dept.id,
    programName: 'B.Tech in Artificial Intelligence & Data Science',
    programCode: `BTECH-AIDS-${timestamp}`,
    degreeLevel: DegreeLevel.UNDERGRADUATE,
    durationYears: 4.0,
    totalSemesters: 8,
    isActive: true,
  });
  assert(program.departmentId === dept.id, 'Academic Program created under Department');

  // Academic Batch
  const batch = await AcademicBatch.create({
    institutionId: instProfile.id,
    departmentId: dept.id,
    programId: program.id,
    batchName: `Batch of 2023-2027`,
    startYear: 2023,
    endYear: 2027,
    currentSemester: 4,
    isActive: true,
  });
  assert(batch.programId === program.id, 'Academic Batch created under Program');

  // ----------------------------------------------------
  // 2. STUDENT REGISTRATION, AFFILIATION & ENROLLMENT
  // ----------------------------------------------------
  console.log('\n--- 2. Student Registration, Affiliation & Academic Context ---');

  const studentUser = await User.create({
    firstName: 'Rohan',
    lastName: 'Verma',
    email: `rohan.verma.${timestamp}@student.edu`,
    passwordHash,
    role: UserRole.STUDENT,
    isVerified: true,
    isActive: true,
  });

  const studentProfile = await StudentProfile.create({
    userId: studentUser.id,
    studentId: `STU-${timestamp}`,
    headline: 'AI/ML Enthusiast | Python | PyTorch',
    currentSemester: 4,
    cgpa: 9.1,
    careerGoal: 'AI Engineer',
  });

  // Affiliation
  const affiliation = await StudentInstitutionAffiliation.create({
    studentId: studentProfile.id,
    institutionId: instProfile.id,
    departmentId: dept.id,
    enrollmentNumber: `ENR-${timestamp}`,
    status: StudentAffiliationStatus.VERIFIED,
    requestedAt: new Date(),
    reviewedAt: new Date(),
    reviewedByUserId: instUser.id,
  });
  assert(affiliation.status === StudentAffiliationStatus.VERIFIED, 'Student affiliation is VERIFIED');

  // Enrollment
  const enrollment = await StudentAcademicEnrollment.create({
    studentId: studentProfile.id,
    institutionId: instProfile.id,
    departmentId: dept.id,
    programId: program.id,
    batchId: batch.id,
    enrollmentNumber: `ENR-${timestamp}`,
    rollNumber: `23AI001`,
    status: EnrollmentStatus.ACTIVE,
    currentSemester: 4,
    isCurrent: true,
    enrolledAt: new Date(),
  });
  assert(enrollment.batchId === batch.id, 'Student enrolled in Academic Batch');

  // Authoritative Academic Context
  const studentContext = await institutionService.getStudentAcademicContext(studentUser.id);
  assert(!!studentContext.activeEnrollment, 'Student retrieves authoritative active enrollment');
  assert(studentContext.activeEnrollment?.program?.id === program.id, 'Student academic context reflects correct Program');
  assert(studentContext.activeEnrollment?.batch?.id === batch.id, 'Student academic context reflects correct Batch');

  // ----------------------------------------------------
  // 3. SKILL, ASSESSMENT & DETERMINISTIC SKILL GAP
  // ----------------------------------------------------
  console.log('\n--- 3. Skill Intelligence, Assessment & Skill Gap Engine ---');

  const [category] = await SkillCategory.findOrCreate({
    where: { name: 'AI & Data Engineering' },
    defaults: { name: 'AI & Data Engineering' },
  });

  const skillPython = await Skill.create({
    categoryId: category.id,
    name: `Python Mastery ${timestamp}`,
    slug: `skill-py-${timestamp}`,
  });

  const skillPyTorch = await Skill.create({
    categoryId: category.id,
    name: `PyTorch & Deep Learning ${timestamp}`,
    slug: `skill-pt-${timestamp}`,
  });

  // Career Role & Requirements
  const careerRole = await CareerRole.create({
    title: `AI Research Engineer ${timestamp}`,
    slug: `ai-research-engineer-${timestamp}`,
  });

  await CareerRoleSkill.create({
    careerRoleId: careerRole.id,
    skillId: skillPython.id,
    requiredLevel: StudentSkillLevel.ADVANCED,
  });

  await CareerRoleSkill.create({
    careerRoleId: careerRole.id,
    skillId: skillPyTorch.id,
    requiredLevel: StudentSkillLevel.INTERMEDIATE,
  });

  // Student adds Career Interest
  await careerService.addCareerInterest(studentUser.id, {
    careerRoleId: careerRole.id,
    priorityOrder: 1,
  });

  // Skill Assessment Creation
  const assessment = await SkillAssessment.create({
    skillId: skillPython.id,
    title: `Python Diagnostics ${timestamp}`,
    difficulty: 'BEGINNER',
    passingScore: 70,
    totalQuestions: 1,
    durationMinutes: 15,
    isActive: true,
  });

  const question = await AssessmentQuestion.create({
    assessmentId: assessment.id,
    question: 'What is the output of list comprehension [x**2 for x in range(3)]?',
    questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
    options: ['[0, 1, 4]', '[1, 4, 9]', '[0, 1, 2]', '[1, 2, 3]'],
    correctAnswer: '[0, 1, 4]',
    points: 100,
    order: 1,
  });

  // Student Takes Assessment
  const startAttempt = await assessmentService.startAttempt(studentUser.id, assessment.id);
  assert(startAttempt.attempt.status === 'IN_PROGRESS', 'Student started assessment attempt');

  const submissionResult = await assessmentService.submitAttempt(studentUser.id, startAttempt.attempt.id, {
    answers: [
      {
        questionId: question.id,
        answer: '[0, 1, 4]',
      },
    ],
  });
  assert(submissionResult.score === 100, 'Assessment scored authoritatively (100%)');
  assert(submissionResult.passed === true, 'Assessment marked as PASSED');

  // Verify Trusted StudentSkill created
  const studentSkills = await studentService.getSkills(studentUser.id);
  const verifiedPythonSkill = studentSkills.skills.find((s) => s.skillId === skillPython.id);
  assert(!!verifiedPythonSkill && verifiedPythonSkill.verified === true, 'Trusted StudentSkill verified upon assessment pass');

  // Verify Skill Gaps calculated
  const gaps = await skillGapService.getStudentGaps(studentUser.id);
  assert(gaps.skillGaps.length >= 1, 'Deterministic Skill Gap engine identified remaining required skill gap');

  // ----------------------------------------------------
  // 4. INDUSTRY WORKFLOW: OPPORTUNITY, MATCH & APPLICATION
  // ----------------------------------------------------
  console.log('\n--- 4. Industry Opportunity, 50/20/10/10/10 Matching & Application ---');

  const industryUser = await User.create({
    firstName: 'Nova',
    lastName: 'AI Labs',
    email: `nova.ai.${timestamp}@industry.com`,
    passwordHash,
    role: UserRole.INDUSTRY,
    isVerified: true,
    isActive: true,
  });

  const industryProfile = await IndustryProfile.create({
    userId: industryUser.id,
    companyName: `Nova AI Systems ${timestamp}`,
    industryType: 'Artificial Intelligence',
    location: 'Bangalore, Karnataka',
    verified: true,
  });

  const job = await Job.create({
    industryId: industryProfile.id,
    title: `Junior AI Engineer ${timestamp}`,
    description: `Build cutting-edge distributed ML models in ${skillPython.name} and ${skillPyTorch.name}.`,
    employmentType: EmploymentType.FULL_TIME,
    workplaceType: WorkplaceType.HYBRID,
    location: 'Bangalore',
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Calculate Match Score
  const matchResult = await matchingService.calculateMatch(studentProfile.id, job.id, OpportunityType.JOB);
  assert(matchResult.matchScore >= 0 && matchResult.matchScore <= 100, 'Deterministic match score computed');
  assert(typeof matchResult.breakdown.skillMatch.score === 'number', '50% Skill Match component present');
  assert(typeof matchResult.breakdown.careerAlignment.score === 'number', '20% Career Alignment component present');

  // Student Submits Application
  const application = await applicationService.submitApplication(studentUser.id, {
    opportunityType: OpportunityType.JOB,
    opportunityId: job.id,
    coverLetter: 'I am passionate about AI and distributed ML systems.',
  });
  assert(application.status === ApplicationStatus.APPLIED, 'Application submitted with status APPLIED');

  // Prevent duplicate application
  let duplicateRejected = false;
  try {
    await applicationService.submitApplication(studentUser.id, {
      opportunityType: OpportunityType.JOB,
      opportunityId: job.id,
    });
  } catch (err: any) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'Duplicate application rejected with ConflictError');

  // Industry Status Transitions
  const indAuthUser = { id: industryUser.id, role: UserRole.INDUSTRY, email: industryUser.email } as any;

  const toReview = await applicationService.updateApplicationStatus(indAuthUser, application.id, {
    status: ApplicationStatus.UNDER_REVIEW,
  });
  assert(toReview.status === ApplicationStatus.UNDER_REVIEW, 'Transitioned to UNDER_REVIEW');

  const toShortlist = await applicationService.updateApplicationStatus(indAuthUser, application.id, {
    status: ApplicationStatus.SHORTLISTED,
  });
  assert(toShortlist.status === ApplicationStatus.SHORTLISTED, 'Transitioned to SHORTLISTED');

  const toInterview = await applicationService.updateApplicationStatus(indAuthUser, application.id, {
    status: ApplicationStatus.INTERVIEW,
  });
  assert(toInterview.status === ApplicationStatus.INTERVIEW, 'Transitioned to INTERVIEW');

  const toSelected = await applicationService.updateApplicationStatus(indAuthUser, application.id, {
    status: ApplicationStatus.SELECTED,
  });
  assert(toSelected.status === ApplicationStatus.SELECTED, 'Transitioned to SELECTED (Terminal State)');

  // ----------------------------------------------------
  // 5. ACADEMICIAN SCOPING & ISOLATION
  // ----------------------------------------------------
  console.log('\n--- 5. Academician Scoping & Department Boundary ---');

  const academicianUser = await User.create({
    firstName: 'Dr. Vikram',
    lastName: 'Sarabhai',
    email: `dr.vikram.${timestamp}@faculty.edu`,
    passwordHash,
    role: UserRole.ACADEMICIAN,
    isVerified: true,
    isActive: true,
  });

  const academicianProfile = await AcademicianProfile.create({
    userId: academicianUser.id,
    institutionId: instProfile.id,
    departmentId: dept.id,
    department: 'Computer Science & AI',
    designation: 'Professor',
    verified: true,
  });

  await AcademicInstitutionAssociation.create({
    academicianId: academicianProfile.id,
    institutionId: instProfile.id,
    designation: 'Professor',
    department: 'Computer Science & AI',
    startDate: new Date('2020-01-01'),
    isCurrent: true,
  });

  // Academician views dashboard with authorized students
  const acadDashboard = await analyticsService.getAcademicianDashboard(academicianUser.id);
  assert(
    acadDashboard.departmentStats.students.some((s: any) => s.id === studentProfile.id),
    'Academician sees student belonging to their verified institution & department'
  );

  // IDOR Protection: Academician from another institution cannot see this student
  const otherInstUser = await User.create({
    firstName: 'Other',
    lastName: 'Inst',
    email: `other.inst.${timestamp}@test.edu`,
    passwordHash,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });
  const otherInstProfile = await InstitutionProfile.create({
    userId: otherInstUser.id,
    institutionName: `Other University ${timestamp}`,
    institutionType: 'University',
    verified: true,
  });
  const otherDept = await InstitutionDepartment.create({
    institutionId: otherInstProfile.id,
    departmentName: 'Physics',
  });
  const otherAcademicianUser = await User.create({
    firstName: 'Other',
    lastName: 'Prof',
    email: `other.prof.${timestamp}@faculty.edu`,
    passwordHash,
    role: UserRole.ACADEMICIAN,
    isVerified: true,
    isActive: true,
  });
  const otherAcademicianProfile = await AcademicianProfile.create({
    userId: otherAcademicianUser.id,
    institutionId: otherInstProfile.id,
    departmentId: otherDept.id,
    department: 'Physics',
    designation: 'Associate Professor',
    verified: true,
  });
  await AcademicInstitutionAssociation.create({
    academicianId: otherAcademicianProfile.id,
    institutionId: otherInstProfile.id,
    designation: 'Associate Professor',
    department: 'Physics',
    startDate: new Date('2021-01-01'),
    isCurrent: true,
  });

  const otherDashboard = await analyticsService.getAcademicianDashboard(otherAcademicianUser.id);
  assert(
    !otherDashboard.departmentStats.students.some((s: any) => s.id === studentProfile.id),
    'CRITICAL SECURITY: Unrelated academician from another institution CANNOT view student'
  );

  console.log('\n===============================================================');
  console.log('GOLDEN WORKFLOW VERIFICATION COMPLETE: ALL 18 CORE STEPS PASSED');
  console.log('===============================================================\n');
}

if (require.main === module) {
  runGoldenWorkflow()
    .then(() => {
      sequelize.close().then(() => process.exit(0));
    })
    .catch((err) => {
      console.error('Golden workflow execution failed:', err);
      sequelize.close().then(() => process.exit(1));
    });
}
