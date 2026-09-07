import assert from 'assert';
import http from 'http';
import '../models';
import { app } from '../app';
import { sequelize } from '../config/database';
import { env } from '../config/env.config';
import { initEventSubscribers, appEvents, AppEventType } from '../events';
import { matchingService, MatchingContext } from '../services/matching.service';
import { recommendationService } from '../services/recommendation.service';
import { opportunityRecommendationQuerySchema } from '../validators/recommendation.validator';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { Job } from '../models/job.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { UserRole } from '../constants/roles';
import { OpportunityType, OpportunityStatus, WorkplaceType, EmploymentType } from '../constants/enums';

export const runPhase21PerformanceProductionTests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 21 PERFORMANCE & PRODUCTION READINESS TESTS');
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

  // =========================================================================
  // 1. HEALTH, LIVENESS & READINESS ENDPOINTS
  // =========================================================================
  console.log('--- 1. Health, Liveness & Readiness Probes ---');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}/api/v1`;

  try {
    await test('Health check (GET /health): Returns lightweight 200 status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.strictEqual(res.status, 200, 'Health endpoint should return 200');
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.status, 'ok');
    });

    await test('Liveness probe (GET /health/live): Returns process uptime', async () => {
      const res = await fetch(`${baseUrl}/health/live`);
      assert.strictEqual(res.status, 200, 'Liveness endpoint should return 200');
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.status, 'ok');
      assert.strictEqual(typeof json.data.uptime, 'number');
      assert.ok(json.data.uptime >= 0, 'Uptime must be a non-negative number');
    });

    await test('Readiness probe (GET /health/ready): Verifies database connectivity', async () => {
      const res = await fetch(`${baseUrl}/health/ready`);
      assert.strictEqual(res.status, 200, 'Readiness endpoint should return 200');
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.status, 'ready');
      assert.strictEqual(json.data.database, 'connected');
      assert.strictEqual(typeof json.data.uptime, 'number');
    });

    // =========================================================================
    // 2. CORRELATION ID (X-REQUEST-ID) & HEADERS
    // =========================================================================
    console.log('\n--- 2. Request Correlation & Tracing ---');

    await test('Correlation ID: Injects UUID X-Request-Id when none provided', async () => {
      const res = await fetch(`${baseUrl}/health`);
      const reqId = res.headers.get('x-request-id');
      assert.ok(reqId, 'Response must include X-Request-Id header');
      assert.ok(reqId!.length >= 16, 'Request ID should be a valid identifier/UUID');
    });

    await test('Correlation ID: Preserves client-supplied X-Request-Id', async () => {
      const customTraceId = 'trace-perf-sih-2026-xyz';
      const res = await fetch(`${baseUrl}/health`, {
        headers: {
          'X-Request-Id': customTraceId,
        },
      });
      const reqId = res.headers.get('x-request-id');
      assert.strictEqual(reqId, customTraceId, 'Should reflect client-supplied X-Request-Id');
    });

    // =========================================================================
    // 3. DATABASE CONNECTION POOL CONFIGURATION & INDEX VERIFICATION
    // =========================================================================
    console.log('\n--- 3. Database Connection Pool & Index Verification ---');

    await test('Connection Pool: Pool configuration matches production readiness standards', async () => {
      const pool = (sequelize as any).connectionManager?.pool;
      const poolOptions = (sequelize as any).options?.pool;
      assert.ok(poolOptions, 'Sequelize pool options must be configured');
      assert.strictEqual(poolOptions.max, 10, 'Pool max should be 10');
      assert.strictEqual(poolOptions.min, 2, 'Pool min should be 2 for pre-warmed connections');
      assert.strictEqual(poolOptions.acquire, 10000, 'Pool acquire timeout should be 10000ms');
      assert.strictEqual(poolOptions.idle, 10000, 'Pool idle timeout should be 10000ms');
    });

    await test('Database Indexes: Performance composite indexes are active in MySQL', async () => {
      const [indices] = await sequelize.query(`
        SELECT TABLE_NAME, INDEX_NAME 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = '${env.DATABASE_NAME}'
      `) as any[];

      const indexMap = new Set(indices.map((i: any) => `${i.TABLE_NAME}.${i.INDEX_NAME}`));

      // Verify all 7 composite indexes created in migration 20260904000002
      assert.ok(
        indexMap.has('notifications.notifications_user_unread_created_idx'),
        'notifications_user_unread_created_idx must exist'
      );
      assert.ok(
        indexMap.has('applications.applications_opp_type_status_idx'),
        'applications_opp_type_status_idx must exist'
      );
      assert.ok(
        indexMap.has('applications.applications_student_status_idx'),
        'applications_student_status_idx must exist'
      );
      assert.ok(
        indexMap.has('jobs.jobs_status_deadline_idx'),
        'jobs_status_deadline_idx must exist'
      );
      assert.ok(
        indexMap.has('internships.internships_status_deadline_idx'),
        'internships_status_deadline_idx must exist'
      );
      assert.ok(
        indexMap.has('skill_gaps.skill_gaps_student_status_priority_idx'),
        'skill_gaps_student_status_priority_idx must exist'
      );
      assert.ok(
        indexMap.has('assessment_attempts.assessment_attempts_student_assessment_status_idx'),
        'assessment_attempts_student_assessment_status_idx must exist'
      );
    });

    // =========================================================================
    // 4. EVENT LISTENER IDEMPOTENCY & LEAK PREVENTION
    // =========================================================================
    console.log('\n--- 4. Event Subscriber Idempotency ---');

    await test('Event Handlers: Repeated initEventSubscribers calls do not duplicate listeners', async () => {
      const countBefore = appEvents.listenerCount(AppEventType.APPLICATION_SUBMITTED);
      // Invoke initialization again
      initEventSubscribers();
      initEventSubscribers();
      const countAfter = appEvents.listenerCount(AppEventType.APPLICATION_SUBMITTED);

      assert.strictEqual(
        countAfter,
        countBefore,
        'Listener count must remain constant to prevent memory leak and duplicate actions'
      );
    });

    // =========================================================================
    // 5. MATCHING & RECOMMENDATION ENGINE N+1 QUERY OPTIMIZATION
    // =========================================================================
    console.log('\n--- 5. Matching & Recommendation Engine Optimization ---');

    await test('MatchingContext: calculateMatch reuses pre-loaded context correctly', async () => {
      // Find or create test student
      let student = await StudentProfile.findOne();
      if (!student) {
        const testUser = await User.create({
          email: `perf_student_${Date.now()}@test.com`,
          passwordHash: 'hash123',
          role: UserRole.STUDENT,
          firstName: 'Perf',
          lastName: 'Student',
        });
        student = await StudentProfile.create({
          userId: testUser.id,
          headline: 'CS Student',
          collegeName: 'Test College',
          department: 'Computer Science',
          graduationYear: 2026,
        });
      }

      // Find or create test job
      let job = await Job.findOne();
      if (!job) {
        let ind = await IndustryProfile.findOne();
        if (!ind) {
          const indUser = await User.create({
            email: `perf_ind_${Date.now()}@test.com`,
            passwordHash: 'hash123',
            role: UserRole.INDUSTRY,
            firstName: 'Perf',
            lastName: 'Industry',
          });
          ind = await IndustryProfile.create({
            userId: indUser.id,
            companyName: 'Perf Corp',
            industryType: 'IT',
          });
        }
        job = await Job.create({
          industryId: ind.id,
          title: 'Software Engineer',
          description: 'Build backend APIs with node and express',
          status: OpportunityStatus.OPEN,
          workplaceType: WorkplaceType.REMOTE,
          employmentType: EmploymentType.FULL_TIME,
        });
      }

      // Call without context
      const match1 = await matchingService.calculateMatch(student.id, job.id, OpportunityType.JOB, false);
      assert.ok(match1.matchScore >= 0 && match1.matchScore <= 100);

      // Call with context
      const context: MatchingContext = {
        student,
        activeSkills: [],
        careerRoles: [],
        studentSkills: [],
        careerInterests: [],
        experiences: [],
        assessments: [],
      };
      const match2 = await matchingService.calculateMatch(student.id, job.id, OpportunityType.JOB, false, context);
      assert.ok(match2.matchScore >= 0 && match2.matchScore <= 100);
      assert.strictEqual(match2.studentId, student.id);
      assert.strictEqual(match2.opportunityId, job.id);
    });

    await test('recommendOpportunitiesForStudent: Executes with context batching without error', async () => {
      const student = await StudentProfile.findOne();
      if (student) {
        const start = Date.now();
        const result = await recommendationService.recommendOpportunitiesForStudent(student.userId, {
          page: 1,
          limit: 10,
        });
        const elapsed = Date.now() - start;
        assert.ok(result.recommendations);
        assert.ok(result.pagination);
        assert.strictEqual(result.pagination.page, 1);
        assert.strictEqual(result.pagination.limit, 10);
        console.log(`    (Recommendation query executed in ${elapsed}ms for page of 10)`);
      }
    });

    // =========================================================================
    // 6. BOUNDED PAGINATION LIMITS & INPUT SECURITY
    // =========================================================================
    console.log('\n--- 6. Bounded Pagination & Schema Safeguards ---');

    await test('Pagination Limits: Schema rejects excessive page size (e.g. limit=1000)', async () => {
      const parseResult = opportunityRecommendationQuerySchema.safeParse({
        limit: 1000,
        page: 1,
      });
      assert.strictEqual(parseResult.success, false, 'Unbounded limit (>100) must be rejected');
    });

    await test('Pagination Limits: Valid page size (limit=50) passes validation', async () => {
      const parseResult = opportunityRecommendationQuerySchema.safeParse({
        limit: 50,
        page: 1,
      });
      assert.strictEqual(parseResult.success, true, 'Reasonable limit (<=100) must be accepted');
    });

  } finally {
    server.close();
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`PHASE 21 PERFORMANCE & READINESS TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} performance/production test(s) failed`);
  }
};

if (require.main === module) {
  runPhase21PerformanceProductionTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Test execution error:', err);
      process.exit(1);
    });
}
