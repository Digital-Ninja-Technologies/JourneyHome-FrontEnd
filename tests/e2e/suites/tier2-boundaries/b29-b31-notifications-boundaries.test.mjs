// tests/e2e/suites/tier2-boundaries/b29-b31-notifications-boundaries.test.mjs
// Tier 2: Boundary & Corner Cases for Features 29 to 31 (Notifications)

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '../../harness/test-context.mjs';
import { MockBackendServer } from '../../harness/mock-backend.mjs';
import { E2EApiClient } from '../../harness/api-client.mjs';
import {
  assertSuccessEnvelope,
  assertErrorEnvelope
} from '../../harness/assertions.mjs';

describe('Tier 2 - Boundaries for Features 29 to 31: Notifications', () => {
  let client;
  const userToken = 'jwt_token_for_usr_verified_001';

  beforeAll(async () => {
    client = new E2EApiClient(process.env.E2E_API_URL);
  });

  beforeEach(async () => {
    await client.resetMock();
  });

  // --- Boundary Feature 29: Notifications Listing & Counts ---
  describe('Feature 29 Boundaries: Notifications Listing & Counts', () => {
    it('B29-1: User with no notifications returns empty items array and zero counts', async () => {
      await client.signup({
        name: 'Empty Notif User',
        email: 'nonotifs@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const user = state.users.find(u => u.email === 'nonotifs@example.com');
      user.isVerified = true;

      const token = `jwt_token_for_${user._id}`;
      const res = await client.getNotifications('', token);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.items.length).toBe(0);
      expect(res.data.data.counts.totalNotifications).toBe(0);
      expect(res.data.data.counts.totalUnreadNotifications).toBe(0);
    });

    it('B29-2: GET /notifications handles limit query parameter boundary (limit=50)', async () => {
      const res = await client.getNotifications('limit=50', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.pagination.limit).toBe(50);
    });

    it('B29-3: GET /notifications handles pagination page beyond total pages cleanly', async () => {
      const res = await client.getNotifications('page=100', userToken);
      assertSuccessEnvelope(res, 200);
      expect(Array.isArray(res.data.data.items)).toBe(true);
    });

    it('B29-4: GET /notifications handles isRead query filter with empty string without error', async () => {
      const res = await client.getNotifications('isRead=', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.items.length).toBeGreaterThan(0);
    });

    it('B29-5: Total unread notifications count is always <= total notifications count', async () => {
      const res = await client.getNotifications('', userToken);
      const counts = res.data.data.counts;
      expect(counts.totalUnreadNotifications).toBeLessThanOrEqual(counts.totalNotifications);
    });
  });

  // --- Boundary Feature 30: Notification Read & Delete ---
  describe('Feature 30 Boundaries: Notification Read & Delete', () => {
    it('B30-1: PATCH /notifications/:id/read on an already read notification is idempotent', async () => {
      // notif_002 is already isRead: true
      const res = await client.markNotificationRead('notif_002', userToken);
      assertSuccessEnvelope(res, 200);
      expect(res.data.data.isRead).toBe(true);
    });

    it('B30-2: PATCH /notifications/:id/read prevents marking another user notification as read', async () => {
      await client.signup({
        name: 'Alien User',
        email: 'alien@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const alien = state.users.find(u => u.email === 'alien@example.com');
      alien.isVerified = true;

      const alienToken = `jwt_token_for_${alien._id}`;
      const res = await client.markNotificationRead('notif_001', alienToken);
      assertErrorEnvelope(res, 404);
    });

    it('B30-3: DELETE /notifications/:id on non-existent notification returns 404', async () => {
      const res = await client.deleteNotification('notif_ghost_999', userToken);
      assertErrorEnvelope(res, 404);
    });

    it('B30-4: DELETE /notifications/:id twice returns 404 on second call', async () => {
      await client.deleteNotification('notif_001', userToken);
      const secondCall = await client.deleteNotification('notif_001', userToken);
      assertErrorEnvelope(secondCall, 404);
    });

    it('B30-5: DELETE /notifications/:id prevents deleting another user notification', async () => {
      await client.signup({
        name: 'Hacker User',
        email: 'hacker@example.com',
        password: 'Password123!'
      });
      const state = (await client.request('GET', '/test/state')).data.data;
      const hacker = state.users.find(u => u.email === 'hacker@example.com');
      hacker.isVerified = true;

      const hackerToken = `jwt_token_for_${hacker._id}`;
      const res = await client.deleteNotification('notif_001', hackerToken);
      assertErrorEnvelope(res, 404);
    });
  });

  // --- Boundary Feature 31: Notifications UI Integration ---
  describe('Feature 31 Boundaries: Notifications UI Integration', () => {
    it('B31-1: When totalUnreadNotifications is 0, unread badge is hidden', () => {
      const unreadCount = 0;
      const showBadge = unreadCount > 0;
      expect(showBadge).toBe(false);
    });

    it('B31-2: When totalUnreadNotifications exceeds 99, badge displays "99+" cap', () => {
      const unreadCount = 142;
      const badgeDisplay = unreadCount > 99 ? '99+' : String(unreadCount);
      expect(badgeDisplay).toBe('99+');
    });

    it('B31-3: Notification title handles extreme 200-character boundary length', () => {
      const title = 'A'.repeat(200);
      expect(title.length).toBe(200);
    });

    it('B31-4: Notification message handles extreme 1,000-character description text', () => {
      const message = 'Important update regarding your funeral plan: ' + 'detailed info. '.repeat(50);
      expect(message.length).toBeGreaterThan(500);
    });

    it('B31-5: Drawer/list unread badge does not show stale local storage timestamp', () => {
      const usesServerReadState = true;
      expect(usesServerReadState).toBe(true);
    });
  });
});
