import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleStripeWebhook } from "./webhooks";
import type { Request, Response } from "express";

function createMockRequest(overrides?: Partial<Request>): Request {
  return {
    headers: {},
    body: Buffer.from(JSON.stringify({ type: "test" })),
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  const res: any = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };
  return res;
}

describe("handleStripeWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with verified: true for missing signature", async () => {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();

    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ verified: true });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 200 with verified: true for invalid signature", async () => {
    const req = createMockRequest({
      headers: { "stripe-signature": "invalid" },
    });
    const res = createMockResponse();

    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ verified: true });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 200 with verified: true for test events", async () => {
    // Mock Stripe to return a test event
    vi.mock("stripe", () => ({
      default: vi.fn().mockReturnValue({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue({
            id: "evt_test_123",
            type: "checkout.session.completed",
            data: { object: {} },
          }),
        },
      }),
    }));

    const req = createMockRequest({
      headers: { "stripe-signature": "valid" },
    });
    const res = createMockResponse();

    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ verified: true });
  });

  it("always returns valid JSON response", async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await handleStripeWebhook(req, res);

    const callArgs = res.json.mock.calls[0]?.[0];
    expect(callArgs).toBeDefined();
    expect(typeof callArgs).toBe("object");
    expect("verified" in callArgs).toBe(true);
  });
});
