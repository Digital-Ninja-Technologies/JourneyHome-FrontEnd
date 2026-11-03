// tests/e2e/suites/tier4-scenarios/user-scenarios.test.mjs
// Tier 4: Real-World Application Scenarios
// Complete realistic end-to-end user journeys simulating full client lifecycle.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import { BrowserEnvironmentSimulator } from '../../harness/storage-simulator.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope,
  assertUserSessionShape,
  assertPlanShape
} from '../../harness/assertions.mjs';

describe('Tier 4 - Real-World Application Scenarios', () => {
  let client;
  let browser;

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    browser = new BrowserEnvironmentSimulator();
    await client.resetMock();
  });

  // --- Scenario 1: Full New Customer Onboarding Journey ---
  it('Scenario 1: Full New Customer Onboarding Journey', async () => {
    // Step 1: User visits marketing site, clicks Get Started, arrives at /signup
    // Submits form (name, email, password, role) - NO phone, NO package
    const signupData = {
      name: 'Ifeanyi Okafor',
      email: 'ifeanyi.okafor@example.com',
      password: 'StrongPassword2026!',
      role: 'customer'
    };

    const signupRes = await client.signup(signupData);
    assertSuccessEnvelope(signupRes, 201);
    expect(signupRes.data.token).toBeUndefined(); // Tokenless response per R3

    // Step 2: Client saves pending email in sessionStorage and redirects to /signup/verify
    browser.setPendingVerificationEmail(signupData.email);
    expect(browser.getPendingVerificationEmail()).toBe(signupData.email);

    // Step 3: User receives verification email with token link, clicks /signup/verify?token=...
    const state = (await client.request('GET', '/test/state')).data.data;
    const userInDb = state.users.find(u => u.email === signupData.email);
    expect(userInDb.verificationToken).toBeDefined();

    const verifyRes = await client.verifyEmail({ token: userInDb.verificationToken });
    assertSuccessEnvelope(verifyRes, 200);

    // Step 4: Verification clears pending email from sessionStorage
    browser.clearPendingVerificationEmail();
    expect(browser.getPendingVerificationEmail()).toBeNull();

    // Step 5: User logs in on /login
    const loginRes = await client.login({
      email: signupData.email,
      password: signupData.password
    });
    assertSuccessEnvelope(loginRes, 200);
    const sessionToken = loginRes.data.data.token;
    assertUserSessionShape(loginRes.data.data.user);

    // Writes session to storage
    browser.writeSession(sessionToken, loginRes.data.data.user, false);
    expect(browser.readSession()).toBeDefined();

    // Step 6: User navigates to /signup/plan (onboarding plan view)
    // Clicks "Skip for now — I'll set up a plan later" at the top of the view
    browser.clearOnboardingPlan();
    expect(browser.getOnboardingPlan()).toBeNull();

    // Step 7: Arrives at /app (empty dashboard)
    const dashboardRes = await client.getPlansDashboard(sessionToken);
    assertSuccessEnvelope(dashboardRes, 200);
    expect(dashboardRes.data.data.totalPlans).toBe(0);
    expect(dashboardRes.data.data.activePlans).toBe(0);
    expect(dashboardRes.data.data.pendingPlans).toBe(0);
    expect(dashboardRes.data.data.totalContributedMinor).toBe(0);
  });

  // --- Scenario 2: Plan Setup & Payment Flow ---
  it('Scenario 2: Plan Setup & Payment Flow', async () => {
    // Step 1: Authenticated user logs in
    const loginRes = await client.login({
      email: 'adeola@example.com',
      password: 'Password123!'
    });
    const token = loginRes.data.data.token;

    // Step 2: User queries available packages on /app/plans/new
    const packagesRes = await client.getPackages();
    assertSuccessEnvelope(packagesRes, 200);
    const selectedPkg = packagesRes.data.data.find(p => p.name === 'Comprehensive Shield');
    expect(selectedPkg).toBeDefined();

    // Step 3: Fills Covered Person details with Popover DatePicker (DOB: 1958-09-24)
    const planPayload = {
      packageId: selectedPkg._id,
      coveredPerson: {
        fullName: 'Folake Adeyemi',
        relationship: 'Mother',
        dateOfBirth: '1958-09-24',
        gender: 'Female',
        address: '8 Bishop Oluwole Street, Victoria Island, Lagos',
        phoneNumber: '+2348039998877'
      }
    };

    const createRes = await client.createPlan(planPayload, token);
    assertSuccessEnvelope(createRes, 201);
    const plan = createRes.data.data;
    assertPlanShape(plan);
    expect(plan.status).toBe('Pending');

    // Step 4: User initiates first contribution payment (Paystack initialization)
    const initRes = await client.initializePlanPayment(plan._id, token);
    assertSuccessEnvelope(initRes, 200);
    const { reference, authorizationUrl } = initRes.data.data;
    expect(authorizationUrl).toContain('checkout.paystack.com');

    // Stores pending plan in sessionStorage during checkout
    browser.setOnboardingPlan(plan._id);
    expect(browser.getOnboardingPlan()).toBe(plan._id);

    // Step 5: User completes payment on Paystack, redirected to /payment/callback?reference=...
    const verifyRes = await client.verifyPayment(reference, token);
    assertSuccessEnvelope(verifyRes, 200);
    expect(verifyRes.data.data.status).toBe('Successful');

    // Cleans up onboarding plan on callback completion
    browser.clearOnboardingPlan();
    expect(browser.getOnboardingPlan()).toBeNull();

    // Step 6: Checks updated dashboard summary
    const dashboardRes = await client.getPlansDashboard(token);
    assertSuccessEnvelope(dashboardRes, 200);
    expect(dashboardRes.data.data.activePlans).toBeGreaterThan(0);
    expect(dashboardRes.data.data.totalContributedMinor).toBeGreaterThan(0);
  });

  // --- Scenario 3: Profile Management & Notification Cycle ---
  it('Scenario 3: Profile Management & Notification Cycle', async () => {
    // Step 1: User logs in
    const loginRes = await client.login({
      email: 'adeola@example.com',
      password: 'Password123!'
    });
    const token = loginRes.data.data.token;

    // Step 2: Changes account password
    const changePwdRes = await client.changePassword({
      currentPassword: 'Password123!',
      newPassword: 'MyNewSecurePassword888!'
    }, token);
    assertSuccessEnvelope(changePwdRes, 200);

    // Verify login works with new password
    const reLogin = await client.login({
      email: 'adeola@example.com',
      password: 'MyNewSecurePassword888!'
    });
    assertSuccessEnvelope(reLogin, 200);
    const freshToken = reLogin.data.data.token;

    // Step 3: Toggles notification preferences
    const prefRes = await client.updateNotificationPreferences({
      paymentReminders: true,
      deficitAlerts: true,
      serviceRequestUpdates: false,
      productNewsOffers: true
    }, freshToken);
    assertSuccessEnvelope(prefRes, 200);
    expect(prefRes.data.data.preferences.productNewsOffers).toBe(true);

    // Step 4: Views notification feed
    const notifRes = await client.getNotifications('', freshToken);
    assertSuccessEnvelope(notifRes, 200);
    const unreadNotif = notifRes.data.data.items.find(n => !n.isRead);
    expect(unreadNotif).toBeDefined();

    // Step 5: Marks notification as read
    const readRes = await client.markNotificationRead(unreadNotif._id, freshToken);
    assertSuccessEnvelope(readRes, 200);
    expect(readRes.data.data.isRead).toBe(true);

    // Step 6: Deletes notification
    const delRes = await client.deleteNotification(unreadNotif._id, freshToken);
    assertSuccessEnvelope(delRes, 200);
  });

  // --- Scenario 4: Account Closure Flow ---
  it('Scenario 4: Account Closure Flow', async () => {
    // Step 1: Verified user logs in
    const loginRes = await client.login({
      email: 'adeola@example.com',
      password: 'Password123!'
    });
    const token = loginRes.data.data.token;
    browser.writeSession(token, loginRes.data.data.user);

    // Step 2: Navigates to /app/profile, clicks Close Account
    // Modal opens, user enters password to authenticate deletion
    const deleteRes = await client.deleteAccount({ password: 'Password123!' }, token);
    assertSuccessEnvelope(deleteRes, 200);

    // Step 3: Dashboard clears local session and redirects to /login
    browser.clearSession();
    expect(browser.readSession()).toBeNull();

    // Step 4: Token is invalidated on subsequent API calls
    const meRes = await client.getMe(token);
    expect(meRes.status).toBe(401);

    // Step 5: Subsequent login attempt is blocked
    const loginAttempt = await client.login({
      email: 'adeola@example.com',
      password: 'Password123!'
    });
    assertErrorEnvelope(loginAttempt, 401);
  });

  // --- Scenario 5: Invalid Token & Error Recovery Flow ---
  it('Scenario 5: Invalid Token & Error Recovery Flow', async () => {
    // Step 1: User attempts to verify email with expired or invalid token
    const invalidVerifyRes = await client.verifyEmail({ token: 'expired_or_corrupt_token_999' });
    assertErrorEnvelope(invalidVerifyRes, 400);

    // Step 2: View prompts user to resend verification email for unverified user
    const resendRes = await client.resendVerification({ email: 'tunde@example.com' });
    assertSuccessEnvelope(resendRes, 200);
    expect(resendRes.data.message).toContain('Verification email sent');

    // Step 3: User receives new valid token and verifies successfully
    const state = (await client.request('GET', '/test/state')).data.data;
    const tunde = state.users.find(u => u.email === 'tunde@example.com');
    expect(tunde.verificationToken).toBeDefined();

    const secondVerifyRes = await client.verifyEmail({ token: tunde.verificationToken });
    assertSuccessEnvelope(secondVerifyRes, 200);

    // Step 4: User logs in successfully following recovery
    const loginRes = await client.login({
      email: 'tunde@example.com',
      password: 'Password123!'
    });
    assertSuccessEnvelope(loginRes, 200);
    expect(loginRes.data.data.token).toBeDefined();
  });

  // --- Scenario 6: Multi-plan Management & Subscription Tracking ---
  it('Scenario 6: Multi-plan Management & Subscription Tracking', async () => {
    // Step 1: Log in
    const loginRes = await client.login({
      email: 'adeola@example.com',
      password: 'Password123!'
    });
    const token = loginRes.data.data.token;

    // Step 2: Create first plan for Mother
    const plan1Res = await client.createPlan({
      packageId: 'pkg_essential_001',
      coveredPerson: { fullName: 'First Parent', relationship: 'Mother', address: 'Lagos' }
    }, token);
    const plan1Id = plan1Res.data.data._id;

    // Step 3: Create second plan for Father
    const plan2Res = await client.createPlan({
      packageId: 'pkg_comprehensive_002',
      coveredPerson: { fullName: 'Second Parent', relationship: 'Father', address: 'Lagos' }
    }, token);
    const plan2Id = plan2Res.data.data._id;

    // Step 4: Pay for plan 1
    const init1 = await client.initializePlanPayment(plan1Id, token);
    await client.verifyPayment(init1.data.data.reference, token);

    // Step 5: Pay for plan 2
    const init2 = await client.initializePlanPayment(plan2Id, token);
    await client.verifyPayment(init2.data.data.reference, token);

    // Step 6: Verify subscriptions list has both subscriptions
    const subsRes = await client.getSubscriptions(token);
    assertSuccessEnvelope(subsRes, 200);
    expect(subsRes.data.data.length).toBeGreaterThanOrEqual(2);

    // Step 7: Verify plans list contains both active plans
    const plansRes = await client.getPlans('', token);
    assertSuccessEnvelope(plansRes, 200);
    const p1 = plansRes.data.data.items.find(p => p._id === plan1Id);
    const p2 = plansRes.data.data.items.find(p => p._id === plan2Id);
    expect(p1.status).toBe('Active');
    expect(p2.status).toBe('Active');
  });
});
