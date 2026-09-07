import { sequelize } from '../config/database';
import fs from 'fs';
import path from 'path';

interface AuditFindings {
  dbInfo: any;
  migrationStatus: any;
  tableCount: number;
  tables: string[];
  schemaIssues: string[];
  academicHierarchy: {
    orphanDepts: any[];
    orphanPrograms: any[];
    mismatchedPrograms: any[];
    orphanBatches: any[];
    mismatchedBatches: any[];
    orphanEnrollments: any[];
    unverifiedAffiliationEnrollments: any[];
    crossInstitutionEnrollments: any[];
    duplicateActiveEnrollments: any[];
  };
  academicianScope: {
    orphanAcademicians: any[];
    orphanAssociations: any[];
    mismatchedAssociations: any[];
  };
  skillIntelligence: {
    orphanSkills: any[];
    orphanQuestions: any[];
    orphanAttempts: any[];
    orphanAnswers: any[];
    orphanStudentSkills: any[];
    orphanSkillGaps: any[];
  };
  industryAndOpportunities: {
    orphanOpportunities: any[];
    orphanApplications: any[];
    duplicateApplications: any[];
    orphanNotifications: any[];
  };
  dataQuality: {
    negativeValues: any[];
    invalidPercentages: any[];
    invalidDates: any[];
  };
  modelMismatches: string[];
}

async function runAudit() {
  const findings: AuditFindings = {
    dbInfo: {},
    migrationStatus: {},
    tableCount: 0,
    tables: [],
    schemaIssues: [],
    academicHierarchy: {
      orphanDepts: [],
      orphanPrograms: [],
      mismatchedPrograms: [],
      orphanBatches: [],
      mismatchedBatches: [],
      orphanEnrollments: [],
      unverifiedAffiliationEnrollments: [],
      crossInstitutionEnrollments: [],
      duplicateActiveEnrollments: [],
    },
    academicianScope: {
      orphanAcademicians: [],
      orphanAssociations: [],
      mismatchedAssociations: [],
    },
    skillIntelligence: {
      orphanSkills: [],
      orphanQuestions: [],
      orphanAttempts: [],
      orphanAnswers: [],
      orphanStudentSkills: [],
      orphanSkillGaps: [],
    },
    industryAndOpportunities: {
      orphanOpportunities: [],
      orphanApplications: [],
      duplicateApplications: [],
      orphanNotifications: [],
    },
    dataQuality: {
      negativeValues: [],
      invalidPercentages: [],
      invalidDates: [],
    },
    modelMismatches: [],
  };

  try {
    // 1. Connection & DB Info
    const [versionRes]: any = await sequelize.query('SELECT VERSION() as version, DATABASE() as dbName');
    findings.dbInfo = {
      database: versionRes[0]?.dbName,
      version: versionRes[0]?.version,
    };

    // Table listing
    const [tablesRes]: any = await sequelize.query('SHOW TABLES');
    const tableKey = Object.keys(tablesRes[0] || {})[0];
    findings.tables = tablesRes.map((t: any) => t[tableKey]);
    findings.tableCount = findings.tables.length;

    // Migrations status
    try {
      const [migRes]: any = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name');
      findings.migrationStatus = {
        appliedCount: migRes.length,
        migrations: migRes.map((m: any) => m.name),
      };
    } catch (e: any) {
      findings.migrationStatus = { error: 'SequelizeMeta table not found or query failed' };
    }

    // 2. Academic Hierarchy Audit
    // 2.1 Orphan departments
    const [orphanDepts]: any = await sequelize.query(`
      SELECT d.id, d.institution_id, d.department_name
      FROM institution_departments d
      LEFT JOIN institution_profiles ip ON d.institution_id = ip.id
      WHERE ip.id IS NULL
    `);
    findings.academicHierarchy.orphanDepts = orphanDepts;

    // 2.2 Orphan academic programs
    const [orphanPrograms]: any = await sequelize.query(`
      SELECT ap.id, ap.program_name, ap.institution_id, ap.department_id
      FROM academic_programs ap
      LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id
      LEFT JOIN institution_departments d ON ap.department_id = d.id
      WHERE ip.id IS NULL OR d.id IS NULL
    `);
    findings.academicHierarchy.orphanPrograms = orphanPrograms;

    // 2.3 Mismatched programs (department belongs to different institution than program)
    const [mismatchedPrograms]: any = await sequelize.query(`
      SELECT ap.id, ap.program_name, ap.institution_id AS programInstId, d.institution_id AS deptInstId
      FROM academic_programs ap
      JOIN institution_departments d ON ap.department_id = d.id
      WHERE ap.institution_id != d.institution_id
    `);
    findings.academicHierarchy.mismatchedPrograms = mismatchedPrograms;

    // 2.4 Orphan batches
    const [orphanBatches]: any = await sequelize.query(`
      SELECT ab.id, ab.batch_name, ab.program_id, ab.department_id, ab.institution_id
      FROM academic_batches ab
      LEFT JOIN academic_programs ap ON ab.program_id = ap.id
      WHERE ap.id IS NULL
    `);
    findings.academicHierarchy.orphanBatches = orphanBatches;

    // 2.5 Mismatched batches (program belongs to different institution or department than batch)
    const [mismatchedBatches]: any = await sequelize.query(`
      SELECT ab.id, ab.batch_name, ab.institution_id AS batchInstId, ap.institution_id AS progInstId,
             ab.department_id AS batchDeptId, ap.department_id AS progDeptId
      FROM academic_batches ab
      JOIN academic_programs ap ON ab.program_id = ap.id
      WHERE ab.institution_id != ap.institution_id OR ab.department_id != ap.department_id
    `);
    findings.academicHierarchy.mismatchedBatches = mismatchedBatches;

    // 2.6 Orphan enrollments
    const [orphanEnrollments]: any = await sequelize.query(`
      SELECT sae.id, sae.student_id, sae.batch_id, sae.program_id
      FROM student_academic_enrollments sae
      LEFT JOIN student_profiles sp ON sae.student_id = sp.id
      LEFT JOIN academic_batches ab ON sae.batch_id = ab.id
      WHERE sp.id IS NULL OR ab.id IS NULL
    `);
    findings.academicHierarchy.orphanEnrollments = orphanEnrollments;

    // 2.7 Enrollments without verified affiliation
    const [unverifiedAffiliationEnrollments]: any = await sequelize.query(`
      SELECT sae.id, sae.student_id, sae.institution_id, sae.batch_id
      FROM student_academic_enrollments sae
      LEFT JOIN student_institution_affiliations sia 
        ON sae.student_id = sia.student_id 
        AND sae.institution_id = sia.institution_id 
        AND sia.status = 'VERIFIED'
      WHERE sia.id IS NULL
    `);
    findings.academicHierarchy.unverifiedAffiliationEnrollments = unverifiedAffiliationEnrollments;

    // 2.8 Cross-institution enrollment (batch belongs to institution A, enrollment mapped to institution B)
    const [crossInstEnrollments]: any = await sequelize.query(`
      SELECT sae.id, sae.student_id, sae.institution_id AS enrollInstId, ab.institution_id AS batchInstId
      FROM student_academic_enrollments sae
      JOIN academic_batches ab ON sae.batch_id = ab.id
      WHERE sae.institution_id != ab.institution_id
    `);
    findings.academicHierarchy.crossInstitutionEnrollments = crossInstEnrollments;

    // 2.9 Duplicate active enrollments for same student in same batch
    const [dupActiveEnrollments]: any = await sequelize.query(`
      SELECT student_id, batch_id, COUNT(*) as count
      FROM student_academic_enrollments
      WHERE status = 'ACTIVE' OR is_current = 1
      GROUP BY student_id, batch_id
      HAVING COUNT(*) > 1
    `);
    findings.academicHierarchy.duplicateActiveEnrollments = dupActiveEnrollments;

    // 3. Academician Scope Audit
    // 3.1 Orphan Academician profiles
    const [orphanAcads]: any = await sequelize.query(`
      SELECT ap.id, ap.user_id, ap.institution_id, ap.department_id
      FROM academician_profiles ap
      LEFT JOIN users u ON ap.user_id = u.id
      WHERE u.id IS NULL
    `);
    findings.academicianScope.orphanAcademicians = orphanAcads;

    // 3.2 Orphan Academician Associations
    const [orphanAssocs]: any = await sequelize.query(`
      SELECT aia.id, aia.academician_id, aia.institution_id
      FROM academic_institution_associations aia
      LEFT JOIN academician_profiles ap ON aia.academician_id = ap.id
      LEFT JOIN institution_profiles ip ON aia.institution_id = ip.id
      WHERE ap.id IS NULL OR ip.id IS NULL
    `);
    findings.academicianScope.orphanAssociations = orphanAssocs;

    // 3.3 Mismatched Academician Department (if profile department_id does not belong to profile institution_id)
    const [mismatchedAssocs]: any = await sequelize.query(`
      SELECT ap.id, ap.user_id, ap.institution_id AS acadInstId, d.institution_id AS deptInstId
      FROM academician_profiles ap
      JOIN institution_departments d ON ap.department_id = d.id
      WHERE ap.institution_id IS NOT NULL AND ap.institution_id != d.institution_id
    `);
    findings.academicianScope.mismatchedAssociations = mismatchedAssocs;

    // 4. Skill Intelligence & Assessment Audit
    // 4.1 Orphan skills
    const [orphanSkills]: any = await sequelize.query(`
      SELECT s.id, s.name, s.category_id
      FROM skills s
      LEFT JOIN skill_categories sc ON s.category_id = sc.id
      WHERE sc.id IS NULL
    `);
    findings.skillIntelligence.orphanSkills = orphanSkills;

    // 4.2 Orphan Assessment Questions
    const [orphanQuestions]: any = await sequelize.query(`
      SELECT aq.id, aq.assessment_id, aq.question
      FROM assessment_questions aq
      LEFT JOIN skill_assessments sa ON aq.assessment_id = sa.id
      WHERE sa.id IS NULL
    `);
    findings.skillIntelligence.orphanQuestions = orphanQuestions;

    // 4.3 Orphan Assessment Attempts
    const [orphanAttempts]: any = await sequelize.query(`
      SELECT aa.id, aa.student_id, aa.assessment_id
      FROM assessment_attempts aa
      LEFT JOIN student_profiles sp ON aa.student_id = sp.id
      LEFT JOIN skill_assessments sa ON aa.assessment_id = sa.id
      WHERE sp.id IS NULL OR sa.id IS NULL
    `);
    findings.skillIntelligence.orphanAttempts = orphanAttempts;

    // 4.4 Orphan Assessment Answers
    const [orphanAnswers]: any = await sequelize.query(`
      SELECT ans.id, ans.attempt_id, ans.question_id
      FROM assessment_answers ans
      LEFT JOIN assessment_attempts aa ON ans.attempt_id = aa.id
      WHERE aa.id IS NULL
    `);
    findings.skillIntelligence.orphanAnswers = orphanAnswers;

    // 4.5 Orphan Student Skills
    const [orphanStudSkills]: any = await sequelize.query(`
      SELECT ss.id, ss.student_id, ss.skill_id
      FROM student_skills ss
      LEFT JOIN student_profiles sp ON ss.student_id = sp.id
      LEFT JOIN skills s ON ss.skill_id = s.id
      WHERE sp.id IS NULL OR s.id IS NULL
    `);
    findings.skillIntelligence.orphanStudentSkills = orphanStudSkills;

    // 4.6 Orphan Skill Gaps
    const [orphanGaps]: any = await sequelize.query(`
      SELECT sg.id, sg.student_id, sg.skill_id
      FROM skill_gaps sg
      LEFT JOIN student_profiles sp ON sg.student_id = sp.id
      LEFT JOIN skills s ON sg.skill_id = s.id
      WHERE sp.id IS NULL OR s.id IS NULL
    `);
    findings.skillIntelligence.orphanSkillGaps = orphanGaps;

    // 5. Industry & Opportunity Audit
    // 5.1 Orphan Opportunities (e.g. jobs without industry profile)
    const [orphanJobs]: any = await sequelize.query(`
      SELECT j.id, j.title, j.industry_id
      FROM jobs j
      LEFT JOIN industry_profiles ip ON j.industry_id = ip.id
      WHERE ip.id IS NULL
    `);
    findings.industryAndOpportunities.orphanOpportunities = orphanJobs;

    // 5.2 Orphan Applications
    const [orphanApps]: any = await sequelize.query(`
      SELECT a.id, a.student_id, a.opportunity_id, a.opportunity_type
      FROM applications a
      LEFT JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.id IS NULL
    `);
    findings.industryAndOpportunities.orphanApplications = orphanApps;

    // 5.3 Duplicate Applications
    const [dupApps]: any = await sequelize.query(`
      SELECT student_id, opportunity_id, opportunity_type, COUNT(*) as count
      FROM applications
      GROUP BY student_id, opportunity_id, opportunity_type
      HAVING COUNT(*) > 1
    `);
    findings.industryAndOpportunities.duplicateApplications = dupApps;

    // 5.4 Orphan Notifications
    const [orphanNotifs]: any = await sequelize.query(`
      SELECT n.id, n.user_id, n.title
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE u.id IS NULL
    `);
    findings.industryAndOpportunities.orphanNotifications = orphanNotifs;

    // 6. Data Quality Checks
    // 6.1 Invalid Percentages / Scores
    const [invAttempts]: any = await sequelize.query(`
      SELECT id, student_id, score, percentage
      FROM assessment_attempts
      WHERE percentage < 0 OR percentage > 100 OR score < 0
    `);
    findings.dataQuality.invalidPercentages = invAttempts;

    // 6.2 Negative experience or values
    const [invExp]: any = await sequelize.query(`
      SELECT id, user_id, experience_years
      FROM academician_profiles
      WHERE experience_years < 0
    `);
    findings.dataQuality.negativeValues = invExp;

    console.log(JSON.stringify(findings, null, 2));
  } catch (error) {
    console.error('Audit execution failed:', error);
  } finally {
    await sequelize.close();
  }
}

runAudit();
