import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * We mock the db module so tests don't need a real database connection.
 */
vi.mock("./db", () => {
  const existingEmails = new Set<string>();

  return {
    insertSubscriber: vi.fn(async (email: string, source?: string) => {
      const normalized = email.toLowerCase().trim();
      if (existingEmails.has(normalized)) {
        return { success: true, alreadyExists: true };
      }
      existingEmails.add(normalized);
      return { success: true, alreadyExists: false };
    }),
    getSubscriberCount: vi.fn(async () => 42),
    getAllSubscribers: vi.fn(async () => [
      { id: 1, email: "test@example.com", source: "cheatsheet", verified: false, createdAt: new Date(), updatedAt: new Date() },
    ]),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
    getDb: vi.fn(),
  };
});

/**
 * Mock the notification module so tests don't call the real notification service.
 */
const mockNotifyOwner = vi.fn(async () => true);
vi.mock("./_core/notification", () => ({
  notifyOwner: (...args: any[]) => mockNotifyOwner(...args),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

/** Regular authenticated user (role: "user") — should NOT access admin endpoints */
function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

/** Admin user (role: "admin") — should access admin endpoints */
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("subscriber.subscribe", () => {
  beforeEach(() => {
    mockNotifyOwner.mockClear();
  });

  it("accepts a valid email and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.subscribe({
      email: "newuser@govcheat.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("You're in");
  });

  it("handles duplicate emails gracefully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.subscribe({
      email: "newuser@govcheat.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("already on the list");
  });

  it("rejects invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.subscriber.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("accepts custom source parameter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.subscribe({
      email: "fbads@govcheat.com",
      source: "facebook_ad",
    });

    expect(result.success).toBe(true);
  });

  it("triggers owner notification on new subscriber", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.subscriber.subscribe({
      email: "notify-test@govcheat.com",
    });

    // Wait a tick for the fire-and-forget promise
    await new Promise((r) => setTimeout(r, 50));

    expect(mockNotifyOwner).toHaveBeenCalledTimes(1);
    expect(mockNotifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("notify-test@govcheat.com"),
        content: expect.stringContaining("notify-test@govcheat.com"),
      })
    );
  });

  it("does NOT notify owner on duplicate subscription", async () => {
    mockNotifyOwner.mockClear();
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.subscriber.subscribe({
      email: "notify-test@govcheat.com",
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });
});

describe("subscriber.count (admin-only)", () => {
  it("returns count for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.count();
    expect(result.count).toBe(42);
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscriber.count()).rejects.toThrow();
  });

  it("rejects non-admin authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscriber.count()).rejects.toThrow(/permission/i);
  });
});

describe("subscriber.list (admin-only)", () => {
  it("returns subscriber list for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("email");
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscriber.list()).rejects.toThrow();
  });

  it("rejects non-admin authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscriber.list()).rejects.toThrow(/permission/i);
  });
});
