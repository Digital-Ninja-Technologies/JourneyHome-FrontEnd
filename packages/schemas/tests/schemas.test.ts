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
  signupSearchSchema,
  resolveSelectedPackage,
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

    it("blocks open redirect attempts", () => {
      expect(
        redirectSearchSchema.safeParse({ redirect: "https://evil.com" }).success,
      ).toBe(false);
      expect(
        redirectSearchSchema.safeParse({ redirect: "//evil.com" }).success,
      ).toBe(false);
      expect(sanitizeRedirect("https://evil.com", "/app")).toBe("/app");
      expect(sanitizeRedirect("//evil.com", "/app")).toBe("/app");
      expect(sanitizeRedirect(undefined, "/app")).toBe("/app");
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

  describe("signup search", () => {
    it("resolves the selected package from package or packageId", () => {
      expect(
        resolveSelectedPackage(signupSearchSchema.parse({ package: "abc" })),
      ).toBe("abc");
      expect(
        resolveSelectedPackage(signupSearchSchema.parse({ packageId: "xyz" })),
      ).toBe("xyz");
      expect(resolveSelectedPackage(signupSearchSchema.parse({}))).toBeUndefined();
    });
  });
});
