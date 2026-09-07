import assert from 'assert';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { LearningProgram } from '../models/learning-program.model';
import { Mentor } from '../models/mentor.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { CareerRole } from '../models/career-role.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { UserRole } from '../constants/roles';
import {
  OpportunityStatus,
  WorkplaceType,
  EmploymentType,
} from '../constants/enums';
import { searchService } from '../services/search.service';
import { globalSearchQuerySchema, SearchCategory } from '../validators/search.validator';

export const runPhase17Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 17 GLOBAL SEARCH TESTS');
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

  const ts = Date.now();
  const passwordHash = await bcrypt.hash('SearchPass123!', 10);

  // Setup Test Fixtures:
  // 1. Industry & Opportunities
  const industryUser = await User.create({
    email: `search_ind_${ts}@test.com`,
    passwordHash,
    role: UserRole.INDUSTRY,
    firstName: 'Vertex',
    lastName: 'Solutions',
    isVerified: true,
  });

  const industryProfile = await IndustryProfile.create({
    userId: industryUser.id,
    companyName: `Vertex Robotics Global ${ts}`,
    industryType: 'Robotics & Automation',
    location: 'Bengaluru Tech Park',
    city: 'Bengaluru',
    description: 'Pioneering autonomous systems and cloud robotic architectures.',
    verified: true,
  });

  const job = await Job.create({
    industryId: industryProfile.id,
    title: `Autonomous Systems Engineer ${ts}`,
    description: 'Develop distributed control software for autonomous robotic platforms.',
    requirements: 'Proficiency in C++, Python, and ROS2.',
    location: 'Bengaluru',
    city: 'Bengaluru',
    workplaceType: WorkplaceType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    status: OpportunityStatus.OPEN,
  });

  const internship = await Internship.create({
    industryId: industryProfile.id,
    title: `Computer Vision Intern ${ts}`,
    description: 'Train deep learning models for obstacle detection on edge devices.',
    requirements: 'Knowledge of PyTorch, OpenCV, and Python.',
    location: 'Bengaluru',
    workplaceType: WorkplaceType.ON_SITE,
    durationMonths: 6,
    openings: 3,
    status: OpportunityStatus.OPEN,
  });

  const project = await Project.create({
    industryId: industryProfile.id,
    title: `Warehouse Swarm Optimization ${ts}`,
    description: 'Design multi-agent path finding algorithms for logistics fulfillment.',
    deliverables: 'Simulation codebase, benchmark report, and architecture design.',
    durationWeeks: 12,
    status: OpportunityStatus.OPEN,
  });

  const learningProgram = await LearningProgram.create({
    industryId: industryProfile.id,
    title: `Applied Robotics Masterclass ${ts}`,
    description: 'Intensive industry curriculum on ROS2, kinematics, and digital twins.',
    mode: 'ONLINE',
    cost: 0,
    status: OpportunityStatus.OPEN,
  });

  // 2. Institution Profile
  const instUser = await User.create({
    email: `search_inst_${ts}@test.com`,
    passwordHash,
    role: UserRole.INSTITUTION,
    firstName: 'National',
    lastName: 'Dean',
    isVerified: true,
  });

  const institution = await InstitutionProfile.create({
    userId: instUser.id,
    institutionName: `National Technology Institute ${ts}`,
    institutionType: 'Engineering University',
    location: 'Delhi NCR',
    city: 'Delhi',
    description: 'Premier national university fostering engineering excellence and research.',
    verified: true,
  });

  // 3. Mentor
  const mentorUser = await User.create({
    email: `search_mentor_${ts}@test.com`,
    passwordHash,
    role: UserRole.ACADEMICIAN,
    firstName: 'Dr. Radhika',
    lastName: `Venkatesh ${ts}`,
    isVerified: true,
  });

  const mentor = await Mentor.create({
    userId: mentorUser.id,
    expertiseAreas: `Robotics, SLAM, Embedded Linux ${ts}`,
    maxMentees: 5,
    currentMentees: 1,
    isAvailable: true,
  });

  // 4. Skill & Category
  let category = await SkillCategory.findOne();
  if (!category) {
    category = await SkillCategory.create({
      name: `Robotics Domain ${ts}`,
      description: 'Domain for autonomous robotics',
    });
  }

  const skill = await Skill.create({
    name: `ROS2 Framework ${ts}`,
    slug: `ros2-framework-${ts}`,
    categoryId: category.id,
    description: 'Robot Operating System 2 middleware for distributed robotic nodes.',
    isActive: true,
  });

  // 5. Career Role
  const careerRole = await CareerRole.create({
    title: `Robotics Software Architect ${ts}`,
    slug: `robotics-software-architect-${ts}`,
    description: 'Architects end-to-end software stacks for high-reliability autonomous machines.',
  });

  console.log('Search test fixtures created successfully.\n');

  // =========================================================================
  // 1. INPUT VALIDATION TESTS
  // =========================================================================

  await test('Validation: Validates valid query parameters correctly', async () => {
    const parsed = globalSearchQuerySchema.parse({
      q: 'Robotics',
      type: SearchCategory.JOBS,
      page: '2',
      limit: '15',
    });

    assert.strictEqual(parsed.q, 'Robotics');
    assert.strictEqual(parsed.type, SearchCategory.JOBS);
    assert.strictEqual(parsed.page, 2);
    assert.strictEqual(parsed.limit, 15);
  });

  await test('Validation: Rejects empty search query', async () => {
    assert.throws(() => {
      globalSearchQuerySchema.parse({ q: '   ' });
    });
  });

  await test('Validation: Rejects unsupported search category', async () => {
    assert.throws(() => {
      globalSearchQuerySchema.parse({ q: 'test', type: 'unsupportedCategory' });
    });
  });

  await test('Validation: Rejects negative or zero page and limit', async () => {
    assert.throws(() => {
      globalSearchQuerySchema.parse({ q: 'test', page: 0 });
    });
    assert.throws(() => {
      globalSearchQuerySchema.parse({ q: 'test', limit: -5 });
    });
  });

  await test('Validation: Rejects excessive limit (> 100)', async () => {
    assert.throws(() => {
      globalSearchQuerySchema.parse({ q: 'test', limit: 1000 });
    });
  });

  // =========================================================================
  // 2. CATEGORY-SPECIFIC SEARCH TESTS (ALL 9 MASTER PROMPT CATEGORIES)
  // =========================================================================

  await test('Category 1: Search Jobs by title/description', async () => {
    const result = await searchService.search({
      q: `Autonomous Systems Engineer ${ts}`,
      type: SearchCategory.JOBS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.JOBS);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, job.id);
    assert.strictEqual(result.results[0].type, SearchCategory.JOBS);
    assert.strictEqual(result.results[0].title, job.title);
    assert.ok(result.results[0].metadata?.companyName.includes('Vertex Robotics'));
  });

  await test('Category 2: Search Internships by title/description', async () => {
    const result = await searchService.search({
      q: `Computer Vision Intern ${ts}`,
      type: SearchCategory.INTERNSHIPS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.INTERNSHIPS);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, internship.id);
    assert.strictEqual(result.results[0].type, SearchCategory.INTERNSHIPS);
  });

  await test('Category 3: Search Projects by title/description', async () => {
    const result = await searchService.search({
      q: `Warehouse Swarm Optimization ${ts}`,
      type: SearchCategory.PROJECTS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.PROJECTS);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, project.id);
    assert.strictEqual(result.results[0].type, SearchCategory.PROJECTS);
  });

  await test('Category 4: Search Learning Programs by title/curriculum', async () => {
    const result = await searchService.search({
      q: `Applied Robotics Masterclass ${ts}`,
      type: SearchCategory.LEARNING_PROGRAMS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.LEARNING_PROGRAMS);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, learningProgram.id);
  });

  await test('Category 5: Search Mentors by name and expertise', async () => {
    const result = await searchService.search({
      q: `Radhika`,
      type: SearchCategory.MENTORS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.MENTORS);
    assert.ok(result.results.length >= 1);
    const found = result.results.find((r) => r.id === mentor.id);
    assert.ok(found, 'Mentor must be found');
    assert.ok(found!.title.includes('Dr. Radhika'));
    assert.ok(found!.description?.includes('Robotics'));
  });

  await test('Category 6: Search Skills by name and description', async () => {
    const result = await searchService.search({
      q: `ROS2 Framework ${ts}`,
      type: SearchCategory.SKILLS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.SKILLS);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, skill.id);
  });

  await test('Category 7: Search Career Roles by title and slug', async () => {
    const result = await searchService.search({
      q: `Robotics Software Architect ${ts}`,
      type: SearchCategory.CAREER_ROLES,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.CAREER_ROLES);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, careerRole.id);
  });

  await test('Category 8: Search Companies (IndustryProfiles) by companyName and location', async () => {
    const result = await searchService.search({
      q: `Vertex Robotics Global ${ts}`,
      type: SearchCategory.COMPANIES,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.COMPANIES);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, industryProfile.id);
    assert.ok(result.results[0].location?.includes('Bengaluru'));
  });

  await test('Category 9: Search Institutions by name and location', async () => {
    const result = await searchService.search({
      q: `National Technology Institute ${ts}`,
      type: SearchCategory.INSTITUTIONS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.type, SearchCategory.INSTITUTIONS);
    assert.ok(result.results.length >= 1);
    assert.strictEqual(result.results[0].id, institution.id);
    assert.ok(result.results[0].location?.includes('Delhi'));
  });

  // =========================================================================
  // 3. UNIFIED CROSS-CATEGORY SEARCH TESTS
  // =========================================================================

  await test('Unified Search: Searches across all categories simultaneously when type is omitted', async () => {
    // "Robotics" keyword matches Job, Project, Learning Program, Mentor, Skill, Career Role, Company
    const result = await searchService.search({
      q: 'Robotics',
      page: 1,
      limit: 20,
    });

    assert.strictEqual(result.type, 'all');
    assert.ok(result.results.length >= 3, 'Should return multiple heterogeneous entity types');

    const returnedTypes = new Set(result.results.map((r) => r.type));
    assert.ok(returnedTypes.size >= 2, 'Should contain heterogeneous categories in results');
    assert.ok(result.pagination.total >= result.results.length);
  });

  await test('Deterministic Ranking: Ranks exact title match above partial/description match', async () => {
    const result = await searchService.search({
      q: `ROS2 Framework ${ts}`,
      page: 1,
      limit: 10,
    });

    assert.ok(result.results.length >= 1);
    // The Skill entity has exact title match `ROS2 Framework ${ts}`
    assert.strictEqual(result.results[0].title, `ROS2 Framework ${ts}`);
  });

  // =========================================================================
  // 4. SECURITY, PRIVACY & INJECTION TESTS
  // =========================================================================

  await test('SQL Injection Resilience: Malicious characters are escaped safely', async () => {
    const malicious = "'; DROP TABLE users; -- %_";
    const result = await searchService.search({
      q: malicious,
      page: 1,
      limit: 10,
    });

    assert.ok(Array.isArray(result.results));
    assert.strictEqual(result.results.length, 0);

    // Verify users table was not dropped
    const count = await User.count();
    assert.ok(count > 0, 'Database tables must remain intact');
  });

  await test('Data Privacy: Password hashes and auth secrets are never exposed in search results', async () => {
    const result = await searchService.search({
      q: 'Radhika',
      type: SearchCategory.MENTORS,
      page: 1,
      limit: 10,
    });

    const serialized = JSON.stringify(result);
    assert.ok(!serialized.includes('passwordHash'));
    assert.ok(!serialized.includes(passwordHash));
    assert.ok(!serialized.includes('refreshTokens'));
  });

  await test('Visibility Protection: Closed or inactive opportunities are excluded from search', async () => {
    // Create a closed job
    const closedJob = await Job.create({
      industryId: industryProfile.id,
      title: `Archived Secret Project ${ts}`,
      description: 'Historical project that has concluded.',
      status: OpportunityStatus.CLOSED,
    });

    const result = await searchService.search({
      q: `Archived Secret Project ${ts}`,
      type: SearchCategory.JOBS,
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.results.length, 0, 'Closed opportunities must not be discoverable');
  });

  // =========================================================================
  // 5. PAGINATION & BOUNDED RESULT TESTS
  // =========================================================================

  await test('Pagination: Respects page and limit boundaries accurately', async () => {
    const page1 = await searchService.search({
      q: 'Robotics',
      page: 1,
      limit: 2,
    });

    const page2 = await searchService.search({
      q: 'Robotics',
      page: 2,
      limit: 2,
    });

    assert.strictEqual(page1.results.length, 2);
    assert.strictEqual(page1.pagination.page, 1);
    assert.strictEqual(page1.pagination.limit, 2);
    assert.strictEqual(page2.pagination.page, 2);

    // Results on page 1 and page 2 should be distinct
    const ids1 = page1.results.map((r) => `${r.type}-${r.id}`);
    const ids2 = page2.results.map((r) => `${r.type}-${r.id}`);
    assert.ok(!ids1.includes(ids2[0]), 'Page 2 results must not duplicate Page 1');
  });

  await test('Empty Results: Non-matching search returns clean empty results without error', async () => {
    const result = await searchService.search({
      q: 'NonExistentZzzzXyyyQuery99999',
      page: 1,
      limit: 20,
    });

    assert.strictEqual(result.results.length, 0);
    assert.strictEqual(result.pagination.total, 0);
    assert.strictEqual(result.pagination.totalPages, 1);
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`PHASE 17 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runPhase17Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error running Phase 17 tests:', err);
      process.exit(1);
    });
}
