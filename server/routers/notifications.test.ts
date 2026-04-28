import { describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { "user-agent": "Mozilla/5.0" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("notifications router", () => {
  it("requires authentication for subscribe", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notifications.subscribe({
        endpoint: "https://example.com/push",
        auth: "test-auth",
        p256dh: "test-p256dh",
      });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("requires authentication for unsubscribe", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notifications.unsubscribe({
        endpoint: "https://example.com/push",
      });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("requires authentication for getSubscriptions", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notifications.getSubscriptions();
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("requires authentication for getHistory", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notifications.getHistory({ limit: 50 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });

  it("returns empty subscriptions for new users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.getSubscriptions();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("returns empty notification history for new users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.getHistory({ limit: 50 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
