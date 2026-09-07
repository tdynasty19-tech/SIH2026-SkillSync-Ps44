const API_BASE = 'http://localhost:5000/api/v1';

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = text;
  }

  return {
    status: res.status,
    ok: res.ok,
    data: json,
  };
}

async function runE2E() {
  console.log('--- STARTING PHASE 3C FULL LIFECYCLE E2E TEST ---');

  const stamp = Date.now();

  // 1. Register & Login Industry User
  console.log('1. Registering Industry User...');
  const indEmail = `ind_p3c_${stamp}@company.com`;
  const indPassword = 'Password123!';
  const indRegRes = await request('/auth/register', {
    method: 'POST',
    body: {
      firstName: 'Apex',
      lastName: 'Director',
      email: indEmail,
      password: indPassword,
      role: 'Industry',
    },
  });

  if (!indRegRes.ok) {
    throw new Error(`Industry registration failed: ${JSON.stringify(indRegRes.data)}`);
  }

  const indUserId = indRegRes.data.data.user.id;
  console.log(`PASS: Industry registered (UserID: ${indUserId})`);

  // Login Industry to get JWT
  const indLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: indEmail, password: indPassword },
  });
  if (!indLoginRes.ok) {
    throw new Error(`Industry login failed: ${JSON.stringify(indLoginRes.data)}`);
  }
  const indToken = indLoginRes.data.data.accessToken;
  console.log(`PASS: Industry authenticated with JWT`);

  // Create Industry Profile
  const indProfileRes = await request('/industry/profile', {
    method: 'POST',
    headers: { Authorization: `Bearer ${indToken}` },
    body: {
      companyName: `Apex Cloud Global ${stamp}`,
      cin: `U72200KA${stamp.toString().slice(-6)}PTC`,
      industryType: 'Cloud & AI Infrastructure',
      location: 'Bengaluru Tech Park',
      city: 'Bengaluru',
      state: 'Karnataka',
    },
  });

  if (!indProfileRes.ok) {
    throw new Error(`Industry Profile creation failed (${indProfileRes.status}): ${JSON.stringify(indProfileRes.data)}`);
  }
  console.log(`PASS: Industry Profile created: ${indProfileRes.data.data.companyName}`);

  // 2. Industry Creates Internship Opportunity
  console.log('2. Industry Publishing Internship Opportunity...');
  const internshipRes = await request('/internships', {
    method: 'POST',
    headers: { Authorization: `Bearer ${indToken}` },
    body: {
      title: `Distributed Systems Intern ${stamp}`,
      description: 'Build high-performance microservices, optimize SQL databases, and deploy Kubernetes clusters with Python and Java.',
      requirements: 'Proficiency in Python, Java, SQL, and Docker.',
      durationMonths: 6,
      stipend: 45000,
      workplaceType: 'HYBRID',
      location: 'Bengaluru',
      openings: 2,
      applicationDeadline: '2028-12-31',
    },
  });

  if (!internshipRes.ok) {
    throw new Error(`Internship creation failed: ${JSON.stringify(internshipRes.data)}`);
  }

  const opportunityId = internshipRes.data.data.id;
  const opportunityType = 'INTERNSHIP';
  console.log(`PASS: Internship published: ID #${opportunityId} - "${internshipRes.data.data.title}"`);

  // 3. Register Student User
  console.log('3. Registering Student User...');
  const studentEmail = `student_p3c_${stamp}@university.edu`;
  const studentPassword = 'Password123!';
  const stuRegRes = await request('/auth/register', {
    method: 'POST',
    body: {
      firstName: 'Divyansh',
      lastName: 'Engineer',
      email: studentEmail,
      password: studentPassword,
      role: 'Student',
    },
  });

  if (!stuRegRes.ok) {
    throw new Error(`Student registration failed: ${JSON.stringify(stuRegRes.data)}`);
  }

  const stuUserId = stuRegRes.data.data.user.id;
  console.log(`PASS: Student registered (UserID: ${stuUserId})`);

  // Login Student to get JWT
  const stuLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: studentEmail, password: studentPassword },
  });
  if (!stuLoginRes.ok) {
    throw new Error(`Student login failed: ${JSON.stringify(stuLoginRes.data)}`);
  }
  const stuToken = stuLoginRes.data.data.accessToken;
  console.log(`PASS: Student authenticated with JWT`);

  // Create Student Profile
  const stuProfileRes = await request('/students/me/profile', {
    method: 'POST',
    headers: { Authorization: `Bearer ${stuToken}` },
    body: {
      headline: 'Distributed Systems & Cloud Engineer',
      city: 'Bengaluru',
      state: 'Karnataka',
      collegeName: 'National Institute of Technology',
      department: 'Computer Science & Engineering',
      graduationYear: 2026,
      careerGoal: 'Cloud Software Engineer',
      availabilityStatus: 'AVAILABLE',
    },
  });
  console.log(`PASS: Student Profile created (ProfileID: ${stuProfileRes.data.data.id})`);

  // 4. Student Browses & Checks 5-Factor Match Calculation
  console.log('4. Calculating 5-Factor Deterministic Match via Matching Engine...');
  const matchRes = await request(`/matching/opportunities/${opportunityId}?opportunityType=${opportunityType}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${stuToken}` },
  });

  if (!matchRes.ok) {
    throw new Error(`Match calculation failed: ${JSON.stringify(matchRes.data)}`);
  }

  const matchData = matchRes.data.data;
  console.log(`PASS: Match calculation retrieved successfully!`);
  console.log(`  - Overall Fit Score: ${matchData.matchScore}%`);
  console.log(`  - Skill Match: ${matchData.breakdown.skillMatch.score}%`);
  console.log(`  - Career Alignment: ${matchData.breakdown.careerAlignment.score}%`);
  console.log(`  - Experience Alignment: ${matchData.breakdown.experience.score}%`);
  console.log(`  - Assessment Alignment: ${matchData.breakdown.assessment.score}%`);
  console.log(`  - Preference & Workplace: ${matchData.breakdown.preference.score}%`);

  // 5. Student Applies to Opportunity
  console.log('5. Student submitting application...');
  const applyRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${stuToken}` },
    body: {
      opportunityId,
      opportunityType,
      coverLetter: 'I have hands-on experience developing distributed services and I am thrilled to apply.',
    },
  });

  if (!applyRes.ok) {
    throw new Error(`Application failed: ${JSON.stringify(applyRes.data)}`);
  }

  const applicationId = applyRes.data.data.id;
  console.log(`PASS: Application submitted successfully! (ID: #${applicationId}, Initial Status: ${applyRes.data.data.status})`);

  // 6. Test Duplicate Application Prevention
  console.log('6. Testing duplicate application rejection...');
  const dupRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${stuToken}` },
    body: {
      opportunityId,
      opportunityType,
    },
  });

  if (dupRes.status === 409) {
    console.log('PASS: Duplicate application correctly rejected with 409 Conflict.');
  } else {
    throw new Error(`Expected 409 Conflict for duplicate application, got ${dupRes.status}`);
  }

  // 7. Student Verifies Application Tracker (GET /applications/me)
  console.log('7. Student checking /applications/me tracker...');
  const myAppsRes = await request('/applications/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${stuToken}` },
  });
  const studentApp = myAppsRes.data.data.applications.find((a) => a.id === applicationId);
  if (!studentApp) {
    throw new Error('Submitted application not found in student tracker!');
  }
  console.log(`PASS: Student sees application #${studentApp.id} for "${studentApp.opportunity?.title}" with status "${studentApp.status}"`);

  // 8. Industry Views Pipeline (GET /applications/opportunity/:type/:id)
  console.log('8. Industry reviewing applicant pipeline...');
  const pipelineRes = await request(`/applications/opportunity/${opportunityType}/${opportunityId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${indToken}` },
  });
  const candidateInPipeline = pipelineRes.data.data.applications.find((a) => a.id === applicationId);
  if (!candidateInPipeline) {
    throw new Error('Candidate not present in Industry pipeline!');
  }
  console.log(`PASS: Industry sees applicant (ID #${candidateInPipeline.id}) with status "${candidateInPipeline.status}"`);

  // 9. Industry Transitions Status through Lifecycle
  console.log('9. Transitioning Application Lifecycle: APPLIED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW -> SELECTED...');

  // 9a. Move to UNDER_REVIEW
  const reviewRes = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${indToken}` },
    body: {
      status: 'UNDER_REVIEW',
      reason: 'Initial resume screening passed',
    },
  });
  console.log(`PASS: Status updated to: ${reviewRes.data.data.status}`);

  // 9b. Move to SHORTLISTED
  const shortRes = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${indToken}` },
    body: {
      status: 'SHORTLISTED',
      reason: 'Strong skill fit score',
    },
  });
  console.log(`PASS: Status updated to: ${shortRes.data.data.status}`);

  // 9c. Move to INTERVIEW
  const intRes = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${indToken}` },
    body: {
      status: 'INTERVIEW',
      reason: 'Invited to technical interview round',
    },
  });
  console.log(`PASS: Status updated to: ${intRes.data.data.status}`);

  // 9d. Move to SELECTED (Final Selection State)
  const selRes = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${indToken}` },
    body: {
      status: 'SELECTED',
      reason: 'Candidate selected for internship offer',
    },
  });
  console.log(`PASS: Status updated to: ${selRes.data.data.status}`);

  // 10. Student Checks Final Updated Status and History
  console.log('10. Verifying Student sees final updated status & status history...');
  const appDetailRes = await request(`/applications/me/${applicationId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${stuToken}` },
  });
  const finalApp = appDetailRes.data.data;
  console.log(`PASS: Student Application Current Status: "${finalApp.status}"`);
  console.log(`PASS: Status History Records: ${finalApp.statusHistory?.length || 0} transitions recorded.`);

  if (finalApp.status !== 'SELECTED') {
    throw new Error(`Expected final status SELECTED but got ${finalApp.status}`);
  }

  // 11. Security Check: Student cannot transition status
  console.log('11. Security Check: Verifying student is blocked from changing status...');
  const secRes = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${stuToken}` },
    body: {
      status: 'REJECTED',
    },
  });

  if (secRes.status === 403) {
    console.log('PASS: Student status modification blocked with 403 Forbidden.');
  } else {
    throw new Error(`Expected 403 Forbidden for student status update, got ${secRes.status}`);
  }

  console.log('\n=============================================================');
  console.log('✓ ALL PHASE 3C CROSS-ROLE E2E VERIFICATIONS PASSED (11/11)!');
  console.log('=============================================================');
}

runE2E().catch((err) => {
  console.error('\n✗ E2E Test Failed:', err.message || err);
  process.exit(1);
});
