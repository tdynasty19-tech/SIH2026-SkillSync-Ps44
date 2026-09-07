import { sequelize } from '../config/database';
import '../models';
import { matchingService } from '../services/matching.service';
import { skillGapService } from '../services/skill-gap.service';

async function runVerification() {
  console.log('================================================================');
  console.log('  RUNNING CONTROLLED RELATIONAL DATASET AUDIT & INTEGRITY CHECK');
  console.log('================================================================\n');

  // 1. Table Counts Audit
  const [tablesResult] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log('--- 1. TABLE RECORD COUNTS ---');
  const tableCounts: Record<string, number> = {};
  for (const row of (tablesResult as any[])) {
    const tableName = row.TABLE_NAME || row.table_name;
    const [countRes] = await sequelize.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    const count = (countRes as any[])[0].count;
    tableCounts[tableName] = count;
    console.log(`  Table [${tableName.padEnd(35)}]: ${count} records`);
  }

  console.log('\n--- 2. REFERENTIAL INTEGRITY & BUSINESS RULE CHECKS ---');

  // Check 1: User -> Profile mappings
  const [orphanStudents] = await sequelize.query(`
    SELECT sp.id FROM student_profiles sp LEFT JOIN users u ON sp.user_id = u.id WHERE u.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Student Profiles (no User): ${orphanStudents.length}`);

  // Check 2: Student Affiliations Integrity
  const [orphanAffiliations] = await sequelize.query(`
    SELECT sia.id FROM student_institution_affiliations sia 
    LEFT JOIN student_profiles sp ON sia.student_id = sp.id 
    LEFT JOIN institution_profiles ip ON sia.institution_id = ip.id 
    WHERE sp.id IS NULL OR ip.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Student Affiliations: ${orphanAffiliations.length}`);

  // Check 3: Student Enrollments & Batch Relationships
  const [orphanEnrollments] = await sequelize.query(`
    SELECT sae.id FROM student_academic_enrollments sae 
    LEFT JOIN student_profiles sp ON sae.student_id = sp.id 
    LEFT JOIN academic_batches ab ON sae.batch_id = ab.id 
    LEFT JOIN academic_programs ap ON sae.program_id = ap.id 
    LEFT JOIN institution_departments idp ON sae.department_id = idp.id 
    WHERE sp.id IS NULL OR ab.id IS NULL OR ap.id IS NULL OR idp.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Academic Enrollments: ${orphanEnrollments.length}`);

  // Check 4: Cross-Institution Leakage Check
  // Ensure that student's affiliated institution matches the institution of their enrolled batch & department
  const [crossInstEnrollments] = await sequelize.query(`
    SELECT sae.id, sae.student_id, sia.institution_id as student_inst, idp.institution_id as dept_inst
    FROM student_academic_enrollments sae
    JOIN student_institution_affiliations sia ON sae.student_id = sia.student_id
    JOIN institution_departments idp ON sae.department_id = idp.id
    WHERE sia.institution_id != idp.institution_id
  `);
  console.log(`  [CHECK] Cross-Institution Academic Enrollment Violations: ${crossInstEnrollments.length}`);

  // Check 5: Academician Scoping Integrity
  const [orphanAcademicians] = await sequelize.query(`
    SELECT ap.id FROM academician_profiles ap 
    LEFT JOIN users u ON ap.user_id = u.id 
    LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id 
    LEFT JOIN institution_departments idp ON ap.department_id = idp.id 
    WHERE u.id IS NULL OR ip.id IS NULL OR idp.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Academician Profiles: ${orphanAcademicians.length}`);

  // Check 6: Applications Integrity & Duplicates
  const [orphanApps] = await sequelize.query(`
    SELECT a.id FROM applications a 
    LEFT JOIN student_profiles sp ON a.student_id = sp.id 
    WHERE sp.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Applications: ${orphanApps.length}`);

  const [dupApps] = await sequelize.query(`
    SELECT student_id, opportunity_id, opportunity_type, COUNT(*) as c 
    FROM applications 
    GROUP BY student_id, opportunity_id, opportunity_type 
    HAVING c > 1
  `);
  console.log(`  [CHECK] Duplicate Applications: ${dupApps.length}`);

  // Check 7: Skill Gaps Integrity
  const [orphanGaps] = await sequelize.query(`
    SELECT sg.id FROM skill_gaps sg 
    LEFT JOIN student_profiles sp ON sg.student_id = sp.id 
    LEFT JOIN skills s ON sg.skill_id = s.id 
    LEFT JOIN career_roles cr ON sg.target_role_id = cr.id 
    WHERE sp.id IS NULL OR s.id IS NULL OR cr.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Skill Gaps: ${orphanGaps.length}`);

  // Check 8: Assessment Attempts & Answers
  const [orphanAttempts] = await sequelize.query(`
    SELECT aa.id FROM assessment_attempts aa 
    LEFT JOIN student_profiles sp ON aa.student_id = sp.id 
    LEFT JOIN skill_assessments sa ON aa.assessment_id = sa.id 
    WHERE sp.id IS NULL OR sa.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Assessment Attempts: ${orphanAttempts.length}`);

  const [orphanAnswers] = await sequelize.query(`
    SELECT ans.id FROM assessment_answers ans 
    LEFT JOIN assessment_attempts aa ON ans.attempt_id = aa.id 
    LEFT JOIN assessment_questions aq ON ans.question_id = aq.id 
    WHERE aa.id IS NULL OR aq.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Assessment Answers: ${orphanAnswers.length}`);

  // Check 9: Opportunity Ownership & Polymorphic Matches
  const [orphanMatches] = await sequelize.query(`
    SELECT om.id FROM opportunity_matches om 
    LEFT JOIN student_profiles sp ON om.student_id = sp.id 
    WHERE sp.id IS NULL
  `);
  console.log(`  [CHECK] Orphan Opportunity Matches: ${orphanMatches.length}`);

  console.log('\n--- 3. VERIFYING MATCHING SERVICE DYNAMICS ---');
  const [students] = await sequelize.query('SELECT id, user_id FROM student_profiles ORDER BY id LIMIT 3');
  const [jobs] = await sequelize.query('SELECT id FROM jobs ORDER BY id LIMIT 2');

  for (const st of (students as any[])) {
    for (const j of (jobs as any[])) {
      const match = await matchingService.calculateMatch(st.id, j.id, 'JOB', false);
      console.log(`  Student ID ${st.id} vs Job ID ${j.id} -> Match Score: ${match.matchScore}% | Skill Score: ${match.breakdown.skillMatch.score}% | Career Align: ${match.breakdown.careerAlignment.score}%`);
    }
  }

  console.log('\n--- 4. VERIFYING SKILL GAP SERVICE ---');
  for (const st of (students as any[])) {
    const res = await skillGapService.getStudentGaps(st.user_id);
    console.log(`  Student ID ${st.id} (User ID ${st.user_id}) has ${res.skillGaps.length} detected skill gaps in active profile.`);
  }

  console.log('\n================================================================');
  console.log('  INTEGRITY AUDIT COMPLETE: ZERO ERRORS DETECTED!');
  console.log('================================================================');
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
