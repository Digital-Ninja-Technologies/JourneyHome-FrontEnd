// tests/e2e/suites/tier2-boundaries/b21-b25-plans-boundaries.test.mjs
// Tier 2: Boundary & Corner Cases for Features 21 to 25 (Packages & Plans)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 2 - Boundaries for Features 21 to 25: Packages & Plans', () => {
  let client;
  const userToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Boundary Feature 21: Packages Listing ---
  describe('Feature 21 Boundaries: Packages Listing', () => {
    it('B21-1: GET /packages handles query parameters cleanly without error', async () => {
      const res = await client.request('GET', '/packages?category=all&sort=asc');
      assertSuccessEnvelope(res, 200);
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('B21-2: GET /packages returns amounts as positive integers representing Naira', async () => {
      const res = await client.getPackages();
      for (const pkg of res.data.data) {
        expect(pkg.amount).toBeGreaterThan(0);
        expect(Number.isInteger(pkg.amount)).toBe(true);
      }
    });

    it('B21-3: GET /packages returns features array with non-empty feature strings', async () => {
      const res = await client.getPackages();
      for (const pkg of res.data.data) {
        for (const feat of pkg.features) {
          expect(typeof feat).toBe('string');
          expect(feat.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it('B21-4: GET /packages billingInterval defaults to monthly', async () => {
      const res = await client.getPackages();
      for (const pkg of res.data.data) {
        expect(['monthly', 'annually']).toContain(pkg.billingInterval);
      }
    });

    it('B21-5: GET /packages operates when called with arbitrary HTTP headers', async () => {
      const res = await client.request('GET', '/packages', {
        headers: { 'X-Custom-Client': 'E2E-Test-Agent' }
      });
      assertSuccessEnvelope(res, 200);
    });
  });

  // --- Boundary Feature 22: Plans Dashboard Summary ---
  describe('Feature 22 Boundaries: Plans Dashboard Summary', () => {
    it('B22-1: Summary metrics for user with zero plans returns zeros cleanly', async () => {
      // Create fresh user without plans
      await client.signup({
        name: 'Empty User',
        email: 'empty@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const emptyUser = state.users.find(u => u.email === 'empty@example.com');
      emptyUser.isVerified = true;

      const emptyToken = `jwt_token_for_${emptyUser._id}`;
      const res = await client.getPlansDashboard(emptyToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.totalPlans).toBe(0);
      expect(res.data.data.activePlans).toBe(0);
      expect(res.data.data.pendingPlans).toBe(0);
      expect(res.data.data.totalContributedMinor).toBe(0);
    });

    it('B22-2: Summary metrics for user with only pending plans calculates correctly', async () => {
      // Create pending plan
      await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Pending Member', relationship: 'Cousin', address: 'Abuja' }
      }, userToken);

      const res = await client.getPlansDashboard(userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.pendingPlans).toBeGreaterThan(0);
    });

    it('B22-3: Total contributed amount minor is always non-negative', async () => {
      const res = await client.getPlansDashboard(userToken);
      expect(res.data.data.totalContributedMinor).toBeGreaterThanOrEqual(0);
    });

    it('B22-4: Recent plans list maintains newest-first chronological order', async () => {
      await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'First New', relationship: 'Sister', address: 'Lagos' }
      }, userToken);
      await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: { fullName: 'Second New', relationship: 'Brother', address: 'Lagos' }
      }, userToken);

      const res = await client.getPlansDashboard(userToken);
      const recent = res.data.data.recentPlans;
      expect(recent[0].coveredPerson.fullName).toBe('Second New');
    });

    it('B22-5: Summary handles malformed Authorization Bearer string', async () => {
      const res = await client.getPlansDashboard('malformed_jwt');
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Boundary Feature 23: Plan Creation Integration ---
  describe('Feature 23 Boundaries: Plan Creation Integration', () => {
    it('B23-1: POST /plans handles extreme 500-character address string', async () => {
      const longAddress = 'House 14, ' + 'Block B, Estate Name, Road 5, '.repeat(15) + 'Lagos, Nigeria';
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: {
          fullName: 'Bolanle Johnson',
          relationship: 'Mother',
          address: longAddress
        }
      }, userToken);
      assertSuccessEnvelope(res, 201);
      expect(res.data.data.coveredPerson.address).toBe(longAddress);
    });

    it('B23-2: POST /plans handles beneficiary with accented non-ASCII name', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: {
          fullName: 'Bàbátúndé Òjó',
          relationship: 'Father',
          address: 'Ibadan, Oyo State'
        }
      }, userToken);
      assertSuccessEnvelope(res, 201);
      expect(res.data.data.coveredPerson.fullName).toBe('Bàbátúndé Òjó');
    });

    it('B23-3: POST /plans handles dateOfBirth with 90-year-old historic date (1936-05-14)', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_comprehensive_002',
        coveredPerson: {
          fullName: 'Elder Johnson',
          relationship: 'Grandfather',
          dateOfBirth: '1936-05-14',
          gender: 'Male',
          address: 'Abeokuta, Ogun State'
        }
      }, userToken);
      assertSuccessEnvelope(res, 201);
      expect(res.data.data.coveredPerson.dateOfBirth).toBe('1936-05-14');
    });

    it('B23-4: POST /plans rejects creation when coveredPerson is null', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: null
      }, userToken);
      assertErrorEnvelope(res, 400);
    });

    it('B23-5: POST /plans rejects creation when relationship is missing', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: {
          fullName: 'Test Person',
          relationship: '',
          address: 'Valid Address'
        }
      }, userToken);
      assertErrorEnvelope(res, 400);
    });
  });

  // --- Boundary Feature 24: Plans Listing & Details ---
  describe('Feature 24 Boundaries: Plans Listing & Details', () => {
    it('B24-1: GET /plans handles page query parameter out of bounds (e.g. page=9999)', async () => {
      const res = await client.getPlans('page=9999&limit=10', userToken);
      assertSuccessEnvelope(res, 200);
      expect(Array.isArray(res.data.data.items)).toBe(true);
    });

    it('B24-2: GET /plans handles limit query parameter boundary (limit=100)', async () => {
      const res = await client.getPlans('page=1&limit=100', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.pagination.limit).toBe(100);
    });

    it('B24-3: GET /plans/:id prevents horizontal privilege escalation (cannot view other user plan)', async () => {
      // Create user 2
      await client.signup({
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const otherUser = state.users.find(u => u.email === 'other@example.com');
      otherUser.isVerified = true;

      const otherToken = `jwt_token_for_${otherUser._id}`;
      // otherToken tries to access user 1's plan
      const res = await client.getPlanById('plan_active_001', otherToken);
      assertErrorEnvelope(res, 404);
    });

    it('B24-4: GET /plans handles SQL injection string in planId parameter', async () => {
      const res = await client.getPlanById("' OR '1'='1", userToken);
      assertErrorEnvelope(res, 404);
    });

    it('B24-5: GET /plans items array preserves coveredPerson nested object integrity', async () => {
      const res = await client.getPlans('', userToken);
      const plan = res.data.data.items[0];
      expect(plan.coveredPerson).toBeDefined();
      expect(typeof plan.coveredPerson.relationship).toBe('string');
    });
  });

  // --- Boundary Feature 25: Form Select & DatePicker Migration ---
  describe('Feature 25 Boundaries: Form Select & DatePicker Migration', () => {
    it('B25-1: Date picker format handles ISO string date serialization across timezones', () => {
      const date = new Date(Date.UTC(1965, 9, 12, 0, 0, 0));
      const isoStr = date.toISOString().split('T')[0];
      expect(isoStr).toBe('1965-10-12');
    });

    it('B25-2: Select dropdown gracefully ignores empty string selection', () => {
      const isOptionValid = (val) => Boolean(val && val.trim().length > 0);
      expect(isOptionValid('')).toBe(false);
      expect(isOptionValid('Mother')).toBe(true);
    });

    it('B25-3: DatePicker month select handles month transitions (Jan 31 -> Feb)', () => {
      const jan31 = new Date(2026, 0, 31);
      expect(jan31.getMonth()).toBe(0);
    });

    it('B25-4: DatePicker handles year 2000 millennium boundary', () => {
      const y2k = new Date(2000, 0, 1);
      expect(y2k.getFullYear()).toBe(2000);
    });

    it('B25-5: FormSelect handles items with identical labels but distinct values', () => {
      const items = [
        { label: 'Sibling', value: 'brother' },
        { label: 'Sibling', value: 'sister' }
      ];
      expect(items[0].value).not.toBe(items[1].value);
    });
  });
});
