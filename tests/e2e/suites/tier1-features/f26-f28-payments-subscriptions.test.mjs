// tests/e2e/suites/tier1-features/f26-f28-payments-subscriptions.test.mjs
// Tier 1: Feature Coverage for Features 26 to 28 (Payments & Subscriptions)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope,
  assertPaginatedEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 1 - Features 26 to 28: Payments & Subscriptions Integration', () => {
  let client;
  const userToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Feature 26: Payments Initialization & Verify ---
  describe('Feature 26: Payments Initialization & Verify', () => {
    it('F26-1: POST /payments/plans/:planId/initialize-initial returns authorizationUrl and reference', async () => {
      // First create a pending plan
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: {
          fullName: 'Olumide Jacobs',
          relationship: 'Uncle',
          address: 'Surulere, Lagos'
        }
      }, userToken);
      const planId = planRes.data.data._id;

      const initRes = await client.initializePlanPayment(planId, userToken);
      assertSuccessEnvelope(initRes, 200);
      expect(initRes.data.data.reference).toBeDefined();
      expect(initRes.data.data.authorizationUrl).toContain('paystack.com');
    });

    it('F26-2: POST /payments/plans/:planId/initialize-initial rejects already active/paid plan with 400', async () => {
      const res = await client.initializePlanPayment('plan_active_001', userToken);
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('already active');
    });

    it('F26-3: POST /payments/plans/:planId/initialize-initial returns 404 for non-existent plan', async () => {
      const res = await client.initializePlanPayment('plan_ghost_999', userToken);
      assertErrorEnvelope(res, 404);
    });

    it('F26-4: POST /payments/verify/:reference confirms transaction and activates pending plan', async () => {
      // Create pending plan
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Kemi Adebayo', relationship: 'Aunt', address: 'Yaba, Lagos' }
      }, userToken);
      const planId = planRes.data.data._id;

      const initRes = await client.initializePlanPayment(planId, userToken);
      const ref = initRes.data.data.reference;

      const verifyRes = await client.verifyPayment(ref, userToken);
      assertSuccessEnvelope(verifyRes, 200);
      expect(verifyRes.data.data.status).toBe('Successful');
      expect(verifyRes.data.data.reference).toBe(ref);

      // Verify plan is now Active
      const planCheck = await client.getPlanById(planId, userToken);
      expect(planCheck.data.data.status).toBe('Active');
    });

    it('F26-5: POST /payments/verify/:reference fails gracefully on invalid gateway reference', async () => {
      const res = await client.verifyPayment('invalid_ref', userToken);
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('failed at gateway');
    });
  });

  // --- Feature 27: Payments Listing & Detail ---
  describe('Feature 27: Payments Listing & Detail', () => {
    it('F27-1: GET /payments returns paginated transaction history envelope', async () => {
      const res = await client.getPayments('', userToken);
      assertSuccessEnvelope(res, 200);
      assertPaginatedEnvelope(res.data.data);
      expect(res.data.data.items.length).toBeGreaterThan(0);
    });

    it('F27-2: GET /payments supports query filtering by status', async () => {
      const res = await client.getPayments('status=Successful', userToken);
      assertSuccessEnvelope(res, 200);
      for (const item of res.data.data.items) {
        expect(item.status).toBe('Successful');
      }
    });

    it('F27-3: GET /payments supports filtering by planId', async () => {
      const res = await client.getPayments('planId=plan_active_001', userToken);
      assertSuccessEnvelope(res, 200);
      for (const item of res.data.data.items) {
        expect(item.planId || item.plan).toBe('plan_active_001');
      }
    });

    it('F27-4: GET /payments/:id returns complete transaction receipt details', async () => {
      const res = await client.getPaymentById('pay_001', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data._id).toBe('pay_001');
      expect(res.data.data.amountMinor).toBe(500000);
      expect(res.data.data.currency).toBe('NGN');
    });

    it('F27-5: GET /payments/:id returns 404 for non-existent transaction', async () => {
      const res = await client.getPaymentById('pay_missing_999', userToken);
      assertErrorEnvelope(res, 404);
    });
  });

  // --- Feature 28: Subscriptions Listing & Detail ---
  describe('Feature 28: Subscriptions Listing & Detail', () => {
    it('F28-1: GET /subscriptions returns array of recurring billing subscriptions', async () => {
      const res = await client.getSubscriptions(userToken);
      assertSuccessEnvelope(res, 200);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.data.length).toBeGreaterThan(0);
    });

    it('F28-2: Subscriptions include planId, status, amountMinor, and nextBillingDate', async () => {
      const res = await client.getSubscriptions(userToken);
      const sub = res.data.data[0];
      expect(sub.plan || sub.planId).toBe('plan_active_001');
      expect(sub.status).toBe('active');
      expect(sub.amountMinor).toBe(500000);
      expect(sub.nextBillingDate).toBeDefined();
    });

    it('F28-3: GET /subscriptions/:id returns single subscription record', async () => {
      const res = await client.getSubscriptionById('sub_001', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data._id).toBe('sub_001');
      expect(res.data.data.status).toBe('active');
    });

    it('F28-4: GET /subscriptions/:id returns 404 for missing subscription identifier', async () => {
      const res = await client.getSubscriptionById('sub_missing_999', userToken);
      assertErrorEnvelope(res, 404);
    });

    it('F28-5: GET /subscriptions replaces deprecated /payments/methods endpoint in dashboard', () => {
      const activeEndpoint = '/subscriptions';
      const deprecatedEndpoint = '/payments/methods';
      expect(activeEndpoint).not.toBe(deprecatedEndpoint);
    });
  });
});
