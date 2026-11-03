// tests/e2e/suites/tier1-features/f14-f20-auth.test.mjs
// Tier 1: Feature Coverage for Features 14 to 20 (Auth API Integration)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope,
  assertUserSessionShape
} from '../../harness/assertions.mjs';

describe('Tier 1 - Features 14 to 20: Auth API Integration', () => {
  let client;

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Feature 14: Auth Tokenless Signup Integration ---
  describe('Feature 14: Auth Tokenless Signup Integration', () => {
    it('F14-1: POST /auth/signup creates account and returns success message without token', async () => {
      const res = await client.signup({
        name: 'Chioma Okeke',
        email: 'chioma@example.com',
        password: 'Password123!',
        role: 'customer'
      });
      assertSuccessEnvelope(res, 201);
      expect(res.data.token).toBeUndefined();
      expect(res.data.message).toContain('Verification email sent');
    });

    it('F14-2: POST /auth/signup rejects duplicate email with 409 Conflict', async () => {
      const res = await client.signup({
        name: 'Adeola Johnson',
        email: 'adeola@example.com',
        password: 'Password123!'
      });
      assertErrorEnvelope(res, 409);
      expect(res.data.message).toContain('already registered');
    });

    it('F14-3: POST /auth/signup rejects invalid email format with 400 Bad Request', async () => {
      const res = await client.signup({
        name: 'Bad Email User',
        email: 'not-an-email',
        password: 'Password123!'
      });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('valid email');
    });

    it('F14-4: POST /auth/signup rejects weak password (<6 chars) with 400 Bad Request', async () => {
      const res = await client.signup({
        name: 'Short Password User',
        email: 'short@example.com',
        password: '123'
      });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('at least 6 characters');
    });

    it('F14-5: POST /auth/signup does not require or accept phone number in payload', async () => {
      const res = await client.signup({
        name: 'No Phone Customer',
        email: 'nophone@example.com',
        password: 'Password123!',
        role: 'customer'
      });
      assertSuccessEnvelope(res, 201);
    });
  });

  // --- Feature 15: Auth Login & Unverified Interception ---
  describe('Feature 15: Auth Login & Unverified Interception', () => {
    it('F15-1: POST /auth/login returns JWT session and user data for verified user', async () => {
      const res = await client.login({
        email: 'adeola@example.com',
        password: 'Password123!'
      });
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.token).toBeDefined();
      expect(res.data.data.token.startsWith('jwt_')).toBe(true);
      assertUserSessionShape(res.data.data.user);
    });

    it('F15-2: POST /auth/login returns 401 unverified status when user is unverified', async () => {
      const res = await client.login({
        email: 'tunde@example.com',
        password: 'Password123!'
      });
      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toContain('verify your email');
      expect(res.data.unverified).toBe(true);
    });

    it('F15-3: POST /auth/login returns 401 for incorrect password', async () => {
      const res = await client.login({
        email: 'adeola@example.com',
        password: 'WrongPassword999!'
      });
      assertErrorEnvelope(res, 401);
      expect(res.data.message).toContain('Invalid email or password');
    });

    it('F15-4: POST /auth/login returns 401 for non-existent email', async () => {
      const res = await client.login({
        email: 'nobody@example.com',
        password: 'Password123!'
      });
      assertErrorEnvelope(res, 401);
    });

    it('F15-5: POST /auth/login returns 400 when missing email or password', async () => {
      const res = await client.login({
        email: '',
        password: ''
      });
      assertErrorEnvelope(res, 400);
    });
  });

  // --- Feature 16: Auth Email Verification Route ---
  describe('Feature 16: Auth Email Verification Route', () => {
    it('F16-1: POST /auth/verify-email confirms account with valid token', async () => {
      const res = await client.verifyEmail({ token: 'token_valid_tunde_123' });
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('Email verified successfully');
    });

    it('F16-2: Verified user can successfully log in immediately following verification', async () => {
      await client.verifyEmail({ token: 'token_valid_tunde_123' });
      const loginRes = await client.login({
        email: 'tunde@example.com',
        password: 'Password123!'
      });
      assertSuccessEnvelope(loginRes, 200);
      expect(loginRes.data.data.token).toBeDefined();
    });

    it('F16-3: POST /auth/verify-email rejects non-existent token with 400 Bad Request', async () => {
      const res = await client.verifyEmail({ token: 'invalid_token_999' });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('Invalid or expired');
    });

    it('F16-4: POST /auth/verify-email rejects missing token with 400 Bad Request', async () => {
      const res = await client.verifyEmail({ token: '' });
      assertErrorEnvelope(res, 400);
    });

    it('F16-5: POST /auth/verify-email cannot reuse an already consumed token', async () => {
      await client.verifyEmail({ token: 'token_valid_tunde_123' });
      const secondTry = await client.verifyEmail({ token: 'token_valid_tunde_123' });
      assertErrorEnvelope(secondTry, 400);
    });
  });

  // --- Feature 17: Auth Resend Verification ---
  describe('Feature 17: Auth Resend Verification', () => {
    it('F17-1: POST /auth/resend-verification issues new token for unverified user', async () => {
      const res = await client.resendVerification({ email: 'tunde@example.com' });
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('Verification email sent');
    });

    it('F17-2: POST /auth/resend-verification rejects already verified user with 400 Bad Request', async () => {
      const res = await client.resendVerification({ email: 'adeola@example.com' });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('already verified');
    });

    it('F17-3: POST /auth/resend-verification returns 404 for unknown email', async () => {
      const res = await client.resendVerification({ email: 'unknown@example.com' });
      assertErrorEnvelope(res, 404);
      expect(res.data.message).toContain('User not found');
    });

    it('F17-4: POST /auth/resend-verification validates required email input', async () => {
      const res = await client.resendVerification({ email: '' });
      assertErrorEnvelope(res, 400);
    });

    it('F17-5: Newly issued resend token successfully verifies user account', async () => {
      await client.resendVerification({ email: 'tunde@example.com' });
      const state = (await client.request('GET', '/test/state')).data.data;
      const tunde = state.users.find(u => u.email === 'tunde@example.com');
      expect(tunde.verificationToken).toBeDefined();

      const verifyRes = await client.verifyEmail({ token: tunde.verificationToken });
      assertSuccessEnvelope(verifyRes, 200);
    });
  });

  // --- Feature 18: Auth Forgot & Reset Password ---
  describe('Feature 18: Auth Forgot & Reset Password', () => {
    it('F18-1: POST /auth/forgot-password sends reset instructions for valid email', async () => {
      const res = await client.forgotPassword({ email: 'adeola@example.com' });
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('Password reset link sent');
    });

    it('F18-2: POST /auth/forgot-password returns 404 for unregistered email', async () => {
      const res = await client.forgotPassword({ email: 'ghost@example.com' });
      assertErrorEnvelope(res, 404);
    });

    it('F18-3: POST /auth/reset-password updates password using { token, newPassword }', async () => {
      await client.forgotPassword({ email: 'adeola@example.com' });
      const res = await client.resetPassword({
        token: 'token_reset_usr_verified_001',
        newPassword: 'BrandNewPassword2026!'
      });
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('Password reset successfully');

      // Verify login with new password
      const loginRes = await client.login({
        email: 'adeola@example.com',
        password: 'BrandNewPassword2026!'
      });
      assertSuccessEnvelope(loginRes, 200);
    });

    it('F18-4: POST /auth/reset-password rejects invalid or expired reset token', async () => {
      const res = await client.resetPassword({
        token: 'invalid_reset_token',
        newPassword: 'NewPassword123!'
      });
      assertErrorEnvelope(res, 400);
    });

    it('F18-5: POST /auth/reset-password enforces minimum 6 characters on newPassword', async () => {
      await client.forgotPassword({ email: 'adeola@example.com' });
      const res = await client.resetPassword({
        token: 'token_reset_usr_verified_001',
        newPassword: '123'
      });
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('at least 6 characters');
    });
  });

  // --- Feature 19: Auth Profile & Preferences ---
  describe('Feature 19: Auth Profile & Preferences', () => {
    const validToken = 'jwt_token_for_usr_verified_001';

    it('F19-1: GET /auth/me returns authenticated customer profile', async () => {
      const res = await client.getMe(validToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.email).toBe('adeola@example.com');
      expect(res.data.data.preferences).toBeDefined();
    });

    it('F19-2: GET /auth/me rejects unauthorized request with 401', async () => {
      const res = await client.getMe(null);
      assertErrorEnvelope(res, 401);
    });

    it('F19-3: PATCH /auth/change-password updates user password when currentPassword matches', async () => {
      const res = await client.changePassword({
        currentPassword: 'Password123!',
        newPassword: 'UpdatedPassword789!'
      }, validToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('Password changed successfully');
    });

    it('F19-4: PATCH /auth/change-password rejects incorrect currentPassword with 400', async () => {
      const res = await client.changePassword({
        currentPassword: 'WrongPassword!',
        newPassword: 'UpdatedPassword789!'
      }, validToken);
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('Current password is incorrect');
    });

    it('F19-5: PATCH /auth/notification-preferences updates preferences with exact backend keys', async () => {
      const res = await client.updateNotificationPreferences({
        paymentReminders: false,
        deficitAlerts: true,
        serviceRequestUpdates: true,
        productNewsOffers: true
      }, validToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.preferences.paymentReminders).toBe(false);
      expect(res.data.data.preferences.productNewsOffers).toBe(true);
    });
  });

  // --- Feature 20: Auth Account Deletion ---
  describe('Feature 20: Auth Account Deletion', () => {
    const validToken = 'jwt_token_for_usr_verified_001';

    it('F20-1: DELETE /auth/me deletes account when correct password is provided', async () => {
      const res = await client.deleteAccount({ password: 'Password123!' }, validToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('Account deleted successfully');

      // Verify user is gone
      const meRes = await client.getMe(validToken);
      expect(meRes.status).toBe(401);
    });

    it('F20-2: DELETE /auth/me rejects request with incorrect password with 401', async () => {
      const res = await client.deleteAccount({ password: 'WrongPassword!' }, validToken);
      assertErrorEnvelope(res, 401);
      expect(res.data.message).toContain('Current password is required');
    });

    it('F20-3: DELETE /auth/me rejects request without password in body', async () => {
      const res = await client.deleteAccount({}, validToken);
      assertErrorEnvelope(res, 401);
    });

    it('F20-4: DELETE /auth/me cascades deletion to user plans, payments, and notifications', async () => {
      await client.deleteAccount({ password: 'Password123!' }, validToken);
      const state = (await client.request('GET', '/test/state')).data.data;
      const plans = state.plans.filter(p => p.userId === 'usr_verified_001');
      const payments = state.payments.filter(p => p.userId === 'usr_verified_001');
      expect(plans.length).toBe(0);
      expect(payments.length).toBe(0);
    });

    it('F20-5: Subsequent login attempt for deleted account returns 401', async () => {
      await client.deleteAccount({ password: 'Password123!' }, validToken);
      const loginRes = await client.login({
        email: 'adeola@example.com',
        password: 'Password123!'
      });
      assertErrorEnvelope(loginRes, 401);
    });
  });
});
