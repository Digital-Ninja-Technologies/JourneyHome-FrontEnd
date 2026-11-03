# E2E Test Infra: Journey Home Production Refactoring

## Test Philosophy
- Opaque-box, requirement-driven. Derived from `ORIGINAL_REQUEST.md` and user-facing contracts, NOT from internal implementation details.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Progressive testability: verification mechanisms do not rely on features more complex than what is being tested.

## Feature Inventory & Test Mapping
Mapped against the 34 features from `PROJECT.md`:
| # | Feature | Requirement Source | Tier 1 (>=5) | Tier 2 (>=5) | Tier 3 (Pairwise) |
|---|---------|-------------------|:------------:|:------------:|:-----------------:|
| 1 | UI Primitive Addition | R1 | 5 | 5 | ✓ |
| 2 | Pure Base-UI Select | R1 | 5 | 5 | ✓ |
| 3 | Popover Calendar DatePicker | R1 | 5 | 5 | ✓ |
| 4 | Password Input Component | R1 | 5 | 5 | ✓ |
| 5 | Shared Form Field Library | R1 | 5 | 5 | ✓ |
| 6 | Schemas Phone Removal | R2 | 5 | 5 | ✓ |
| 7 | Schemas SelectedPackage Removal | R2 | 5 | 5 | ✓ |
| 8 | New Schemas Alignment | R2, R3 | 5 | 5 | ✓ |
| 9 | Schemas Unit Tests | R4 | 5 | 5 | ✓ |
| 10 | Onboarding SelectedPackage Removal | R2 | 5 | 5 | ✓ |
| 11 | Onboarding Skip Link Placement | R2 | 5 | 5 | ✓ |
| 12 | Temporary Storage Lifecycle | R2 | 5 | 5 | ✓ |
| 13 | Signup Form Migration | R1, R2 | 5 | 5 | ✓ |
| 14 | Auth Tokenless Signup Integration | R3 | 5 | 5 | ✓ |
| 15 | Auth Login & Unverified Interception | R3 | 5 | 5 | ✓ |
| 16 | Auth Email Verification Route | R3 | 5 | 5 | ✓ |
| 17 | Auth Resend Verification | R3 | 5 | 5 | ✓ |
| 18 | Auth Forgot & Reset Password | R3 | 5 | 5 | ✓ |
| 19 | Auth Profile & Preferences | R3 | 5 | 5 | ✓ |
| 20 | Auth Account Deletion | R3 | 5 | 5 | ✓ |
| 21 | Packages Listing | R3 | 5 | 5 | ✓ |
| 22 | Plans Dashboard Summary | R3 | 5 | 5 | ✓ |
| 23 | Plan Creation Integration | R1, R3 | 5 | 5 | ✓ |
| 24 | Plans Listing & Details | R3 | 5 | 5 | ✓ |
| 25 | Form Select & DatePicker Migration | R1 | 5 | 5 | ✓ |
| 26 | Payments Initialization & Verify | R3 | 5 | 5 | ✓ |
| 27 | Payments Listing & Detail | R3 | 5 | 5 | ✓ |
| 28 | Subscriptions Listing & Detail | R3 | 5 | 5 | ✓ |
| 29 | Notifications Listing & Counts | R3 | 5 | 5 | ✓ |
| 30 | Notification Read & Delete | R3 | 5 | 5 | ✓ |
| 31 | Notifications UI Integration | R3 | 5 | 5 | ✓ |
| 32 | E2E Test Suite Tiers 1-4 Pass | R4 | 5 | 5 | ✓ |
| 33 | Adversarial Coverage Hardening | R4 | 5 | 5 | ✓ |
| 34 | Monorepo Verification & Biome | R4 | 5 | 5 | ✓ |

## Test Architecture
- **Location:** `tests/e2e/` (runner, suites, mocks, and test utilities)
- **Runner:** Vitest / Playwright test harness invoked via `pnpm test:e2e` or `node tests/e2e/runner.mjs`
- **Output:** Structured test reports with 0 exit code on pass, non-zero on failure.
- **Signals:** Generates `TEST_READY.md` upon completion of test suite authoring.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full New Customer Onboarding Journey | Signup (no token) -> Verify Email via token -> Login -> Skip Onboarding -> View Empty Dashboard | High |
| 2 | Plan Setup & Payment Flow | Login -> Pick Package -> Fill Covered Person with Popover DatePicker -> Initialize Payment -> Verify Callback -> Dashboard Summary Update | High |
| 3 | Profile Management & Notification Cycle | Change Password -> Toggle Preferences -> Receive Deficit Notification -> Mark Read -> Delete Notification | Medium |
| 4 | Account Closure Flow | Login -> Navigate to Profile -> Enter current password -> Delete Account -> Verify Session Cleared & Login Blocked | Medium |
| 5 | Invalid Token & Error Recovery | Expired Email Verification Token -> Trigger Resend -> Verify with New Token -> Recovery Flow | High |

## Coverage Thresholds
- Tier 1: >= 5 tests per feature (34 × 5 = 170 tests)
- Tier 2: >= 5 boundary/edge tests per feature (34 × 5 = 170 tests)
- Tier 3: Pairwise combinations across auth, plans, payments, notifications (>= 34 tests)
- Tier 4: >= 5 realistic application end-to-end scenarios
- Minimum Target: >= 380 test cases
