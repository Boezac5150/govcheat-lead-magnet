import { describe, it, expect } from "vitest";
import { testSamGovConnection } from "./samGovService";

describe("SAM.gov API Integration", () => {
  it.skip("should validate SAM.gov API key connectivity", async () => {
    const isConnected = await testSamGovConnection();
    expect(typeof isConnected).toBe("boolean");
    // If API key is valid, connection should succeed
    if (process.env.SAM_GOV_API_KEY) {
      expect(isConnected).toBe(true);
    }
  }, { timeout: 10000 });
});
