import { authService } from '../services/auth.service';

async function testLogins() {
  const accounts = [
    { role: 'STUDENT', email: 'demo.student@sih.gov.in' },
    { role: 'INDUSTRY', email: 'demo.industry@sih.gov.in' },
    { role: 'ACADEMICIAN', email: 'demo.academician@sih.gov.in' },
    { role: 'INSTITUTION', email: 'demo.institution@sih.gov.in' },
  ];

  console.log('Testing demo login credentials:');
  for (const acc of accounts) {
    try {
      const res = await authService.login({
        email: acc.email,
        password: 'DemoPassword123!',
      });
      console.log(`  ✓ [SUCCESS] Role: ${acc.role.padEnd(12)} | Email: ${acc.email} | User ID: ${(res.user as any).id} | Access Token: Generated`);
    } catch (err: any) {
      console.error(`  ✗ [FAILED]  Role: ${acc.role.padEnd(12)} | Email: ${acc.email} | Error: ${err.message}`);
    }
  }
}

testLogins().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
