import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/v1';

const runE2E = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 3B COMPLETE END-TO-END HTTP TEST');
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
      failed++;
    }
  };

  let token = '';
  let skillCatalogItem: any = null;
  let addedStudentSkillId = 0;
  let assessmentItem: any = null;
  let activeAttemptId = 0;
  let safeQuestions: any[] = [];
  let careerRoleItem: any = null;

  const testEmail = `student.phase3b.${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  const request = async (endpoint: string, options: any = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  };

  // 1. Auth: Register & Login
  console.log('--- 1. Auth & Session ---');
  await test('Register new student user', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        firstName: 'Divyansh',
        lastName: 'Student',
        email: testEmail,
        password: testPassword,
        role: 'Student',
      },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data?.data?.user?.id);
    assert.strictEqual(res.data.data.user.email, testEmail);
  });

  await test('Login with student credentials and receive JWT token', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data?.data?.accessToken);
    token = res.data.data.accessToken;
  });

  // 2. Profile
  console.log('\n--- 2. Student Profile ---');
  await test('Create / Get student profile', async () => {
    let res = await request('/students/me/profile', { method: 'GET' });
    if (res.status === 404) {
      res = await request('/students/me/profile', {
        method: 'POST',
        body: {
          headline: 'Computer Science Undergraduate',
          collegeName: 'IIT Delhi',
          currentSemester: 6,
        },
      });
    }
    assert.ok(res.status === 200 || res.status === 201);
    assert.ok(res.data?.data?.id);
  });

  await test('Update student profile (personal, academic, links)', async () => {
    const res = await request('/students/me/profile', {
      method: 'PATCH',
      body: {
        headline: 'Full Stack Engineer & AI Enthusiast',
        bio: 'Passionate about building scalable applications.',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        collegeName: 'IIT Delhi',
        department: 'Computer Science and Engineering',
        course: 'B.Tech',
        currentSemester: 6,
        cgpa: 9.1,
        careerGoal: 'Software Engineer at top tech firm',
        githubUrl: 'https://github.com/divyansh',
        linkedinUrl: 'https://linkedin.com/in/divyansh',
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data?.data?.headline, 'Full Stack Engineer & AI Enthusiast');
    assert.strictEqual(res.data?.data?.city, 'New Delhi');
    assert.strictEqual(Number(res.data?.data?.cgpa), 9.1);
  });

  await test('Verify profile persistence on refetch', async () => {
    const res = await request('/students/me/profile', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data?.data?.headline, 'Full Stack Engineer & AI Enthusiast');
    assert.strictEqual(res.data?.data?.department, 'Computer Science and Engineering');
  });

  // 3. Skills
  console.log('\n--- 3. Skill Taxonomy & Student Skills ---');
  await test('Browse skill taxonomy (/skills)', async () => {
    const res = await request('/skills?limit=10', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data?.data?.skills?.length > 0);
    skillCatalogItem = res.data.data.skills[0];
    assert.ok(skillCatalogItem.id);
    assert.ok(skillCatalogItem.name);
  });

  await test('Add skill from taxonomy to profile', async () => {
    const res = await request('/students/me/skills', {
      method: 'POST',
      body: {
        skillId: skillCatalogItem.id,
        level: 'BEGINNER',
        yearsOfExperience: 1,
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data?.data?.skillId, skillCatalogItem.id);
    assert.strictEqual(res.data?.data?.level, 'BEGINNER');
    assert.strictEqual(res.data?.data?.verified, false);
    addedStudentSkillId = res.data.data.id;
  });

  await test('Update skill level and experience', async () => {
    const res = await request(`/students/me/skills/${addedStudentSkillId}`, {
      method: 'PATCH',
      body: {
        level: 'INTERMEDIATE',
        yearsOfExperience: 2,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data?.data?.level, 'INTERMEDIATE');
  });

  await test('Verify student skills list contains updated skill', async () => {
    const res = await request('/students/me/skills', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    const found = res.data?.data?.skills?.find((s: any) => s.id === addedStudentSkillId);
    assert.ok(found);
    assert.strictEqual(found.level, 'INTERMEDIATE');
    assert.strictEqual(found.skill.name, skillCatalogItem.name);
  });

  // 4. Assessments
  console.log('\n--- 4. Assessment System & Test Runner ---');
  await test('List active assessments (/assessments)', async () => {
    const res = await request('/assessments?limit=10', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data?.data?.assessments?.length > 0);
    assessmentItem = res.data.data.assessments[0];
    assert.ok(assessmentItem.id);
  });

  await test('Start assessment attempt and receive safe questions', async () => {
    const res = await request(`/assessments/${assessmentItem.id}/attempts`, { method: 'POST' });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data?.data?.attempt?.id);
    activeAttemptId = res.data.data.attempt.id;
    safeQuestions = res.data.data.questions;
    assert.ok(safeQuestions.length > 0);
    // Security verification: ensure correctAnswer is masked
    for (const q of safeQuestions) {
      assert.strictEqual(q.correctAnswer, undefined);
    }
  });

  await test('Fetch attempt details (/assessments/attempts/:id)', async () => {
    const res = await request(`/assessments/attempts/${activeAttemptId}`, { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data?.data?.id, activeAttemptId);
    assert.ok(res.data?.data?.questions?.length > 0);
  });

  await test('Submit assessment attempt for backend evaluation', async () => {
    // Pick the first option or a placeholder for each question
    const answers = safeQuestions.map(q => {
      const optionVal = Array.isArray(q.options) && q.options.length > 0
        ? q.options[0]
        : 'test-answer';
      return {
        questionId: q.id,
        answer: String(optionVal),
      };
    });

    const res = await request(`/assessments/attempts/${activeAttemptId}/submit`, {
      method: 'POST',
      body: { answers },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data?.data?.attemptId);
    assert.ok(typeof res.data?.data?.percentage === 'number');
    assert.ok(typeof res.data?.data?.passed === 'boolean');
    assert.ok(res.data?.data?.level);
    assert.strictEqual(res.data?.data?.status, 'COMPLETED');
  });

  await test('Verify student attempt history contains completed test', async () => {
    const res = await request('/students/me/assessment-attempts', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    const found = res.data?.data?.attempts?.find((a: any) => a.id === activeAttemptId);
    assert.ok(found);
    assert.strictEqual(found.status, 'COMPLETED');
  });

  // 5. Career Roles & Skill Gaps
  console.log('\n--- 5. Career Roles & Skill Gap Analysis ---');
  await test('List career roles and add career interest', async () => {
    const rolesRes = await request('/careers?limit=5', { method: 'GET' });
    assert.strictEqual(rolesRes.status, 200);
    if (rolesRes.data?.data?.careerRoles?.length > 0) {
      careerRoleItem = rolesRes.data.data.careerRoles[0];
      const interestRes = await request('/students/me/career-interests', {
        method: 'POST',
        body: {
          careerRoleId: careerRoleItem.id,
          priority: 'PRIMARY',
        },
      });
      assert.strictEqual(interestRes.status, 201);
    }
  });

  await test('Fetch student skill gaps (/students/me/skill-gaps)', async () => {
    const res = await request('/students/me/skill-gaps', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data?.data?.skillGaps));
    if (res.data.data.skillGaps.length > 0) {
      const gap = res.data.data.skillGaps[0];
      console.log('      [DEBUG] Sample Gap:', JSON.stringify(gap));
      assert.ok(gap.skill);
      assert.ok(gap.currentScore !== undefined);
      assert.ok(gap.requiredScore !== undefined);
      assert.ok(gap.priority);
      assert.ok(gap.status);
    }
  });

  await test('Recalculate skill gaps (/students/me/skill-gaps/recalculate)', async () => {
    const res = await request('/students/me/skill-gaps/recalculate', { method: 'POST' });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data?.data?.skillGaps));
  });

  // 6. Dashboard
  console.log('\n--- 6. Student Dashboard ---');
  await test('Fetch student dashboard analytics', async () => {
    const res = await request('/students/me/dashboard', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data?.data);
  });

  console.log('\n=============================================');
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runE2E().catch(err => {
  console.error('Fatal E2E Error:', err);
  process.exit(1);
});
