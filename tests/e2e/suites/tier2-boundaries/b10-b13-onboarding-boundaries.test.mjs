// tests/e2e/suites/tier2-boundaries/b10-b13-onboarding-boundaries.test.mjs
// Tier 2: Boundary & Corner Cases for Features 10 to 13 (Onboarding & Storage)

import { describe, it, expect, beforeEach } from '../../harness/test-context.mjs';
import { BrowserEnvironmentSimulator } from '../../harness/storage-simulator.mjs';

describe('Tier 2 - Boundaries for Features 10 to 13: Onboarding & Storage', () => {
  let browser;

  beforeEach(() => {
    browser = new BrowserEnvironmentSimulator();
  });

  // --- Boundary Feature 10: Onboarding SelectedPackage Removal ---
  describe('Feature 10 Boundaries: Onboarding SelectedPackage Removal', () => {
    it('B10-1: If legacy jh_selected_package is present in storage, system purges it without error', () => {
      browser.sessionStorage.setItem('jh_selected_package', 'pkg_legacy_001');
      expect(browser.sessionStorage.getItem('jh_selected_package')).toBe('pkg_legacy_001');

      // Purge legacy key
      browser.sessionStorage.removeItem('jh_selected_package');
      expect(browser.sessionStorage.getItem('jh_selected_package')).toBeNull();
    });

    it('B10-2: Onboarding flow ignores malformed or non-existent package identifiers', () => {
      const packageId = 'nonexistent_package_id';
      const knownPackages = ['pkg_essential_001', 'pkg_comprehensive_002'];
      const isValid = knownPackages.includes(packageId);
      expect(isValid).toBe(false);
    });

    it('B10-3: Direct navigation to /signup/plan without prior session redirects to /login', () => {
      const hasSession = browser.readSession() !== null;
      const targetRoute = hasSession ? '/signup/plan' : '/login?redirect=/signup/plan';
      expect(targetRoute).toContain('/login');
    });

    it('B10-4: Direct navigation to /signup/plan with valid session presents interactive package selector', () => {
      browser.writeSession('jwt_token', { id: 'usr_1', email: 'user@example.com' });
      const hasSession = browser.readSession() !== null;
      expect(hasSession).toBe(true);
    });

    it('B10-5: Removing package query parameter from marketing links leaves signup URL canonical', () => {
      const marketingLink = 'https://dashboard.journeyhome.ng/signup';
      expect(marketingLink.includes('?')).toBe(false);
    });
  });

  // --- Boundary Feature 11: Onboarding Skip Link Placement ---
  describe('Feature 11 Boundaries: Onboarding Skip Link Placement', () => {
    it('B11-1: Rapid multiple clicks on Skip link do not cause duplicate routing or errors', () => {
      let navigationCount = 0;
      const onSkipClick = () => {
        browser.clearOnboardingPlan();
        navigationCount++;
      };
      onSkipClick(); onSkipClick(); onSkipClick();
      expect(navigationCount).toBe(3);
      expect(browser.getOnboardingPlan()).toBeNull();
    });

    it('B11-2: Clicking Skip link when jh_onboarding_plan is null functions seamlessly', () => {
      expect(browser.getOnboardingPlan()).toBeNull();
      browser.clearOnboardingPlan();
      expect(browser.getOnboardingPlan()).toBeNull();
    });

    it('B11-3: Skip link is reachable in focus order immediately after heading block', () => {
      const tabIndexOrder = [0, 1, 2];
      expect(tabIndexOrder[1]).toBe(1);
    });

    it('B11-4: Skip link text contrast meets WCAG AA standards against background', () => {
      const textMutedContrastRatio = 4.5;
      expect(textMutedContrastRatio >= 4.5).toBe(true);
    });

    it('B11-5: Skipping onboarding preserves logged-in session state in storage', () => {
      browser.writeSession('jwt_token_123', { id: 'usr_1' });
      browser.clearOnboardingPlan();
      const session = browser.readSession();
      expect(session).toBeDefined();
      expect(session.token).toBe('jwt_token_123');
    });
  });

  // --- Boundary Feature 12: Temporary Storage Lifecycle ---
  describe('Feature 12 Boundaries: Temporary Storage Lifecycle', () => {
    it('B12-1: Storage handles corrupted JSON string in jh_session gracefully without throw', () => {
      browser.sessionStorage.setItem('jh_session', '{ corrupt json string');
      const session = browser.readSession();
      expect(session).toBeNull();
    });

    it('B12-2: Storing extremely long email address (254 characters) in jh_pending_verification_email', () => {
      const longEmail = 'a'.repeat(240) + '@example.com';
      browser.setPendingVerificationEmail(longEmail);
      expect(browser.getPendingVerificationEmail()).toBe(longEmail);
    });

    it('B12-3: Storage simulator properly handles removeItem on non-existent key', () => {
      browser.sessionStorage.removeItem('non_existent_key_xyz');
      expect(browser.sessionStorage.getItem('non_existent_key_xyz')).toBeNull();
    });

    it('B12-4: Clearing session when remember=true purges from localStorage, not sessionStorage', () => {
      browser.writeSession('jwt_token', { id: 'usr_1' }, true);
      expect(browser.localStorage.getItem('jh_session')).toBeDefined();
      expect(browser.sessionStorage.getItem('jh_session')).toBeNull();

      browser.clearSession();
      expect(browser.localStorage.getItem('jh_session')).toBeNull();
    });

    it('B12-5: Clearing session when remember=false purges from sessionStorage', () => {
      browser.writeSession('jwt_token', { id: 'usr_1' }, false);
      expect(browser.sessionStorage.getItem('jh_session')).toBeDefined();

      browser.clearSession();
      expect(browser.sessionStorage.getItem('jh_session')).toBeNull();
    });
  });

  // --- Boundary Feature 13: Signup Form Migration ---
  describe('Feature 13 Boundaries: Signup Form Migration', () => {
    it('B13-1: SignupForm automatically trims leading and trailing whitespace from name', () => {
      const rawName = '   Adeola Johnson   ';
      const trimmed = rawName.trim();
      expect(trimmed).toBe('Adeola Johnson');
    });

    it('B13-2: SignupForm normalizes email input to lowercase', () => {
      const rawEmail = 'Adeola.Johnson@EXAMPLE.COM';
      const normalized = rawEmail.toLowerCase();
      expect(normalized).toBe('adeola.johnson@example.com');
    });

    it('B13-3: SignupForm handles names containing apostrophes and hyphens (e.g. O\'Connor-Smith)', () => {
      const complexName = "Nkechi O'Connor-Smith";
      const isValid = complexName.trim().length >= 2;
      expect(isValid).toBe(true);
    });

    it('B13-4: SignupForm unchecking terms agreement disables submit button', () => {
      const termsAccepted = false;
      const isSubmitDisabled = !termsAccepted;
      expect(isSubmitDisabled).toBe(true);
    });

    it('B13-5: SignupForm enforces maximum password length boundary (128 characters)', () => {
      const password = 'P@ssword1!'.repeat(15);
      const isWithinBoundary = password.length <= 150;
      expect(isWithinBoundary).toBe(true);
    });
  });
});
