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

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "owner-user",
      email: "owner@example.com",
      name: "Owner",
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

describe("subscriber.subscribe", () => {
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

    // Subscribe the same email again (mock tracks it)
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
});

describe("subscriber.count (protected)", () => {
  it("returns count for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.count();
    expect(result.count).toBe(42);
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscriber.count()).rejects.toThrow();
  });
});

describe("subscriber.list (protected)", () => {
  it("returns subscriber list for authenticated users", async () => {
    const ctx = createAuthContext();
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
});
