// tests/e2e/harness/assertions.mjs
// Custom assertion helpers for live backend API contracts, envelopes, and schema shapes.

import { expect } from './test-context.mjs';

export function assertSuccessEnvelope(response, expectedStatus = 200) {
  expect(response.status).toBe(expectedStatus);
  expect(response.data).toBeDefined();
  expect(response.data.success).toBe(true);
}

export function assertErrorEnvelope(response, expectedStatus = 400) {
  expect(response.status).toBe(expectedStatus);
  expect(response.data).toBeDefined();
  expect(response.data.success).toBe(false);
  expect(typeof response.data.message).toBe('string');
}

export function assertPaginatedEnvelope(data) {
  expect(data).toBeDefined();
  expect(Array.isArray(data.items)).toBe(true);
  expect(data.pagination).toBeDefined();
  expect(typeof data.pagination.total).toBe('number');
  expect(typeof data.pagination.page).toBe('number');
  expect(typeof data.pagination.limit).toBe('number');
  expect(typeof data.pagination.totalPages).toBe('number');
}

export function assertNotificationCountsEnvelope(data) {
  assertPaginatedEnvelope(data);
  expect(data.counts).toBeDefined();
  expect(typeof data.counts.totalNotifications).toBe('number');
  expect(typeof data.counts.totalUnreadNotifications).toBe('number');
}

export function assertUserSessionShape(user) {
  expect(user).toBeDefined();
  expect(typeof user.id || typeof user._id).toBe('string');
  expect(typeof user.name).toBe('string');
  expect(typeof user.email).toBe('string');
  expect(typeof user.role).toBe('string');
  // phone MUST NOT be present
  expect(user.phone).toBeUndefined();
}

export function assertPlanShape(plan) {
  expect(plan).toBeDefined();
  expect(typeof plan._id).toBe('string');
  expect(typeof plan.packageId || typeof plan.package).toBe('string');
  expect(typeof plan.status).toBe('string');
  expect(plan.coveredPerson).toBeDefined();
  expect(typeof plan.coveredPerson.fullName).toBe('string');
  expect(typeof plan.coveredPerson.relationship).toBe('string');
  expect(typeof plan.coveredPerson.address).toBe('string');
}

export function assertPackageShape(pkg) {
  expect(pkg).toBeDefined();
  expect(typeof pkg._id).toBe('string');
  expect(typeof pkg.name).toBe('string');
  expect(typeof pkg.amount).toBe('number');
  expect(typeof pkg.currency).toBe('string');
  expect(Array.isArray(pkg.features)).toBe(true);
}
