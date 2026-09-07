import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { StudentEducation } from '../models/student-education.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentCertification } from '../models/student-certification.model';
import { StudentExperience } from '../models/student-experience.model';
import { StudentAchievement } from '../models/student-achievement.model';
import { SkillCategory } from '../models/skill-category.model';
import { Skill } from '../models/skill.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { AssessmentAnswer } from '../models/assessment-answer.model';
import { SkillGap } from '../models/skill-gap.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicProgram } from '../models/academic-program.model';
import { AcademicBatch } from '../models/academic-batch.model';
import { StudentAcademicEnrollment } from '../models/student-academic-enrollment.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { AcademicInstitutionAssociation } from '../models/academic-institution-association.model';
import { Job } from '../models/job.model';
import { LearningProgram } from '../models/learning-program.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioProject } from '../models/portfolio-project.model';
import { PortfolioCertification } from '../models/portfolio-certification.model';
import { PortfolioAchievement } from '../models/portfolio-achievement.model';
import { PortfolioExperience } from '../models/portfolio-experience.model';
import { Document } from '../models/document.model';
import { Mentor } from '../models/mentor.model';
import { MentorshipRequest } from '../models/mentorship-request.model';
import { MentorshipSession } from '../models/mentorship-session.model';
import { LearningRecommendation } from '../models/learning-recommendation.model';
import { OpportunityMatch } from '../models/opportunity-match.model';
import { Notification } from '../models/notification.model';
import { Placement } from '../models/placement.model';
import { PlacementRecord } from '../models/placement-record.model';
import { Collaboration } from '../models/collaboration.model';
import { Workshop } from '../models/workshop.model';

import { UserRole } from '../constants/roles';
import {
  StudentSkillLevel,
  SkillGapPriority,
  SkillGapStatus,
  ApplicationStatus,
  AssessmentQuestionType,
  AssessmentAttemptStatus,
  OpportunityStatus,
  WorkplaceType,
  EmploymentType,
  CollaborationType,
  CollaborationStatus,
  MentorshipStatus,
  StudentAffiliationStatus,
  DegreeLevel,
  EnrollmentStatus,
  DocumentAccessLevel,
  NotificationType,
} from '../constants/enums';
import { matchingService } from '../services/matching.service';
import { logger } from '../utils/logger';

/**
 * Phase 20: Comprehensive Deterministic SIH Demo Seeder
 * Authoritative Demo Scenario: Aarav Sharma (Student) -> Backend Developer
 */
export async function runDemoSeed() {
  // 1. Strict Production Guard
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL_SAFETY_VIOLATION: Demo seed execution is forbidden in production environment!');
  }

  logger.info('--- Starting Deterministic SIH Phase 20 Demo Seeding ---');

  // Common demo credentials - hashed with bcrypt
  const DEMO_PASSWORD_RAW = 'DemoPassword123!';
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD_RAW, 10);

  // ----------------------------------------------------
  // 1. SEED CORE DEMO USERS
  // ----------------------------------------------------
  const [studentUser] = await User.findOrCreate({
    where: { email: 'demo.student@sih.gov.in' },
    defaults: {
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'demo.student@sih.gov.in',
      passwordHash,
      role: UserRole.STUDENT,
      isVerified: true,
      isActive: true,
    },
  });

  const [industryUser] = await User.findOrCreate({
    where: { email: 'demo.industry@sih.gov.in' },
    defaults: {
      firstName: 'Rajesh',
      lastName: 'Varma',
      email: 'demo.industry@sih.gov.in',
      passwordHash,
      role: UserRole.INDUSTRY,
      isVerified: true,
      isActive: true,
    },
  });

  const [academicianUser] = await User.findOrCreate({
    where: { email: 'demo.academician@sih.gov.in' },
    defaults: {
      firstName: 'Dr. S.',
      lastName: 'Ramanujan',
      email: 'demo.academician@sih.gov.in',
      passwordHash,
      role: UserRole.ACADEMICIAN,
      isVerified: true,
      isActive: true,
    },
  });

  const [institutionUser] = await User.findOrCreate({
    where: { email: 'demo.institution@sih.gov.in' },
    defaults: {
      firstName: 'NITK',
      lastName: 'Surathkal',
      email: 'demo.institution@sih.gov.in',
      passwordHash,
      role: UserRole.INSTITUTION,
      isVerified: true,
      isActive: true,
    },
  });

  logger.info('  ✓ Demo users seeded (Student, Industry, Academician, Institution)');

  // ----------------------------------------------------
  // 2. SEED PROFILES & ORGANIZATIONS
  // ----------------------------------------------------
  // Student Profile
  const [studentProfile] = await StudentProfile.findOrCreate({
    where: { userId: studentUser.id },
    defaults: {
      userId: studentUser.id,
      studentId: 'NITK2023CS042',
      headline: 'Aspiring Backend Developer | Java | Node.js | SQL | Distributed Systems',
      bio: 'Pre-final year Computer Science Engineering student at NITK Surathkal with deep interest in backend architectures, microservices, and high-concurrency relational data systems.',
      location: 'Surathkal, Karnataka, India',
      city: 'Surathkal',
      state: 'Karnataka',
      country: 'India',
      collegeName: 'National Institute of Technology Karnataka',
      department: 'Computer Science & Engineering',
      course: 'B.Tech',
      specialization: 'Computer Science & Engineering',
      currentSemester: 6,
      graduationYear: 2026,
      cgpa: 8.85,
      careerGoal: 'Backend Developer',
      availabilityStatus: 'AVAILABLE',
      profileCompletion: 95,
    },
  });

  // Student Education
  await StudentEducation.findOrCreate({
    where: { studentId: studentProfile.id, institutionName: 'National Institute of Technology Karnataka (NITK)' },
    defaults: {
      studentId: studentProfile.id,
      institutionName: 'National Institute of Technology Karnataka (NITK)',
      degree: 'Bachelor of Technology (B.Tech)',
      fieldOfStudy: 'Computer Science & Engineering',
      startYear: 2022,
      endYear: 2026,
      grade: '8.85 CGPA',
      description: 'Relevant Coursework: Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, Distributed Computing.',
    },
  });

  // Industry Profile
  const [industryProfile] = await IndustryProfile.findOrCreate({
    where: { userId: industryUser.id },
    defaults: {
      userId: industryUser.id,
      companyName: 'Apex Cloud Systems',
      cin: 'U72200KA2018PTC112345',
      industryType: 'Cloud Infrastructure & Enterprise Software',
      websiteUrl: 'https://apexcloudsystems.demo',
      location: 'Bengaluru, Karnataka, India',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      description: 'Pioneering next-generation enterprise cloud platforms, distributed storage systems, and cloud-native microservices.',
      verified: true,
    },
  });

  // Institution Profile
  const [institutionProfile] = await InstitutionProfile.findOrCreate({
    where: { userId: institutionUser.id },
    defaults: {
      userId: institutionUser.id,
      institutionName: 'National Institute of Technology Karnataka',
      aisheCode: 'U-0237',
      institutionType: 'National Importance',
      affiliation: 'Ministry of Education, Government of India',
      accreditation: 'NAAC A++',
      websiteUrl: 'https://www.nitk.ac.in',
      location: 'Surathkal, Mangaluru, Karnataka',
      city: 'Surathkal',
      state: 'Karnataka',
      country: 'India',
      description: 'Premier national technological university focused on world-class technical education, interdisciplinary research, and academia-industry synergy.',
      verified: true,
    },
  });

  // Institution Department
  const [institutionDept] = await InstitutionDepartment.findOrCreate({
    where: { institutionId: institutionProfile.id, departmentName: 'Department of Computer Science & Engineering' },
    defaults: {
      institutionId: institutionProfile.id,
      departmentName: 'Department of Computer Science & Engineering',
      departmentCode: 'CSE',
      hodName: 'Dr. K. Chandrasekaran',
      email: 'hodcse@nitk.edu.in',
      phone: '+91-824-2474000',
    },
  });

  await studentProfile.update({
    institutionId: institutionProfile.id,
    departmentId: institutionDept.id,
  });

  await StudentInstitutionAffiliation.findOrCreate({
    where: {
      studentId: studentProfile.id,
      institutionId: institutionProfile.id,
    },
    defaults: {
      studentId: studentProfile.id,
      institutionId: institutionProfile.id,
      departmentId: institutionDept.id,
      enrollmentNumber: 'NITK2023CS042',
      status: StudentAffiliationStatus.VERIFIED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedByUserId: institutionUser.id,
    },
  });

  // Academic Program
  const [academicProgram] = await AcademicProgram.findOrCreate({
    where: {
      institutionId: institutionProfile.id,
      departmentId: institutionDept.id,
      programName: 'Bachelor of Technology in Computer Science and Engineering',
    },
    defaults: {
      institutionId: institutionProfile.id,
      departmentId: institutionDept.id,
      programName: 'Bachelor of Technology in Computer Science and Engineering',
      programCode: 'BTECH-CSE',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      durationYears: 4.0,
      totalSemesters: 8,
      description: 'Undergraduate flagship program in Computer Science and Engineering focusing on software engineering, cloud architecture, AI, and systems programming.',
      isActive: true,
    },
  });

  // Academic Batch
  const [academicBatch] = await AcademicBatch.findOrCreate({
    where: {
      programId: academicProgram.id,
      batchName: 'Batch of 2022-2026',
    },
    defaults: {
      institutionId: institutionProfile.id,
      departmentId: institutionDept.id,
      programId: academicProgram.id,
      batchName: 'Batch of 2022-2026',
      startYear: 2022,
      endYear: 2026,
      currentSemester: 6,
      isActive: true,
    },
  });

  // Student Academic Enrollment
  await StudentAcademicEnrollment.findOrCreate({
    where: {
      studentId: studentProfile.id,
      batchId: academicBatch.id,
    },
    defaults: {
      studentId: studentProfile.id,
      institutionId: institutionProfile.id,
      departmentId: institutionDept.id,
      programId: academicProgram.id,
      batchId: academicBatch.id,
      enrollmentNumber: 'NITK2023CS042',
      rollNumber: '22CS042',
      status: EnrollmentStatus.ACTIVE,
      currentSemester: 6,
      isCurrent: true,
      enrolledAt: new Date('2022-08-01'),
    },
  });

  // Academician Profile
  const [academicianProfile] = await AcademicianProfile.findOrCreate({
    where: { userId: academicianUser.id },
    defaults: {
      userId: academicianUser.id,
      institutionId: institutionProfile.id,
      departmentId: institutionDept.id,
      department: 'Department of Computer Science & Engineering',
      designation: 'Professor & Head of Distributed Systems Lab',
      qualification: 'Ph.D. in Computer Science (Distributed Systems)',
      specialization: 'Distributed Systems, Cloud Architecture, Scalable Databases',
      experienceYears: 18,
      bio: 'Senior researcher and academician with 18+ years experience guiding postgraduate scholars and architecting large-scale distributed computing systems.',
      researchInterests: 'Distributed Consensus, Cloud Native Systems, Database Optimization',
      verified: true,
    },
  });
  await academicianProfile.update({
    institutionId: institutionProfile.id,
    departmentId: institutionDept.id,
  });

  // Academician Association
  await AcademicInstitutionAssociation.findOrCreate({
    where: { academicianId: academicianProfile.id, institutionId: institutionProfile.id },
    defaults: {
      academicianId: academicianProfile.id,
      institutionId: institutionProfile.id,
      designation: 'Professor',
      department: 'Department of Computer Science & Engineering',
      startDate: new Date('2016-07-01'),
      isCurrent: true,
    },
  });

  logger.info('  ✓ Profiles seeded (Student, Industry, Institution, Academician)');

  // ----------------------------------------------------
  // 3. SEED SKILLS & CATEGORIES
  // ----------------------------------------------------
  const [techCategory] = await SkillCategory.findOrCreate({
    where: { name: 'Technical Skills' },
    defaults: {
      name: 'Technical Skills',
      description: 'Core programming languages, systems, and engineering frameworks',
    },
  });

  const skillDefinitions = [
    { name: 'Java', slug: 'java', description: 'Enterprise object-oriented language for high-performance backend systems' },
    { name: 'Node.js', slug: 'nodejs', description: 'Asynchronous event-driven JavaScript backend runtime' },
    { name: 'SQL', slug: 'sql', description: 'Relational database query language and performance optimization' },
    { name: 'Docker', slug: 'docker', description: 'Containerization and container image lifecycle management' },
    { name: 'AWS', slug: 'aws', description: 'Amazon Web Services cloud architecture and managed infrastructure' },
    { name: 'System Design', slug: 'system-design', description: 'Architecting resilient, distributed, scalable software systems' },
  ];

  const skillMap: Record<string, Skill> = {};
  for (const def of skillDefinitions) {
    const [s] = await Skill.findOrCreate({
      where: { slug: def.slug },
      defaults: {
        categoryId: techCategory.id,
        name: def.name,
        slug: def.slug,
        description: def.description,
        isActive: true,
      },
    });
    skillMap[def.name] = s;
  }

  logger.info('  ✓ Platform skills seeded (Java, Node.js, SQL, Docker, AWS, System Design)');

  // ----------------------------------------------------
  // 4. SEED AARAV'S STUDENT SKILLS
  // ----------------------------------------------------
  // Java: Advanced (score 88)
  // SQL: Advanced (score 91)
  // Node.js: Intermediate (score 78)
  // Docker: Beginner (score 35)
  // AWS: Beginner (score 30)
  // System Design: Beginner (score 40)
  const studentSkillsData = [
    { name: 'Java', level: StudentSkillLevel.ADVANCED, score: 88, verified: true },
    { name: 'SQL', level: StudentSkillLevel.ADVANCED, score: 91, verified: true },
    { name: 'Node.js', level: StudentSkillLevel.INTERMEDIATE, score: 78, verified: true },
    { name: 'Docker', level: StudentSkillLevel.BEGINNER, score: 35, verified: false },
    { name: 'AWS', level: StudentSkillLevel.BEGINNER, score: 30, verified: false },
    { name: 'System Design', level: StudentSkillLevel.BEGINNER, score: 40, verified: false },
  ];

  for (const item of studentSkillsData) {
    const skill = skillMap[item.name];
    if (skill) {
      await StudentSkill.findOrCreate({
        where: { studentId: studentProfile.id, skillId: skill.id },
        defaults: {
          studentId: studentProfile.id,
          skillId: skill.id,
          level: item.level,
          score: item.score,
          verified: item.verified,
          lastAssessedAt: item.verified ? new Date() : null,
        },
      });
    }
  }

  logger.info("  ✓ Aarav's verified skills seeded according to Master Prompt");

  // ----------------------------------------------------
  // 5. SEED ASSESSMENTS, QUESTIONS, ATTEMPTS & ANSWERS
  // ----------------------------------------------------
  // Java Assessment: 88%
  const [javaAssessment] = await SkillAssessment.findOrCreate({
    where: { skillId: skillMap['Java'].id },
    defaults: {
      skillId: skillMap['Java'].id,
      title: 'Java Backend & Concurrency Assessment',
      description: 'Assesses deep knowledge of JVM memory model, multi-threading, and Spring microservices',
      difficulty: 'Intermediate',
      durationMinutes: 30,
      passingScore: 70,
      totalQuestions: 5,
      isActive: true,
    },
  });

  const javaQuestionsData = [
    {
      question: 'Which memory area in the JVM is shared across all concurrent application threads?',
      options: { A: 'Heap Memory', B: 'Thread Stack', C: 'Program Counter', D: 'Native Stack' },
      correctAnswer: 'A',
      points: 22,
    },
    {
      question: 'Which collection implementation guarantees concurrent thread-safety without external synchronization?',
      options: { A: 'ArrayList', B: 'ConcurrentHashMap', C: 'HashMap', D: 'TreeMap' },
      correctAnswer: 'B',
      points: 22,
    },
    {
      question: 'What happens when an unhandled exception occurs inside a thread submitted via ExecutorService.submit()?',
      options: { A: 'JVM halts', B: 'Logged to stderr', C: 'Captured inside Future.get() as ExecutionException', D: 'Thread silently restarts' },
      correctAnswer: 'C',
      points: 22,
    },
    {
      question: 'Which annotation enables declarative Spring database transaction management?',
      options: { A: '@Transactional', B: '@Transact', C: '@Atomic', D: '@EnableTransaction' },
      correctAnswer: 'A',
      points: 22,
    },
    {
      question: 'Which garbage collection algorithm is standard and default in modern OpenJDK 17 LTS?',
      options: { A: 'Serial GC', B: 'Parallel GC', C: 'Concurrent Mark Sweep', D: 'G1 Garbage Collector' },
      correctAnswer: 'D',
      points: 12,
    },
  ];

  const javaQuestions: AssessmentQuestion[] = [];
  for (let i = 0; i < javaQuestionsData.length; i++) {
    const qData = javaQuestionsData[i];
    const [q] = await AssessmentQuestion.findOrCreate({
      where: { assessmentId: javaAssessment.id, order: i + 1 },
      defaults: {
        assessmentId: javaAssessment.id,
        question: qData.question,
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        points: qData.points,
        order: i + 1,
      },
    });
    javaQuestions.push(q);
  }

  // Seed Java Attempt & Answers (Score: 22+22+22+22 + 0 = 88 / 100 = 88%)
  const [javaAttempt] = await AssessmentAttempt.findOrCreate({
    where: { assessmentId: javaAssessment.id, studentId: studentProfile.id },
    defaults: {
      assessmentId: javaAssessment.id,
      studentId: studentProfile.id,
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      score: 88,
      percentage: 88,
      status: AssessmentAttemptStatus.COMPLETED,
    },
  });

  const javaSubmittedAnswers = ['A', 'B', 'C', 'A', 'B']; // Last one incorrect (D is correct)
  for (let i = 0; i < javaQuestions.length; i++) {
    const q = javaQuestions[i];
    const answerGiven = javaSubmittedAnswers[i];
    const isCorrect = answerGiven === q.correctAnswer;
    const pointsEarned = isCorrect ? q.points : 0;

    await AssessmentAnswer.findOrCreate({
      where: { attemptId: javaAttempt.id, questionId: q.id },
      defaults: {
        attemptId: javaAttempt.id,
        questionId: q.id,
        answer: answerGiven,
        isCorrect,
        pointsEarned,
      },
    });
  }

  // SQL Assessment: 91%
  const [sqlAssessment] = await SkillAssessment.findOrCreate({
    where: { skillId: skillMap['SQL'].id },
    defaults: {
      skillId: skillMap['SQL'].id,
      title: 'Relational Database Architecture & SQL Optimization Assessment',
      description: 'Evaluates relational indexing, transaction isolation levels, and complex query performance',
      difficulty: 'Intermediate',
      durationMinutes: 30,
      passingScore: 70,
      totalQuestions: 4,
      isActive: true,
    },
  });

  const sqlQuestionsData = [
    {
      question: 'Which index structure provides O(log n) lookups and optimal performance for range queries?',
      options: { A: 'B-Tree Index', B: 'Hash Index', C: 'Bitmap Index', D: 'GIN Index' },
      correctAnswer: 'A',
      points: 30,
    },
    {
      question: 'Which standard ANSI SQL isolation level prevents both Non-Repeatable Reads and Phantom Reads?',
      options: { A: 'Read Committed', B: 'Serializable', C: 'Repeatable Read', D: 'Read Uncommitted' },
      correctAnswer: 'B',
      points: 30,
    },
    {
      question: 'In standard SQL query execution order, which clause is executed immediately after GROUP BY?',
      options: { A: 'WHERE', B: 'SELECT', C: 'HAVING', D: 'ORDER BY' },
      correctAnswer: 'C',
      points: 31,
    },
    {
      question: 'Which command provides actual execution times and rows scanned in MySQL 8 / PostgreSQL?',
      options: { A: 'EXPLAIN COST', B: 'SHOW PROFILE', C: 'ANALYZE TABLE', D: 'EXPLAIN ANALYZE' },
      correctAnswer: 'D',
      points: 9,
    },
  ];

  const sqlQuestions: AssessmentQuestion[] = [];
  for (let i = 0; i < sqlQuestionsData.length; i++) {
    const qData = sqlQuestionsData[i];
    const [q] = await AssessmentQuestion.findOrCreate({
      where: { assessmentId: sqlAssessment.id, order: i + 1 },
      defaults: {
        assessmentId: sqlAssessment.id,
        question: qData.question,
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        points: qData.points,
        order: i + 1,
      },
    });
    sqlQuestions.push(q);
  }

  // Seed SQL Attempt & Answers (Score: 30+30+31 + 0 = 91 / 100 = 91%)
  const [sqlAttempt] = await AssessmentAttempt.findOrCreate({
    where: { assessmentId: sqlAssessment.id, studentId: studentProfile.id },
    defaults: {
      assessmentId: sqlAssessment.id,
      studentId: studentProfile.id,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      score: 91,
      percentage: 91,
      status: AssessmentAttemptStatus.COMPLETED,
    },
  });

  const sqlSubmittedAnswers = ['A', 'B', 'C', 'A']; // Last one incorrect (D is correct)
  for (let i = 0; i < sqlQuestions.length; i++) {
    const q = sqlQuestions[i];
    const answerGiven = sqlSubmittedAnswers[i];
    const isCorrect = answerGiven === q.correctAnswer;
    const pointsEarned = isCorrect ? q.points : 0;

    await AssessmentAnswer.findOrCreate({
      where: { attemptId: sqlAttempt.id, questionId: q.id },
      defaults: {
        attemptId: sqlAttempt.id,
        questionId: q.id,
        answer: answerGiven,
        isCorrect,
        pointsEarned,
      },
    });
  }

  // Node.js Assessment: 78%
  const [nodeAssessment] = await SkillAssessment.findOrCreate({
    where: { skillId: skillMap['Node.js'].id },
    defaults: {
      skillId: skillMap['Node.js'].id,
      title: 'Node.js Asynchronous Runtime & Microservices Assessment',
      description: 'Assesses understanding of the Libuv event loop, asynchronous non-blocking I/O, and streams',
      difficulty: 'Intermediate',
      durationMinutes: 30,
      passingScore: 70,
      totalQuestions: 4,
      isActive: true,
    },
  });

  const nodeQuestionsData = [
    {
      question: 'In which Libuv event loop phase are setImmediate() callbacks executed?',
      options: { A: 'Check phase', B: 'Timers phase', C: 'Poll phase', D: 'Close phase' },
      correctAnswer: 'A',
      points: 26,
    },
    {
      question: 'Which native Node.js core module allows multi-threaded CPU-heavy computations on shared memory?',
      options: { A: 'cluster', B: 'worker_threads', C: 'child_process', D: 'events' },
      correctAnswer: 'B',
      points: 26,
    },
    {
      question: 'When is the process.nextTick() queue drained relative to the Libuv event loop phases?',
      options: { A: 'After next timer', B: 'After I/O poll', C: 'Immediately after current operation completes before continuing', D: 'At loop idle' },
      correctAnswer: 'C',
      points: 26,
    },
    {
      question: 'Which HTTP content-type header is required for Server-Sent Events (SSE)?',
      options: { A: 'application/json', B: 'multipart/form-data', C: 'application/octet-stream', D: 'text/event-stream' },
      correctAnswer: 'D',
      points: 22,
    },
  ];

  const nodeQuestions: AssessmentQuestion[] = [];
  for (let i = 0; i < nodeQuestionsData.length; i++) {
    const qData = nodeQuestionsData[i];
    const [q] = await AssessmentQuestion.findOrCreate({
      where: { assessmentId: nodeAssessment.id, order: i + 1 },
      defaults: {
        assessmentId: nodeAssessment.id,
        question: qData.question,
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        points: qData.points,
        order: i + 1,
      },
    });
    nodeQuestions.push(q);
  }

  // Seed Node.js Attempt & Answers (Score: 26+26+26 + 0 = 78 / 100 = 78%)
  const [nodeAttempt] = await AssessmentAttempt.findOrCreate({
    where: { assessmentId: nodeAssessment.id, studentId: studentProfile.id },
    defaults: {
      assessmentId: nodeAssessment.id,
      studentId: studentProfile.id,
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      score: 78,
      percentage: 78,
      status: AssessmentAttemptStatus.COMPLETED,
    },
  });

  const nodeSubmittedAnswers = ['A', 'B', 'C', 'A']; // Last one incorrect (D is correct)
  for (let i = 0; i < nodeQuestions.length; i++) {
    const q = nodeQuestions[i];
    const answerGiven = nodeSubmittedAnswers[i];
    const isCorrect = answerGiven === q.correctAnswer;
    const pointsEarned = isCorrect ? q.points : 0;

    await AssessmentAnswer.findOrCreate({
      where: { attemptId: nodeAttempt.id, questionId: q.id },
      defaults: {
        attemptId: nodeAttempt.id,
        questionId: q.id,
        answer: answerGiven,
        isCorrect,
        pointsEarned,
      },
    });
  }

  logger.info('  ✓ Assessments and verified score attempts seeded: Java (88%), SQL (91%), Node.js (78%)');

  // ----------------------------------------------------
  // 6. SEED CAREER ROLE & ROLE SKILLS
  // ----------------------------------------------------
  const [backendRole] = await CareerRole.findOrCreate({
    where: { slug: 'backend-developer' },
    defaults: {
      title: 'Backend Developer',
      slug: 'backend-developer',
      description: 'Designs, implements, and optimizes scalable server-side microservices, distributed data pipelines, and robust APIs.',
    },
  });

  const roleSkillsData = [
    { skillName: 'Java', requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.2 },
    { skillName: 'SQL', requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.2 },
    { skillName: 'Node.js', requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.0 },
    { skillName: 'Docker', requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.0 },
    { skillName: 'AWS', requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.0 },
    { skillName: 'System Design', requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.0 },
  ];

  for (const item of roleSkillsData) {
    const skill = skillMap[item.skillName];
    if (skill) {
      await CareerRoleSkill.findOrCreate({
        where: { careerRoleId: backendRole.id, skillId: skill.id },
        defaults: {
          careerRoleId: backendRole.id,
          skillId: skill.id,
          requiredLevel: item.requiredLevel,
          importanceWeight: item.importanceWeight,
        },
      });
    }
  }

  // Aarav Career Interest
  await StudentCareerInterest.findOrCreate({
    where: { studentId: studentProfile.id, careerRoleId: backendRole.id },
    defaults: {
      studentId: studentProfile.id,
      careerRoleId: backendRole.id,
      priorityOrder: 1,
    },
  });

  logger.info('  ✓ Target Career Role seeded: Backend Developer');

  // ----------------------------------------------------
  // 7. SEED AUTHORITATIVE SKILL GAPS
  // ----------------------------------------------------
  // Master Prompt:
  // Docker        → High
  // AWS           → High
  // System Design → Medium
  const skillGapsData = [
    {
      skillName: 'Docker',
      currentLevel: StudentSkillLevel.BEGINNER,
      requiredLevel: StudentSkillLevel.ADVANCED,
      currentScore: 35,
      requiredScore: 75,
      gapScore: 40,
      priority: SkillGapPriority.HIGH,
    },
    {
      skillName: 'AWS',
      currentLevel: StudentSkillLevel.BEGINNER,
      requiredLevel: StudentSkillLevel.ADVANCED,
      currentScore: 30,
      requiredScore: 75,
      gapScore: 45,
      priority: SkillGapPriority.HIGH,
    },
    {
      skillName: 'System Design',
      currentLevel: StudentSkillLevel.BEGINNER,
      requiredLevel: StudentSkillLevel.INTERMEDIATE,
      currentScore: 40,
      requiredScore: 50,
      gapScore: 10,
      priority: SkillGapPriority.MEDIUM,
    },
  ];

  for (const gap of skillGapsData) {
    const skill = skillMap[gap.skillName];
    if (skill) {
      await SkillGap.findOrCreate({
        where: { studentId: studentProfile.id, skillId: skill.id },
        defaults: {
          studentId: studentProfile.id,
          skillId: skill.id,
          targetRoleId: backendRole.id,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          currentScore: gap.currentScore,
          requiredScore: gap.requiredScore,
          gapScore: gap.gapScore,
          priority: gap.priority,
          status: SkillGapStatus.OPEN,
        },
      });
    }
  }

  logger.info('  ✓ Authoritative Skill Gaps seeded: Docker (High), AWS (High), System Design (Medium)');

  // ----------------------------------------------------
  // 8. SEED OPPORTUNITIES (JOBS & LEARNING)
  // ----------------------------------------------------
  // Primary Recommended Opportunity: Backend Engineering Intern (Apex Cloud Systems)
  const [backendInternship] = await Job.findOrCreate({
    where: { industryId: industryProfile.id, title: 'Backend Engineering Intern' },
    defaults: {
      industryId: industryProfile.id,
      title: 'Backend Engineering Intern',
      description: 'Apex Cloud Systems is seeking a talented Backend Engineering Intern to develop scalable distributed microservices, design low-latency APIs, and optimize SQL databases using Java and Node.js.',
      requirements: 'Strong proficiency in Java, Node.js, and SQL. Familiarity with cloud concepts and containerization is a plus.',
      location: 'Bengaluru / Remote',
      city: 'Bengaluru',
      state: 'Karnataka',
      workplaceType: WorkplaceType.REMOTE,
      employmentType: EmploymentType.INTERNSHIP,
      salaryMin: 45000,
      salaryMax: 60000,
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      openings: 5,
      status: OpportunityStatus.OPEN,
    },
  });

  // Supporting opportunity: Senior Cloud Architect
  const [cloudArchitectJob] = await Job.findOrCreate({
    where: { industryId: industryProfile.id, title: 'Senior Cloud Microservices Architect' },
    defaults: {
      industryId: industryProfile.id,
      title: 'Senior Cloud Microservices Architect',
      description: 'Lead enterprise architecture initiatives across distributed multi-region cloud infrastructures using AWS, Docker, and Kubernetes.',
      requirements: 'Deep expertise in AWS, Docker, Kubernetes, and high-concurrency distributed backend systems.',
      location: 'Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      workplaceType: WorkplaceType.HYBRID,
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 1800000,
      salaryMax: 2800000,
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      openings: 2,
      status: OpportunityStatus.OPEN,
    },
  });

  // Learning Programs
  const [dockerLearningProgram] = await LearningProgram.findOrCreate({
    where: { title: 'Cloud Native Microservices with Docker & Kubernetes' },
    defaults: {
      industryId: industryProfile.id,
      institutionId: institutionProfile.id,
      title: 'Cloud Native Microservices with Docker & Kubernetes',
      description: 'Master containerization, Docker multi-stage builds, container networking, and Kubernetes pod orchestration.',
      curriculum: 'Module 1: Docker Basics, Module 2: Multi-stage Dockerfiles, Module 3: Docker Compose, Module 4: Kubernetes Deployments.',
      durationHours: 40,
      mode: 'Online',
      cost: 0,
      status: OpportunityStatus.OPEN,
    },
  });

  await LearningProgram.findOrCreate({
    where: { title: 'AWS Certified Developer Associate Accelerator' },
    defaults: {
      industryId: industryProfile.id,
      institutionId: institutionProfile.id,
      title: 'AWS Certified Developer Associate Accelerator',
      description: 'Hands-on guided roadmap covering AWS core services: EC2, S3, RDS, DynamoDB, Lambda, API Gateway, and CloudWatch.',
      curriculum: 'Comprehensive coverage of AWS compute, serverless architectures, IAM security policies, and CI/CD pipelines.',
      durationHours: 50,
      mode: 'Hybrid',
      cost: 0,
      status: OpportunityStatus.OPEN,
    },
  });

  logger.info('  ✓ Opportunities seeded: Backend Engineering Intern, Senior Cloud Architect, Learning Programs');

  // ----------------------------------------------------
  // 9. SEED APPLICATIONS & STATUS HISTORY
  // ----------------------------------------------------
  // Application 1: Backend Engineering Intern -> SHORTLISTED (Consistent history)
  const [app1] = await Application.findOrCreate({
    where: { studentId: studentProfile.id, opportunityId: backendInternship.id, opportunityType: 'JOB' },
    defaults: {
      studentId: studentProfile.id,
      opportunityId: backendInternship.id,
      opportunityType: 'JOB',
      status: ApplicationStatus.SHORTLISTED,
      matchScore: 91,
      coverLetter: 'I am passionate about backend architecture and distributed systems. Having scored 88% in Java and 91% in SQL on verified platform assessments, I am excited to contribute to Apex Cloud Systems.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed valid status progression: APPLIED -> UNDER_REVIEW -> SHORTLISTED
  await ApplicationStatusHistory.findOrCreate({
    where: { applicationId: app1.id, toStatus: ApplicationStatus.APPLIED },
    defaults: {
      applicationId: app1.id,
      fromStatus: null,
      toStatus: ApplicationStatus.APPLIED,
      changedByUserId: studentUser.id,
      reason: 'Application submitted successfully',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await ApplicationStatusHistory.findOrCreate({
    where: { applicationId: app1.id, toStatus: ApplicationStatus.UNDER_REVIEW },
    defaults: {
      applicationId: app1.id,
      fromStatus: ApplicationStatus.APPLIED,
      toStatus: ApplicationStatus.UNDER_REVIEW,
      changedByUserId: industryUser.id,
      reason: 'Candidate profile and assessment scores under review by engineering team',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await ApplicationStatusHistory.findOrCreate({
    where: { applicationId: app1.id, toStatus: ApplicationStatus.SHORTLISTED },
    defaults: {
      applicationId: app1.id,
      fromStatus: ApplicationStatus.UNDER_REVIEW,
      toStatus: ApplicationStatus.SHORTLISTED,
      changedByUserId: industryUser.id,
      reason: 'Shortlisted based on exceptional Java (88%) & SQL (91%) assessment scores and strong backend profile',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Application 2: Cloud Architect -> UNDER_REVIEW
  const [app2] = await Application.findOrCreate({
    where: { studentId: studentProfile.id, opportunityId: cloudArchitectJob.id, opportunityType: 'JOB' },
    defaults: {
      studentId: studentProfile.id,
      opportunityId: cloudArchitectJob.id,
      opportunityType: 'JOB',
      status: ApplicationStatus.UNDER_REVIEW,
      matchScore: 72,
      coverLetter: 'Interested in cloud infrastructure and expanding my experience in distributed microservices.',
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await ApplicationStatusHistory.findOrCreate({
    where: { applicationId: app2.id, toStatus: ApplicationStatus.APPLIED },
    defaults: {
      applicationId: app2.id,
      fromStatus: null,
      toStatus: ApplicationStatus.APPLIED,
      changedByUserId: studentUser.id,
      reason: 'Candidate application received',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await ApplicationStatusHistory.findOrCreate({
    where: { applicationId: app2.id, toStatus: ApplicationStatus.UNDER_REVIEW },
    defaults: {
      applicationId: app2.id,
      fromStatus: ApplicationStatus.APPLIED,
      toStatus: ApplicationStatus.UNDER_REVIEW,
      changedByUserId: industryUser.id,
      reason: 'Initial profile screening in progress',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  logger.info('  ✓ Applications and deterministic status histories seeded');

  // ----------------------------------------------------
  // 10. SEED PORTFOLIO, PROJECTS, CERTS, ACHIEVEMENTS & EXPERIENCE
  // ----------------------------------------------------
  // Student Experience
  await StudentExperience.findOrCreate({
    where: { studentId: studentProfile.id, companyName: 'CloudScale Labs' },
    defaults: {
      studentId: studentProfile.id,
      title: 'Backend Development Intern',
      companyName: 'CloudScale Labs',
      location: 'Bengaluru (Remote)',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-11-30'),
      isCurrent: false,
      description: 'Engineered high-throughput RESTful microservices in Java Spring Boot and Node.js. Optimized PostgreSQL queries reducing p99 latency by 35%.',
    },
  });

  // Student Certification
  await StudentCertification.findOrCreate({
    where: { studentId: studentProfile.id, title: 'Oracle Certified Professional: Java SE 17 Developer' },
    defaults: {
      studentId: studentProfile.id,
      title: 'Oracle Certified Professional: Java SE 17 Developer',
      issuingOrganization: 'Oracle',
      issueDate: new Date('2024-03-15'),
      credentialId: 'OCP-JAVA-89421',
      credentialUrl: 'https://verify.oracle.demo/cert/OCP-JAVA-89421',
    },
  });

  // Student Achievement
  await StudentAchievement.findOrCreate({
    where: { studentId: studentProfile.id, title: '1st Place - National Cloud Innovation Hackathon 2025' },
    defaults: {
      studentId: studentProfile.id,
      title: '1st Place - National Cloud Innovation Hackathon 2025',
      description: 'Engineered an auto-scaling distributed queue broker handling 50k events/sec across simulated cluster nodes.',
      date: new Date('2025-01-20'),
      awardUrl: 'https://hackathon.demo/awards/2025/first-place',
    },
  });

  // Portfolio
  const [portfolio] = await Portfolio.findOrCreate({
    where: { studentId: studentProfile.id },
    defaults: {
      studentId: studentProfile.id,
      theme: 'modern',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // Portfolio Projects
  const portfolioProjects = [
    {
      title: 'High-Throughput Distributed Cache System',
      description: 'A distributed in-memory cache system built using Java and Raft consensus, featuring TTL eviction, consistent hashing, and asynchronous disk snapshotting.',
      role: 'Lead Backend Engineer',
      technologies: 'Java, Raft, Netty, Redis',
      projectUrl: 'https://demo.portfolio.sih.gov.in/cache-system',
      githubUrl: 'https://github.com/demo/distributed-cache',
      order: 1,
    },
    {
      title: 'Real-Time Event Notification Broker',
      description: 'Scalable notification delivery microservice built in Node.js and SQL with Redis pub/sub handling push and email notifications with strict idempotency.',
      role: 'Backend Developer',
      technologies: 'Node.js, Express, PostgreSQL, Redis, Docker',
      projectUrl: 'https://demo.portfolio.sih.gov.in/notify-engine',
      githubUrl: 'https://github.com/demo/notify-engine',
      order: 2,
    },
    {
      title: 'Cloud Infrastructure Automation Pipeline',
      description: 'Infrastructure as Code deployment blueprints for containerized microservices across AWS with monitoring and alerts.',
      role: 'DevOps & Backend Engineer',
      technologies: 'Docker, AWS ECS, Terraform, GitHub Actions',
      order: 3,
    },
  ];

  for (const proj of portfolioProjects) {
    await PortfolioProject.findOrCreate({
      where: { portfolioId: portfolio.id, title: proj.title },
      defaults: {
        portfolioId: portfolio.id,
        title: proj.title,
        description: proj.description,
        role: proj.role,
        technologies: proj.technologies,
        projectUrl: proj.projectUrl,
        githubUrl: proj.githubUrl,
        order: proj.order,
      },
    });
  }

  // Portfolio Certification
  await PortfolioCertification.findOrCreate({
    where: { portfolioId: portfolio.id, title: 'Oracle Certified Professional: Java SE 17 Developer' },
    defaults: {
      portfolioId: portfolio.id,
      title: 'Oracle Certified Professional: Java SE 17 Developer',
      issuer: 'Oracle University',
      issueDate: new Date('2024-03-15'),
      credentialUrl: 'https://verify.oracle.demo/cert/OCP-JAVA-89421',
      order: 1,
    },
  });

  // Portfolio Achievement
  await PortfolioAchievement.findOrCreate({
    where: { portfolioId: portfolio.id, title: 'National Cloud Innovation Hackathon Winner' },
    defaults: {
      portfolioId: portfolio.id,
      title: 'National Cloud Innovation Hackathon Winner',
      description: 'Ranked 1st among 350 university teams nationwide for scalable distributed systems design.',
      date: new Date('2025-01-20'),
      order: 1,
    },
  });

  // Portfolio Experience
  await PortfolioExperience.findOrCreate({
    where: { portfolioId: portfolio.id, title: 'Backend Development Intern' },
    defaults: {
      portfolioId: portfolio.id,
      title: 'Backend Development Intern',
      organization: 'CloudScale Labs',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-11-30'),
      description: 'Engineered microservices and relational database query optimization.',
      order: 1,
    },
  });

  // Fictional Demo Document (Resume)
  await Document.findOrCreate({
    where: { ownerUserId: studentUser.id, fileName: 'Aarav_Sharma_Resume.pdf' },
    defaults: {
      ownerUserId: studentUser.id,
      fileName: 'Aarav_Sharma_Resume.pdf',
      fileUrl: '/uploads/demo/Aarav_Sharma_Resume.pdf',
      fileType: 'application/pdf',
      fileSizeBytes: 245760,
      accessLevel: DocumentAccessLevel.PUBLIC,
    },
  });

  logger.info("  ✓ Aarav's portfolio, projects, certifications, achievements, experience, and demo document seeded");

  // ----------------------------------------------------
  // 11. SEED MENTORSHIP
  // ----------------------------------------------------
  const [mentor] = await Mentor.findOrCreate({
    where: { userId: academicianUser.id },
    defaults: {
      userId: academicianUser.id,
      expertiseAreas: 'Distributed Systems, High-Concurrency Backends, Cloud Architecture',
      maxMentees: 5,
      currentMentees: 1,
      isAvailable: true,
    },
  });

  const [mentorshipReq] = await MentorshipRequest.findOrCreate({
    where: { mentorId: mentor.id, studentId: studentProfile.id },
    defaults: {
      mentorId: mentor.id,
      studentId: studentProfile.id,
      goals: 'Guidance on high-concurrency distributed backend systems, microservices resiliency, and closing Docker/AWS skill gaps.',
      message: 'Dear Professor Ramanujan, I would greatly appreciate your mentorship to strengthen my understanding of distributed backend architectures.',
      status: MentorshipStatus.ACCEPTED,
      requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  await MentorshipSession.findOrCreate({
    where: { mentorshipRequestId: mentorshipReq.id },
    defaults: {
      mentorshipRequestId: mentorshipReq.id,
      sessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      startTime: '16:00',
      durationMinutes: 45,
      meetingLink: 'https://meet.sih.gov.in/demo/mentor-session-ramanujan-aarav',
      notes: 'Reviewed CAP theorem trade-offs, partitioned databases, and containerization best practices with Docker.',
      isCompleted: true,
    },
  });

  logger.info('  ✓ Mentorship seeded (Mentor Dr. Ramanujan, Request ACCEPTED, Session Completed)');

  // ----------------------------------------------------
  // 12. SEED LEARNING RECOMMENDATIONS
  // ----------------------------------------------------
  const learningRecs = [
    {
      skillName: 'Docker',
      title: 'Docker Containerization Deep Dive for Backend Engineers',
      resourceUrl: 'https://learn.sih.gov.in/courses/docker-deep-dive',
      provider: 'SIH Learning Hub',
      duration: '20 Hours',
      priority: SkillGapPriority.HIGH,
    },
    {
      skillName: 'AWS',
      title: 'AWS Cloud Practitioner & Developer Associate Roadmap',
      resourceUrl: 'https://learn.sih.gov.in/courses/aws-cloud-essentials',
      provider: 'SIH Learning Hub',
      duration: '30 Hours',
      priority: SkillGapPriority.HIGH,
    },
    {
      skillName: 'System Design',
      title: 'Large-Scale Distributed Systems & Database Architecture',
      resourceUrl: 'https://learn.sih.gov.in/courses/system-design',
      provider: 'SIH Learning Hub',
      duration: '25 Hours',
      priority: SkillGapPriority.MEDIUM,
    },
  ];

  for (const rec of learningRecs) {
    const skill = skillMap[rec.skillName];
    if (skill) {
      await LearningRecommendation.findOrCreate({
        where: { studentId: studentProfile.id, skillId: skill.id },
        defaults: {
          studentId: studentProfile.id,
          skillId: skill.id,
          title: rec.title,
          resourceUrl: rec.resourceUrl,
          provider: rec.provider,
          duration: rec.duration,
          cost: 0,
          priority: rec.priority,
        },
      });
    }
  }

  logger.info('  ✓ Learning recommendations seeded for identified skill gaps');

  // ----------------------------------------------------
  // 13. SEED NOTIFICATIONS (Covering Master Prompt Types)
  // ----------------------------------------------------
  const notificationsData = [
    {
      type: NotificationType.APPLICATION_SUBMITTED,
      title: 'Application Submitted',
      message: 'Your application for Backend Engineering Intern at Apex Cloud Systems has been submitted.',
      isRead: true,
    },
    {
      type: NotificationType.SHORTLISTED,
      title: 'Profile Shortlisted!',
      message: 'Congratulations! Apex Cloud Systems shortlisted your profile for Backend Engineering Intern.',
      isRead: true,
    },
    {
      type: NotificationType.STUDENT_SELECTED,
      title: 'Application Status Update: Shortlisted',
      message: 'You have been shortlisted for the final interview round at Apex Cloud Systems.',
      isRead: false,
    },
    {
      type: NotificationType.SKILL_GAP_DETECTED,
      title: 'Skill Gap Detected',
      message: 'Skill gap identified in Docker and AWS for your target role Backend Developer.',
      isRead: false,
    },
    {
      type: NotificationType.LEARNING_RECOMMENDATION,
      title: 'New Learning Recommendation',
      message: 'Course recommended: "Cloud Native Microservices with Docker & Kubernetes" to address Docker gap.',
      isRead: false,
    },
    {
      type: NotificationType.MENTORSHIP_ACCEPTED,
      title: 'Mentorship Request Accepted',
      message: 'Dr. S. Ramanujan accepted your mentorship request. Your upcoming session has been scheduled.',
      isRead: true,
    },
    {
      type: NotificationType.NEW_OPPORTUNITY,
      title: 'New Opportunity Match: 91%',
      message: 'Apex Cloud Systems posted "Backend Engineering Intern" which strongly matches your backend skillset.',
      isRead: false,
    },
  ];

  for (const n of notificationsData) {
    await Notification.findOrCreate({
      where: { userId: studentUser.id, type: n.type, title: n.title },
      defaults: {
        userId: studentUser.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        readAt: n.isRead ? new Date() : null,
      },
    });
  }

  logger.info('  ✓ Authoritative notification stream seeded (7 Master Prompt notification types)');

  // ----------------------------------------------------
  // 14. SEED INSTITUTION PLACEMENTS & COLLABORATIONS
  // ----------------------------------------------------
  const [placement] = await Placement.findOrCreate({
    where: { institutionId: institutionProfile.id, academicYear: '2024-2025' },
    defaults: {
      institutionId: institutionProfile.id,
      academicYear: '2024-2025',
      totalStudents: 450,
      placedStudents: 418,
      higherStudiesStudents: 22,
      entrepreneurshipStudents: 10,
      averageSalary: 1520000,
      highestSalary: 5200000,
      medianSalary: 1350000,
    },
  });

  await PlacementRecord.findOrCreate({
    where: { placementId: placement.id, studentId: studentProfile.id },
    defaults: {
      placementId: placement.id,
      studentId: studentProfile.id,
      companyName: 'Apex Cloud Systems',
      roleOffered: 'Backend Engineering Intern',
      packageOffered: 600000,
      offerDate: new Date(),
    },
  });

  const [collab] = await Collaboration.findOrCreate({
    where: { industryId: industryProfile.id, institutionId: institutionProfile.id, title: 'Apex Cloud Systems & NITK Cloud Computing Innovation Initiative' },
    defaults: {
      industryId: industryProfile.id,
      institutionId: institutionProfile.id,
      title: 'Apex Cloud Systems & NITK Cloud Computing Innovation Initiative',
      collaborationType: CollaborationType.WORKSHOP,
      description: 'Collaborative initiative providing student cloud computing workshops, live industrial training, and engineering internships.',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      status: CollaborationStatus.APPROVED,
    },
  });

  await Workshop.findOrCreate({
    where: { collaborationId: collab.id, topic: 'Scalable Microservices Architectures with Java & Node.js' },
    defaults: {
      collaborationId: collab.id,
      topic: 'Scalable Microservices Architectures with Java & Node.js',
      speakerName: 'Rajesh Varma',
      speakerDesignation: 'VP of Engineering, Apex Cloud Systems',
      date: new Date('2025-02-15'),
      durationHours: 6,
      venue: 'NITK Main Seminar Hall & Virtual Live Stream',
      attendeesCount: 180,
    },
  });

  logger.info('  ✓ Institution placement analytics and industry collaboration seeded');

  // ----------------------------------------------------
  // 15. COMPUTE & PERSIST DETERMINISTIC MATCH SCORE
  // ----------------------------------------------------
  const matchResult = await matchingService.calculateMatch(
    studentProfile.id,
    backendInternship.id,
    'JOB',
    true // persist match in opportunity_matches table
  );

  logger.info(`  ✓ Deterministic Match Calculated: ${matchResult.matchScore}%`);
  logger.info('--- SIH Phase 20 Deterministic Demo Seeding Completed Successfully ---');

  return {
    success: true,
    users: {
      student: studentUser.email,
      industry: industryUser.email,
      academician: academicianUser.email,
      institution: institutionUser.email,
    },
    aaravMatchScore: matchResult.matchScore,
    aaravBreakdown: matchResult.breakdown,
  };
}

// Standalone execution entrypoint
if (require.main === module) {
  runDemoSeed()
    .then((res) => {
      console.log('\n[Demo Seed Summary]');
      console.log(`Demo Student:     ${res.users.student}`);
      console.log(`Demo Industry:    ${res.users.industry}`);
      console.log(`Demo Academic:    ${res.users.academician}`);
      console.log(`Demo Institution: ${res.users.institution}`);
      console.log(`Aarav Match:      ${res.aaravMatchScore}%\n`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('\nDemo seed execution failed:', err);
      process.exit(1);
    });
}
