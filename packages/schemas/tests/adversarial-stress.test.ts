import { describe, expect, it } from "vitest";
import {
  UserRoleEnum,
  sessionUserSchema,
  signupSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  deleteAccountSchema,
  resetPasswordSchema,
  loginSchema,
  adminLoginSchema,
  verifyCodeSchema,
  redirectSearchSchema,
  verifyEmailSearchSchema,
  sanitizeRedirect,
  customerMeSchema,
  updateProfileSchema,
  customerPreferencesSchema,
  paginatedNotificationsSchema,
  appNotificationSchema,
  planSchema,
  createPlanSchema,
  coveredPersonSchema,
} from "../src";

describe("Adversarial Stress Test Suite: @journeyhome/schemas", () => {
  describe("1. auth.ts Schemas", () => {
    describe("sessionUserSchema", () => {
      it("accepts valid session users across all user roles", () => {
        const roles = ["customer", "covered_person", "admin", "super_admin"] as const;
        for (const role of roles) {
          const res = sessionUserSchema.safeParse({
            id: `usr_${role}_001`,
            email: `${role}@example.com`,
            name: `User ${role}`,
            role,
            isSuperAdmin: role === "super_admin",
          });
          expect(res.success).toBe(true);
        }
      });

      it("rejects missing required fields individually", () => {
        const base = {
          id: "usr_123",
          email: "user@example.com",
          name: "Adaeze",
          role: "customer",
          isSuperAdmin: false,
        };

        const keys = ["id", "email", "name", "role", "isSuperAdmin"] as const;
        for (const key of keys) {
          const copy: Record<string, unknown> = { ...base };
          delete copy[key];
          const res = sessionUserSchema.safeParse(copy);
          expect(res.success, `Should reject when '${key}' is missing`).toBe(false);
        }
      });

      it("rejects invalid role in session user", () => {
        const invalidRoles = ["guest", "user", "root", "CUSTOMER", "coveredPerson", "", null, 123];
        for (const badRole of invalidRoles) {
          const res = sessionUserSchema.safeParse({
            id: "usr_123",
            email: "user@example.com",
            name: "Adaeze",
            role: badRole,
            isSuperAdmin: false,
          });
          expect(res.success, `Should reject invalid role: ${String(badRole)}`).toBe(false);
        }
      });

      it("rejects invalid email formats", () => {
        const invalidEmails = [
          "not-an-email",
          "@missing-user.com",
          "missing-domain@",
          "spaces in@email.com",
          "missing-dot@domain",
          "",
        ];
        for (const badEmail of invalidEmails) {
          const res = sessionUserSchema.safeParse({
            id: "usr_123",
            email: badEmail,
            name: "Adaeze",
            role: "customer",
            isSuperAdmin: false,
          });
          expect(res.success, `Should reject bad email: ${badEmail}`).toBe(false);
        }
      });

      it("rejects empty name", () => {
        const res = sessionUserSchema.safeParse({
          id: "usr_123",
          email: "user@example.com",
          name: "",
          role: "customer",
          isSuperAdmin: false,
        });
        expect(res.success).toBe(false);
      });

      it("rejects non-boolean isSuperAdmin", () => {
        const nonBooleans = ["true", "false", 1, 0, null, undefined, {}, []];
        for (const val of nonBooleans) {
          const res = sessionUserSchema.safeParse({
            id: "usr_123",
            email: "user@example.com",
            name: "Adaeze",
            role: "customer",
            isSuperAdmin: val,
          });
          expect(res.success, `Should reject isSuperAdmin: ${String(val)}`).toBe(false);
        }
      });

      it("strips phone from parsed sessionUser if injected in payload", () => {
        const payloadWithPhone = {
          id: "usr_123",
          email: "user@example.com",
          name: "Adaeze",
          role: "customer",
          isSuperAdmin: false,
          phone: "+2348012345678",
        };
        const res = sessionUserSchema.safeParse(payloadWithPhone);
        expect(res.success).toBe(true);
        if (res.success) {
          expect("phone" in res.data).toBe(false);
        }
      });
    });

    describe("signupSchema", () => {
      it("accepts valid signup with customer and covered_person", () => {
        const r1 = signupSchema.safeParse({
          name: "Adaeze Okafor",
          email: "adaeze@example.com",
          password: "password123",
          role: "customer",
        });
        expect(r1.success).toBe(true);

        const r2 = signupSchema.safeParse({
          name: "Emeka Okafor",
          email: "emeka@example.com",
          password: "password123",
          role: "covered_person",
        });
        expect(r2.success).toBe(true);
      });

      it("defaults role to customer when omitted", () => {
        const res = signupSchema.safeParse({
          name: "Adaeze Okafor",
          email: "adaeze@example.com",
          password: "password123",
        });
        expect(res.success).toBe(true);
        if (res.success) {
          expect(res.data.role).toBe("customer");
        }
      });

      it("rejects privilege escalation roles (admin, super_admin, root)", () => {
        const forbiddenRoles = ["admin", "super_admin", "root", "manager", "support"];
        for (const badRole of forbiddenRoles) {
          const res = signupSchema.safeParse({
            name: "Attacker",
            email: "attacker@example.com",
            password: "password123",
            role: badRole,
          });
          expect(res.success, `Should reject role escalation to ${badRole}`).toBe(false);
        }
      });

      it("trims name and email whitespace", () => {
        const res = signupSchema.safeParse({
          name: "   Adaeze Okafor   ",
          email: "   adaeze@example.com   ",
          password: "password123",
        });
        expect(res.success).toBe(true);
        if (res.success) {
          expect(res.data.name).toBe("Adaeze Okafor");
          expect(res.data.email).toBe("adaeze@example.com");
        }
      });

      it("rejects whitespace-only name that collapses to empty or <2 chars", () => {
        const whitespaceNames = ["", " ", "  ", "\t", "\n\n", " A "];
        for (const badName of whitespaceNames) {
          const res = signupSchema.safeParse({
            name: badName,
            email: "adaeze@example.com",
            password: "password123",
          });
          expect(res.success, `Should reject whitespace name: '${badName}'`).toBe(false);
        }
      });

      it("enforces password minimum length of 6 characters", () => {
        // 5 characters -> FAIL
        expect(
          signupSchema.safeParse({
            name: "Adaeze",
            email: "adaeze@example.com",
            password: "12345",
          }).success,
        ).toBe(false);

        // 6 characters -> PASS
        expect(
          signupSchema.safeParse({
            name: "Adaeze",
            email: "adaeze@example.com",
            password: "123456",
          }).success,
        ).toBe(true);
      });

      it("strips phone and SelectedPackage from signup output if provided", () => {
        const res = signupSchema.safeParse({
          name: "Adaeze",
          email: "adaeze@example.com",
          password: "password123",
          phone: "+2348012345678",
          SelectedPackage: "pkg_123",
          selectedPackage: "pkg_123",
        });
        expect(res.success).toBe(true);
        if (res.success) {
          expect("phone" in res.data).toBe(false);
          expect("SelectedPackage" in res.data).toBe(false);
          expect("selectedPackage" in res.data).toBe(false);
        }
      });

      it("handles injection strings in name/password without crashing", () => {
        const injections = [
          "<script>alert('xss')</script>",
          "'; DROP TABLE users; --",
          "' OR '1'='1",
          '{"$gt": ""}',
          "undefined",
          "null",
          "../etc/passwd",
          "\x00\x01\x02",
        ];

        for (const inj of injections) {
          const res = signupSchema.safeParse({
            name: inj,
            email: "clean@example.com",
            password: "ValidPassword123!",
          });
          // As long as min(2) holds, it is parsed safely as a string
          if (inj.trim().length >= 2) {
            expect(res.success).toBe(true);
          } else {
            expect(res.success).toBe(false);
          }
        }
      });

      it("handles extreme string lengths", () => {
        const hugeName = "A".repeat(50000);
        const hugePass = "P".repeat(50000);
        const res = signupSchema.safeParse({
          name: hugeName,
          email: "normal@example.com",
          password: hugePass,
        });
        expect(res.success).toBe(true);
      });
    });

    describe("verifyEmailSchema", () => {
      it("accepts non-empty token string", () => {
        expect(verifyEmailSchema.safeParse({ token: "tok_verify_abc123" }).success).toBe(true);
        expect(verifyEmailSchema.safeParse({ token: "jwt.token.string" }).success).toBe(true);
      });

      it("rejects empty token, missing token, or non-string", () => {
        expect(verifyEmailSchema.safeParse({ token: "" }).success).toBe(false);
        expect(verifyEmailSchema.safeParse({}).success).toBe(false);
        expect(verifyEmailSchema.safeParse({ token: null }).success).toBe(false);
        expect(verifyEmailSchema.safeParse({ token: 12345 }).success).toBe(false);
        expect(verifyEmailSchema.safeParse({ token: true }).success).toBe(false);
        expect(verifyEmailSchema.safeParse({ token: ["token"] }).success).toBe(false);
      });
    });

    describe("resendVerificationSchema", () => {
      it("accepts valid email and trims whitespace", () => {
        const res = resendVerificationSchema.safeParse({
          email: "  user@example.com  ",
        });
        expect(res.success).toBe(true);
        if (res.success) {
          expect(res.data.email).toBe("user@example.com");
        }
      });

      it("rejects missing, empty, or invalid email", () => {
        expect(resendVerificationSchema.safeParse({}).success).toBe(false);
        expect(resendVerificationSchema.safeParse({ email: "" }).success).toBe(false);
        expect(resendVerificationSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
        expect(resendVerificationSchema.safeParse({ email: null }).success).toBe(false);
      });
    });

    describe("deleteAccountSchema", () => {
      it("accepts non-empty password", () => {
        expect(deleteAccountSchema.safeParse({ password: "myPassword123" }).success).toBe(true);
      });

      it("rejects empty or missing password", () => {
        expect(deleteAccountSchema.safeParse({ password: "" }).success).toBe(false);
        expect(deleteAccountSchema.safeParse({}).success).toBe(false);
        expect(deleteAccountSchema.safeParse({ password: null }).success).toBe(false);
      });
    });

    describe("resetPasswordSchema (newPassword contract)", () => {
      it("strictly validates newPassword and rejects legacy password field", () => {
        // Correct new contract
        const valid = resetPasswordSchema.safeParse({
          token: "tok_reset_123",
          newPassword: "FreshPassword123!",
        });
        expect(valid.success).toBe(true);

        // Legacy contract using password instead of newPassword MUST FAIL
        const legacy = resetPasswordSchema.safeParse({
          token: "tok_reset_123",
          password: "FreshPassword123!",
        });
        expect(legacy.success).toBe(false);
      });

      it("enforces minimum length of 6 characters on newPassword", () => {
        expect(
          resetPasswordSchema.safeParse({
            token: "tok_123",
            newPassword: "short",
          }).success,
        ).toBe(false);

        expect(
          resetPasswordSchema.safeParse({
            token: "tok_123",
            newPassword: "short1",
          }).success,
        ).toBe(true);
      });

      it("rejects missing token or empty token", () => {
        expect(
          resetPasswordSchema.safeParse({
            token: "",
            newPassword: "FreshPassword123!",
          }).success,
        ).toBe(false);

        expect(
          resetPasswordSchema.safeParse({
            newPassword: "FreshPassword123!",
          }).success,
        ).toBe(false);
      });
    });
  });

  describe("2. enums.ts UserRoleEnum", () => {
    it("accepts customer, covered_person, admin, super_admin", () => {
      expect(UserRoleEnum.safeParse("customer").success).toBe(true);
      expect(UserRoleEnum.safeParse("covered_person").success).toBe(true);
      expect(UserRoleEnum.safeParse("admin").success).toBe(true);
      expect(UserRoleEnum.safeParse("super_admin").success).toBe(true);
    });

    it("rejects arbitrary or invalid role values", () => {
      const invalidRoles = [
        "user",
        "member",
        "guest",
        "operator",
        "CUSTOMER",
        "COVERED_PERSON",
        "coveredPerson",
        "customer ",
        " covered_person",
        "superadmin",
        "",
        null,
        undefined,
        123,
        false,
        {},
      ];

      for (const val of invalidRoles) {
        expect(UserRoleEnum.safeParse(val).success, `Expected rejection for role: ${String(val)}`).toBe(false);
      }
    });
  });

  describe("3. search.ts Schemas & Open Redirect Vectors", () => {
    describe("verifyEmailSearchSchema & redirectSearchSchema", () => {
      it("accepts valid internal paths", () => {
        const validPaths = [
          "/",
          "/dashboard",
          "/app/plans",
          "/app/plans/plan_123?tab=overview",
          "/auth/login?redirect=%2Fapp",
        ];

        for (const p of validPaths) {
          const res = verifyEmailSearchSchema.safeParse({
            token: "tok_123",
            redirect: p,
          });
          expect(res.success, `Path should be accepted: ${p}`).toBe(true);
        }
      });

      it("allows optional token and redirect", () => {
        const emptyRes = verifyEmailSearchSchema.safeParse({});
        expect(emptyRes.success).toBe(true);
        if (emptyRes.success) {
          expect(emptyRes.data.token).toBeUndefined();
          expect(emptyRes.data.redirect).toBeUndefined();
        }

        const tokenOnly = verifyEmailSearchSchema.safeParse({ token: "tok_abc" });
        expect(tokenOnly.success).toBe(true);
      });

      it("blocks adversarial open redirect vectors", () => {
        const maliciousRedirects = [
          "https://evil.com",
          "http://evil.com",
          "//evil.com",
          "//evil.com/path",
          "///evil.com",
          "https://journey-home.onrender.com.attacker.com",
          "javascript:alert(document.cookie)",
          "data:text/html,<script>alert(1)</script>",
          "vbscript:msgbox(1)",
          "ftp://files.attacker.com",
          "http://127.0.0.1:8000/evil",
          "//127.0.0.1",
        ];

        for (const evil of maliciousRedirects) {
          const res = verifyEmailSearchSchema.safeParse({
            token: "tok_123",
            redirect: evil,
          });
          expect(res.success, `Must reject open redirect payload: ${evil}`).toBe(false);
        }
      });

      it("sanitizeRedirect returns fallback on dangerous redirects", () => {
        const fallback = "/app";
        expect(sanitizeRedirect("https://evil.com", fallback)).toBe(fallback);
        expect(sanitizeRedirect("//evil.com", fallback)).toBe(fallback);
        expect(sanitizeRedirect("javascript:alert(1)", fallback)).toBe(fallback);
        expect(sanitizeRedirect(null, fallback)).toBe(fallback);
        expect(sanitizeRedirect(undefined, fallback)).toBe(fallback);
        expect(sanitizeRedirect("/app/plans", fallback)).toBe("/app/plans");
      });

      it("mitigates backslash open redirect vector (/\\\\evil.com) safely", () => {
        // Backslash open redirect vector (/\\evil.com) is rejected:
        const parseResult = redirectSearchSchema.safeParse({ redirect: "/\\evil.com" });
        expect(parseResult.success).toBe(false);

        // sanitizeRedirect returns the fallback path:
        const sanitized = sanitizeRedirect("/\\evil.com", "/app");
        expect(sanitized).toBe("/app");
      });

      it("rejects malformed query payloads (arrays, numbers, objects as redirect)", () => {
        expect(verifyEmailSearchSchema.safeParse({ redirect: 12345 }).success).toBe(false);
        expect(verifyEmailSearchSchema.safeParse({ redirect: ["/app"] }).success).toBe(false);
        expect(verifyEmailSearchSchema.safeParse({ redirect: { path: "/app" } }).success).toBe(false);
        expect(verifyEmailSearchSchema.safeParse({ token: 12345 }).success).toBe(false);
        expect(verifyEmailSearchSchema.safeParse({ token: {} }).success).toBe(false);
      });
    });
  });

  describe("4. user.ts Schemas & Phone Field Removal", () => {
    describe("customerMeSchema", () => {
      it("validates valid customer me profile with updated preferences structure", () => {
        const validMe = {
          id: "usr_cust_001",
          name: "Adaeze Okafor",
          email: "adaeze@example.com",
          createdAt: "2026-11-03T12:00:00.000Z",
          preferences: {
            paymentReminders: true,
            deficitAlerts: false,
            serviceRequestUpdates: true,
            productNewsOffers: false,
          },
        };

        const res = customerMeSchema.safeParse(validMe);
        expect(res.success).toBe(true);
      });

      it("strips phone if backend sends phone field in customerMe response", () => {
        const payloadWithPhone = {
          id: "usr_cust_001",
          name: "Adaeze Okafor",
          email: "adaeze@example.com",
          createdAt: "2026-11-03T12:00:00.000Z",
          phone: "+2348012345678",
          preferences: {
            paymentReminders: true,
            deficitAlerts: false,
            serviceRequestUpdates: true,
            productNewsOffers: false,
          },
        };

        const res = customerMeSchema.safeParse(payloadWithPhone);
        expect(res.success).toBe(true);
        if (res.success) {
          expect("phone" in res.data).toBe(false);
        }
      });

      it("rejects customerMe when required fields are missing", () => {
        const base = {
          id: "usr_cust_001",
          name: "Adaeze Okafor",
          email: "adaeze@example.com",
          createdAt: "2026-11-03T12:00:00.000Z",
          preferences: {
            paymentReminders: true,
            deficitAlerts: false,
            serviceRequestUpdates: true,
            productNewsOffers: false,
          },
        };

        const requiredKeys = ["id", "name", "email", "createdAt", "preferences"] as const;
        for (const k of requiredKeys) {
          const broken: Record<string, unknown> = { ...base };
          delete broken[k];
          expect(customerMeSchema.safeParse(broken).success, `Missing '${k}' must fail`).toBe(false);
        }
      });
    });

    describe("updateProfileSchema", () => {
      it("allows updating name, email, or both", () => {
        expect(updateProfileSchema.safeParse({ name: "Adaeze Nwosu" }).success).toBe(true);
        expect(updateProfileSchema.safeParse({ email: "newemail@example.com" }).success).toBe(true);
        expect(
          updateProfileSchema.safeParse({
            name: "Adaeze Nwosu",
            email: "newemail@example.com",
          }).success,
        ).toBe(true);
        expect(updateProfileSchema.safeParse({}).success).toBe(true);
      });

      it("strips phone from updateProfile parsed data if submitted", () => {
        const res = updateProfileSchema.safeParse({
          name: "Adaeze Nwosu",
          phone: "+2348012345678",
        });
        expect(res.success).toBe(true);
        if (res.success) {
          expect("phone" in res.data).toBe(false);
        }
      });

      it("rejects invalid name length or whitespace-only name in updateProfile", () => {
        expect(updateProfileSchema.safeParse({ name: "A" }).success).toBe(false);
        expect(updateProfileSchema.safeParse({ name: "   " }).success).toBe(false);
        expect(updateProfileSchema.safeParse({ name: "" }).success).toBe(false);
      });

      it("rejects invalid email in updateProfile", () => {
        expect(updateProfileSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
      });
    });
  });

  describe("5. notification.ts Schemas", () => {
    describe("customerPreferencesSchema", () => {
      it("strictly validates the 4 updated boolean preferences", () => {
        const valid = {
          paymentReminders: true,
          deficitAlerts: true,
          serviceRequestUpdates: false,
          productNewsOffers: true,
        };
        const res = customerPreferencesSchema.safeParse(valid);
        expect(res.success).toBe(true);
      });

      it("rejects legacy preference property names (serviceUpdates, productNews)", () => {
        const legacy = {
          paymentReminders: true,
          deficitAlerts: true,
          serviceUpdates: false,
          productNews: true,
        };
        const res = customerPreferencesSchema.safeParse(legacy);
        expect(res.success).toBe(false);
      });

      it("rejects when any preference field is missing", () => {
        const base = {
          paymentReminders: true,
          deficitAlerts: true,
          serviceRequestUpdates: false,
          productNewsOffers: true,
        };

        const fields = [
          "paymentReminders",
          "deficitAlerts",
          "serviceRequestUpdates",
          "productNewsOffers",
        ] as const;

        for (const field of fields) {
          const partial: Record<string, unknown> = { ...base };
          delete partial[field];
          expect(customerPreferencesSchema.safeParse(partial).success, `Missing '${field}' must fail`).toBe(false);
        }
      });

      it("rejects non-boolean types (strings, numbers, null)", () => {
        const nonBooleans = [
          { paymentReminders: "true", deficitAlerts: true, serviceRequestUpdates: true, productNewsOffers: true },
          { paymentReminders: 1, deficitAlerts: true, serviceRequestUpdates: true, productNewsOffers: true },
          { paymentReminders: null, deficitAlerts: true, serviceRequestUpdates: true, productNewsOffers: true },
        ];

        for (const item of nonBooleans) {
          expect(customerPreferencesSchema.safeParse(item).success).toBe(false);
        }
      });
    });

    describe("paginatedNotificationsSchema & appNotificationSchema", () => {
      it("validates full notifications envelope and default isRead=false", () => {
        const payload = {
          items: [
            {
              _id: "notif_001",
              title: "Payment Received",
              message: "Your monthly contribution was recorded",
              event: "PaymentSuccess",
              createdAt: "2026-11-03T10:00:00.000Z",
            },
            {
              _id: "notif_002",
              title: "Plan Verified",
              message: "Your plan documents have been approved",
              event: "PlanApproved",
              isRead: true,
              plan: "plan_xyz",
              subject: "Verification Completed",
              createdAt: "2026-11-03T11:00:00.000Z",
            },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
          counts: {
            totalNotifications: 2,
            totalUnreadNotifications: 1,
          },
        };

        const res = paginatedNotificationsSchema.safeParse(payload);
        expect(res.success).toBe(true);
        if (res.success) {
          expect(res.data.items[0].isRead).toBe(false);
          expect(res.data.items[1].isRead).toBe(true);
        }
      });

      it("accepts empty notification items array", () => {
        const emptyEnvelope = {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          },
          counts: {
            totalNotifications: 0,
            totalUnreadNotifications: 0,
          },
        };
        const res = paginatedNotificationsSchema.safeParse(emptyEnvelope);
        expect(res.success).toBe(true);
      });

      it("rejects invalid items inside notifications array", () => {
        const brokenPayload = {
          items: [
            {
              _id: "notif_bad",
              // Missing title, message, event
              createdAt: "2026-11-03T10:00:00.000Z",
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          counts: { totalNotifications: 1, totalUnreadNotifications: 1 },
        };
        expect(paginatedNotificationsSchema.safeParse(brokenPayload).success).toBe(false);
      });

      it("rejects malformed pagination or counts", () => {
        const base = {
          items: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
          counts: { totalNotifications: 0, totalUnreadNotifications: 0 },
        };

        const bad1 = { ...base, pagination: { total: "zero", page: 1, limit: 20, totalPages: 0 } };
        expect(paginatedNotificationsSchema.safeParse(bad1).success).toBe(false);

        const bad2 = { ...base, counts: { totalNotifications: 0 } }; // missing totalUnreadNotifications
        expect(paginatedNotificationsSchema.safeParse(bad2).success).toBe(false);
      });
    });
  });

  describe("6. Plan and Covered Person Schemas", () => {
    it("validates coveredPersonSchema without requiring phone", () => {
      const valid = {
        fullName: "Chidi Obi",
        relationship: "Brother",
        address: "Plot 12 Marina, Lagos",
      };
      const res = coveredPersonSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("accepts optional phoneNumber in coveredPersonSchema", () => {
      const validWithPhone = {
        fullName: "Chidi Obi",
        relationship: "Brother",
        address: "Plot 12 Marina, Lagos",
        phoneNumber: "+2348099999999",
      };
      const res = coveredPersonSchema.safeParse(validWithPhone);
      expect(res.success).toBe(true);
    });

    it("createPlanSchema validates packageId and coveredPerson", () => {
      const valid = {
        packageId: "pkg_tier_1",
        coveredPerson: {
          fullName: "Chidi Obi",
          relationship: "Brother",
          address: "Plot 12 Marina, Lagos",
        },
      };
      const res = createPlanSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("createPlanSchema rejects empty packageId", () => {
      const invalid = {
        packageId: "",
        coveredPerson: {
          fullName: "Chidi Obi",
          relationship: "Brother",
          address: "Plot 12 Marina, Lagos",
        },
      };
      const res = createPlanSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("7. Stress & Boundary Test: High Volume / Extreme Payloads", () => {
    it("handles large array of notifications efficiently without stack overflow", () => {
      const count = 500;
      const items = Array.from({ length: count }, (_, i) => ({
        _id: `notif_${i}`,
        title: `Notification ${i}`,
        message: `Message body for notification ${i} with extra text to consume memory`,
        event: "PaymentSuccess",
        isRead: i % 2 === 0,
        createdAt: new Date().toISOString(),
      }));

      const start = performance.now();
      const res = paginatedNotificationsSchema.safeParse({
        items,
        pagination: {
          total: count,
          page: 1,
          limit: count,
          totalPages: 1,
        },
        counts: {
          totalNotifications: count,
          totalUnreadNotifications: count / 2,
        },
      });
      const duration = performance.now() - start;

      expect(res.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Must validate 500 complex items in < 1s
    });

    it("resists prototype pollution payloads in objects", () => {
      const polluted = JSON.parse(
        '{"name": "Polluted User", "email": "test@example.com", "password": "password123", "__proto__": {"isAdmin": true}}',
      );
      const res = signupSchema.safeParse(polluted);
      expect(res.success).toBe(true);
      // Verify global Object prototype was not contaminated
      expect(({} as { isAdmin?: boolean }).isAdmin).toBeUndefined();
    });
  });
});
