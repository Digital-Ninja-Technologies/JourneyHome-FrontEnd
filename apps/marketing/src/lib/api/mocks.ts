import type { Package } from "@journeyhome/schemas";

export const NOT_MOCKED = Symbol("not-mocked");

export const DUMMY_PACKAGES: Package[] = [
  {
    _id: "basic",
    name: "Basic",
    description: "Photography only",
    features: [
      "Half-day photography",
      "Digital gallery",
      "Dedicated coordinator",
    ],
    amount: 500_000,
    currency: "NGN",
    billingInterval: "monthly",
    isActive: true,
  },
  {
    _id: "standard",
    name: "Standard",
    description: "Photography + videography",
    features: [
      "Full-day photography & video",
      "Edited keepsake film",
      "Printed album, 40 pages",
      "Digital gallery for family abroad",
    ],
    amount: 1_000_000,
    currency: "NGN",
    billingInterval: "monthly",
    isActive: true,
  },
  {
    _id: "premium",
    name: "Premium",
    description: "Full production",
    features: [
      "Everything in Standard",
      "Second videographer",
      "Drone coverage, where permitted",
      "Premium leather album",
    ],
    amount: 1_800_000,
    currency: "NGN",
    billingInterval: "monthly",
    isActive: true,
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown | typeof NOT_MOCKED> {
  const route = `${method} ${path.split("?")[0]}`;

  if (route === "GET /packages") {
    await sleep(60);
    return DUMMY_PACKAGES;
  }

  if (route === "POST /contact") {
    await sleep(250);
    const b = (body ?? {}) as Record<string, unknown>;
    return {
      _id: `msg_mock_${Date.now()}`,
      id: `msg_mock_${Date.now()}`,
      name: b.name,
      phone: b.phone,
      email: b.email,
      topic: b.topic,
      message: b.message,
      createdAt: new Date().toISOString(),
      received: true,
    };
  }

  return NOT_MOCKED;
}
