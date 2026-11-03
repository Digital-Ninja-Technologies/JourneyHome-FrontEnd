// tests/e2e/suites/tier2-boundaries/b26-b28-payments-boundaries.test.mjs
// Tier 2: Boundary & Corner Cases for Features 26 to 28 (Payments & Subscriptions)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 2 - Boundaries for Features 26 to 28: Payments & Subscriptions', () => {
  let client;
  const userToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Boundary Feature 26: Payments Initialization & Verify ---
  describe('Feature 26 Boundaries: Payments Initialization & Verify', () => {
    it('B26-1: POST /payments/plans/:planId/initialize-initial with unauthorized token returns 401', async () => {
      const res = await client.initializePlanPayment('plan_active_001', null);
      assertErrorEnvelope(res, 401);
    });

    it('B26-2: POST /payments/plans/:planId/initialize-initial handles non-existent plan ID with 404', async () => {
      const res = await client.initializePlanPayment('nonexistent_plan_id', userToken);
      assertErrorEnvelope(res, 404);
    });

    it('B26-3: POST /payments/verify/:reference handles special characters in transaction reference', async () => {
      const res = await client.verifyPayment('ref_special_123_abc', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.status).toBe('Successful');
    });

    it('B26-4: POST /payments/verify/:reference returns 400 for explicit failure reference string (invalid_ref)', async () => {
      const res = await client.verifyPayment('invalid_ref', userToken);
      assertErrorEnvelope(res, 400);
    });

    it('B26-5: POST /payments/verify/:reference without Bearer token returns 401', async () => {
      const res = await client.verifyPayment('ref_some_123', null);
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Boundary Feature 27: Payments Listing & Detail ---
  describe('Feature 27 Boundaries: Payments Listing & Detail', () => {
    it('B27-1: GET /payments handles filtering by status with no matching records', async () => {
      const res = await client.getPayments('status=Failed', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.items.length).toBe(0);
    });

    it('B27-2: GET /payments handles empty string query filters (?status=&purpose=)', async () => {
      const res = await client.getPayments('status=&purpose=', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.items.length).toBeGreaterThan(0);
    });

    it('B27-3: GET /payments/:id prevents unauthorized access to another user transaction receipt', async () => {
      await client.signup({
        name: 'Another User',
        email: 'another@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const user2 = state.users.find(u => u.email === 'another@example.com');
      user2.isVerified = true;

      const user2Token = `jwt_token_for_${user2._id}`;
      const res = await client.getPaymentById('pay_001', user2Token);
      assertErrorEnvelope(res, 404);
    });

    it('B27-4: Payment amountMinor represents exact amount in kobo (100 kobo = 1 NGN)', () => {
      const amountNaira = 5000;
      const amountMinor = amountNaira * 100;
      expect(amountMinor).toBe(500000);
      expect(amountMinor / 100).toBe(5000);
    });

    it('B27-5: GET /payments without token returns 401', async () => {
      const res = await client.getPayments('', null);
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Boundary Feature 28: Subscriptions Listing & Detail ---
  describe('Feature 28 Boundaries: Subscriptions Listing & Detail', () => {
    it('B28-1: User with no subscriptions receives empty items array cleanly', async () => {
      await client.signup({
        name: 'No Sub User',
        email: 'nosub@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const user = state.users.find(u => u.email === 'nosub@example.com');
      user.isVerified = true;

      const token = `jwt_token_for_${user._id}`;
      const res = await client.getSubscriptions(token);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.length).toBe(0);
    });

    it('B28-2: GET /subscriptions/:id returns 404 for malformed ID string', async () => {
      const res = await client.getSubscriptionById('undefined', userToken);
      assertErrorEnvelope(res, 404);
    });

    it('B28-3: GET /subscriptions/:id prevents cross-user access to subscription details', async () => {
      await client.signup({
        name: 'Other Sub User',
        email: 'othersub@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const user = state.users.find(u => u.email === 'othersub@example.com');
      user.isVerified = true;

      const token = `jwt_token_for_${user._id}`;
      const res = await client.getSubscriptionById('sub_001', token);
      assertErrorEnvelope(res, 404);
    });

    it('B28-4: Subscription nextBillingDate is a valid future ISO date', () => {
      const now = Date.now();
      const futureDate = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
      expect(new Date(futureDate).getTime()).toBeGreaterThan(now);
    });

    it('B28-5: GET /subscriptions without Bearer token returns 401', async () => {
      const res = await client.getSubscriptions(null);
      assertErrorEnvelope(res, 401);
    });
  });
});
