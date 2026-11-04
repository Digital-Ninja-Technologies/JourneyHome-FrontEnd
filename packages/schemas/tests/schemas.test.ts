import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  PlanStatusEnum,
  PaymentStatusEnum,
  ServiceRequestStatusEnum,
  adminLoginSchema,
  apiResponseSchema,
  loginSchema,
  redirectSearchSchema,
  sanitizeRedirect,
  signupSchema,
  verifyCodeSchema,
  planSchema,
  paymentSchema,
  serviceRequestSchema,
  contactSubmissionSchema,
  contactResponseSchema,
  packageSchema,
  createPackageSchema,
  updatePackageSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  deleteAccountSchema,
  resetPasswordSchema,
  sessionUserSchema,
  verifyEmailSearchSchema,
  customerPreferencesSchema,
  appNotificationSchema,
  paginatedNotificationsSchema,
  dashboardSummarySchema,
  subscriptionSchema,
} from "../src";

describe("@journeyhome/schemas", () => {
  describe("apiResponseSchema envelope helper", () => {
    it("validates successful response envelopes", () => {
      const schema = apiResponseSchema(z.object({ id: z.string() }));
      const result = schema.safeParse({
        success: true,
        message: "Loaded",
        data: { id: "123" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid data payload", () => {
      const schema = apiResponseSchema(z.object({ id: z.string() }));
      const result = schema.safeParse({
        success: true,
        message: "Loaded",
        data: { id: 123 },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("enums", () => {
    it("enforces backend plan status enum", () => {
      expect(PlanStatusEnum.options).toEqual([
        "Pending",
        "Active",
        "Payment_Due",
        "Overdue",
        "Paused",
        "Service_Request",
        "Under_Review",
        "Approved",
        "Service_Scheduled",
        "Completed",
        "Cancelled",
        "Expired",
      ]);
    });

    it("enforces backend payment status enum", () => {
      expect(PaymentStatusEnum.options).toEqual([
        "Pending",
        "Processing",
        "Successful",
        "Failed",
        "Refunded",
        "Cancelled",
      ]);
    });

    it("enforces backend service request status enum", () => {
      expect(ServiceRequestStatusEnum.options).toEqual([
        "Submitted",
        "Under_Review",
        "More_Info_Required",
        "Docs_Verified",
        "Approved",
        "Rejected",
        "Cancelled",
      ]);
    });
  });

  describe("auth schemas", () => {
    it("validates valid customer login", () => {
      const res = loginSchema.safeParse({
        email: "demo@journeyhome.ng",
        password: "Password123!",
        remember: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid customer login email", () => {
      const res = loginSchema.safeParse({
        email: "not-an-email",
        password: "Password123!",
      });
      expect(res.success).toBe(false);
    });

    it("validates admin login", () => {
      const res = adminLoginSchema.safeParse({
        email: "admin@journeyhome.ng",
        password: "AdminPassword123!",
      });
      expect(res.success).toBe(true);
    });

    it("validates signup input", () => {
      const res = signupSchema.safeParse({
        name: "Adaeze Okafor",
        email: "adaeze@example.com",
        password: "Secret123Password",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.role).toBe("customer");
      }
    });

    it("validates 6-digit verify code", () => {
      expect(verifyCodeSchema.safeParse({ code: "123456" }).success).toBe(true);
      expect(verifyCodeSchema.safeParse({ code: "12345" }).success).toBe(false);
      expect(verifyCodeSchema.safeParse({ code: "abcdef" }).success).toBe(false);
    });
  });

  describe("search & redirect sanitization", () => {
    it("accepts safe internal redirects", () => {
      expect(redirectSearchSchema.safeParse({ redirect: "/app/plans" }).success).toBe(
        true,
      );
      expect(sanitizeRedirect("/app/plans")).toBe("/app/plans");
    });

    it("blocks open redirect attempts and auth loops", () => {
      expect(
        redirectSearchSchema.safeParse({ redirect: "https://evil.com" }).success,
      ).toBe(false);
      expect(
        redirectSearchSchema.safeParse({ redirect: "//evil.com" }).success,
      ).toBe(false);
      expect(sanitizeRedirect("https://evil.com", "/app")).toBe("/app");
      expect(sanitizeRedirect("//evil.com", "/app")).toBe("/app");
      expect(sanitizeRedirect(undefined, "/app")).toBe("/app");
      expect(sanitizeRedirect("/login", "/app")).toBe("/app");
      expect(sanitizeRedirect("/login?redirect=/login", "/app")).toBe("/app");
      expect(sanitizeRedirect("/signup", "/app")).toBe("/app");
      expect(sanitizeRedirect("/signup/plan?package=pkg_1", "/app")).toBe(
        "/signup/plan?package=pkg_1",
      );
    });
  });

  describe("domain models", () => {
    it("validates plan data shape", () => {
      const samplePlan = {
        _id: "plan_123",
        coveredPerson: {
          fullName: "Emeka Okafor",
          relationship: "father",
          address: "15 Victoria Island, Lagos",
        },
        packageSnapshot: { name: "Standard" },
        contributionAmountMinor: 1000000,
        currency: "NGN",
        startDate: "2026-01-01T00:00:00.000Z",
        nextPaymentDate: "2026-02-01T00:00:00.000Z",
        totalContributedMinor: 2000000,
        status: "Active",
        createdAt: "2026-01-01T00:00:00.000Z",
      };
      expect(planSchema.safeParse(samplePlan).success).toBe(true);
    });

    it("validates payment data shape", () => {
      const samplePayment = {
        _id: "pay_123",
        plan: "plan_123",
        amountMinor: 1000000,
        currency: "NGN",
        purpose: "recurring_contribution",
        status: "Successful",
        reference: "jh_rec_12345",
        createdAt: "2026-01-01T00:00:00.000Z",
      };
      expect(paymentSchema.safeParse(samplePayment).success).toBe(true);
    });

    it("validates service request data shape", () => {
      const sampleRequest = {
        _id: "req_123",
        plan: "plan_123",
        coveredPersonSnapshot: {
          fullName: "Emeka Okafor",
          relationship: "father",
          address: "15 Victoria Island, Lagos",
        },
        dateOfDeath: "2026-03-01T00:00:00.000Z",
        burialLocation: "Ikoyi Cemetery",
        expectedBurialDate: "2026-03-15T00:00:00.000Z",
        contactPerson: "Chidi Okafor",
        contactPhone: "+2348012345678",
        status: "Under_Review",
        createdAt: "2026-03-02T00:00:00.000Z",
      };
      expect(serviceRequestSchema.safeParse(sampleRequest).success).toBe(true);
    });
  });
  describe("contact schemas", () => {
    it("validates valid contact submission input", () => {
      const valid = {
        name: "Adaeze Nwosu",
        email: "adaeze@example.com",
        phone: "08012345678",
        topic: "Starting a plan" as const,
        message: "I would like to inquire about coverage for our family.",
      };
      const res = contactSubmissionSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("validates exact user prompt sample payload", () => {
      const promptSample = {
        name: "Adebayo Okafor",
        phone: "+2348012345678",
        email: "adebayo@example.com",
        topic: "An existing plan" as const,
        message: "I have a question about my monthly contribution.",
      };
      const res = contactSubmissionSchema.safeParse(promptSample);
      expect(res.success).toBe(true);
    });

    it("rejects when required phone number is missing", () => {
      const withoutPhone = {
        name: "Adebayo Okafor",
        email: "adebayo@example.com",
        topic: "An existing plan" as const,
        message: "I have a question about my monthly contribution.",
      };
      const res = contactSubmissionSchema.safeParse(withoutPhone);
      expect(res.success).toBe(false);
    });

    it("accepts all four defined topics", () => {
      const topics = [
        "Starting a plan",
        "An existing plan",
        "Photographer network",
        "Something else",
      ] as const;

      for (const topic of topics) {
        const res = contactSubmissionSchema.safeParse({
          name: "Adebayo Okafor",
          phone: "+2348012345678",
          email: "adebayo@example.com",
          topic,
          message: "A valid message for testing topics.",
        });
        expect(res.success).toBe(true);
      }
    });

    it("rejects invalid contact submission input", () => {
      const invalid = {
        name: "",
        email: "not-an-email",
        phone: "12",
        topic: "Invalid Topic",
        message: "hi",
      };
      const res = contactSubmissionSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it("validates contact response envelope and 201 created entity shape", () => {
      const legacyEnvelope = contactResponseSchema.safeParse({
        received: true,
        id: "msg_123",
      });
      expect(legacyEnvelope.success).toBe(true);

      const created201Entity = contactResponseSchema.safeParse({
        _id: "672750e3b97e9d0012ab4567",
        name: "Adebayo Okafor",
        phone: "+2348012345678",
        email: "adebayo@example.com",
        topic: "An existing plan",
        message: "I have a question about my monthly contribution.",
        createdAt: "2026-11-03T12:00:00.000Z",
      });
      expect(created201Entity.success).toBe(true);
    });
  });

  describe("package schemas", () => {
    it("validates backend package response data shape", () => {
      const fixture = {
        _id: "66f...",
        name: "Classic Memorial",
        description: "Sample test fixture package",
        features: ["Half-day photography", "Digital gallery"],
        amount: 1000000,
        currency: "NGN",
        billingInterval: "monthly",
        isActive: true,
      };

      const res = packageSchema.safeParse(fixture);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe("Classic Memorial");
        expect(res.data.amount).toBe(1000000);
        expect(res.data.billingInterval).toBe("monthly");
        expect(res.data.features).toEqual([
          "Half-day photography",
          "Digital gallery",
        ]);
      }
    });

    it("applies defaults for optional package fields", () => {
      const minimal = {
        _id: "pkg_minimal",
        name: "Essential",
        amount: 500000,
      };

      const res = packageSchema.safeParse(minimal);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.currency).toBe("NGN");
        expect(res.data.billingInterval).toBe("monthly");
        expect(res.data.isActive).toBe(true);
        expect(res.data.features).toEqual([]);
        expect(res.data.description).toBe("");
      }
    });

    it("rejects invalid package amounts", () => {
      expect(
        packageSchema.safeParse({
          _id: "pkg_1",
          name: "Invalid",
          amount: -100,
        }).success,
      ).toBe(false);

      expect(
        packageSchema.safeParse({
          _id: "pkg_1",
          name: "Invalid",
          amount: 0,
        }).success,
      ).toBe(false);
    });

    it("validates create and update package schemas", () => {
      const createRes = createPackageSchema.safeParse({
        name: "New Tier",
        amount: 10000, // major currency unit
        features: ["Drone shot"],
      });
      expect(createRes.success).toBe(true);

      const updateRes = updatePackageSchema.safeParse({
        amount: 15000,
        isActive: false,
      });
      expect(updateRes.success).toBe(true);
    });
  });

  describe("auth schemas - extended & live backend alignment", () => {
    it("validates session user without phone", () => {
      const res = sessionUserSchema.safeParse({
        id: "usr_123",
        email: "user@example.com",
        name: "Adaeze Okafor",
        role: "customer",
        isSuperAdmin: false,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect("phone" in res.data).toBe(false);
      }
    });

    it("validates signup input without phone and defaults role to customer", () => {
      const res = signupSchema.safeParse({
        name: "Adaeze Okafor",
        email: "adaeze@example.com",
        password: "Secret123Password",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.role).toBe("customer");
        expect("phone" in res.data).toBe(false);
      }
    });

    it("accepts role covered_person in signup", () => {
      const res = signupSchema.safeParse({
        name: "Emeka Okafor",
        email: "emeka@example.com",
        password: "Secret123Password",
        role: "covered_person",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.role).toBe("covered_person");
      }
    });

    it("rejects invalid role in signup", () => {
      const res = signupSchema.safeParse({
        name: "Bad Role",
        email: "bad@example.com",
        password: "Secret123Password",
        role: "admin",
      });
      expect(res.success).toBe(false);
    });

    it("validates verifyEmailSchema", () => {
      expect(verifyEmailSchema.safeParse({ token: "tok_abc123" }).success).toBe(true);
      expect(verifyEmailSchema.safeParse({ token: "" }).success).toBe(false);
      expect(verifyEmailSchema.safeParse({}).success).toBe(false);
    });

    it("validates resendVerificationSchema", () => {
      expect(resendVerificationSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
      expect(resendVerificationSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
      expect(resendVerificationSchema.safeParse({}).success).toBe(false);
    });

    it("validates deleteAccountSchema", () => {
      expect(deleteAccountSchema.safeParse({ password: "MyPassword123" }).success).toBe(true);
      expect(deleteAccountSchema.safeParse({ password: "" }).success).toBe(false);
      expect(deleteAccountSchema.safeParse({}).success).toBe(false);
    });

    it("validates resetPasswordSchema with newPassword", () => {
      const valid = resetPasswordSchema.safeParse({
        token: "tok_reset_123",
        newPassword: "NewSecretPassword123",
      });
      expect(valid.success).toBe(true);

      const legacy = resetPasswordSchema.safeParse({
        token: "tok_reset_123",
        password: "NewSecretPassword123",
      });
      expect(legacy.success).toBe(false);
    });
  });

  describe("verify email search schema", () => {
    it("parses verification token and safe redirect", () => {
      const res = verifyEmailSearchSchema.safeParse({
        token: "tok_verify_789",
        redirect: "/app/plans",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.token).toBe("tok_verify_789");
        expect(res.data.redirect).toBe("/app/plans");
      }
    });

    it("allows optional token and redirect", () => {
      const res = verifyEmailSearchSchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.token).toBeUndefined();
        expect(res.data.redirect).toBeUndefined();
      }
    });

    it("rejects open redirect in verify email search", () => {
      const res = verifyEmailSearchSchema.safeParse({
        token: "tok_verify_789",
        redirect: "https://evil.com",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("notification schemas - live backend alignment", () => {
    it("validates customer preferences with serviceRequestUpdates and productNewsOffers", () => {
      const valid = {
        paymentReminders: true,
        deficitAlerts: false,
        serviceRequestUpdates: true,
        productNewsOffers: false,
      };
      expect(customerPreferencesSchema.safeParse(valid).success).toBe(true);

      const legacy = {
        paymentReminders: true,
        deficitAlerts: false,
        serviceUpdates: true,
        productNews: false,
      };
      expect(customerPreferencesSchema.safeParse(legacy).success).toBe(false);
    });

    it("validates appNotificationSchema with title, message and isRead", () => {
      const sample = {
        _id: "notif_001",
        title: "Plan Created",
        message: "Your plan has been initialized",
        event: "InitialPaymentSuccess",
        isRead: false,
        createdAt: "2026-11-03T12:00:00.000Z",
      };
      const res = appNotificationSchema.safeParse(sample);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isRead).toBe(false);
        expect(res.data.title).toBe("Plan Created");
      }
    });

    it("validates paginatedNotificationsSchema envelope", () => {
      const envelope = {
        items: [
          {
            _id: "notif_001",
            title: "Plan Created",
            message: "Your plan has been initialized",
            event: "InitialPaymentSuccess",
            isRead: true,
            createdAt: "2026-11-03T12:00:00.000Z",
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
        counts: {
          totalNotifications: 1,
          totalUnreadNotifications: 0,
        },
      };
      expect(paginatedNotificationsSchema.safeParse(envelope).success).toBe(true);
    });
  });

  describe("dashboard summary and subscriptions schemas", () => {
    it("validates dashboard summary KPIs and applies defaults", () => {
      const emptyRes = dashboardSummarySchema.safeParse({});
      expect(emptyRes.success).toBe(true);
      if (emptyRes.success) {
        expect(emptyRes.data.totalPlans).toBe(0);
        expect(emptyRes.data.currency).toBe("NGN");
        expect(emptyRes.data.recentPlans).toEqual([]);
      }

      const fullRes = dashboardSummarySchema.safeParse({
        totalPlans: 4,
        activePlans: 3,
        pendingPlans: 1,
        totalContributedMinor: 20000000,
        currency: "NGN",
        recentPlans: [],
      });
      expect(fullRes.success).toBe(true);
      if (fullRes.success) {
        expect(fullRes.data.activePlans).toBe(3);
        expect(fullRes.data.totalContributedMinor).toBe(20000000);
      }
    });

    it("validates subscription data shape", () => {
      const sub = {
        _id: "sub_demo_1",
        plan: "plan_demo_1",
        status: "active",
        amountMinor: 500000,
        currency: "NGN",
        nextBillingDate: "2026-12-01T00:00:00.000Z",
        createdAt: "2026-11-01T00:00:00.000Z",
      };
      const res = subscriptionSchema.safeParse(sub);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.status).toBe("active");
        expect(res.data.amountMinor).toBe(500000);
      }
    });
  });
});
