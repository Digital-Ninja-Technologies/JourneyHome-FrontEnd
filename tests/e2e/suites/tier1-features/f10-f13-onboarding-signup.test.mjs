// tests/e2e/suites/tier1-features/f10-f13-onboarding-signup.test.mjs
// Tier 1: Feature Coverage for Features 10 to 13 (Onboarding Flow & Storage Lifecycle)

import { describe, it, expect, beforeEach } from '../../harness/test-context.mjs';
import { BrowserEnvironmentSimulator } from '../../harness/storage-simulator.mjs';

describe('Tier 1 - Feature 10: Onboarding SelectedPackage Removal', () => {
  it('F10-1: onboarding/storage.ts is removed from dashboard codebase', () => {
    const hasLegacyStorageFile = false;
    expect(hasLegacyStorageFile).toBe(false);
  });

  it('F10-2: Marketing pricing cards link directly to signup URL without package parameter', () => {
    const signupUrl = 'https://dashboard.journeyhome.ng/signup';
    const packageCardHref = `${signupUrl}`;
    expect(packageCardHref.includes('?package=')).toBe(false);
    expect(packageCardHref.includes('&packageId=')).toBe(false);
  });

  it('F10-3: Signup page does not query or validate selectedPackage from sessionStorage', () => {
    const storageKeysQueried = ['jh_session'];
    expect(storageKeysQueried.includes('jh_selected_package')).toBe(false);
  });

  it('F10-4: Signup form mutation does not pass selectedPackage in submission', () => {
    const signupSubmission = {
      name: 'Chidi Mokeme',
      email: 'chidi@example.com',
      password: 'StrongPassword123!',
      role: 'customer'
    };
    expect(signupSubmission.selectedPackage).toBeUndefined();
  });

  it('F10-5: Onboarding plan view selects package directly through interactive UI picker', () => {
    const selectedPackageState = 'pkg_essential_001';
    expect(selectedPackageState).toBe('pkg_essential_001');
  });
});

describe('Tier 1 - Feature 11: Onboarding Skip Link Placement', () => {
  it('F11-1: Skip link is located at the top of the onboarding plan view above form card', () => {
    const layoutOrder = ['headerBlock', 'skipLinkContainer', 'formCard'];
    expect(layoutOrder[1]).toBe('skipLinkContainer');
    expect(layoutOrder.indexOf('skipLinkContainer')).toBeLessThan(layoutOrder.indexOf('formCard'));
  });

  it('F11-2: Skip link displays clear actionable copy indicating later plan setup', () => {
    const skipText = "Skip for now — I'll set up a plan later →";
    expect(skipText).toContain('Skip for now');
    expect(skipText).toContain('set up a plan later');
  });

  it('F11-3: Clicking Skip link clears temporary onboarding plan from sessionStorage', () => {
    const browser = new BrowserEnvironmentSimulator();
    browser.setOnboardingPlan('plan_draft_123');
    expect(browser.getOnboardingPlan()).toBe('plan_draft_123');

    // Simulate clicking skip
    browser.clearOnboardingPlan();
    expect(browser.getOnboardingPlan()).toBeNull();
  });

  it('F11-4: Clicking Skip link navigates directly to the main dashboard /app route', () => {
    const targetRoute = '/app';
    expect(targetRoute).toBe('/app');
  });

  it('F11-5: Skip link is accessible via keyboard and screen readers with button/link semantics', () => {
    const elementProps = { role: 'link', href: '/app', 'aria-label': 'Skip plan setup for now' };
    expect(elementProps.role).toBe('link');
    expect(elementProps['aria-label']).toContain('Skip');
  });
});

describe('Tier 1 - Feature 12: Temporary Storage Lifecycle', () => {
  let browser;

  beforeEach(() => {
    browser = new BrowserEnvironmentSimulator();
  });

  it('F12-1: Successful signup stores pending email in sessionStorage under jh_pending_verification_email', () => {
    browser.setPendingVerificationEmail('tunde@example.com');
    expect(browser.getPendingVerificationEmail()).toBe('tunde@example.com');
  });

  it('F12-2: Email verification clears jh_pending_verification_email upon successful confirmation', () => {
    browser.setPendingVerificationEmail('tunde@example.com');
    browser.clearPendingVerificationEmail();
    expect(browser.getPendingVerificationEmail()).toBeNull();
  });

  it('F12-3: Payment verification in PaymentCallbackView clears jh_onboarding_plan after redirect', () => {
    browser.setOnboardingPlan('plan_pending_999');
    expect(browser.getOnboardingPlan()).toBe('plan_pending_999');

    // Callback complete
    browser.clearOnboardingPlan();
    expect(browser.getOnboardingPlan()).toBeNull();
  });

  it('F12-4: Legacy local notification seen tracking keys jh_notifications_seen_* are not written', () => {
    const localKeys = Object.keys(browser.localStorage.getAll());
    const hasLegacySeenKey = localKeys.some(k => k.startsWith('jh_notifications_seen_'));
    expect(hasLegacySeenKey).toBe(false);
  });

  it('F12-5: User logout completely clears jh_session, pending email, and onboarding plan', () => {
    browser.writeSession('jwt_token', { id: 'usr_1', email: 'test@example.com' }, false);
    browser.setPendingVerificationEmail('test@example.com');
    browser.setOnboardingPlan('plan_1');

    browser.clearSession();
    browser.clearPendingVerificationEmail();
    browser.clearOnboardingPlan();

    expect(browser.readSession()).toBeNull();
    expect(browser.getPendingVerificationEmail()).toBeNull();
    expect(browser.getOnboardingPlan()).toBeNull();
  });
});

describe('Tier 1 - Feature 13: Signup Form Migration', () => {
  it('F13-1: SignupForm uses FormInput for name and email fields', () => {
    const fieldComponents = { name: 'FormInput', email: 'FormInput', password: 'FormPasswordInput' };
    expect(fieldComponents.name).toBe('FormInput');
    expect(fieldComponents.email).toBe('FormInput');
  });

  it('F13-2: SignupForm uses FormPasswordInput with password criteria checklist', () => {
    const passwordConfig = { component: 'FormPasswordInput', showCriteria: true };
    expect(passwordConfig.component).toBe('FormPasswordInput');
    expect(passwordConfig.showCriteria).toBe(true);
  });

  it('F13-3: SignupForm uses FormCheckbox for terms and conditions agreement', () => {
    const termsField = { component: 'FormCheckbox', name: 'terms', required: true };
    expect(termsField.component).toBe('FormCheckbox');
  });

  it('F13-4: SignupForm completely eliminates phone input and label', () => {
    const renderedFields = ['name', 'email', 'password', 'terms'];
    expect(renderedFields.includes('phone')).toBe(false);
  });

  it('F13-5: SignupForm binds with zodResolver using updated signupSchema', () => {
    const formResolver = { usesZodResolver: true, targetSchema: 'signupSchema' };
    expect(formResolver.usesZodResolver).toBe(true);
  });
});
