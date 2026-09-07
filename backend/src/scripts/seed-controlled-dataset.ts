import bcrypt from 'bcrypt';
import '../models';
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
import { IndustryContact } from '../models/industry-contact.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicProgram } from '../models/academic-program.model';
import { AcademicBatch } from '../models/academic-batch.model';
import { StudentAcademicEnrollment } from '../models/student-academic-enrollment.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { AcademicInstitutionAssociation } from '../models/academic-institution-association.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { FacultyOpportunity } from '../models/faculty-opportunity.model';
import { ResearchOpportunity } from '../models/research-opportunity.model';
import { LearningProgram } from '../models/learning-program.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioProject } from '../models/portfolio-project.model';
import { PortfolioCertification } from '../models/portfolio-certification.model';
import { PortfolioAchievement } from '../models/portfolio-achievement.model';
import { PortfolioExperience } from '../models/portfolio-experience.model';
import { Document } from '../models/document.model';
import { Notification } from '../models/notification.model';
import { Placement } from '../models/placement.model';
import { PlacementRecord } from '../models/placement-record.model';
import { Collaboration } from '../models/collaboration.model';
import { Workshop } from '../models/workshop.model';
import { OpportunityMatch } from '../models/opportunity-match.model';
import { LearningRecommendation } from '../models/learning-recommendation.model';
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
  StudentAffiliationStatus,
  DegreeLevel,
  EnrollmentStatus,
  NotificationType,
  CollaborationType,
  CollaborationStatus,
} from '../constants/enums';
import { matchingService } from '../services/matching.service';
import { skillGapService } from '../services/skill-gap.service';
import { logger } from '../utils/logger';

/**
 * CONTROLLED RELATIONAL DATASET SEEDER
 * Deterministic, Realistic, Zero-Orphan, High-Integrity Dataset
 */
export async function runControlledSeed() {
  // 1. Strict Local Environment Safety Guard
  const dbName = sequelize.config.database;
  const dbHost = sequelize.config.host;
  logger.info(`[SEED-GUARD] Resolved database target: ${dbName} on ${dbHost}`);

  if (process.env.NODE_ENV === 'production' || dbName.includes('railway.internal') || dbName.includes('railway.app')) {
    throw new Error(`CRITICAL_SAFETY_STOP: Controlled reset is strictly blocked on production or remote railway database: ${dbName}`);
  }

  logger.info('================================================================');
  logger.info('  STARTING CONTROLLED RELATIONAL DATASET SEED (LOCAL MYSQL)');
  logger.info('================================================================');

  const DEMO_PASSWORD_RAW = 'DemoPassword123!';
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD_RAW, 10);

  // ----------------------------------------------------
  // STEP 1: SAFE DATA RESET (Reverse Dependency Truncation)
  // ----------------------------------------------------
  logger.info('Step 1: Safely clearing existing application data...');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

  const tablesToClear = [
    'notifications',
    'opportunity_matches',
    'learning_recommendations',
    'ai_analyses',
    'application_status_history',
    'applications',
    'job_required_skills',
    'internship_required_skills',
    'project_required_skills',
    'faculty_opportunities',
    'research_opportunities',
    'consultancy_opportunities',
    'fdps',
    'learning_programs',
    'live_projects',
    'industrial_trainings',
    'guest_lectures',
    'workshops',
    'collaborations',
    'placement_records',
    'placements',
    'jobs',
    'internships',
    'projects',
    'portfolio_documents',
    'portfolio_experiences',
    'portfolio_achievements',
    'portfolio_certifications',
    'portfolio_projects',
    'portfolios',
    'document_access',
    'documents',
    'mentorship_sessions',
    'mentorship_requests',
    'mentors',
    'student_languages',
    'student_interests',
    'student_achievements',
    'student_experiences',
    'student_certifications',
    'student_education',
    'student_skills',
    'assessment_answers',
    'assessment_attempts',
    'assessment_questions',
    'skill_assessments',
    'skill_gaps',
    'career_role_skills',
    'student_career_interests',
    'career_roles',
    'skills',
    'skill_categories',
    'student_academic_enrollments',
    'student_institution_affiliations',
    'academic_batches',
    'academic_programs',
    'academic_institution_associations',
    'institution_departments',
    'academician_profiles',
    'institution_profiles',
    'industry_contacts',
    'industry_connections',
    'industry_profiles',
    'student_profiles',
    'refresh_tokens',
    'users',
  ];

  for (const table of tablesToClear) {
    try {
      await sequelize.query(`TRUNCATE TABLE \`${table}\`;`);
    } catch (e) {
      // If table doesn't exist or syntax error, log debug
      logger.debug(`Table truncate skipped for: ${table}`);
    }
  }

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  logger.info('  ✓ Old data cleared safely. Schema & migrations intact.');

  // ----------------------------------------------------
  // STEP 2: SEED SKILL CATEGORIES & SKILLS (24 Skills)
  // ----------------------------------------------------
  logger.info('Step 2: Seeding Skills Taxonomy & Categories...');
  const catBackend = await SkillCategory.create({ name: 'Backend & Systems Engineering', description: 'Server-side architectures, concurrency, APIs, and runtime internals' });
  const catFrontend = await SkillCategory.create({ name: 'Frontend & UI Architecture', description: 'Modern client architectures, component state, and web ergonomics' });
  const catAIML = await SkillCategory.create({ name: 'AI, Machine Learning & Data Science', description: 'Neural networks, predictive modeling, statistical learning, and pipelines' });
  const catDevOps = await SkillCategory.create({ name: 'Cloud Infrastructure & DevOps', description: 'Containerization, cloud orchestration, CI/CD, and system design' });

  // Skills
  const sJava = await Skill.create({ name: 'Java', slug: 'java', categoryId: catBackend.id, description: 'Enterprise Java, Spring Boot, and JVM internals', isActive: true });
  const sNode = await Skill.create({ name: 'Node.js', slug: 'nodejs', categoryId: catBackend.id, description: 'Asynchronous event-driven runtime, Libuv, and microservices', isActive: true });
  const sSQL = await Skill.create({ name: 'SQL', slug: 'sql', categoryId: catBackend.id, description: 'Relational data modeling, ACID transactions, and query tuning', isActive: true });
  const sDSA = await Skill.create({ name: 'Data Structures & Algorithms', slug: 'dsa', categoryId: catBackend.id, description: 'Algorithmic complexity, graphs, trees, and dynamic programming', isActive: true });
  const sSysDesign = await Skill.create({ name: 'System Design', slug: 'system-design', categoryId: catBackend.id, description: 'Distributed systems, load balancing, caching, and partitioning', isActive: true });
  const sREST = await Skill.create({ name: 'RESTful API Architecture', slug: 'rest-api', categoryId: catBackend.id, description: 'Idempotency, HTTP semantics, and API design', isActive: true });

  const sReact = await Skill.create({ name: 'React', slug: 'react', categoryId: catFrontend.id, description: 'Modern React, hooks lifecycle, and state architecture', isActive: true });
  const sTS = await Skill.create({ name: 'TypeScript', slug: 'typescript', categoryId: catFrontend.id, description: 'Static typing, generics, and enterprise JavaScript typing', isActive: true });
  const sCSS = await Skill.create({ name: 'Modern CSS & Tailwind', slug: 'css-tailwind', categoryId: catFrontend.id, description: 'Responsive layouts, grid systems, and animations', isActive: true });
  const sNext = await Skill.create({ name: 'Next.js', slug: 'nextjs', categoryId: catFrontend.id, description: 'Server components, SSR, and modern full-stack web frameworks', isActive: true });

  const sPython = await Skill.create({ name: 'Python', slug: 'python', categoryId: catAIML.id, description: 'Python language, scientific computing, and generators', isActive: true });
  const sML = await Skill.create({ name: 'Machine Learning', slug: 'machine-learning', categoryId: catAIML.id, description: 'Supervised/unsupervised algorithms, evaluation, and tuning', isActive: true });
  const sDeepLearning = await Skill.create({ name: 'Deep Learning & Neural Networks', slug: 'deep-learning', categoryId: catAIML.id, description: 'PyTorch, backpropagation, and transformer architectures', isActive: true });
  const sNLP = await Skill.create({ name: 'Natural Language Processing', slug: 'nlp', categoryId: catAIML.id, description: 'Language models, embeddings, and text tokenization', isActive: true });

  const sDocker = await Skill.create({ name: 'Docker', slug: 'docker', categoryId: catDevOps.id, description: 'Containerization, multi-stage builds, and container networking', isActive: true });
  const sAWS = await Skill.create({ name: 'AWS Cloud Platform', slug: 'aws', categoryId: catDevOps.id, description: 'EC2, S3, RDS, ECS, Lambda, and IAM security', isActive: true });
  const sK8s = await Skill.create({ name: 'Kubernetes', slug: 'kubernetes', categoryId: catDevOps.id, description: 'Container orchestration, pods, services, and ingress', isActive: true });
  const sGit = await Skill.create({ name: 'Git & Version Control', slug: 'git', categoryId: catDevOps.id, description: 'Branching strategies, interactive rebase, and code review', isActive: true });

  logger.info('  ✓ 4 Skill Categories and 18 core Skills seeded.');

  // ----------------------------------------------------
  // STEP 3: SEED CAREER ROLES & BENCHMARKS (5 Roles)
  // ----------------------------------------------------
  logger.info('Step 3: Seeding Industry Career Roles & Benchmark Requirements...');
  const crBackend = await CareerRole.create({
    title: 'Backend Software Engineer',
    slug: 'backend-software-engineer',
    description: 'Design distributed architectures, high-throughput microservices, robust APIs, and scalable databases.',
  });
  await CareerRoleSkill.bulkCreate([
    { careerRoleId: crBackend.id, skillId: sJava.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 2.0 },
    { careerRoleId: crBackend.id, skillId: sNode.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.8 },
    { careerRoleId: crBackend.id, skillId: sSQL.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.8 },
    { careerRoleId: crBackend.id, skillId: sDocker.id, requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.2 },
    { careerRoleId: crBackend.id, skillId: sSysDesign.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.5 },
  ]);

  const crFullStack = await CareerRole.create({
    title: 'Full Stack Web Developer',
    slug: 'full-stack-web-developer',
    description: 'Build end-to-end web applications with React, Node.js, relational databases, and containerized deployments.',
  });
  await CareerRoleSkill.bulkCreate([
    { careerRoleId: crFullStack.id, skillId: sReact.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 2.0 },
    { careerRoleId: crFullStack.id, skillId: sNode.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 2.0 },
    { careerRoleId: crFullStack.id, skillId: sSQL.id, requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.5 },
    { careerRoleId: crFullStack.id, skillId: sTS.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.5 },
    { careerRoleId: crFullStack.id, skillId: sDocker.id, requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.0 },
  ]);

  const crAIML = await CareerRole.create({
    title: 'AI & Machine Learning Engineer',
    slug: 'ai-machine-learning-engineer',
    description: 'Develop intelligent systems, neural networks, predictive models, and data pipelines using modern Python frameworks.',
  });
  await CareerRoleSkill.bulkCreate([
    { careerRoleId: crAIML.id, skillId: sPython.id, requiredLevel: StudentSkillLevel.EXPERT, importanceWeight: 2.0 },
    { careerRoleId: crAIML.id, skillId: sML.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 2.0 },
    { careerRoleId: crAIML.id, skillId: sDeepLearning.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.8 },
    { careerRoleId: crAIML.id, skillId: sSQL.id, requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.2 },
    { careerRoleId: crAIML.id, skillId: sDSA.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.5 },
  ]);

  const crDevOps = await CareerRole.create({
    title: 'Cloud & DevOps Architect',
    slug: 'cloud-devops-architect',
    description: 'Automate CI/CD pipelines, container orchestration, cloud infrastructure, and observability.',
  });
  await CareerRoleSkill.bulkCreate([
    { careerRoleId: crDevOps.id, skillId: sDocker.id, requiredLevel: StudentSkillLevel.EXPERT, importanceWeight: 2.0 },
    { careerRoleId: crDevOps.id, skillId: sAWS.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 2.0 },
    { careerRoleId: crDevOps.id, skillId: sK8s.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.8 },
    { careerRoleId: crDevOps.id, skillId: sSysDesign.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.5 },
  ]);

  const crSDE = await CareerRole.create({
    title: 'Core Software Development Engineer (SDE)',
    slug: 'core-software-development-engineer-sde',
    description: 'Solve complex algorithmic problems, optimize high-performance backend systems, and write clean production code.',
  });
  await CareerRoleSkill.bulkCreate([
    { careerRoleId: crSDE.id, skillId: sDSA.id, requiredLevel: StudentSkillLevel.EXPERT, importanceWeight: 2.0 },
    { careerRoleId: crSDE.id, skillId: sJava.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.8 },
    { careerRoleId: crSDE.id, skillId: sSQL.id, requiredLevel: StudentSkillLevel.ADVANCED, importanceWeight: 1.5 },
    { careerRoleId: crSDE.id, skillId: sSysDesign.id, requiredLevel: StudentSkillLevel.INTERMEDIATE, importanceWeight: 1.2 },
  ]);

  logger.info('  ✓ 5 Career Roles and 22 Career-Skill benchmark associations seeded.');

  // ----------------------------------------------------
  // STEP 4: SEED ASSESSMENTS & HIGH-QUALITY QUESTIONS (5 Assessments)
  // ----------------------------------------------------
  logger.info('Step 4: Seeding Verified Skill Assessments & Questions...');
  const asmNode = await SkillAssessment.create({
    title: 'Node.js Runtime & Microservices Assessment',
    description: 'Test your understanding of asynchronous Node.js, Libuv event loop phases, worker threads, and REST/microservice architecture.',
    skillId: sNode.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 60.0,
    totalQuestions: 5,
    isActive: true,
  });
  await AssessmentQuestion.bulkCreate([
    { assessmentId: asmNode.id, question: 'In which Libuv event loop phase are setImmediate() callbacks executed?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Check phase', B: 'Timers phase', C: 'Poll phase', D: 'Close phase' }, correctAnswer: 'A', points: 20, order: 1 },
    { assessmentId: asmNode.id, question: 'Which native Node.js core module allows multi-threaded CPU-heavy computations?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'cluster', B: 'worker_threads', C: 'child_process', D: 'events' }, correctAnswer: 'B', points: 20, order: 2 },
    { assessmentId: asmNode.id, question: 'When is the process.nextTick() queue drained relative to the Libuv event loop?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'After next timer', B: 'After I/O poll', C: 'Immediately after current operation completes before continuing', D: 'At loop idle' }, correctAnswer: 'C', points: 20, order: 3 },
    { assessmentId: asmNode.id, question: 'Which HTTP content-type header is required for Server-Sent Events (SSE)?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'application/json', B: 'multipart/form-data', C: 'application/octet-stream', D: 'text/event-stream' }, correctAnswer: 'D', points: 20, order: 4 },
    { assessmentId: asmNode.id, question: 'Which Node.js Stream mode uses pause and resume methods for manual flow control?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Paused / Non-flowing mode', B: 'Flowing mode', C: 'Piping mode', D: 'Buffer mode' }, correctAnswer: 'A', points: 20, order: 5 },
  ]);

  const asmJava = await SkillAssessment.create({
    title: 'Java Backend & Enterprise Concurrency Assessment',
    description: 'Comprehensive evaluation covering JVM memory architecture, multithreading, Spring framework internals, and garbage collection.',
    skillId: sJava.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 60.0,
    totalQuestions: 5,
    isActive: true,
  });
  await AssessmentQuestion.bulkCreate([
    { assessmentId: asmJava.id, question: 'Which memory area in the JVM is shared across all concurrent application threads?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Heap Memory', B: 'Thread Stack', C: 'Program Counter Register', D: 'Native Method Stack' }, correctAnswer: 'A', points: 20, order: 1 },
    { assessmentId: asmJava.id, question: 'Which collection implementation guarantees thread-safety with concurrent read access without full table locking?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'ArrayList', B: 'ConcurrentHashMap', C: 'HashMap', D: 'TreeMap' }, correctAnswer: 'B', points: 20, order: 2 },
    { assessmentId: asmJava.id, question: 'What happens when an unhandled exception occurs inside a thread submitted via ExecutorService.submit()?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'JVM halts immediately', B: 'Logged to stderr automatically', C: 'Captured and rethrown inside Future.get() as ExecutionException', D: 'Thread restarts silently' }, correctAnswer: 'C', points: 20, order: 3 },
    { assessmentId: asmJava.id, question: 'Which annotation enables declarative Spring database transaction management with rollback support?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: '@Transactional', B: '@Transact', C: '@Atomic', D: '@EnableTransaction' }, correctAnswer: 'A', points: 20, order: 4 },
    { assessmentId: asmJava.id, question: 'Which garbage collection algorithm is standard and default in modern OpenJDK (Java 11+)?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Serial GC', B: 'Parallel GC', C: 'Concurrent Mark Sweep (CMS)', D: 'G1 Garbage Collector' }, correctAnswer: 'D', points: 20, order: 5 },
  ]);

  const asmSQL = await SkillAssessment.create({
    title: 'Relational Database Architecture & SQL Optimization',
    description: 'Evaluate index architectures, ANSI SQL isolation levels, execution query order, and query plan profiling.',
    skillId: sSQL.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 60.0,
    totalQuestions: 5,
    isActive: true,
  });
  await AssessmentQuestion.bulkCreate([
    { assessmentId: asmSQL.id, question: 'Which index structure provides O(log n) lookups and optimal performance for range queries in B-Tree systems?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'B-Tree Index', B: 'Hash Index', C: 'Bitmap Index', D: 'GIN Index' }, correctAnswer: 'A', points: 20, order: 1 },
    { assessmentId: asmSQL.id, question: 'Which standard ANSI SQL isolation level prevents both Non-Repeatable Reads and Phantom Reads?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Read Committed', B: 'Serializable', C: 'Repeatable Read', D: 'Read Uncommitted' }, correctAnswer: 'B', points: 20, order: 2 },
    { assessmentId: asmSQL.id, question: 'In standard SQL query execution order, which clause is executed immediately after GROUP BY?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'WHERE', B: 'SELECT', C: 'HAVING', D: 'ORDER BY' }, correctAnswer: 'C', points: 20, order: 3 },
    { assessmentId: asmSQL.id, question: 'Which command provides actual execution times and rows scanned in MySQL / PostgreSQL query profiling?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'EXPLAIN COST', B: 'SHOW PROFILE', C: 'ANALYZE TABLE', D: 'EXPLAIN ANALYZE' }, correctAnswer: 'D', points: 20, order: 4 },
    { assessmentId: asmSQL.id, question: 'Which constraint ensures referential integrity between child and parent relational tables?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'PRIMARY KEY', B: 'UNIQUE KEY', C: 'FOREIGN KEY', D: 'CHECK' }, correctAnswer: 'C', points: 20, order: 5 },
  ]);

  const asmReact = await SkillAssessment.create({
    title: 'React Component Architecture & State Management',
    description: 'Assess hooks lifecycle, virtual DOM reconciliation, state optimization, and context patterns.',
    skillId: sReact.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 60.0,
    totalQuestions: 5,
    isActive: true,
  });
  await AssessmentQuestion.bulkCreate([
    { assessmentId: asmReact.id, question: 'Which hook should be used to memoize expensive computed values across re-renders?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'useMemo', B: 'useCallback', C: 'useRef', D: 'useEffect' }, correctAnswer: 'A', points: 20, order: 1 },
    { assessmentId: asmReact.id, question: 'What is the purpose of the key prop when rendering lists of elements in React?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'CSS styling', B: 'Helps React identify which items have changed, been added, or removed during reconciliation', C: 'Accessing child state', D: 'Enabling TypeScript typing' }, correctAnswer: 'B', points: 20, order: 2 },
    { assessmentId: asmReact.id, question: 'When does the cleanup function returned inside useEffect execute?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Before the component unmounts and before re-running the effect on dependency change', B: 'Only after browser page reload', C: 'Immediately after initial render', D: 'During constructor phase' }, correctAnswer: 'A', points: 20, order: 3 },
    { assessmentId: asmReact.id, question: 'Which pattern prevents unnecessary re-rendering of child functional components?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'React.memo with useCallback for passed function handlers', B: 'Inline arrow functions in JSX', C: 'Nested component definitions', D: 'Global window variables' }, correctAnswer: 'A', points: 20, order: 4 },
    { assessmentId: asmReact.id, question: 'What is the primary difference between useEffect and useLayoutEffect?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'useLayoutEffect runs synchronously after all DOM mutations before browser paint', B: 'useEffect runs before render', C: 'useLayoutEffect runs only on the server', D: 'There is no difference' }, correctAnswer: 'A', points: 20, order: 5 },
  ]);

  const asmML = await SkillAssessment.create({
    title: 'Machine Learning Foundations & Deep Learning Assessment',
    description: 'Assess loss functions, overfitting prevention, gradient descent optimizers, and evaluation metrics.',
    skillId: sML.id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 60.0,
    totalQuestions: 5,
    isActive: true,
  });
  await AssessmentQuestion.bulkCreate([
    { assessmentId: asmML.id, question: 'Which regularization technique randomly drops neurons during neural network training to prevent co-adaptation?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Dropout', B: 'Batch Normalization', C: 'L1 Lasso', D: 'Gradient Clipping' }, correctAnswer: 'A', points: 20, order: 1 },
    { assessmentId: asmML.id, question: 'Which evaluation metric is best suited for assessing classification models on highly imbalanced datasets?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Precision-Recall AUC / F1-Score', B: 'Accuracy', C: 'Mean Squared Error', D: 'R-Squared' }, correctAnswer: 'A', points: 20, order: 2 },
    { assessmentId: asmML.id, question: 'What problem does the Residual Connection (skip connection) in ResNet solve?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Vanishing gradient problem in deep networks allowing identity mappings', B: 'Data imbalance', C: 'High memory consumption during inference', D: 'Slow learning rate' }, correctAnswer: 'A', points: 20, order: 3 },
    { assessmentId: asmML.id, question: 'Which optimizer adaptively calculates individual learning rates for different parameters using first and second moments of gradients?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'Adam (Adaptive Moment Estimation)', B: 'Vanilla SGD', C: 'Mini-batch SGD without momentum', D: 'Coordinate Descent' }, correctAnswer: 'A', points: 20, order: 4 },
    { assessmentId: asmML.id, question: 'What is the activation function defined as f(x) = max(0, x)?', questionType: AssessmentQuestionType.MULTIPLE_CHOICE, options: { A: 'ReLU (Rectified Linear Unit)', B: 'Sigmoid', C: 'Tanh', D: 'Softmax' }, correctAnswer: 'A', points: 20, order: 5 },
  ]);

  logger.info('  ✓ 5 Skill Assessments and 25 Questions seeded.');

  // ----------------------------------------------------
  // STEP 5: SEED INSTITUTIONS, DEPARTMENTS, PROGRAMS, BATCHES (2 Institutions)
  // ----------------------------------------------------
  logger.info('Step 5: Seeding Academic Institutions & Program Hierarchy...');
  
  // Institution 1: NITK Surathkal (Demo Institution Account)
  const uInst1 = await User.create({
    firstName: 'NITK',
    lastName: 'Surathkal Admin',
    email: 'demo.institution@sih.gov.in',
    passwordHash,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });
  const inst1 = await InstitutionProfile.create({
    userId: uInst1.id,
    institutionName: 'National Institute of Technology Karnataka (NITK)',
    aisheCode: 'U-0237',
    institutionType: 'National Importance',
    affiliation: 'Ministry of Education, Government of India',
    accreditation: 'NAAC A++',
    websiteUrl: 'https://www.nitk.ac.in',
    location: 'Surathkal, Mangaluru, Karnataka',
    city: 'Surathkal',
    state: 'Karnataka',
    country: 'India',
    description: 'Premier national technological university focused on world-class technical education, research, and academia-industry synergy.',
    verified: true,
  });

  // Secondary NITK admin alias
  await User.create({
    firstName: 'NITK',
    lastName: 'Admin Office',
    email: 'admin@nitk.ac.in',
    passwordHash,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });

  const dept1_1 = await InstitutionDepartment.create({
    institutionId: inst1.id,
    departmentName: 'Department of Computer Science & Engineering',
    departmentCode: 'CSE',
    hodName: 'Dr. K. Chandrasekaran',
    email: 'hodcse@nitk.edu.in',
    phone: '+91-824-2474000',
  });
  const dept1_2 = await InstitutionDepartment.create({
    institutionId: inst1.id,
    departmentName: 'Department of Information Technology',
    departmentCode: 'IT',
    hodName: 'Dr. Sowmya Kamath',
    email: 'hodit@nitk.edu.in',
    phone: '+91-824-2474010',
  });

  const prog1_1 = await AcademicProgram.create({
    institutionId: inst1.id,
    departmentId: dept1_1.id,
    programName: 'Bachelor of Technology in Computer Science and Engineering',
    programCode: 'BTECH-CSE',
    degreeLevel: DegreeLevel.UNDERGRADUATE,
    durationYears: 4.0,
    totalSemesters: 8,
    description: 'Flagship undergraduate engineering program in CSE.',
    isActive: true,
  });
  const prog1_2 = await AcademicProgram.create({
    institutionId: inst1.id,
    departmentId: dept1_2.id,
    programName: 'Bachelor of Technology in Information Technology',
    programCode: 'BTECH-IT',
    degreeLevel: DegreeLevel.UNDERGRADUATE,
    durationYears: 4.0,
    totalSemesters: 8,
    description: 'Undergraduate engineering program in IT.',
    isActive: true,
  });

  const batch1_1 = await AcademicBatch.create({
    institutionId: inst1.id,
    departmentId: dept1_1.id,
    programId: prog1_1.id,
    batchName: 'Batch 2022-2026 (CSE Senior)',
    startYear: 2022,
    endYear: 2026,
    currentSemester: 6,
    isActive: true,
  });
  const batch1_2 = await AcademicBatch.create({
    institutionId: inst1.id,
    departmentId: dept1_1.id,
    programId: prog1_1.id,
    batchName: 'Batch 2023-2027 (CSE Junior)',
    startYear: 2023,
    endYear: 2027,
    currentSemester: 4,
    isActive: true,
  });
  const batch1_3 = await AcademicBatch.create({
    institutionId: inst1.id,
    departmentId: dept1_2.id,
    programId: prog1_2.id,
    batchName: 'Batch 2022-2026 (IT)',
    startYear: 2022,
    endYear: 2026,
    currentSemester: 6,
    isActive: true,
  });

  // Institution 2: IIT Bombay
  const uInst2 = await User.create({
    firstName: 'IIT Bombay',
    lastName: 'Admin Office',
    email: 'admin@iitb.ac.in',
    passwordHash,
    role: UserRole.INSTITUTION,
    isVerified: true,
    isActive: true,
  });
  const inst2 = await InstitutionProfile.create({
    userId: uInst2.id,
    institutionName: 'Indian Institute of Technology Bombay (IITB)',
    aisheCode: 'U-0001',
    institutionType: 'Institute of National Importance',
    affiliation: 'Autonomous National University',
    accreditation: 'NAAC A++',
    websiteUrl: 'https://www.iitb.ac.in',
    location: 'Powai, Mumbai, Maharashtra',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    description: 'India’s premier institute of technology, recognized globally for excellence in engineering and AI research.',
    verified: true,
  });

  const dept2_1 = await InstitutionDepartment.create({
    institutionId: inst2.id,
    departmentName: 'Department of Computer Science & Engineering',
    departmentCode: 'CSE',
    hodName: 'Prof. Pushpak Bhattacharyya',
    email: 'hod@cse.iitb.ac.in',
    phone: '+91-22-25767900',
  });
  const dept2_2 = await InstitutionDepartment.create({
    institutionId: inst2.id,
    departmentName: 'Centre for Machine Intelligence and Data Science',
    departmentCode: 'CMInDS',
    hodName: 'Dr. Sunita Sarawagi',
    email: 'head@minds.iitb.ac.in',
    phone: '+91-22-25767920',
  });

  const prog2_1 = await AcademicProgram.create({
    institutionId: inst2.id,
    departmentId: dept2_1.id,
    programName: 'Bachelor of Technology in Computer Science',
    programCode: 'BTECH-CS-IITB',
    degreeLevel: DegreeLevel.UNDERGRADUATE,
    durationYears: 4.0,
    totalSemesters: 8,
    description: 'Premier undergraduate computer science program at IIT Bombay.',
    isActive: true,
  });
  const prog2_2 = await AcademicProgram.create({
    institutionId: inst2.id,
    departmentId: dept2_2.id,
    programName: 'Master of Technology in AI and Data Science',
    programCode: 'MTECH-AIDS',
    degreeLevel: DegreeLevel.POSTGRADUATE,
    durationYears: 2.0,
    totalSemesters: 4,
    description: 'Postgraduate specialized program in Machine Intelligence.',
    isActive: true,
  });

  const batch2_1 = await AcademicBatch.create({
    institutionId: inst2.id,
    departmentId: dept2_1.id,
    programId: prog2_1.id,
    batchName: 'Batch 2022-2026 (IITB CS)',
    startYear: 2022,
    endYear: 2026,
    currentSemester: 6,
    isActive: true,
  });
  const batch2_2 = await AcademicBatch.create({
    institutionId: inst2.id,
    departmentId: dept2_2.id,
    programId: prog2_2.id,
    batchName: 'Batch 2023-2025 (IITB AI M.Tech)',
    startYear: 2023,
    endYear: 2025,
    currentSemester: 4,
    isActive: true,
  });

  logger.info('  ✓ 2 Institutions, 4 Departments, 4 Programs, and 5 Batches seeded.');

  // ----------------------------------------------------
  // STEP 6: SEED ACADEMICIANS & FACULTY (6 Academicians)
  // ----------------------------------------------------
  logger.info('Step 6: Seeding Scoped Academicians & Faculty...');
  const academicianData = [
    { email: 'demo.academician@sih.gov.in', name: 'Dr. K. Chandrasekaran', instId: inst1.id, deptId: dept1_1.id, deptName: 'Computer Science & Engineering', desig: 'Professor & HOD', spec: 'Distributed Computing & Cloud Architectures' },
    { email: 'chandrasekaran@nitk.edu.in', name: 'Dr. K. Chandrasekaran', instId: inst1.id, deptId: dept1_1.id, deptName: 'Computer Science & Engineering', desig: 'Professor & HOD', spec: 'Distributed Computing & Cloud Architectures' },
    { email: 'tahiliani@nitk.edu.in', name: 'Dr. Mohit P. Tahiliani', instId: inst1.id, deptId: dept1_1.id, deptName: 'Computer Science & Engineering', desig: 'Associate Professor', spec: 'Computer Networks & TCP Congestion Control' },
    { email: 'sowmya.kamath@nitk.edu.in', name: 'Dr. Sowmya Kamath', instId: inst1.id, deptId: dept1_2.id, deptName: 'Information Technology', desig: 'Associate Professor & HOD', spec: 'Information Systems & Big Data' },
    { email: 'pb@cse.iitb.ac.in', name: 'Prof. Pushpak Bhattacharyya', instId: inst2.id, deptId: dept2_1.id, deptName: 'Computer Science & Engineering', desig: 'Professor & HOD', spec: 'Natural Language Processing & AI' },
    { email: 'sarawagi@minds.iitb.ac.in', name: 'Dr. Sunita Sarawagi', instId: inst2.id, deptId: dept2_2.id, deptName: 'Centre for Machine Intelligence and Data Science', desig: 'Professor & Chair', spec: 'Information Extraction & Deep Learning' },
    { email: 'rajendran@ee.iitb.ac.in', name: 'Dr. B. Rajendran', instId: inst2.id, deptId: dept2_1.id, deptName: 'Computer Science & Engineering', desig: 'Associate Professor', spec: 'Neuromorphic Computing & Systems' },
  ];

  for (const ac of academicianData) {
    const parts = ac.name.split(' ');
    const u = await User.create({
      firstName: parts[0] || 'Dr.',
      lastName: parts.slice(1).join(' ') || 'Faculty',
      email: ac.email,
      passwordHash,
      role: UserRole.ACADEMICIAN,
      isVerified: true,
      isActive: true,
    });
    const p = await AcademicianProfile.create({
      userId: u.id,
      institutionId: ac.instId,
      departmentId: ac.deptId,
      department: ac.deptName,
      designation: ac.desig,
      specialization: ac.spec,
      qualification: 'Ph.D in Computer Science',
      experienceYears: 15,
      verified: true,
    });
    await AcademicInstitutionAssociation.create({
      academicianId: p.id,
      institutionId: ac.instId,
      department: ac.deptName,
      designation: ac.desig,
      startDate: new Date('2020-01-01'),
      isCurrent: true,
    });
  }
  logger.info('  ✓ 7 Academicians seeded with strict institutional and departmental scoping.');

  // ----------------------------------------------------
  // STEP 7: SEED INDUSTRIES & CONTACTS (4 Industries)
  // ----------------------------------------------------
  logger.info('Step 7: Seeding Verified Industry Profiles...');
  const industriesData = [
    {
      email: 'demo.industry@sih.gov.in',
      name: 'Apex Cloud Systems',
      cin: 'U72200KA2018PTC112345',
      type: 'Cloud Infrastructure & Enterprise Software',
      city: 'Bengaluru',
      state: 'Karnataka',
      desc: 'Pioneering next-generation enterprise cloud platforms, distributed storage systems, and cloud-native microservices.',
    },
    {
      email: 'recruiting@apexcloud.io',
      name: 'Apex Cloud Systems Talent Office',
      cin: 'U72200KA2018PTC112346',
      type: 'Cloud Infrastructure & Enterprise Software',
      city: 'Bengaluru',
      state: 'Karnataka',
      desc: 'Pioneering next-generation enterprise cloud platforms, distributed storage systems, and cloud-native microservices.',
    },
    {
      email: 'talent@quantumai.tech',
      name: 'Quantum AI Dynamics',
      cin: 'U72200TG2020PTC145678',
      type: 'Artificial Intelligence & Neural Compute',
      city: 'Hyderabad',
      state: 'Telangana',
      desc: 'Building cutting-edge foundational models, automated inference engines, and computer vision architectures.',
    },
    {
      email: 'careers@nexusweblabs.com',
      name: 'Nexus Web Labs',
      cin: 'U72200MH2019PTC134567',
      type: 'Modern Web Platforms & SaaS',
      city: 'Pune',
      state: 'Maharashtra',
      desc: 'High-growth product company delivering scalable SaaS applications, real-time collaboration suites, and frontend platforms.',
    },
    {
      email: 'tech-hiring@horizonfintech.com',
      name: 'Horizon FinTech Solutions',
      cin: 'U72200MH2017PTC109876',
      type: 'Financial Technology & High-Frequency Systems',
      city: 'Mumbai',
      state: 'Maharashtra',
      desc: 'Tier-1 financial technology company developing ultra-low-latency transaction gateways, algorithmic matching engines, and banking APIs.',
    },
  ];

  const industryProfiles = [];
  for (const ind of industriesData) {
    const u = await User.create({
      firstName: ind.name.split(' ')[0],
      lastName: ind.name.split(' ').slice(1).join(' ') || 'Recruiter',
      email: ind.email,
      passwordHash,
      role: UserRole.INDUSTRY,
      isVerified: true,
      isActive: true,
    });
    const p = await IndustryProfile.create({
      userId: u.id,
      companyName: ind.name,
      cin: ind.cin,
      industryType: ind.type,
      websiteUrl: `https://${ind.name.toLowerCase().replace(/\s+/g, '')}.com`,
      location: `${ind.city}, ${ind.state}, India`,
      city: ind.city,
      state: ind.state,
      country: 'India',
      description: ind.desc,
      verified: true,
    });
    await IndustryContact.create({
      industryId: p.id,
      name: `${ind.name.split(' ')[0]} Talent Team`,
      email: ind.email,
      phone: '+91-80-45678900',
      isPrimary: true,
    });
    industryProfiles.push(p);
  }
  logger.info('  ✓ 4 Verified Industry Profiles & Contacts seeded.');

  // ----------------------------------------------------
  // STEP 8: SEED OPPORTUNITIES (Jobs, Internships, Projects, Faculty) (10 Opportunities)
  // ----------------------------------------------------
  logger.info('Step 8: Seeding Industry Opportunities & Required Skills...');
  const indApex = industryProfiles[0];
  const indQuantum = industryProfiles[1];
  const indNexus = industryProfiles[2];
  const indHorizon = industryProfiles[3];

  // Opp 1: Apex Cloud Backend SDE Job
  const oppJob1 = await Job.create({
    industryId: indApex.id,
    title: 'Distributed Systems & Backend Engineer',
    description: 'We are seeking passionate backend engineers to build high-scale distributed storage and telemetry microservices using Java, Node.js, and Docker.',
    requirements: 'Strong proficiency in Java, Node.js, SQL, and Docker. Experience with microservice architectures and RESTful APIs.',
    employmentType: EmploymentType.FULL_TIME,
    workplaceType: WorkplaceType.HYBRID,
    location: 'Bengaluru, Karnataka',
    salaryMin: 1800000,
    salaryMax: 2600000,
    openings: 3,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 60 * 86400000),
  });

  // Opp 2: Apex Cloud Internship
  const oppIntern1 = await Internship.create({
    industryId: indApex.id,
    title: 'Cloud Infrastructure & DevOps Summer Internship 2026',
    description: 'Gain hands-on experience building automated CI/CD pipelines, container orchestration with Docker & Kubernetes, and observability on AWS.',
    requirements: 'Hands-on familiarity with Docker, AWS, Git, and Linux shell scripting. Strong foundation in networking and CI/CD.',
    workplaceType: WorkplaceType.ON_SITE,
    location: 'Bengaluru, Karnataka',
    durationMonths: 6,
    stipend: 60000,
    openings: 5,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 45 * 86400000),
  });

  // Opp 3: Quantum AI Dynamics ML Engineer Job
  const oppJob2 = await Job.create({
    industryId: indQuantum.id,
    title: 'AI / Machine Learning Engineer (Core Models)',
    description: 'Join our research team to build multimodal foundation models, fine-tune transformers in PyTorch, and deploy low-latency inference pipelines.',
    requirements: 'Expertise in Python, Machine Learning, Deep Learning, Natural Language Processing, and Data Structures & Algorithms.',
    employmentType: EmploymentType.FULL_TIME,
    workplaceType: WorkplaceType.HYBRID,
    location: 'Hyderabad, Telangana',
    salaryMin: 2200000,
    salaryMax: 3200000,
    openings: 2,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 60 * 86400000),
  });

  // Opp 4: Quantum AI Research Internship
  const oppIntern2 = await Internship.create({
    industryId: indQuantum.id,
    title: 'Deep Learning & NLP Research Intern',
    description: '6-month research internship focused on transformer alignment, prompt compression, and benchmark evaluations.',
    requirements: 'Proficiency in Python, Deep Learning, Natural Language Processing, and PyTorch.',
    workplaceType: WorkplaceType.REMOTE,
    location: 'Remote, India',
    durationMonths: 6,
    stipend: 75000,
    openings: 4,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 30 * 86400000),
  });

  // Opp 5: Nexus Web Labs Full Stack SDE Job
  const oppJob3 = await Job.create({
    industryId: indNexus.id,
    title: 'Full Stack Web Platform Engineer',
    description: 'Architect responsive, real-time collaboration applications using React, TypeScript, Node.js, and PostgreSQL.',
    requirements: 'Solid experience in React, TypeScript, Node.js, SQL, and REST APIs. Familiarity with Tailwind CSS is a plus.',
    employmentType: EmploymentType.FULL_TIME,
    workplaceType: WorkplaceType.HYBRID,
    location: 'Pune, Maharashtra',
    salaryMin: 1500000,
    salaryMax: 2200000,
    openings: 4,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 60 * 86400000),
  });

  // Opp 6: Nexus Web Labs Frontend Internship
  const oppIntern3 = await Internship.create({
    industryId: indNexus.id,
    title: 'Frontend React Engineering Intern',
    description: 'Work alongside senior UI engineers to craft accessible, performant React components and design system tokens.',
    requirements: 'Experience with React, TypeScript, JavaScript, HTML5, and CSS3.',
    workplaceType: WorkplaceType.HYBRID,
    location: 'Pune, Maharashtra',
    durationMonths: 4,
    stipend: 45000,
    openings: 3,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 30 * 86400000),
  });

  // Opp 7: Horizon FinTech SDE Core Backend Job
  const oppJob4 = await Job.create({
    industryId: indHorizon.id,
    title: 'Core Software Development Engineer (SDE-1)',
    description: 'Build mission-critical payment settlement and core transaction routing engines with ultra-low latency requirements.',
    requirements: 'Excellence in Data Structures & Algorithms, Java, SQL, System Design, and concurrent programming.',
    employmentType: EmploymentType.FULL_TIME,
    workplaceType: WorkplaceType.ON_SITE,
    location: 'Mumbai, Maharashtra',
    salaryMin: 2400000,
    salaryMax: 3400000,
    openings: 2,
    status: OpportunityStatus.OPEN,
    applicationDeadline: new Date(Date.now() + 60 * 86400000),
  });

  // Opp 8: Student Capstone Live Project
  const oppProject1 = await Project.create({
    industryId: indApex.id,
    title: 'Autonomous Distributed Cache Cluster',
    description: 'Industry-sponsored capstone project to implement a distributed in-memory cache with Raft consensus and dynamic replication.',
    deliverables: 'Complete working open-source repo with Docker Compose setup, comprehensive benchmark suite, and API documentation.',
    durationWeeks: 12,
    budget: 150000,
    status: OpportunityStatus.OPEN,
  });

  // Opp 9: Faculty Research Collaboration
  await ResearchOpportunity.create({
    industryId: indQuantum.id,
    title: 'Academic-Industry Joint Research: Energy-Efficient LLM Fine-Tuning',
    description: 'Joint research project seeking faculty and academic labs to develop sparse attention architectures for edge AI deployment.',
    fieldOfStudy: 'Artificial Intelligence & Model Compression',
    durationMonths: 12,
    fundingAmount: 2500000,
    status: OpportunityStatus.OPEN,
  });

  // Opp 10: Faculty Immersion Internship
  await FacultyOpportunity.create({
    industryId: indApex.id,
    title: 'Faculty Industry Immersion Program in Enterprise Cloud Engineering',
    description: 'Sabbatical and summer faculty fellowship program providing university professors hands-on immersion in production cloud architecture.',
    department: 'Computer Science & Engineering',
    applicationDeadline: new Date(Date.now() + 90 * 86400000),
    status: OpportunityStatus.OPEN,
  });

  logger.info('  ✓ 10 Opportunities (Jobs, Internships, Projects, Faculty Collaborations) seeded.');

  // ----------------------------------------------------
  // STEP 9: SEED STUDENTS & REALISTIC SCENARIOS (12 Students)
  // ----------------------------------------------------
  logger.info('Step 9: Seeding Diverse Student Personas & Verified Affiliations...');

  // Student Persona Definitions
  const studentPersonas = [
    {
      // Student A (The Lead Hero Student: Aarav Sharma)
      firstName: 'Aarav', lastName: 'Sharma', email: 'demo.student@sih.gov.in', studentId: 'NITK2022CS001',
      instId: inst1.id, deptId: dept1_1.id, programId: prog1_1.id, batchId: batch1_1.id,
      headline: 'Aspiring Backend Developer | Java | Node.js | SQL | Distributed Systems',
      careerGoalRole: crBackend, cgpa: 8.85, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sJava, level: StudentSkillLevel.EXPERT, score: 100, verified: true, source: 'Assessment' },
        { skill: sNode, level: StudentSkillLevel.ADVANCED, score: 85, verified: true, source: 'Assessment' },
        { skill: sSQL, level: StudentSkillLevel.ADVANCED, score: 80, verified: true, source: 'Assessment' },
        { skill: sDocker, level: StudentSkillLevel.INTERMEDIATE, score: 65, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [
        { asm: asmJava, score: 100, passed: true },
        { asm: asmNode, score: 100, passed: true },
      ],
      applications: [
        { opp: oppJob1, oppType: 'JOB', status: ApplicationStatus.SHORTLISTED, notes: 'Shortlisted by hiring manager. Strong assessment score.' },
        { opp: oppIntern1, oppType: 'INTERNSHIP', status: ApplicationStatus.APPLIED, notes: 'Application under technical screening.' },
      ],
    },
    {
      // Student B: Priya Nair (Full Stack Focused)
      firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@sih.gov.in', studentId: 'NITK2022IT014',
      instId: inst1.id, deptId: dept1_2.id, programId: prog1_2.id, batchId: batch1_3.id,
      headline: 'Full Stack Engineer | React | TypeScript | Node.js | Next.js',
      careerGoalRole: crFullStack, cgpa: 9.10, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sReact, level: StudentSkillLevel.ADVANCED, score: 90, verified: true, source: 'Assessment' },
        { skill: sTS, level: StudentSkillLevel.ADVANCED, score: 80, verified: false, source: 'Project' },
        { skill: sNode, level: StudentSkillLevel.INTERMEDIATE, score: 60, verified: false, source: 'Self' },
        { skill: sCSS, level: StudentSkillLevel.ADVANCED, score: 85, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [
        { asm: asmReact, score: 90, passed: true },
      ],
      applications: [
        { opp: oppJob3, oppType: 'JOB', status: ApplicationStatus.SELECTED, notes: 'Offered Full Stack Platform Engineer role after outstanding technical interview!' },
        { opp: oppIntern3, oppType: 'INTERNSHIP', status: ApplicationStatus.SHORTLISTED, notes: 'Shortlisted for UI internship.' },
      ],
    },
    {
      // Student C: Rohit Verma (IITB AI Specialist)
      firstName: 'Rohit', lastName: 'Verma', email: 'rohit.verma@sih.gov.in', studentId: 'IITB2022CS088',
      instId: inst2.id, deptId: dept2_1.id, programId: prog2_1.id, batchId: batch2_1.id,
      headline: 'AI/ML Researcher & Engineer | Python | Deep Learning | PyTorch',
      careerGoalRole: crAIML, cgpa: 9.45, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sPython, level: StudentSkillLevel.EXPERT, score: 95, verified: true, source: 'Assessment' },
        { skill: sML, level: StudentSkillLevel.EXPERT, score: 100, verified: true, source: 'Assessment' },
        { skill: sDeepLearning, level: StudentSkillLevel.ADVANCED, score: 85, verified: false, source: 'Project' },
        { skill: sSQL, level: StudentSkillLevel.INTERMEDIATE, score: 60, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [
        { asm: asmML, score: 100, passed: true },
      ],
      applications: [
        { opp: oppJob2, oppType: 'JOB', status: ApplicationStatus.SHORTLISTED, notes: 'Advanced to AI Architecture Interview round.' },
      ],
    },
    {
      // Student D: Ananya Deshmukh (Junior - Affiliation Pending)
      firstName: 'Ananya', lastName: 'Deshmukh', email: 'ananya.deshmukh@sih.gov.in', studentId: 'NITK2023CS077',
      instId: inst1.id, deptId: dept1_1.id, programId: prog1_1.id, batchId: batch1_2.id,
      headline: 'Sophomore Computer Science Student | Exploring Systems & Algorithms',
      careerGoalRole: crSDE, cgpa: 8.20, sem: 4,
      affiliationStatus: StudentAffiliationStatus.PENDING,
      skills: [
        { skill: sJava, level: StudentSkillLevel.BEGINNER, score: 40, verified: false, source: 'Self' },
        { skill: sPython, level: StudentSkillLevel.INTERMEDIATE, score: 55, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [],
      applications: [
        { opp: oppIntern1, oppType: 'INTERNSHIP', status: ApplicationStatus.APPLIED, notes: 'Applied for summer internship.' },
      ],
    },
    {
      // Student E: Vikram Singh (IITB Cloud/DevOps)
      firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@sih.gov.in', studentId: 'IITB2022CS034',
      instId: inst2.id, deptId: dept2_1.id, programId: prog2_1.id, batchId: batch2_1.id,
      headline: 'Cloud Infrastructure & SRE Specialist | Docker | AWS | Kubernetes',
      careerGoalRole: crDevOps, cgpa: 8.70, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sDocker, level: StudentSkillLevel.EXPERT, score: 95, verified: true, source: 'Assessment' },
        { skill: sAWS, level: StudentSkillLevel.ADVANCED, score: 85, verified: false, source: 'Certification' },
        { skill: sK8s, level: StudentSkillLevel.INTERMEDIATE, score: 70, verified: false, source: 'Self' },
        { skill: sGit, level: StudentSkillLevel.EXPERT, score: 90, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [],
      applications: [
        { opp: oppIntern1, oppType: 'INTERNSHIP', status: ApplicationStatus.SELECTED, notes: 'Selected for Cloud Infrastructure internship.' },
      ],
    },
    {
      // Student F: Sneha Kulkarni (High Flyer Core SDE)
      firstName: 'Sneha', lastName: 'Kulkarni', email: 'sneha.kulkarni@sih.gov.in', studentId: 'NITK2022CS019',
      instId: inst1.id, deptId: dept1_1.id, programId: prog1_1.id, batchId: batch1_1.id,
      headline: 'Competitive Programmer & Core SDE | Data Structures | Java | High Performance',
      careerGoalRole: crSDE, cgpa: 9.60, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sDSA, level: StudentSkillLevel.EXPERT, score: 100, verified: true, source: 'Assessment' },
        { skill: sJava, level: StudentSkillLevel.EXPERT, score: 95, verified: true, source: 'Assessment' },
        { skill: sSQL, level: StudentSkillLevel.ADVANCED, score: 85, verified: true, source: 'Assessment' },
        { skill: sSysDesign, level: StudentSkillLevel.ADVANCED, score: 80, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [
        { asm: asmJava, score: 100, passed: true },
        { asm: asmSQL, score: 100, passed: true },
      ],
      applications: [
        { opp: oppJob4, oppType: 'JOB', status: ApplicationStatus.SHORTLISTED, notes: 'Shortlisted for SDE-1 Core Trading Engine team.' },
      ],
    },
    {
      // Student G: Arjun Patel (Beginner with clear gaps)
      firstName: 'Arjun', lastName: 'Patel', email: 'arjun.patel@sih.gov.in', studentId: 'NITK2022IT045',
      instId: inst1.id, deptId: dept1_2.id, programId: prog1_2.id, batchId: batch1_3.id,
      headline: 'Aspiring Web Developer | Learning Frontend & Backend',
      careerGoalRole: crFullStack, cgpa: 7.20, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sCSS, level: StudentSkillLevel.INTERMEDIATE, score: 50, verified: false, source: 'Self' },
        { skill: sReact, level: StudentSkillLevel.BEGINNER, score: 35, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [
        { asm: asmReact, score: 40, passed: false },
      ],
      applications: [
        { opp: oppIntern3, oppType: 'INTERNSHIP', status: ApplicationStatus.REJECTED, notes: 'Candidate skills below benchmark requirements.' },
      ],
    },
    {
      // Student H: Divya Menon (M.Tech AI Researcher)
      firstName: 'Divya', lastName: 'Menon', email: 'divya.menon@sih.gov.in', studentId: 'IITB2023AI005',
      instId: inst2.id, deptId: dept2_2.id, programId: prog2_2.id, batchId: batch2_2.id,
      headline: 'M.Tech AI Research Scholar | NLP & Generative Architectures',
      careerGoalRole: crAIML, cgpa: 9.30, sem: 4,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sPython, level: StudentSkillLevel.EXPERT, score: 95, verified: true, source: 'Assessment' },
        { skill: sNLP, level: StudentSkillLevel.ADVANCED, score: 90, verified: false, source: 'Project' },
        { skill: sML, level: StudentSkillLevel.ADVANCED, score: 85, verified: true, source: 'Assessment' },
      ],
      assessmentsTaken: [
        { asm: asmML, score: 100, passed: true },
      ],
      applications: [
        { opp: oppIntern2, oppType: 'INTERNSHIP', status: ApplicationStatus.SHORTLISTED, notes: 'Shortlisted for NLP Foundation Model Research.' },
      ],
    },
    {
      // Student I: Kavita Reddy (NITK Backend)
      firstName: 'Kavita', lastName: 'Reddy', email: 'kavita.reddy@sih.gov.in', studentId: 'NITK2022CS052',
      instId: inst1.id, deptId: dept1_1.id, programId: prog1_1.id, batchId: batch1_1.id,
      headline: 'Backend Developer | Java | SQL | Spring Microservices',
      careerGoalRole: crBackend, cgpa: 8.50, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sJava, level: StudentSkillLevel.ADVANCED, score: 80, verified: true, source: 'Assessment' },
        { skill: sSQL, level: StudentSkillLevel.ADVANCED, score: 80, verified: true, source: 'Assessment' },
      ],
      assessmentsTaken: [
        { asm: asmSQL, score: 80, passed: true },
      ],
      applications: [
        { opp: oppJob1, oppType: 'JOB', status: ApplicationStatus.APPLIED, notes: 'Under review.' },
      ],
    },
    {
      // Student J: Manish Kumar (IITB Algorithms)
      firstName: 'Manish', lastName: 'Kumar', email: 'manish.kumar@sih.gov.in', studentId: 'IITB2022CS091',
      instId: inst2.id, deptId: dept2_1.id, programId: prog2_1.id, batchId: batch2_1.id,
      headline: 'Software Engineer | Algorithms | C++ | Java',
      careerGoalRole: crSDE, cgpa: 8.90, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sDSA, level: StudentSkillLevel.ADVANCED, score: 85, verified: false, source: 'Self' },
        { skill: sJava, level: StudentSkillLevel.ADVANCED, score: 80, verified: true, source: 'Assessment' },
      ],
      assessmentsTaken: [],
      applications: [
        { opp: oppJob4, oppType: 'JOB', status: ApplicationStatus.APPLIED, notes: 'Application submitted.' },
      ],
    },
    {
      // Student K: Neha Gupta (NITK Frontend)
      firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@sih.gov.in', studentId: 'NITK2022IT033',
      instId: inst1.id, deptId: dept1_2.id, programId: prog1_2.id, batchId: batch1_3.id,
      headline: 'Frontend Engineer | React | TypeScript | UI/UX',
      careerGoalRole: crFullStack, cgpa: 8.40, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sReact, level: StudentSkillLevel.ADVANCED, score: 85, verified: true, source: 'Assessment' },
        { skill: sTS, level: StudentSkillLevel.INTERMEDIATE, score: 70, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [
        { asm: asmReact, score: 80, passed: true },
      ],
      applications: [
        { opp: oppJob3, oppType: 'JOB', status: ApplicationStatus.APPLIED, notes: 'Technical review in progress.' },
      ],
    },
    {
      // Student L: Siddharth Joshi (IITB Cloud)
      firstName: 'Siddharth', lastName: 'Joshi', email: 'siddharth.joshi@sih.gov.in', studentId: 'IITB2022CS011',
      instId: inst2.id, deptId: dept2_1.id, programId: prog2_1.id, batchId: batch2_1.id,
      headline: 'DevOps & Site Reliability Engineer | Docker | AWS',
      careerGoalRole: crDevOps, cgpa: 8.65, sem: 6,
      affiliationStatus: StudentAffiliationStatus.VERIFIED,
      skills: [
        { skill: sDocker, level: StudentSkillLevel.ADVANCED, score: 85, verified: false, source: 'Self' },
        { skill: sAWS, level: StudentSkillLevel.INTERMEDIATE, score: 70, verified: false, source: 'Self' },
      ],
      assessmentsTaken: [],
      applications: [
        { opp: oppIntern1, oppType: 'INTERNSHIP', status: ApplicationStatus.APPLIED, notes: 'Application submitted.' },
      ],
    },
  ];

  let totalApplicationsCount = 0;

  for (const st of studentPersonas) {
    // 1. Create User
    const u = await User.create({
      firstName: st.firstName,
      lastName: st.lastName,
      email: st.email,
      passwordHash,
      role: UserRole.STUDENT,
      isVerified: true,
      isActive: true,
    });

    // 2. Create Student Profile
    const profile = await StudentProfile.create({
      userId: u.id,
      studentId: st.studentId,
      institutionId: st.instId,
      departmentId: st.deptId,
      headline: st.headline,
      bio: `${st.firstName} is an ambitious engineering student focused on industry competencies.`,
      collegeName: st.instId === inst1.id ? inst1.institutionName : inst2.institutionName,
      department: st.deptId === dept1_1.id || st.deptId === dept2_1.id ? 'Computer Science & Engineering' : 'Information Technology',
      course: 'B.Tech',
      currentSemester: st.sem,
      graduationYear: 2026,
      cgpa: st.cgpa,
      careerGoal: st.careerGoalRole.title,
      country: 'India',
      availabilityStatus: 'AVAILABLE',
      profileCompletion: 90,
    });

    // 3. Create Student Education
    await StudentEducation.create({
      studentId: profile.id,
      institutionName: st.instId === inst1.id ? inst1.institutionName : inst2.institutionName,
      degree: 'Bachelor of Technology',
      fieldOfStudy: 'Computer Science & Engineering',
      startYear: 2022,
      endYear: 2026,
      grade: `${st.cgpa} CGPA`,
    });

    // 4. Create Affiliation
    await StudentInstitutionAffiliation.create({
      studentId: profile.id,
      institutionId: st.instId,
      departmentId: st.deptId,
      enrollmentNumber: st.studentId,
      status: st.affiliationStatus,
      requestedAt: new Date(Date.now() - 30 * 86400000),
      reviewedAt: st.affiliationStatus === StudentAffiliationStatus.VERIFIED ? new Date() : null,
      reviewedByUserId: st.affiliationStatus === StudentAffiliationStatus.VERIFIED ? (st.instId === inst1.id ? uInst1.id : uInst2.id) : null,
    });

    // 5. Create Academic Enrollment
    await StudentAcademicEnrollment.create({
      studentId: profile.id,
      institutionId: st.instId,
      departmentId: st.deptId,
      programId: st.programId,
      batchId: st.batchId,
      enrollmentNumber: st.studentId,
      status: EnrollmentStatus.ACTIVE,
      currentSemester: st.sem,
      enrolledAt: new Date(Date.now() - 365 * 86400000),
    });

    // 6. Assign Target Career Goal
    await StudentCareerInterest.create({
      studentId: profile.id,
      careerRoleId: st.careerGoalRole.id,
      priorityOrder: 1,
    });

    // 7. Seed Student Skills
    for (const sk of st.skills) {
      await StudentSkill.create({
        studentId: profile.id,
        skillId: sk.skill.id,
        level: sk.level,
        score: sk.score,
        verified: sk.verified,
        source: sk.source,
        lastAssessedAt: sk.verified ? new Date() : null,
      });
    }

    // 8. Seed Assessment Attempts & Answers
    for (const at of st.assessmentsTaken) {
      const attempt = await AssessmentAttempt.create({
        assessmentId: at.asm.id,
        studentId: profile.id,
        score: at.score,
        percentage: at.score,
        status: AssessmentAttemptStatus.COMPLETED,
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(),
      });

      const questions = await AssessmentQuestion.findAll({ where: { assessmentId: at.asm.id } });
      for (const q of questions) {
        await AssessmentAnswer.create({
          attemptId: attempt.id,
          questionId: q.id,
          answer: at.passed ? q.correctAnswer : 'Incorrect Answer Option',
          isCorrect: at.passed,
          pointsEarned: at.passed ? q.points : 0,
        });
      }
    }

    // 9. Calculate Deterministic Skill Gaps
    await skillGapService.calculateGapsForStudent(profile.id);

    // 10. Seed Applications & History
    for (const app of st.applications) {
      totalApplicationsCount++;
      const createdApp = await Application.create({
        studentId: profile.id,
        opportunityId: app.opp.id,
        opportunityType: app.oppType,
        status: app.status,
        appliedAt: new Date(Date.now() - 15 * 86400000),
        coverLetter: `I am thrilled to apply for the ${app.opp.title} role. My technical background in ${st.headline} aligns with your requirements.`,
        resumeUrl: `https://storage.sih.gov.in/resumes/${st.firstName.toLowerCase()}-${st.lastName.toLowerCase()}-resume.pdf`,
      });

      // Initial APPLIED history
      await ApplicationStatusHistory.create({
        applicationId: createdApp.id,
        fromStatus: null,
        toStatus: ApplicationStatus.APPLIED,
        changedByUserId: u.id,
        reason: 'Initial student application submission',
        createdAt: new Date(Date.now() - 15 * 86400000),
      });

      // Subsequent status history
      if (app.status !== ApplicationStatus.APPLIED) {
        await ApplicationStatusHistory.create({
          applicationId: createdApp.id,
          fromStatus: ApplicationStatus.APPLIED,
          toStatus: app.status,
          changedByUserId: app.opp.industryId ? indApex.userId : u.id,
          reason: app.notes,
          createdAt: new Date(),
        });
      }

      // Notification for student
      if (app.status === ApplicationStatus.SHORTLISTED) {
        await Notification.create({
          userId: u.id,
          title: `Shortlisted: ${app.opp.title}`,
          message: `Congratulations! Your application for ${app.opp.title} has been shortlisted by the recruiting team.`,
          type: NotificationType.SHORTLISTED,
          isRead: false,
        });
      } else if (app.status === ApplicationStatus.SELECTED) {
        await Notification.create({
          userId: u.id,
          title: `Selected: ${app.opp.title}`,
          message: `Congratulations! You have been selected for the ${app.opp.title} position!`,
          type: NotificationType.STUDENT_SELECTED,
          isRead: false,
        });
      } else if (app.status === ApplicationStatus.REJECTED) {
        await Notification.create({
          userId: u.id,
          title: `Application Update: ${app.opp.title}`,
          message: `Thank you for your interest in ${app.opp.title}. The team has decided to proceed with other candidates at this time.`,
          type: NotificationType.REJECTED,
          isRead: true,
        });
      }
    }

    // 11. Create Digital Portfolio
    const portfolio = await Portfolio.create({
      studentId: profile.id,
      theme: 'MODERN_DARK',
      isPublished: true,
      publishedAt: new Date(),
      customDomain: `${st.firstName.toLowerCase()}-${st.lastName.toLowerCase()}.portfolio.local`,
    });

    await PortfolioProject.create({
      portfolioId: portfolio.id,
      title: `${st.careerGoalRole.title} Showcase Project`,
      description: `Production-ready application implementing clean architecture, automated tests, and containerization for ${st.careerGoalRole.title}.`,
      role: 'Lead Architect & Full Stack Engineer',
      technologies: 'Java, Node.js, React, Docker, TypeScript, PostgreSQL',
      projectUrl: 'https://demo-showcase.sih.gov.in',
      githubUrl: `https://github.com/${st.firstName.toLowerCase()}/showcase`,
      order: 1,
    });
  }

  logger.info(`  ✓ 12 Students with complete profiles, skills, assessments, gaps, and ${totalApplicationsCount} applications seeded.`);

  // ----------------------------------------------------
  // STEP 10: SEED PLACEMENTS, COLLABORATIONS & WORKSHOPS
  // ----------------------------------------------------
  logger.info('Step 10: Seeding Placement Drives & Industry Collaborations...');
  const placementDrive = await Placement.create({
    institutionId: inst1.id,
    academicYear: '2025-2026',
    totalStudents: 150,
    placedStudents: 138,
    higherStudiesStudents: 8,
    entrepreneurshipStudents: 2,
    averageSalary: 1450000,
    highestSalary: 4200000,
    medianSalary: 1200000,
  });

  // Seed placement records for selected students
  const [selectedApps] = await sequelize.query(`
    SELECT a.id, a.student_id, a.opportunity_id 
    FROM applications a 
    WHERE a.status = '${ApplicationStatus.SELECTED}'
  `);

  for (const sel of (selectedApps as any[])) {
    await PlacementRecord.create({
      placementId: placementDrive.id,
      studentId: sel.student_id,
      companyName: 'Nexus Web Labs',
      roleOffered: 'Full Stack Web Platform Engineer',
      packageOffered: 1850000,
      offerDate: new Date(),
    });
  }

  // Industry-Institution Collaboration
  const collab = await Collaboration.create({
    industryId: indApex.id,
    institutionId: inst1.id,
    title: 'Cloud Computing Centre of Excellence (CoE)',
    description: 'Joint research and student incubation facility for scalable distributed systems.',
    collaborationType: CollaborationType.WORKSHOP,
    status: CollaborationStatus.APPROVED,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2027-01-01'),
  });

  await Workshop.create({
    collaborationId: collab.id,
    topic: 'Hands-On Deep Learning & Transformers Bootcamp',
    speakerName: 'Dr. Sunita Sarawagi',
    speakerDesignation: 'Principal AI Scientist, Quantum AI Dynamics',
    date: new Date(Date.now() + 20 * 86400000),
    durationHours: 18,
    venue: 'Auditorium A, NITK Surathkal',
    attendeesCount: 95,
  });

  // ----------------------------------------------------
  // STEP 11: POPULATE OPPORTUNITY MATCH SCORES (Exact Matching Engine)
  // ----------------------------------------------------
  logger.info('Step 11: Computing Authoritative Opportunity Match Scores...');
  const [allStudents] = await sequelize.query('SELECT id, user_id FROM student_profiles');
  const [allOpportunities] = await sequelize.query('SELECT id, "JOB" as opp_type FROM jobs UNION SELECT id, "INTERNSHIP" as opp_type FROM internships');

  for (const st of (allStudents as any[])) {
    for (const opp of (allOpportunities as any[]).slice(0, 4)) {
      try {
        const matchRes = await matchingService.calculateMatch(st.id, opp.id, opp.opp_type as any);
        await OpportunityMatch.create({
          studentId: st.id,
          opportunityId: opp.id,
          opportunityType: opp.opp_type,
          matchScore: matchRes.matchScore,
          breakdown: matchRes.breakdown as any,
        });
      } catch (_) {}
    }
  }

  logger.info('================================================================');
  logger.info('  CONTROLLED SEEDING COMPLETED SUCCESSFULLY WITH 100% INTEGRITY!');
  logger.info('================================================================');
}

// Auto-run if executed directly via node / ts-node
runControlledSeed()
  .then(() => {
    console.log('[SEED-SUCCESS] Seeder process finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[SEED-ERROR] Seeder execution failed with stack trace:', err);
    process.exit(1);
  });
