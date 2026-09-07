import { sequelize } from '../config/database';

async function runSanityCheck() {
  console.log('====================================================');
  console.log('PHASE G — TARGETED DATABASE SANITY CHECK');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. Check orphan academic programs
    const [orphanPrograms]: any = await sequelize.query(`
      SELECT ap.id, ap.program_name, ap.institution_id, ap.department_id 
      FROM academic_programs ap
      LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id
      LEFT JOIN institution_departments d ON ap.department_id = d.id
      WHERE ip.id IS NULL OR d.id IS NULL
    `);
    if (orphanPrograms.length === 0) {
      console.log('  ✓ PASS: 0 orphan academic programs (all linked to valid institutions and departments)');
      passed++;
    } else {
      console.error(`  ✗ FAIL: Found ${orphanPrograms.length} orphan academic programs:`, orphanPrograms);
      failed++;
    }

    // 2. Check academic programs department-institution consistency
    const [mismatchedPrograms]: any = await sequelize.query(`
      SELECT ap.id, ap.program_name, ap.institution_id AS programInstId, d.institution_id AS deptInstId
      FROM academic_programs ap
      JOIN institution_departments d ON ap.department_id = d.id
      WHERE ap.institution_id != d.institution_id
    `);
    if (mismatchedPrograms.length === 0) {
      console.log('  ✓ PASS: 0 mismatched academic programs (department.institution_id matches program.institution_id)');
      passed++;
    } else {
      console.error(`  ✗ FAIL: Found ${mismatchedPrograms.length} mismatched academic programs:`, mismatchedPrograms);
      failed++;
    }

    // 3. Check orphan academic batches
    const [orphanBatches]: any = await sequelize.query(`
      SELECT ab.id, ab.batch_name, ab.program_id
      FROM academic_batches ab
      LEFT JOIN academic_programs ap ON ab.program_id = ap.id
      WHERE ap.id IS NULL
    `);
    if (orphanBatches.length === 0) {
      console.log('  ✓ PASS: 0 orphan academic batches (all linked to valid academic programs)');
      passed++;
    } else {
      console.error(`  ✗ FAIL: Found ${orphanBatches.length} orphan academic batches:`, orphanBatches);
      failed++;
    }

    // 4. Check orphan student academic enrollments
    const [orphanEnrollments]: any = await sequelize.query(`
      SELECT sae.id, sae.student_id, sae.batch_id
      FROM student_academic_enrollments sae
      LEFT JOIN student_profiles sp ON sae.student_id = sp.id
      LEFT JOIN academic_batches ab ON sae.batch_id = ab.id
      WHERE sp.id IS NULL OR ab.id IS NULL
    `);
    if (orphanEnrollments.length === 0) {
      console.log('  ✓ PASS: 0 orphan student enrollments (all linked to valid students and batches)');
      passed++;
    } else {
      console.error(`  ✗ FAIL: Found ${orphanEnrollments.length} orphan student enrollments:`, orphanEnrollments);
      failed++;
    }

    // 5. Check enrollment institutional affiliation integrity
    const [unverifiedEnrollments]: any = await sequelize.query(`
      SELECT sae.id, sae.student_id, sae.batch_id, ap.institution_id AS batchInstId
      FROM student_academic_enrollments sae
      JOIN academic_batches ab ON sae.batch_id = ab.id
      JOIN academic_programs ap ON ab.program_id = ap.id
      LEFT JOIN student_institution_affiliations sia 
        ON sae.student_id = sia.student_id 
        AND sia.institution_id = ap.institution_id 
        AND sia.status = 'VERIFIED'
      WHERE sia.id IS NULL
    `);
    if (unverifiedEnrollments.length === 0) {
      console.log('  ✓ PASS: All student enrollments have verified institutional affiliation');
      passed++;
    } else {
      console.error(`  ✗ FAIL: Found ${unverifiedEnrollments.length} enrollments without verified affiliation:`, unverifiedEnrollments);
      failed++;
    }

    console.log(`\n====================================================`);
    console.log(`SANITY CHECK SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during database sanity check:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSanityCheck();
