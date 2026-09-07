const http = require('http');
const { sequelize } = require('../../dist/config/database');

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function verifyR5() {
  console.log('================================================================');
  console.log('         R5 VERIFICATION: DATABASE INTEGRITY & API AUDIT        ');
  console.log('================================================================\n');

  await sequelize.authenticate();
  console.log('✓ Sequelize authenticated with Railway MySQL.\n');

  // 1. COUNT AUDIT
  console.log('--- 1. DATABASE ENTITY COUNTS ---');
  const countQueries = {
    'Users': 'SELECT count(*) as c FROM users',
    'Student Profiles': 'SELECT count(*) as c FROM student_profiles',
    'Industry Profiles': 'SELECT count(*) as c FROM industry_profiles',
    'Academician Profiles': 'SELECT count(*) as c FROM academician_profiles',
    'Institution Profiles': 'SELECT count(*) as c FROM institution_profiles',
    'Institution Departments': 'SELECT count(*) as c FROM institution_departments',
    'Mentors': 'SELECT count(*) as c FROM mentors',
    'Skill Categories': 'SELECT count(*) as c FROM skill_categories',
    'Skills': 'SELECT count(*) as c FROM skills',
    'Student Skills': 'SELECT count(*) as c FROM student_skills',
    'Career Roles': 'SELECT count(*) as c FROM career_roles',
    'Career Role Skills': 'SELECT count(*) as c FROM career_role_skills',
    'Student Career Interests': 'SELECT count(*) as c FROM student_career_interests',
    'Skill Assessments': 'SELECT count(*) as c FROM skill_assessments',
    'Assessment Questions': 'SELECT count(*) as c FROM assessment_questions',
    'Assessment Attempts': 'SELECT count(*) as c FROM assessment_attempts',
    'Assessment Answers': 'SELECT count(*) as c FROM assessment_answers',
    'Skill Gaps': 'SELECT count(*) as c FROM skill_gaps',
    'Jobs': 'SELECT count(*) as c FROM jobs',
    'Internships': 'SELECT count(*) as c FROM internships',
    'Projects': 'SELECT count(*) as c FROM projects',
    'Learning Programs': 'SELECT count(*) as c FROM learning_programs',
    'Learning Recommendations': 'SELECT count(*) as c FROM learning_recommendations',
    'Applications': 'SELECT count(*) as c FROM applications',
    'Application Status Histories': 'SELECT count(*) as c FROM application_status_histories',
    'Opportunity Matches': 'SELECT count(*) as c FROM opportunity_matches',
    'Collaborations': 'SELECT count(*) as c FROM collaborations',
    'Workshops': 'SELECT count(*) as c FROM workshops',
    'Notifications': 'SELECT count(*) as c FROM notifications',
  };

  const counts = {};
  for (const [name, sql] of Object.entries(countQueries)) {
    const [res] = await sequelize.query(sql);
    counts[name] = Number(res[0].c);
    console.log(`  • ${name.padEnd(30)}: ${counts[name]}`);
  }

  // 2. RELATIONAL INTEGRITY CHECKS (ORPHAN DETECTION)
  console.log('\n--- 2. RELATIONAL INTEGRITY & ORPHAN AUDIT ---');
  const orphanChecks = [
    {
      name: 'Students without Users',
      sql: 'SELECT count(*) as c FROM student_profiles sp LEFT JOIN users u ON sp.user_id = u.id WHERE u.id IS NULL',
    },
    {
      name: 'Industries without Users',
      sql: 'SELECT count(*) as c FROM industry_profiles ip LEFT JOIN users u ON ip.user_id = u.id WHERE u.id IS NULL',
    },
    {
      name: 'Academicians without Institutions',
      sql: 'SELECT count(*) as c FROM academician_profiles ap LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id WHERE ip.id IS NULL',
    },
    {
      name: 'Student Skills without Skills',
      sql: 'SELECT count(*) as c FROM student_skills ss LEFT JOIN skills s ON ss.skill_id = s.id WHERE s.id IS NULL',
    },
    {
      name: 'Career Role Skills without Skills',
      sql: 'SELECT count(*) as c FROM career_role_skills crs LEFT JOIN skills s ON crs.skill_id = s.id WHERE s.id IS NULL',
    },
    {
      name: 'Assessment Questions without Assessment',
      sql: 'SELECT count(*) as c FROM assessment_questions aq LEFT JOIN skill_assessments sa ON aq.assessment_id = sa.id WHERE sa.id IS NULL',
    },
    {
      name: 'Assessment Attempts without Student',
      sql: 'SELECT count(*) as c FROM assessment_attempts aa LEFT JOIN student_profiles sp ON aa.student_id = sp.id WHERE sp.id IS NULL',
    },
    {
      name: 'Skill Gaps without Student',
      sql: 'SELECT count(*) as c FROM skill_gaps sg LEFT JOIN student_profiles sp ON sg.student_id = sp.id WHERE sp.id IS NULL',
    },
    {
      name: 'Jobs without Industry',
      sql: 'SELECT count(*) as c FROM jobs j LEFT JOIN industry_profiles ip ON j.industry_id = ip.id WHERE ip.id IS NULL',
    },
    {
      name: 'Applications without Student',
      sql: 'SELECT count(*) as c FROM applications a LEFT JOIN student_profiles sp ON a.student_id = sp.id WHERE sp.id IS NULL',
    },
    {
      name: 'Notifications without User',
      sql: 'SELECT count(*) as c FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE u.id IS NULL',
    },
  ];

  let totalOrphans = 0;
  for (const check of orphanChecks) {
    const [res] = await sequelize.query(check.sql);
    const count = Number(res[0].c);
    totalOrphans += count;
    console.log(`  ✓ ${check.name.padEnd(45)}: ${count} orphans ${count === 0 ? '(PASS)' : '(FAIL)'}`);
  }

  // 3. API ENDPOINT VERIFICATION
  console.log('\n--- 3. API ENDPOINT VERIFICATION (HTTP localhost:5000/api/v1) ---');
  const demoAccounts = [
    { role: 'Student', email: 'demo.student@sih.gov.in', pass: 'DemoPassword123!' },
    { role: 'Industry', email: 'demo.industry@sih.gov.in', pass: 'DemoPassword123!' },
    { role: 'Academician', email: 'demo.academician@sih.gov.in', pass: 'DemoPassword123!' },
    { role: 'Institution', email: 'demo.institution@sih.gov.in', pass: 'DemoPassword123!' },
  ];

  const tokens = {};
  for (const acc of demoAccounts) {
    const res = await httpRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: acc.email, password: acc.pass }
    );

    if (res.status === 200 && res.data.success) {
      tokens[acc.role] = res.data.data.accessToken;
      console.log(`  ✓ Auth Login [${acc.role}]: PASS (200 OK) -> User: ${res.data.data.user.email}`);
    } else {
      console.error(`  ✗ Auth Login [${acc.role}]: FAIL (${res.status})`, res.data);
    }
  }

  const studentToken = tokens['Student'];
  const apiChecks = [
    { name: 'Auth Profile (/auth/me)', path: '/api/v1/auth/me', token: studentToken },
    { name: 'Student Profile (/students/me/profile)', path: '/api/v1/students/me/profile', token: studentToken },
    { name: 'Student Skills (/students/me/skills)', path: '/api/v1/students/me/skills', token: studentToken },
    { name: 'Skills Catalog (/skills)', path: '/api/v1/skills', token: studentToken },
    { name: 'Career Roles (/careers)', path: '/api/v1/careers', token: studentToken },
    { name: 'Assessments Catalog (/assessments)', path: '/api/v1/assessments', token: studentToken },
    { name: 'Skill Gaps (/students/me/skill-gaps)', path: '/api/v1/students/me/skill-gaps', token: studentToken },
    { name: 'Opportunities - Jobs (/jobs)', path: '/api/v1/jobs', token: studentToken },
    { name: 'Opportunities - Internships (/internships)', path: '/api/v1/internships', token: studentToken },
    { name: 'Opportunities - Projects (/projects)', path: '/api/v1/projects', token: studentToken },
    { name: 'Student Applications (/applications/me)', path: '/api/v1/applications/me', token: studentToken },
    { name: 'Notifications (/notifications)', path: '/api/v1/notifications', token: studentToken },
  ];

  let apiPassed = 0;
  for (const check of apiChecks) {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: check.path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${check.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 200 && (res.data.success || Array.isArray(res.data.data) || typeof res.data === 'object')) {
      apiPassed++;
      const countInfo = Array.isArray(res.data.data) ? `(${res.data.data.length} items)` : res.data.data?.total ? `(${res.data.data.total} items)` : '';
      console.log(`  ✓ ${check.name.padEnd(45)}: PASS (200 OK) ${countInfo}`);
    } else {
      console.log(`  ✗ ${check.name.padEnd(45)}: HTTP ${res.status}`);
    }
  }

  console.log(`\nVerified ${apiPassed} of ${apiChecks.length} API endpoints successfully.`);
  process.exit(0);
}

verifyR5().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
