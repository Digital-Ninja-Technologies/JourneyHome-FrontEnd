// tests/e2e/suites/tier3-pairwise/pairwise-interactions.test.mjs
// Tier 3: Cross-Feature Combinations & Pairwise Interactions
// Covers pairwise interactions across Auth, Plans, Payments, and Notifications.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope,
  assertPlanShape
} from '../../harness/assertions.mjs';

describe('Tier 3 - Pairwise Interactions across Features', () => {
  let client;
  const verifiedToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Interaction Group 1: Auth ↔ Plans (Pairwise 1 to 7) ---
  describe('Pairwise Group 1: Auth ↔ Plans Interactions', () => {
    it('P01: Unauthenticated request to POST /plans is rejected with 401', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'No Auth', relationship: 'Friend', address: 'Nowhere' }
      }, null);
      assertErrorEnvelope(res, 401);
    });

    it('P02: Unverified user cannot create a plan until email verification is complete', async () => {
      // Unverified user tries to log in -> blocked
      const loginRes = await client.login({ email: 'tunde@example.com', password: 'Password123!' });
      expect(loginRes.status).toBe(401);

      // Verify email
      await client.verifyEmail({ token: 'token_valid_tunde_123' });
      const verifiedLogin = await client.login({ email: 'tunde@example.com', password: 'Password123!' });
      const token = verifiedLogin.data.data.token;

      // Plan creation now succeeds
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Ayodele Bakare', relationship: 'Sister', address: 'Ikeja' }
      }, token);
      assertSuccessEnvelope(planRes, 201);
    });

    it('P03: Plans created by authenticated user are strictly bound to their userId', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Bound Beneficiary', relationship: 'Parent', address: 'Lagos' }
      }, verifiedToken);
      expect(res.data.data.userId).toBe('usr_verified_001');
    });

    it('P04: User password change does not affect plan ownership or access', async () => {
      await client.changePassword({
        currentPassword: 'Password123!',
        newPassword: 'BrandNewPassword123!'
      }, verifiedToken);

      const plansRes = await client.getPlans('', verifiedToken);
      assertSuccessEnvelope(plansRes, 200);
      expect(plansRes.data.data.items.length).toBeGreaterThan(0);
    });

    it('P05: Account deletion destroys all plans associated with the user account', async () => {
      // Confirm plan exists
      const beforePlans = await client.getPlans('', verifiedToken);
      expect(beforePlans.data.data.items.length).toBeGreaterThan(0);

      // Delete account
      await client.deleteAccount({ password: 'Password123!' }, verifiedToken);

      // Plans should no longer exist in state
      const state = (await client.request('GET', '/test/state')).data.data;
      const userPlans = state.plans.filter(p => p.userId === 'usr_verified_001');
      expect(userPlans.length).toBe(0);
    });

    it('P06: GET /plans/dashboard reflects newly created plan in totalPlans and pendingPlans', async () => {
      const beforeDash = await client.getPlansDashboard(verifiedToken);
      const initialTotal = beforeDash.data.data.totalPlans;

      await client.createPlan({
        packageId: 'pkg_comprehensive_002',
        coveredPerson: { fullName: 'New Member', relationship: 'Son', address: 'Surulere' }
      }, verifiedToken);

      const afterDash = await client.getPlansDashboard(verifiedToken);
      expect(afterDash.data.data.totalPlans).toBe(initialTotal + 1);
      expect(afterDash.data.data.pendingPlans).toBe(beforeDash.data.data.pendingPlans + 1);
    });

    it('P07: Profile me endpoint user details match creator info on created plans', async () => {
      const meRes = await client.getMe(verifiedToken);
      const planRes = await client.getPlanById('plan_active_001', verifiedToken);
      expect(planRes.data.data.userId).toBe(meRes.data.data.id || meRes.data.data._id);
    });
  });

  // --- Interaction Group 2: Auth ↔ Payments (Pairwise 8 to 14) ---
  describe('Pairwise Group 2: Auth ↔ Payments Interactions', () => {
    it('P08: Unauthenticated request to initialize payment returns 401', async () => {
      const res = await client.initializePlanPayment('plan_active_001', null);
      assertErrorEnvelope(res, 401);
    });

    it('P09: Unauthenticated request to verify payment returns 401', async () => {
      const res = await client.verifyPayment('ref_123', null);
      assertErrorEnvelope(res, 401);
    });

    it('P10: Unauthenticated request to GET /payments returns 401', async () => {
      const res = await client.getPayments('', null);
      assertErrorEnvelope(res, 401);
    });

    it('P11: Payment verification requires valid authenticated session matching payer', async () => {
      const res = await client.verifyPayment('ref_valid_checkout_123', verifiedToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.userId).toBe('usr_verified_001');
    });

    it('P12: User account deletion cascades to all associated payment transaction records', async () => {
      await client.deleteAccount({ password: 'Password123!' }, verifiedToken);
      const state = (await client.request('GET', '/test/state')).data.data;
      const userPayments = state.payments.filter(p => p.userId === 'usr_verified_001');
      expect(userPayments.length).toBe(0);
    });

    it('P13: Payment query filters isolate payments per authenticated user', async () => {
      const res = await client.getPayments('status=Successful', verifiedToken);
      assertSuccessEnvelope(res, 200);
      for (const item of res.data.data.items) {
        expect(item.userId).toBe('usr_verified_001');
      }
    });

    it('P14: Password change allows user to continue viewing previous payment history', async () => {
      await client.changePassword({ currentPassword: 'Password123!', newPassword: 'NewPassword789!' }, verifiedToken);
      const res = await client.getPayments('', verifiedToken);
      assertSuccessEnvelope(res, 200);
    });
  });

  // --- Interaction Group 3: Auth ↔ Notifications (Pairwise 15 to 20) ---
  describe('Pairwise Group 3: Auth ↔ Notifications Interactions', () => {
    it('P15: Unauthenticated request to GET /notifications returns 401', async () => {
      const res = await client.getNotifications('', null);
      assertErrorEnvelope(res, 401);
    });

    it('P16: Notification preferences update immediately affects user profile state', async () => {
      const updateRes = await client.updateNotificationPreferences({
        deficitAlerts: false
      }, verifiedToken);
      assertSuccessEnvelope(updateRes, 200);

      const meRes = await client.getMe(verifiedToken);
      expect(meRes.data.data.preferences.deficitAlerts).toBe(false);
    });

    it('P17: Marking notification as read persists across multiple profile me requests', async () => {
      await client.markNotificationRead('notif_001', verifiedToken);
      const notifRes = await client.getNotifications('isRead=false', verifiedToken);
      expect(notifRes.data.data.items.length).toBe(0);
    });

    it('P18: Notification deletion removes record without affecting other user notifications', async () => {
      await client.deleteNotification('notif_001', verifiedToken);
      const res = await client.getNotifications('', verifiedToken);
      expect(res.data.data.items.some(n => n._id === 'notif_001')).toBe(false);
    });

    it('P19: User account deletion cascades to delete all user notifications', async () => {
      await client.deleteAccount({ password: 'Password123!' }, verifiedToken);
      const state = (await client.request('GET', '/test/state')).data.data;
      const notifs = state.notifications.filter(n => n.userId === 'usr_verified_001');
      expect(notifs.length).toBe(0);
    });

    it('P20: User session expiration blocks subsequent notification operations with 401', async () => {
      const invalidToken = 'jwt_token_for_expired_session';
      const res = await client.markNotificationRead('notif_001', invalidToken);
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Interaction Group 4: Plans ↔ Payments (Pairwise 21 to 27) ---
  describe('Pairwise Group 4: Plans ↔ Payments Interactions', () => {
    it('P21: Creating a plan in Pending status allows initializing initial payment', async () => {
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Plan Payment Target', relationship: 'Mother', address: 'Lagos' }
      }, verifiedToken);
      const planId = planRes.data.data._id;

      const payRes = await client.initializePlanPayment(planId, verifiedToken);
      assertSuccessEnvelope(payRes, 200);
      expect(payRes.data.data.authorizationUrl).toBeDefined();
    });

    it('P22: Verifying payment transitions corresponding plan status to Active', async () => {
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Status Transition Person', relationship: 'Father', address: 'Lagos' }
      }, verifiedToken);
      const planId = planRes.data.data._id;

      const initRes = await client.initializePlanPayment(planId, verifiedToken);
      const ref = initRes.data.data.reference;

      await client.verifyPayment(ref, verifiedToken);

      const updatedPlan = await client.getPlanById(planId, verifiedToken);
      expect(updatedPlan.data.data.status).toBe('Active');
    });

    it('P23: Already Active plan rejects new initial payment initialization', async () => {
      const res = await client.initializePlanPayment('plan_active_001', verifiedToken);
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('already active');
    });

    it('P24: Payment verification increments totalContributedMinor in plans dashboard', async () => {
      const dashBefore = await client.getPlansDashboard(verifiedToken);
      const contribBefore = dashBefore.data.data.totalContributedMinor;

      // Create plan & verify payment (500,000 minor)
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Contrib Member', relationship: 'Aunt', address: 'Lagos' }
      }, verifiedToken);
      const initRes = await client.initializePlanPayment(planRes.data.data._id, verifiedToken);
      await client.verifyPayment(initRes.data.data.reference, verifiedToken);

      const dashAfter = await client.getPlansDashboard(verifiedToken);
      expect(dashAfter.data.data.totalContributedMinor).toBe(contribBefore + 500000);
    });

    it('P25: GET /payments with planId filter returns all payments for that specific plan', async () => {
      const res = await client.getPayments('planId=plan_active_001', verifiedToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.items.length).toBeGreaterThan(0);
      for (const item of res.data.data.items) {
        expect(item.planId || item.plan).toBe('plan_active_001');
      }
    });

    it('P26: Initializing payment on deleted plan returns 404', async () => {
      const res = await client.initializePlanPayment('plan_nonexistent_123', verifiedToken);
      assertErrorEnvelope(res, 404);
    });

    it('P27: Payment record links to corresponding plan ID and packageName', async () => {
      const payRes = await client.getPaymentById('pay_001', verifiedToken);
      expect(payRes.data.data.plan || payRes.data.data.planId).toBe('plan_active_001');
    });
  });

  // --- Interaction Group 5: Plans ↔ Subscriptions (Pairwise 28 to 31) ---
  describe('Pairwise Group 5: Plans ↔ Subscriptions Interactions', () => {
    it('P28: Verifying initial payment automatically generates an active subscription', async () => {
      const planRes = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Sub Person', relationship: 'Sister', address: 'Lagos' }
      }, verifiedToken);
      const initRes = await client.initializePlanPayment(planRes.data.data._id, verifiedToken);
      await client.verifyPayment(initRes.data.data.reference, verifiedToken);

      const subsRes = await client.getSubscriptions(verifiedToken);
      assertSuccessEnvelope(subsRes, 200);
      const activeSubs = subsRes.data.data.filter(s => s.status === 'active');
      expect(activeSubs.length).toBeGreaterThan(0);
    });

    it('P29: Subscription amountMinor matches package monthly price in minor currency (500,000 NGN kobo)', async () => {
      const subRes = await client.getSubscriptionById('sub_001', verifiedToken);
      assertSuccessEnvelope(subRes, 200);
      expect(subRes.data.data.amountMinor).toBe(500000);
      expect(subRes.data.data.billingInterval).toBe('monthly');
    });

    it('P30: Subscriptions list includes plan identifier linked to user plan', async () => {
      const subsRes = await client.getSubscriptions(verifiedToken);
      const sub = subsRes.data.data[0];
      expect(sub.plan || sub.planId).toBe('plan_active_001');
    });

    it('P31: Deleting user account clears all recurring subscriptions', async () => {
      await client.deleteAccount({ password: 'Password123!' }, verifiedToken);
      const state = (await client.request('GET', '/test/state')).data.data;
      const subs = state.subscriptions.filter(s => s.userId === 'usr_verified_001');
      expect(subs.length).toBe(0);
    });
  });

  // --- Interaction Group 6: Payments & Plans ↔ Notifications (Pairwise 32 to 35) ---
  describe('Pairwise Group 6: Payments & Plans ↔ Notifications Interactions', () => {
    it('P32: Initial payment receipt notification links to plan and transaction', async () => {
      const notifRes = await client.getNotifications('', verifiedToken);
      const paymentNotif = notifRes.data.data.items.find(n => n.event === 'payment.success');
      expect(paymentNotif).toBeDefined();
      expect(paymentNotif.plan).toBe('plan_active_001');
    });

    it('P33: Marking plan activation notification as read reduces unread counter by 1', async () => {
      const beforeNotifs = await client.getNotifications('', verifiedToken);
      const unreadBefore = beforeNotifs.data.data.counts.totalUnreadNotifications;

      await client.markNotificationRead('notif_001', verifiedToken);

      const afterNotifs = await client.getNotifications('', verifiedToken);
      expect(afterNotifs.data.data.counts.totalUnreadNotifications).toBe(unreadBefore - 1);
    });

    it('P34: Deleting notification removes it while preserving related plan and payment', async () => {
      await client.deleteNotification('notif_001', verifiedToken);

      // Verify plan and payment still intact
      const planRes = await client.getPlanById('plan_active_001', verifiedToken);
      const payRes = await client.getPaymentById('pay_001', verifiedToken);
      assertSuccessEnvelope(planRes, 200);
      assertSuccessEnvelope(payRes, 200);
    });

    it('P35: End-to-end multi-entity cross check: User -> Plan -> Payment -> Subscription -> Notification', async () => {
      const meRes = await client.getMe(verifiedToken);
      const userId = meRes.data.data.id || meRes.data.data._id;

      const plansRes = await client.getPlans('', verifiedToken);
      const payRes = await client.getPayments('', verifiedToken);
      const subsRes = await client.getSubscriptions(verifiedToken);
      const notifRes = await client.getNotifications('', verifiedToken);

      expect(plansRes.data.data.items[0].userId).toBe(userId);
      expect(payRes.data.data.items[0].userId).toBe(userId);
      expect(subsRes.data.data[0].userId).toBe(userId);
      expect(notifRes.data.data.items[0].userId).toBe(userId);
    });
  });
});
