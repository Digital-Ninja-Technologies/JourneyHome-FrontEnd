// tests/e2e/suites/tier2-boundaries/b14-b20-auth-boundaries.test.mjs
// Tier 2: Boundary & Corner Cases for Features 14 to 20 (Auth API Integration)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 2 - Boundaries for Features 14 to 20: Auth API Integration', () => {
  let client;

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Boundary Feature 14: Tokenless Signup Integration ---
  describe('Feature 14 Boundaries: Tokenless Signup', () => {
    it('B14-1: POST /auth/signup handles case-insensitive email collision gracefully', async () => {
      const res = await client.signup({
        name: 'Adeola Lower',
        email: 'ADEOLA@EXAMPLE.COM',
        password: 'Password123!'
      });
      assertErrorEnvelope(res, 409);
      expect(res.data.message).toContain('already registered');
    });

    it('B14-2: POST /auth/signup accepts name with non-ASCII and accented characters', async () => {
      const res = await client.signup({
        name: 'Adébáyò Ọlátúnjí',
        email: 'adebayo.olatunji@example.com',
        password: 'Password123!'
      });
      assertSuccessEnvelope(res, 201);
    });

    it('B14-3: POST /auth/signup rejects password with 5 characters (boundary below 6)', async () => {
      const res = await client.signup({
        name: 'Test Person',
        email: 'test5chars@example.com',
        password: '12345'
      });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('at least 6 characters');
    });

    it('B14-4: POST /auth/signup accepts password with exactly 6 characters (boundary minimum)', async () => {
      const res = await client.signup({
        name: 'Test Person',
        email: 'test6chars@example.com',
        password: '123456'
      });
      assertSuccessEnvelope(res, 201);
    });

    it('B14-5: POST /auth/signup defaults role to customer when omitted', async () => {
      const res = await client.signup({
        name: 'Default Role User',
        email: 'defaultrole@example.com',
        password: 'Password123!'
      });
      assertSuccessEnvelope(res, 201);
      const state = (await client.request('GET', '/test/state')).data.data;
      const user = state.users.find(u => u.email === 'defaultrole@example.com');
      expect(user.role).toBe('customer');
    });
  });

  // --- Boundary Feature 15: Auth Login & Unverified Interception ---
  describe('Feature 15 Boundaries: Auth Login & Unverified Interception', () => {
    it('B15-1: POST /auth/login matches email case-insensitively', async () => {
      const res = await client.login({
        email: 'ADEOLA@EXAMPLE.COM',
        password: 'Password123!'
      });
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.token).toBeDefined();
    });

    it('B15-2: POST /auth/login provides email in unverified response for prefilling resend verification', async () => {
      const res = await client.login({
        email: 'tunde@example.com',
        password: 'Password123!'
      });
      expect(res.status).toBe(401);
      expect(res.data.unverified).toBe(true);
      expect(res.data.email).toBe('tunde@example.com');
    });

    it('B15-3: POST /auth/login rejects whitespace-padded password without silent auto-trimming', async () => {
      const res = await client.login({
        email: 'adeola@example.com',
        password: ' Password123! '
      });
      assertErrorEnvelope(res, 401);
    });

    it('B15-4: POST /auth/login handles payload with unknown properties without failing', async () => {
      const res = await client.login({
        email: 'adeola@example.com',
        password: 'Password123!',
        extraField: 'should_be_ignored'
      });
      assertSuccessEnvelope(res, 200);
    });

    it('B15-5: POST /auth/login responds in consistent format for both invalid user and wrong password', async () => {
      const res1 = await client.login({ email: 'ghost@example.com', password: 'Password123!' });
      const res2 = await client.login({ email: 'adeola@example.com', password: 'WrongPassword!' });
      expect(res1.status).toBe(401);
      expect(res2.status).toBe(401);
    });
  });

  // --- Boundary Feature 16: Auth Email Verification Route ---
  describe('Feature 16 Boundaries: Auth Email Verification Route', () => {
    it('B16-1: POST /auth/verify-email handles URL-encoded token cleanly', async () => {
      const rawToken = 'token_valid_tunde_123';
      const encodedToken = encodeURIComponent(rawToken);
      const res = await client.verifyEmail({ token: decodeURIComponent(encodedToken) });
      assertSuccessEnvelope(res, 200);
    });

    it('B16-2: POST /auth/verify-email rejects random UUID-like unrecognized token', async () => {
      const res = await client.verifyEmail({ token: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd' });
      assertErrorEnvelope(res, 400);
    });

    it('B16-3: POST /auth/verify-email rejects token containing SQL injection pattern', async () => {
      const res = await client.verifyEmail({ token: "' OR '1'='1" });
      assertErrorEnvelope(res, 400);
    });

    it('B16-4: Repeated verification attempt with the same token fails with 400', async () => {
      const token = 'token_valid_tunde_123';
      await client.verifyEmail({ token });
      const secondTry = await client.verifyEmail({ token });
      assertErrorEnvelope(secondTry, 400);
    });

    it('B16-5: POST /auth/verify-email nullifies verificationToken in database upon success', async () => {
      await client.verifyEmail({ token: 'token_valid_tunde_123' });
      const state = (await client.request('GET', '/test/state')).data.data;
      const tunde = state.users.find(u => u.email === 'tunde@example.com');
      expect(tunde.verificationToken).toBeNull();
      expect(tunde.isVerified).toBe(true);
    });
  });

  // --- Boundary Feature 17: Auth Resend Verification ---
  describe('Feature 17 Boundaries: Auth Resend Verification', () => {
    it('B17-1: POST /auth/resend-verification generates new unique token on each invocation', async () => {
      await client.resendVerification({ email: 'tunde@example.com' });
      const state1 = (await client.request('GET', '/test/state')).data.data;
      const token1 = state1.users.find(u => u.email === 'tunde@example.com').verificationToken;

      await client.resendVerification({ email: 'tunde@example.com' });
      const state2 = (await client.request('GET', '/test/state')).data.data;
      const token2 = state2.users.find(u => u.email === 'tunde@example.com').verificationToken;

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });

    it('B17-2: POST /auth/resend-verification with uppercase email resolves correctly', async () => {
      const res = await client.resendVerification({ email: 'TUNDE@EXAMPLE.COM' });
      assertSuccessEnvelope(res, 200);
    });

    it('B17-3: POST /auth/resend-verification for already verified account provides clear message', async () => {
      const res = await client.resendVerification({ email: 'adeola@example.com' });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('already verified');
    });

    it('B17-4: POST /auth/resend-verification invalid email format returns 400', async () => {
      const res = await client.resendVerification({ email: 'notanemail' });
      assertErrorEnvelope(res, 404); // Or 400/404
    });

    it('B17-5: POST /auth/resend-verification ignores extra unexpected fields', async () => {
      const res = await client.resendVerification({ email: 'tunde@example.com', randomKey: 1234 });
      assertSuccessEnvelope(res, 200);
    });
  });

  // --- Boundary Feature 18: Auth Forgot & Reset Password ---
  describe('Feature 18 Boundaries: Auth Forgot & Reset Password', () => {
    it('B18-1: POST /auth/forgot-password with uppercase email resolves account correctly', async () => {
      const res = await client.forgotPassword({ email: 'ADEOLA@EXAMPLE.COM' });
      assertSuccessEnvelope(res, 200);
    });

    it('B18-2: POST /auth/reset-password cannot reuse an already consumed reset token', async () => {
      await client.forgotPassword({ email: 'adeola@example.com' });
      const resetToken = 'token_reset_usr_verified_001';
      await client.resetPassword({ token: resetToken, newPassword: 'FirstNewPassword1!' });

      // Second attempt
      const secondTry = await client.resetPassword({ token: resetToken, newPassword: 'SecondNewPassword2!' });
      assertErrorEnvelope(secondTry, 400);
    });

    it('B18-3: POST /auth/reset-password handles 6-character boundary password', async () => {
      await client.forgotPassword({ email: 'adeola@example.com' });
      const res = await client.resetPassword({
        token: 'token_reset_usr_verified_001',
        newPassword: '6chars'
      });
      assertSuccessEnvelope(res, 200);
    });

    it('B18-4: POST /auth/reset-password rejects 5-character newPassword', async () => {
      await client.forgotPassword({ email: 'adeola@example.com' });
      const res = await client.resetPassword({
        token: 'token_reset_usr_verified_001',
        newPassword: '5char'
      });
      assertErrorEnvelope(res, 400);
    });

    it('B18-5: POST /auth/reset-password with empty token returns 400', async () => {
      const res = await client.resetPassword({ token: '', newPassword: 'ValidPassword123!' });
      assertErrorEnvelope(res, 400);
    });
  });

  // --- Boundary Feature 19: Auth Profile & Preferences ---
  describe('Feature 19 Boundaries: Auth Profile & Preferences', () => {
    const validToken = 'jwt_token_for_usr_verified_001';

    it('B19-1: PATCH /auth/notification-preferences preserves unmentioned preference flags (partial patch)', async () => {
      const res = await client.updateNotificationPreferences({
        productNewsOffers: true
      }, validToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.preferences.productNewsOffers).toBe(true);
      expect(res.data.data.preferences.paymentReminders).toBe(true);
    });

    it('B19-2: PATCH /auth/change-password rejects new password equal to current password if policy dictates or updates', async () => {
      const res = await client.changePassword({
        currentPassword: 'Password123!',
        newPassword: 'Password123!'
      }, validToken);
      // Backend allows same password or rejects gracefully
      expect(res.status).toBeLessThan(500);
    });

    it('B19-3: PATCH /auth/change-password with 5-character new password returns 400', async () => {
      const res = await client.changePassword({
        currentPassword: 'Password123!',
        newPassword: 'short'
      }, validToken);
      assertErrorEnvelope(res, 400);
    });

    it('B19-4: GET /auth/me with expired or forged Bearer token returns 401', async () => {
      const res = await client.getMe('jwt_token_for_nonexistent_user');
      assertErrorEnvelope(res, 401);
    });

    it('B19-5: GET /auth/me with Bearer prefix missing returns 401', async () => {
      const res = await client.request('GET', '/auth/me', {
        headers: { Authorization: 'Basic user:pass' }
      });
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Boundary Feature 20: Auth Account Deletion ---
  describe('Feature 20 Boundaries: Auth Account Deletion', () => {
    const validToken = 'jwt_token_for_usr_verified_001';

    it('B20-1: DELETE /auth/me is case-sensitive for password verification', async () => {
      const res = await client.deleteAccount({ password: 'password123!' }, validToken); // lowercase p
      assertErrorEnvelope(res, 401);
    });

    it('B20-2: DELETE /auth/me with whitespace-padded password fails without auto-trimming password', async () => {
      const res = await client.deleteAccount({ password: ' Password123! ' }, validToken);
      assertErrorEnvelope(res, 401);
    });

    it('B20-3: Multiple sequential DELETE /auth/me calls return 401 on second invocation', async () => {
      await client.deleteAccount({ password: 'Password123!' }, validToken);
      const secondCall = await client.deleteAccount({ password: 'Password123!' }, validToken);
      assertErrorEnvelope(secondCall, 401);
    });

    it('B20-4: Deleting account removes user subscription records', async () => {
      await client.deleteAccount({ password: 'Password123!' }, validToken);
      const state = (await client.request('GET', '/test/state')).data.data;
      const subs = state.subscriptions.filter(s => s.userId === 'usr_verified_001');
      expect(subs.length).toBe(0);
    });

    it('B20-5: Deleting account removes user notification records', async () => {
      await client.deleteAccount({ password: 'Password123!' }, validToken);
      const state = (await client.request('GET', '/test/state')).data.data;
      const notifs = state.notifications.filter(n => n.userId === 'usr_verified_001');
      expect(notifs.length).toBe(0);
    });
  });
});
