import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";

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

describe("dashboard.getSubscription", () => {
  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.dashboard.getSubscription();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("returns no subscription for new users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getSubscription();

    expect(result.hasSubscription).toBe(false);
    expect(result.subscription).toBeNull();
  }, { timeout: 10000 });
});

describe("dashboard.getPaymentHistory", () => {
  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.dashboard.getPaymentHistory();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("returns empty payment history for new users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getPaymentHistory();

    expect(result.payments).toEqual([]);
    expect(result.total).toBe(0);
  }, { timeout: 10000 });
});

describe("dashboard.getMetrics", () => {
  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.dashboard.getMetrics();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("returns default metrics for users without subscription", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getMetrics();

    expect(result.isSubscribed).toBe(false);
    expect(result.tier).toBe("scout");
    expect(result.totalPayments).toBe(0);
    expect(result.totalSpent).toBe(0);
    expect(result.lastPaymentDate).toBeNull();
  }, { timeout: 10000 });
});
