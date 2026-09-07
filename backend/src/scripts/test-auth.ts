import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { authService } from '../services/auth.service';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refresh-token.model';
import { UserRole } from '../constants/roles';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.util';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

export const runAuthTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING PHASE 4 AUTHENTICATION & RBAC TESTS');
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
      if (err.stack) {
        console.error(err.stack);
      }
      failed++;
    }
  };

  const testEmail = `test.student.${Date.now()}@example.com`;
  const testPassword = 'StrongPassword123!';
  let createdUserId = 0;
  let activeAccessToken = '';
  let activeRefreshToken = '';
  let resetTokenStr = '';

  // ----------------------------------------------------
  // 1. REGISTRATION TESTS
  // ----------------------------------------------------
  console.log('\n--- 1. Registration Tests ---');

  await test('Valid user registration creates user and returns safe payload without passwordHash', async () => {
    const result = await authService.register({
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: testEmail,
      password: testPassword,
      role: UserRole.STUDENT,
    });

    const user = result.user as any;
    assert.ok(user, 'Result must contain user object');
    assert.strictEqual(user.email, testEmail);
    assert.strictEqual(user.role, UserRole.STUDENT);
    assert.strictEqual(user.passwordHash, undefined, 'passwordHash must never be exposed');
    assert.ok(user.id, 'User must have an id');
    assert.ok(user.uuid, 'User must have a uuid');

    createdUserId = user.id;

    // Verify database record has bcrypt hash
    const dbUser = await User.findByPk(createdUserId);
    assert.ok(dbUser);
    assert.notStrictEqual(dbUser.passwordHash, testPassword, 'Password in database must not be plaintext');
    const isBcrypt = await bcrypt.compare(testPassword, dbUser.passwordHash);
    assert.strictEqual(isBcrypt, true, 'Database password must match bcrypt hash');
  });

  await test('Duplicate email registration throws ConflictError', async () => {
    let errorCaught = false;
    try {
      await authService.register({
        firstName: 'Duplicate',
        lastName: 'User',
        email: testEmail,
        password: 'AnotherPassword123!',
        role: UserRole.STUDENT,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, 409, 'Status code must be 409 Conflict');
    }
    assert.strictEqual(errorCaught, true, 'Duplicate email should throw ConflictError');
  });

  // ----------------------------------------------------
  // 2. LOGIN TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. Login Tests ---');

  await test('Valid login returns tokens, user payload and updates lastLoginAt', async () => {
    const beforeLogin = new Date();
    const result = await authService.login({
      email: testEmail,
      password: testPassword,
    });

    assert.ok(result.accessToken, 'Must return accessToken');
    assert.ok(result.refreshToken, 'Must return refreshToken');
    assert.ok(result.user, 'Must return user object');
    assert.strictEqual((result.user as any).passwordHash, undefined, 'passwordHash must never be exposed');

    activeAccessToken = result.accessToken;
    activeRefreshToken = result.refreshToken;

    // Verify token claims
    const decodedAccess = verifyAccessToken(activeAccessToken);
    assert.strictEqual(decodedAccess.userId, createdUserId);
    assert.strictEqual(decodedAccess.role, UserRole.STUDENT);

    const decodedRefresh = verifyRefreshToken(activeRefreshToken);
    assert.strictEqual(decodedRefresh.userId, createdUserId);

    // Verify lastLoginAt updated in database
    const dbUser = await User.findByPk(createdUserId);
    assert.ok(dbUser?.lastLoginAt, 'lastLoginAt must be set');
    assert.ok(dbUser!.lastLoginAt!.getTime() >= beforeLogin.getTime() - 2000, 'lastLoginAt must be recent');

    // Verify refresh token is persisted in database
    const dbToken = await RefreshToken.findOne({ where: { token: activeRefreshToken } });
    assert.ok(dbToken, 'Refresh token must be persisted in database');
    assert.strictEqual(dbToken.isRevoked, false, 'New token must not be revoked');
  });

  await test('Login with incorrect password throws AuthenticationError', async () => {
    let errorCaught = false;
    try {
      await authService.login({
        email: testEmail,
        password: 'WrongPassword123!',
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, 401, 'Status code must be 401 Unauthorized');
    }
    assert.strictEqual(errorCaught, true);
  });

  await test('Login with non-existent account throws AuthenticationError', async () => {
    let errorCaught = false;
    try {
      await authService.login({
        email: 'nonexistent.user.12345@example.com',
        password: testPassword,
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.strictEqual(errorCaught, true);
  });

  await test('Login with deactivated account throws AuthenticationError', async () => {
    // Create deactivated user
    const inactiveEmail = `inactive.${Date.now()}@example.com`;
    const hash = await bcrypt.hash('InactivePass123!', 10);
    const inactiveUser = await User.create({
      uuid: crypto.randomUUID(),
      firstName: 'Inactive',
      lastName: 'Account',
      email: inactiveEmail,
      passwordHash: hash,
      role: UserRole.STUDENT,
      isActive: false,
      isVerified: false,
    });

    let errorCaught = false;
    try {
      await authService.login({
        email: inactiveEmail,
        password: 'InactivePass123!',
      });
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.strictEqual(errorCaught, true, 'Inactive account must be rejected');

    await inactiveUser.destroy();
  });

  // ----------------------------------------------------
  // 3. REFRESH TOKEN TESTS
  // ----------------------------------------------------
  console.log('\n--- 3. Refresh Token Tests ---');

  await test('Valid refresh token rotates token and issues new access/refresh tokens', async () => {
    const result = await authService.refreshToken(activeRefreshToken);
    assert.ok(result.accessToken, 'Must return new accessToken');
    assert.ok(result.refreshToken, 'Must return new refreshToken');
    assert.notStrictEqual(result.refreshToken, activeRefreshToken, 'Refresh token must be rotated');

    // Verify old token is now marked isRevoked
    const oldTokenDb = await RefreshToken.findOne({ where: { token: activeRefreshToken } });
    assert.strictEqual(oldTokenDb?.isRevoked, true, 'Old token must be marked isRevoked');

    // Update active tokens
    activeAccessToken = result.accessToken;
    activeRefreshToken = result.refreshToken;
  });

  await test('Revoked refresh token is rejected', async () => {
    // Try to reuse the old revoked token
    const oldRevokedToken = (await RefreshToken.findOne({
      where: { userId: createdUserId, isRevoked: true },
    }))!.token;

    let errorCaught = false;
    try {
      await authService.refreshToken(oldRevokedToken);
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.strictEqual(errorCaught, true, 'Revoked refresh token must be rejected');
  });

  await test('Invalid or forged refresh token is rejected', async () => {
    let errorCaught = false;
    try {
      await authService.refreshToken('invalid.token.string');
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.strictEqual(errorCaught, true);
  });

  // ----------------------------------------------------
  // 4. CURRENT USER (/auth/me) TESTS
  // ----------------------------------------------------
  console.log('\n--- 4. Current User (/auth/me) Tests ---');

  await test('getCurrentUser returns authoritative user profile from database', async () => {
    const user = (await authService.getCurrentUser(createdUserId)) as any;
    assert.strictEqual(user.id, createdUserId);
    assert.strictEqual(user.email, testEmail);
    assert.strictEqual(user.passwordHash, undefined, 'passwordHash must never be exposed');
  });

  await test('authenticate middleware attaches user identity to request', async () => {
    const req: any = {
      headers: {
        authorization: `Bearer ${activeAccessToken}`,
      },
    };
    const res: any = {};
    let nextCalled = false;
    let nextError: any = null;

    authenticate(req, res, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(nextError, undefined);
    assert.ok(req.user);
    assert.strictEqual(req.user.id, createdUserId);
    assert.strictEqual(req.user.role, UserRole.STUDENT);
  });

  await test('authenticate middleware rejects missing or malformed header', async () => {
    const req: any = { headers: {} };
    let errorCaught: any = null;

    authenticate(req, {} as any, (err?: any) => {
      errorCaught = err;
    });

    assert.ok(errorCaught);
    assert.strictEqual(errorCaught.statusCode, 401);
  });

  // ----------------------------------------------------
  // 5. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
  // ----------------------------------------------------
  console.log('\n--- 5. RBAC Middleware Tests ---');

  await test('authorizeRoles allows authorized role', async () => {
    const req: any = {
      user: {
        id: createdUserId,
        email: testEmail,
        role: UserRole.STUDENT,
      },
    };
    let nextCalled = false;
    let nextError: any = null;

    const middleware = authorizeRoles(UserRole.STUDENT, UserRole.ACADEMICIAN);
    middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(nextError, undefined);
  });

  await test('authorizeRoles blocks unauthorized role with 403 Forbidden', async () => {
    const req: any = {
      user: {
        id: createdUserId,
        email: testEmail,
        role: UserRole.STUDENT,
      },
    };
    let nextCalled = false;
    let nextError: any = null;

    // Only Industry and Institution allowed
    const middleware = authorizeRoles(UserRole.INDUSTRY, UserRole.INSTITUTION);
    middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.strictEqual(nextCalled, true);
    assert.ok(nextError);
    assert.strictEqual(nextError.statusCode, 403, 'Must return 403 Forbidden');
  });

  // ----------------------------------------------------
  // 6. PASSWORD RESET TESTS
  // ----------------------------------------------------
  console.log('\n--- 6. Password Reset Tests ---');

  await test('forgotPassword returns safe message and generates valid reset token in dev', async () => {
    const result = await authService.forgotPassword(testEmail);
    assert.ok(result.message);
    assert.ok((result as any).resetToken, 'Dev environment should return resetToken for testing');
    resetTokenStr = (result as any).resetToken;
  });

  await test('resetPassword updates password and invalidates old password and sessions', async () => {
    const newPassword = 'BrandNewPassword456!';
    const result = await authService.resetPassword({
      token: resetTokenStr,
      newPassword,
    });
    assert.ok(result.message);

    // Old password must fail
    let oldPassFailed = false;
    try {
      await authService.login({
        email: testEmail,
        password: testPassword,
      });
    } catch (err: any) {
      oldPassFailed = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.strictEqual(oldPassFailed, true, 'Old password must no longer work');

    // New password must succeed
    const loginResult = await authService.login({
      email: testEmail,
      password: newPassword,
    });
    assert.ok(loginResult.accessToken);
    assert.strictEqual((loginResult.user as any).email, testEmail);

    activeRefreshToken = loginResult.refreshToken;
  });

  await test('resetPassword rejects invalid or re-used reset token', async () => {
    let errorCaught = false;
    try {
      await authService.resetPassword({
        token: resetTokenStr,
        newPassword: 'YetAnotherPassword789!',
      });
    } catch (err: any) {
      errorCaught = true;
    }
    assert.ok(errorCaught, 'Reused or invalid reset token should be rejected');
  });

  // ----------------------------------------------------
  // 7. LOGOUT TESTS
  // ----------------------------------------------------
  console.log('\n--- 7. Logout Tests ---');

  await test('logout successfully revokes active refresh token', async () => {
    const result = await authService.logout(activeRefreshToken);
    assert.ok(result.message);

    // Check in database that token is revoked
    const dbToken = await RefreshToken.findOne({ where: { token: activeRefreshToken } });
    assert.strictEqual(dbToken?.isRevoked, true, 'Refresh token must be revoked after logout');

    // Using it for refresh must now fail
    let refreshFailed = false;
    try {
      await authService.refreshToken(activeRefreshToken);
    } catch (err: any) {
      refreshFailed = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.strictEqual(refreshFailed, true, 'Logged out refresh token must not be usable');
  });

  // Cleanup test user and refresh tokens
  await RefreshToken.destroy({ where: { userId: createdUserId } });
  await User.destroy({ where: { id: createdUserId } });

  console.log('\n=============================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAuthTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
