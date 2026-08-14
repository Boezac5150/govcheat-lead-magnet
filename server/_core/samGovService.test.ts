import { describe, it, expect } from "vitest";
import { mapSamGovOpportunity, testSamGovConnection } from "./samGovService";

describe("SAM.gov API Integration", () => {
  it("maps the current SAM.gov opportunity fields", () => {
    const result = mapSamGovOpportunity({
      noticeId: "abc-123",
      title: "Network support",
      fullParentPathName: "DEPT.OFFICE",
      responseDeadLine: "2026-09-01T17:00:00-05:00",
      type: "Solicitation",
      typeOfSetAsideDescription: "Small Business Set-Aside",
      naicsCode: "541512",
      uiLink: "https://sam.gov/opp/abc-123/view",
      award: { amount: "125000" },
    });

    expect(result).toMatchObject({
      id: "abc-123",
      agency: "DEPT.OFFICE",
      deadline: "2026-09-01T17:00:00-05:00",
      contractType: "Solicitation",
      setAside: "Small Business Set-Aside",
      value: 125000,
    });
  });
  it.skip("should validate SAM.gov API key connectivity", async () => {
    const isConnected = await testSamGovConnection();
    expect(typeof isConnected).toBe("boolean");
    // If API key is valid, connection should succeed
    if (process.env.SAM_GOV_API_KEY) {
      expect(isConnected).toBe(true);
    }
  }, { timeout: 10000 });
});
