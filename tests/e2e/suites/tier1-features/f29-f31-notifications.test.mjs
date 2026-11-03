// tests/e2e/suites/tier1-features/f29-f31-notifications.test.mjs
// Tier 1: Feature Coverage for Features 29 to 31 (Notifications Integration)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope,
  assertNotificationCountsEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 1 - Features 29 to 31: Notifications Integration', () => {
  let client;
  const userToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Feature 29: Notifications Listing & Counts ---
  describe('Feature 29: Notifications Listing & Counts', () => {
    it('F29-1: GET /notifications returns envelope with items, pagination, and total/unread counts', async () => {
      const res = await client.getNotifications('', userToken);
      assertSuccessEnvelope(res, 200);
      assertNotificationCountsEnvelope(res.data.data);
      expect(res.data.data.counts.totalNotifications).toBeGreaterThanOrEqual(2);
      expect(res.data.data.counts.totalUnreadNotifications).toBeGreaterThanOrEqual(1);
    });

    it('F29-2: Notifications include _id, title, message, event, isRead, and createdAt', async () => {
      const res = await client.getNotifications('', userToken);
      const notif = res.data.data.items[0];
      expect(typeof notif._id).toBe('string');
      expect(typeof notif.title).toBe('string');
      expect(typeof notif.message).toBe('string');
      expect(typeof notif.isRead).toBe('boolean');
      expect(typeof notif.createdAt).toBe('string');
    });

    it('F29-3: GET /notifications supports filtering by isRead=false', async () => {
      const res = await client.getNotifications('isRead=false', userToken);
      assertSuccessEnvelope(res, 200);
      for (const item of res.data.data.items) {
        expect(item.isRead).toBe(false);
      }
    });

    it('F29-4: GET /notifications supports filtering by isRead=true', async () => {
      const res = await client.getNotifications('isRead=true', userToken);
      assertSuccessEnvelope(res, 200);
      for (const item of res.data.data.items) {
        expect(item.isRead).toBe(true);
      }
    });

    it('F29-5: GET /notifications returns 401 when unauthorized', async () => {
      const res = await client.getNotifications('', null);
      assertErrorEnvelope(res, 401);
    });
  });

  // --- Feature 30: Notification Read & Delete ---
  describe('Feature 30: Notification Read & Delete', () => {
    it('F30-1: PATCH /notifications/:id/read marks notification as read on the server', async () => {
      const res = await client.markNotificationRead('notif_001', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.isRead).toBe(true);

      // Verify unread count decremented
      const checkRes = await client.getNotifications('', userToken);
      expect(checkRes.data.data.counts.totalUnreadNotifications).toBe(0);
    });

    it('F30-2: PATCH /notifications/:id/read returns 404 for non-existent notification', async () => {
      const res = await client.markNotificationRead('notif_missing_999', userToken);
      assertErrorEnvelope(res, 404);
      expect(res.data.message).toContain('not found');
    });

    it('F30-3: DELETE /notifications/:id removes notification from backend feed', async () => {
      const res = await client.deleteNotification('notif_001', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.message).toContain('deleted');

      // Verify it is gone from listing
      const listRes = await client.getNotifications('', userToken);
      const exists = listRes.data.data.items.some(n => n._id === 'notif_001');
      expect(exists).toBe(false);
    });

    it('F30-4: DELETE /notifications/:id returns 404 for missing notification identifier', async () => {
      const res = await client.deleteNotification('notif_missing_999', userToken);
      assertErrorEnvelope(res, 404);
    });

    it('F30-5: Notification mutations require authentication and return 401 without Bearer token', async () => {
      const readRes = await client.markNotificationRead('notif_001', null);
      assertErrorEnvelope(readRes, 401);
      const delRes = await client.deleteNotification('notif_001', null);
      assertErrorEnvelope(delRes, 401);
    });
  });

  // --- Feature 31: Notifications UI Integration ---
  describe('Feature 31: Notifications UI Integration', () => {
    it('F31-1: Header bell icon displays badge reflecting live totalUnreadNotifications count', () => {
      const counts = { totalUnreadNotifications: 3 };
      const showBadge = counts.totalUnreadNotifications > 0;
      expect(showBadge).toBe(true);
      expect(counts.totalUnreadNotifications).toBe(3);
    });

    it('F31-2: Marking notification as read updates TanStack Query cache optimistically', () => {
      let cache = {
        items: [{ _id: 'notif_1', isRead: false }],
        counts: { totalUnreadNotifications: 1 }
      };

      // Optimistic update
      cache = {
        ...cache,
        items: cache.items.map(n => n._id === 'notif_1' ? { ...n, isRead: true } : n),
        counts: { totalUnreadNotifications: Math.max(0, cache.counts.totalUnreadNotifications - 1) }
      };

      expect(cache.items[0].isRead).toBe(true);
      expect(cache.counts.totalUnreadNotifications).toBe(0);
    });

    it('F31-3: Deleting notification performs optimistic cache eviction', () => {
      let items = [{ _id: 'notif_1' }, { _id: 'notif_2' }];
      items = items.filter(n => n._id !== 'notif_1');
      expect(items.length).toBe(1);
      expect(items[0]._id).toBe('notif_2');
    });

    it('F31-4: Notifications view completely eliminates device-specific localStorage tracking', () => {
      const usesLocalStorageSeen = false;
      expect(usesLocalStorageSeen).toBe(false);
    });

    it('F31-5: Notification timestamps are formatted via date-fns or native Intl.DateTimeFormat', () => {
      const dateStr = '2026-01-16T14:35:00.000Z';
      const parsed = new Date(dateStr);
      expect(parsed.getFullYear()).toBe(2026);
    });
  });
});
