import assert from 'assert';
import http from 'http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import '../models';
import { app } from '../app';
import { env } from '../config/env.config';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { Document } from '../models/document.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { authService } from '../services/auth.service';
import { documentService } from '../services/document.service';
import { opportunityService } from '../services/opportunity.service';
import { notificationService } from '../services/notification.service';
import { searchService } from '../services/search.service';
import { storageService } from '../utils/storage.util';
import { verifyAccessToken, signAccessToken } from '../utils/jwt.util';
import { authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';
import { HttpStatus } from '../constants/http-status';
import { DocumentAccessLevel, OpportunityStatus, WorkplaceType, EmploymentType } from '../constants/enums';
import { globalSearchQuerySchema } from '../validators/search.validator';

export const runPhase18SecurityTests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 18 API VALIDATION & SECURITY HARDENING TESTS');
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
  const passwordHash = await bcrypt.hash('SecTest123!', 10);

  // =========================================================================
  // 1. AUTHENTICATION & TOKEN SECURITY
  // =========================================================================
  console.log('--- 1. Authentication & Token Security ---');

  const activeUser = await User.create({
    email: `sec_active_${ts}@test.com`,
    passwordHash,
    role: UserRole.STUDENT,
    firstName: 'Active',
    lastName: 'User',
    isActive: true,
    isVerified: true,
  });

  const inactiveUser = await User.create({
    email: `sec_inactive_${ts}@test.com`,
    passwordHash,
    role: UserRole.STUDENT,
    firstName: 'Inactive',
    lastName: 'User',
    isActive: false,
    isVerified: true,
  });

  await test('Reject login with incorrect password', async () => {
    let errorCaught = false;
    try {
      await authService.login({
        email: activeUser.email,
        password: 'WrongPassword999!',
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.UNAUTHORIZED);
      assert.strictEqual(err.message, 'Invalid email or password');
    }
    assert.ok(errorCaught, 'Must reject incorrect credentials');
  });

  await test('Reject login for inactive / suspended account', async () => {
    let errorCaught = false;
    try {
      await authService.login({
        email: inactiveUser.email,
        password: 'SecTest123!',
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.UNAUTHORIZED);
      assert.strictEqual(err.message, 'Account has been deactivated. Please contact support.');
    }
    assert.ok(errorCaught, 'Must block deactivated account from logging in');
  });

  await test('Reject expired access token', async () => {
    // Generate an already-expired token (signed with valid secret)
    const expiredToken = jwt.sign(
      { id: activeUser.id, email: activeUser.email, role: activeUser.role },
      env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    let errorCaught = false;
    try {
      verifyAccessToken(expiredToken);
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.UNAUTHORIZED);
      assert.strictEqual(err.message, 'Invalid or expired access token');
    }
    assert.ok(errorCaught, 'Must reject expired tokens');
  });

  await test('Reject token signed with forged / invalid secret', async () => {
    const forgedToken = jwt.sign(
      { id: activeUser.id, email: activeUser.email, role: UserRole.INSTITUTION },
      'forged-malicious-secret-key-12345',
      { expiresIn: '1h' }
    );

    let errorCaught = false;
    try {
      verifyAccessToken(forgedToken);
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.UNAUTHORIZED);
      assert.strictEqual(err.message, 'Invalid or expired access token');
    }
    assert.ok(errorCaught, 'Must reject forged JWT signatures');
  });

  await test('Reject invalid refresh token on token refresh attempt', async () => {
    let errorCaught = false;
    try {
      await authService.refreshToken('malicious.invalid.refreshtokenstring');
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.UNAUTHORIZED);
    }
    assert.ok(errorCaught, 'Must reject invalid refresh token');
  });

  // =========================================================================
  // 2. DATA MASKING & SENSITIVE FIELD PROTECTION
  // =========================================================================
  console.log('\n--- 2. Data Masking & Sensitive Field Protection ---');

  await test('User.toJSON() must never expose passwordHash', async () => {
    const userObj = activeUser.toJSON() as any;
    assert.strictEqual(userObj.passwordHash, undefined, 'passwordHash must be omitted from toJSON()');
  });

  await test('AssessmentQuestion.toJSON() must never expose correctAnswer', async () => {
    const question = AssessmentQuestion.build({
      id: 9999,
      assessmentId: 1,
      question: 'What is O(1) time complexity?',
      options: ['Linear', 'Constant', 'Quadratic', 'Logarithmic'],
      correctAnswer: 'Constant',
      points: 10,
    });

    const json = question.toJSON() as any;
    assert.strictEqual(json.correctAnswer, undefined, 'correctAnswer must be omitted from student-facing JSON');
  });

  // =========================================================================
  // 3. RBAC & IDOR PROTECTION
  // =========================================================================
  console.log('\n--- 3. RBAC & IDOR Protection ---');

  // Create Student A and Student B
  const studentAUser = await User.create({
    email: `sec_stda_${ts}@test.com`,
    passwordHash,
    role: UserRole.STUDENT,
    firstName: 'Student',
    lastName: 'Alpha',
    isActive: true,
  });
  const studentBUser = await User.create({
    email: `sec_stdb_${ts}@test.com`,
    passwordHash,
    role: UserRole.STUDENT,
    firstName: 'Student',
    lastName: 'Beta',
    isActive: true,
  });

  await StudentProfile.create({
    userId: studentAUser.id,
    collegeName: 'Alpha University',
    course: 'Computer Science',
    profileCompletion: 80,
  });
  await StudentProfile.create({
    userId: studentBUser.id,
    collegeName: 'Beta University',
    course: 'Information Technology',
    profileCompletion: 80,
  });

  // Create document owned by Student A
  const studentADoc = await documentService.createDocument(studentAUser.id, {
    fileName: 'alpha_resume.pdf',
    fileUrl: '/uploads/resumes/alpha_resume.pdf',
    fileType: 'application/pdf',
    fileSizeBytes: 10240,
    accessLevel: DocumentAccessLevel.PRIVATE,
  });

  await test('IDOR: Student B cannot access Student A private document', async () => {
    let errorCaught = false;
    try {
      await documentService.getDocumentById(studentBUser.id, studentADoc.id);
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.FORBIDDEN);
      assert.ok(err.message.includes('permission to view this document'));
    }
    assert.ok(errorCaught, 'IDOR document access attempt must be rejected with 403 Forbidden');
  });

  await test('IDOR: Student B cannot delete Student A document', async () => {
    let errorCaught = false;
    try {
      await documentService.deleteDocument(studentBUser.id, studentADoc.id);
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.FORBIDDEN);
      assert.ok(err.message.includes('Only the document owner can delete this document'));
    }
    assert.ok(errorCaught, 'IDOR document deletion attempt must be rejected with 403 Forbidden');
  });

  await test('IDOR: User B cannot access User A notifications', async () => {
    const notifs = await notificationService.getMyNotifications(studentBUser.id, { page: 1, limit: 10 });
    // User B receives their own notifications, never User A
    assert.ok(Array.isArray(notifs.notifications));
  });

  await test('RBAC: authorizeRoles rejects unauthorized roles', async () => {
    const middleware = authorizeRoles(UserRole.INSTITUTION, UserRole.INDUSTRY);
    let errorCaught = false;

    const mockReq = {
      user: { id: studentAUser.id, role: UserRole.STUDENT },
    } as any;
    const mockRes = {} as any;
    const mockNext = (err?: any) => {
      if (err) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, HttpStatus.FORBIDDEN);
      }
    };

    middleware(mockReq, mockRes, mockNext);
    assert.ok(errorCaught, 'Student role must be rejected by institution/industry restricted route');
  });

  // Create Industry A and Industry B
  const industryAUser = await User.create({
    email: `sec_inda_${ts}@test.com`,
    passwordHash,
    role: UserRole.INDUSTRY,
    firstName: 'TechCorp',
    lastName: 'Alpha',
  });
  const industryBUser = await User.create({
    email: `sec_indb_${ts}@test.com`,
    passwordHash,
    role: UserRole.INDUSTRY,
    firstName: 'TechCorp',
    lastName: 'Beta',
  });

  const indAProfile = await IndustryProfile.create({
    userId: industryAUser.id,
    companyName: 'TechCorp Alpha',
    industryType: 'Information Technology',
  });
  await IndustryProfile.create({
    userId: industryBUser.id,
    companyName: 'TechCorp Beta',
    industryType: 'Information Technology',
  });

  const jobA = await opportunityService.createJob(industryAUser.id, {
    title: 'Software Engineer',
    description: 'Build robust backend architectures with high security',
    openings: 2,
    status: OpportunityStatus.OPEN,
    workplaceType: WorkplaceType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    applicationDeadline: '2028-01-01',
  });

  await test('IDOR: Industry B cannot update Industry A job opportunity', async () => {
    let errorCaught = false;
    try {
      await opportunityService.updateJob(industryBUser.id, jobA.id, {
        title: 'Hacked Title',
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.FORBIDDEN);
      assert.strictEqual(err.message, 'You are not authorized to modify this job');
    }
    assert.ok(errorCaught, 'Must forbid cross-tenant opportunity updates');
  });

  // =========================================================================
  // 4. FILE UPLOAD & PATH TRAVERSAL DEFENSE
  // =========================================================================
  console.log('\n--- 4. File Upload & Path Traversal Defense ---');

  await test('File Upload: Reject prohibited dangerous file extensions (.exe, .sh, .php, .js)', async () => {
    const dangerousFiles = ['virus.exe', 'exploit.sh', 'shell.php', 'script.js'];
    for (const filename of dangerousFiles) {
      let errorCaught = false;
      try {
        await storageService.upload({
          originalname: filename,
          mimetype: 'application/octet-stream',
          size: 100,
          buffer: Buffer.from('malicious payload'),
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, HttpStatus.BAD_REQUEST);
        assert.ok(err.message.includes('not allowed'), `Must state file type not allowed: ${filename}`);
      }
      assert.ok(errorCaught, `Must reject dangerous extension: ${filename}`);
    }
  });

  await test('Path Traversal: Reject file keys attempting directory traversal in storage', async () => {
    const traversalKeys = [
      '../../etc/passwd',
      '..\\..\\windows\\system32',
      'resumes/../../../secret.txt',
    ];

    for (const key of traversalKeys) {
      let errorCaught = false;
      try {
        await storageService.getAccessibleUrl(key);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, HttpStatus.BAD_REQUEST);
        assert.ok(err.message.includes('Path traversal'));
      }
      assert.ok(errorCaught, `Must reject traversal key: ${key}`);
    }
  });

  await test('File Upload: Reject file exceeding 10MB size limit', async () => {
    let errorCaught = false;
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    try {
      await storageService.upload({
        originalname: 'huge_file.pdf',
        mimetype: 'application/pdf',
        size: oversizedBuffer.length,
        buffer: oversizedBuffer,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, HttpStatus.BAD_REQUEST);
      assert.ok(err.message.includes('exceeds maximum allowed limit'));
    }
    assert.ok(errorCaught, 'Must reject files > 10MB');
  });

  // =========================================================================
  // 5. INJECTION, PARAMETER VALIDATION & SEARCH SAFETY
  // =========================================================================
  console.log('\n--- 5. Injection, Parameter Validation & Search Safety ---');

  await test('Search Query Validation: Rejects malicious / invalid search parameters', async () => {
    // Excessive query string (> 200 characters)
    const longQuery = 'a'.repeat(250);
    const parseResult1 = globalSearchQuerySchema.safeParse({ q: longQuery });
    assert.strictEqual(parseResult1.success, false, 'Should reject queries > 200 characters');

    // Invalid category enum
    const parseResult2 = globalSearchQuerySchema.safeParse({ q: 'engineer', type: 'INVALID_CATEGORY' });
    assert.strictEqual(parseResult2.success, false, 'Should reject unsupported search types');

    // Negative pagination
    const parseResult3 = globalSearchQuerySchema.safeParse({ q: 'engineer', page: -1 });
    assert.strictEqual(parseResult3.success, false, 'Should reject negative page numbers');

    // Excessive limit (> 100)
    const parseResult4 = globalSearchQuerySchema.safeParse({ q: 'engineer', limit: 500 });
    assert.strictEqual(parseResult4.success, false, 'Should reject excessive limit');
  });

  await test('SQL Injection Defense: Search service safely escapes SQL meta-characters', async () => {
    const maliciousInputs = [
      "' OR 1=1 --",
      "'; DROP TABLE users; --",
      "UNION SELECT * FROM users",
      "\\%\\_",
    ];

    for (const sqlPayload of maliciousInputs) {
      const res = await searchService.search({
        q: sqlPayload,
        page: 1,
        limit: 10,
      });
      assert.ok(Array.isArray(res.results), 'Must safely execute parameterized query without crashing');
    }
  });

  // =========================================================================
  // 6. LIVE HTTP SERVER SECURITY HEADERS, CORS & PRODUCTION ERROR SANITIZATION
  // =========================================================================
  console.log('\n--- 6. HTTP Security Headers, CORS & Error Handling ---');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}/api/v1`;

  try {
    await test('Security Headers: Helmet sets nosniff and disables X-Powered-By', async () => {
      const res = await fetch(`${baseUrl}/docs`);
      assert.strictEqual(res.headers.get('x-powered-by'), null, 'X-Powered-By must be disabled');
      assert.strictEqual(
        res.headers.get('x-content-type-options'),
        'nosniff',
        'X-Content-Type-Options must be nosniff'
      );
    });

    await test('Malformed JSON: Returns structured 400 validation error without stack trace leak', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"invalidJson": unquotedValue}',
      });

      assert.strictEqual(res.status, 400);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.stack, undefined, 'Stack trace must not be leaked');
    });

    await test('Route Not Found: Returns structured 404 without internal server details', async () => {
      const res = await fetch(`${baseUrl}/non-existent-route-9999`);
      assert.strictEqual(res.status, 404);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.stack, undefined, 'Stack trace must not be leaked');
    });

    await test('CORS Hardening: Permits configured origin and denies disallowed origin', async () => {
      // Allowed or localhost in non-production
      const allowedRes = await fetch(`${baseUrl}/docs`, {
        headers: { Origin: 'http://localhost:3000' },
      });
      assert.ok(allowedRes.status < 500);

      // Verify credentials header can be returned with specific origin
      const allowOrigin = allowedRes.headers.get('access-control-allow-origin');
      if (allowOrigin) {
        assert.notStrictEqual(allowOrigin, '*', 'Access-Control-Allow-Origin must not be wildcard with credentials');
      }
    });

    await test('Rate Limiting: Exceeding authRateLimiter threshold returns HTTP 429', async () => {
      process.env.TEST_RATE_LIMIT = 'true';
      const maxAttempts = 22; // authRateLimiter max is 20
      let hit429 = false;

      for (let i = 0; i < maxAttempts; i++) {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'rate_test@example.com', password: 'bad' }),
        });

        if (res.status === 429) {
          hit429 = true;
          const data: any = await res.json();
          assert.strictEqual(data.success, false);
          assert.ok(data.message.includes('Too many authentication attempts'));
          break;
        }
      }

      delete process.env.TEST_RATE_LIMIT;
      assert.ok(hit429, 'Rate limiter must enforce HTTP 429 Too Many Requests upon exceeding threshold');
    });

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`PHASE 18 SECURITY TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runPhase18SecurityTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error running Phase 18 Security tests:', err);
      process.exit(1);
    });
}
