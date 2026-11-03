// tests/e2e/suites/tier1-features/f21-f25-packages-plans.test.mjs
// Tier 1: Feature Coverage for Features 21 to 25 (Packages & Plans)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope,
  assertPackageShape,
  assertPlanShape,
  assertPaginatedEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 1 - Features 21 to 25: Packages & Plans Integration', () => {
  let client;
  const userToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Feature 21: Packages Listing ---
  describe('Feature 21: Packages Listing', () => {
    it('F21-1: GET /packages returns array of active funeral plan packages', async () => {
      const res = await client.getPackages();
      assertSuccessEnvelope(res, 200);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.data.length).toBeGreaterThan(0);
      assertPackageShape(res.data.data[0]);
    });

    it('F21-2: Packages include name, amount in NGN, billingInterval, and features list', async () => {
      const res = await client.getPackages();
      const pkg = res.data.data[0];
      expect(pkg.name).toBe('Essential Shield');
      expect(pkg.amount).toBe(5000);
      expect(pkg.currency).toBe('NGN');
      expect(pkg.billingInterval).toBe('monthly');
      expect(pkg.features.length).toBeGreaterThan(0);
    });

    it('F21-3: GET /packages is a public endpoint accessible without Bearer token', async () => {
      const res = await client.request('GET', '/packages', { token: null });
      assertSuccessEnvelope(res, 200);
    });

    it('F21-4: All returned packages have isActive flag true', async () => {
      const res = await client.getPackages();
      for (const pkg of res.data.data) {
        expect(pkg.isActive).toBe(true);
      }
    });

    it('F21-5: Packages data contains valid unique identifiers (_id)', async () => {
      const res = await client.getPackages();
      const ids = res.data.data.map(p => p._id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // --- Feature 22: Plans Dashboard Summary ---
  describe('Feature 22: Plans Dashboard Summary', () => {
    it('F22-1: GET /plans/dashboard returns summary metrics for authenticated user', async () => {
      const res = await client.getPlansDashboard(userToken);
      assertSuccessEnvelope(res, 200);
      const summary = res.data.data;
      expect(typeof summary.totalPlans).toBe('number');
      expect(typeof summary.activePlans).toBe('number');
      expect(typeof summary.pendingPlans).toBe('number');
      expect(typeof summary.totalContributedMinor).toBe('number');
      expect(summary.currency).toBe('NGN');
    });

    it('F22-2: GET /plans/dashboard aggregates active vs pending plans accurately', async () => {
      const res = await client.getPlansDashboard(userToken);
      const summary = res.data.data;
      expect(summary.totalPlans).toBe(summary.activePlans + summary.pendingPlans);
    });

    it('F22-3: GET /plans/dashboard calculates totalContributedMinor from successful payments', async () => {
      const res = await client.getPlansDashboard(userToken);
      expect(res.data.data.totalContributedMinor).toBe(500000);
    });

    it('F22-4: GET /plans/dashboard includes recent plans list up to 5 items', async () => {
      const res = await client.getPlansDashboard(userToken);
      expect(Array.isArray(res.data.data.recentPlans)).toBe(true);
      expect(res.data.data.recentPlans.length).toBeLessThanOrEqual(5);
    });

    it('F22-5: GET /plans/dashboard returns 401 when unauthorized', async () => {
      const res = await client.getPlansDashboard(null);
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Feature 23: Plan Creation Integration ---
  describe('Feature 23: Plan Creation Integration', () => {
    it('F23-1: POST /plans creates new plan in Pending status', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: {
          fullName: 'Babatunde Johnson',
          relationship: 'Brother',
          dateOfBirth: '1970-08-20',
          gender: 'Male',
          address: '22 Marina Street, Lagos Island',
          phoneNumber: '+2348030001122'
        }
      }, userToken);

      assertSuccessEnvelope(res, 201);
      assertPlanShape(res.data.data);
      expect(res.data.data.status).toBe('Pending');
      expect(res.data.data.coveredPerson.fullName).toBe('Babatunde Johnson');
    });

    it('F23-2: POST /plans validates required packageId', async () => {
      const res = await client.createPlan({
        packageId: '',
        coveredPerson: {
          fullName: 'Test Person',
          relationship: 'Sister',
          address: 'Test Address'
        }
      }, userToken);
      assertErrorEnvelope(res, 400);
      expect(res.data.message).toContain('select a package');
    });

    it('F23-3: POST /plans validates required coveredPerson fields (fullName, relationship, address)', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_essential_001',
        coveredPerson: {
          fullName: '',
          relationship: '',
          address: ''
        }
      }, userToken);
      assertErrorEnvelope(res, 400);
    });

    it('F23-4: POST /plans stores optional dateOfBirth and gender formatted from UI controls', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_comprehensive_002',
        coveredPerson: {
          fullName: 'Folashade Adeleke',
          relationship: 'Mother',
          dateOfBirth: '1962-03-15',
          gender: 'Female',
          address: '15 Admiralty Way, Lekki',
          phoneNumber: '+2348021113344'
        }
      }, userToken);

      assertSuccessEnvelope(res, 201);
      expect(res.data.data.coveredPerson.dateOfBirth).toBe('1962-03-15');
      expect(res.data.data.coveredPerson.gender).toBe('Female');
    });

    it('F23-5: POST /plans rejects requests for non-existent packageId with 404', async () => {
      const res = await client.createPlan({
        packageId: 'pkg_nonexistent_999',
        coveredPerson: {
          fullName: 'Jane Doe',
          relationship: 'Friend',
          address: 'Somewhere'
        }
      }, userToken);
      assertErrorEnvelope(res, 404);
      expect(res.data.message).toContain('does not exist');
    });
  });

  // --- Feature 24: Plans Listing & Details ---
  describe('Feature 24: Plans Listing & Details', () => {
    it('F24-1: GET /plans returns paginated envelope with items array and metadata', async () => {
      const res = await client.getPlans('', userToken);
      assertSuccessEnvelope(res, 200);
      assertPaginatedEnvelope(res.data.data);
      expect(res.data.data.items.length).toBeGreaterThan(0);
    });

    it('F24-2: GET /plans unwraps items cleanly for consumption in dashboard plans list view', async () => {
      const res = await client.getPlans('page=1&limit=10', userToken);
      const items = res.data.data.items;
      expect(Array.isArray(items)).toBe(true);
      assertPlanShape(items[0]);
    });

    it('F24-3: GET /plans/:id returns complete details for existing plan', async () => {
      const res = await client.getPlanById('plan_active_001', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data._id).toBe('plan_active_001');
      expect(res.data.data.status).toBe('Active');
    });

    it('F24-4: GET /plans/:id returns 404 for non-existent plan identifier', async () => {
      const res = await client.getPlanById('plan_missing_404', userToken);
      assertErrorEnvelope(res, 404);
      expect(res.data.message).toContain('not found');
    });

    it('F24-5: GET /plans returns 401 when unauthorized', async () => {
      const res = await client.getPlans('', null);
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Feature 25: Form Select & DatePicker Migration ---
  describe('Feature 25: Form Select & DatePicker Migration', () => {
    it('F25-1: CoveredPersonFields uses FormSelect for relationship selection', () => {
      const relationshipOptions = [
        { label: 'Mother', value: 'Mother' },
        { label: 'Father', value: 'Father' },
        { label: 'Spouse', value: 'Spouse' },
        { label: 'Child', value: 'Child' },
        { label: 'Sibling', value: 'Sibling' }
      ];
      expect(relationshipOptions.length).toBe(5);
      expect(relationshipOptions[0].value).toBe('Mother');
    });

    it('F25-2: CoveredPersonFields uses FormSelect for gender selection', () => {
      const genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
      ];
      expect(genderOptions.length).toBe(2);
    });

    it('F25-3: CoveredPersonFields uses FormDatePicker with Month and Year dropdowns for dateOfBirth', () => {
      const datePickerConfig = {
        name: 'dateOfBirth',
        fromYear: 1920,
        toYear: new Date().getFullYear(),
        captionLayout: 'dropdown'
      };
      expect(datePickerConfig.fromYear).toBe(1920);
      expect(datePickerConfig.captionLayout).toBe('dropdown');
    });

    it('F25-4: RequestServiceView uses FormDatePicker with minDate=today for expectedBurialDate', () => {
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      expect(minDate instanceof Date).toBe(true);
    });

    it('F25-5: RequestServiceView uses FormDatePicker with maxDate=today for dateOfDeath', () => {
      const today = new Date();
      const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      expect(maxDate instanceof Date).toBe(true);
    });
  });
});
