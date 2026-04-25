import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";
import Stripe from "stripe";

// Mock Stripe
vi.mock("stripe", () => {
  const mockCheckoutSessions = {
    create: vi.fn().mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
      payment_status: "unpaid",
      customer_email: "test@govcheat.com",
      metadata: {},
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: "cs_test_123",
      payment_status: "paid",
      customer_email: "test@govcheat.com",
      metadata: {},
    }),
  };

  return {
    default: vi.fn(() => ({
      checkout: { sessions: mockCheckoutSessions },
      webhooks: { constructEvent: vi.fn() },
    })),
  };
});

type AuthenticatedUser = User;

function createAuthContext(user?: Partial<AuthenticatedUser>): TrpcContext {
  const defaultUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@govcheat.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: { ...defaultUser, ...user },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("stripe.createCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("creates a checkout session for a valid tier", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.createCheckoutSession({
      tier: "operator",
      origin: "https://example.com",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("checkoutUrl");
    expect(result).toHaveProperty("sessionId");
    expect(result.checkoutUrl).toContain("stripe.com");
    expect(result.sessionId).toBe("cs_test_123");
  });

  it("creates checkout sessions for all paid tiers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const tiers = ["operator", "contractor", "prime"] as const;

    for (const tier of tiers) {
      const result = await caller.stripe.createCheckoutSession({
        tier,
        origin: "https://example.com",
      });

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBeTruthy();
      expect(result.sessionId).toBe("cs_test_123");
    }
  });

  it("includes user metadata in the checkout session", async () => {
    const ctx = createAuthContext({
      email: "contractor@govcheat.com",
      name: "John Contractor",
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.createCheckoutSession({
      tier: "contractor",
      origin: "https://example.com",
    });

    expect(result.success).toBe(true);
    expect(result.checkoutUrl).toBeTruthy();
    expect(result.sessionId).toBe("cs_test_123");
  });

  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.createCheckoutSession({
        tier: "operator",
        origin: "https://example.com",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("rejects invalid tier names", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.createCheckoutSession({
        tier: "invalid" as any,
        origin: "https://example.com",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeTruthy();
    }
  });

  it("validates the origin URL format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.createCheckoutSession({
        tier: "operator",
        origin: "not-a-valid-url",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeTruthy();
    }
  });
});

describe("stripe.getCheckoutSession", () => {
  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.getCheckoutSession({
        sessionId: "cs_test_123",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("validates session ID format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stripe.getCheckoutSession({
        sessionId: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeTruthy();
    }
  });
});
