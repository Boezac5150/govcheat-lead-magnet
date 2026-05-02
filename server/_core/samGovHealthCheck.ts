/**
 * SAM.gov API Health Check & Failover Service
 * Monitors SAM.gov API availability and automatically switches to live data when stable
 */

import { getRealContracts, type RealContract } from "./realDataService";

interface HealthCheckResult {
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errorMessage?: string;
}

let lastHealthCheck: HealthCheckResult | null = null;
let samGovDataCache: RealContract[] | null = null;
let cacheTimestamp: Date | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Check if SAM.gov API is healthy and responsive
 */
export async function checkSamGovHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) {
      return {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime: 0,
        errorMessage: "SAM_GOV_API_KEY not configured",
      };
    }

    const response = await fetch(
      `https://api.sam.gov/prod/opportunities/v1/search?api_key=${apiKey}&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    );

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = (await response.json()) as any;
      const isHealthy = data.opportunitiesData && Array.isArray(data.opportunitiesData);

      lastHealthCheck = {
        isHealthy,
        lastCheck: new Date(),
        responseTime,
      };

      return lastHealthCheck;
    } else {
      lastHealthCheck = {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime,
        errorMessage: `HTTP ${response.status}`,
      };

      return lastHealthCheck;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    lastHealthCheck = {
      isHealthy: false,
      lastCheck: new Date(),
      responseTime,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };

    return lastHealthCheck;
  }
}

/**
 * Fetch contracts with automatic failover
 * Tries SAM.gov API first, falls back to realistic data if unavailable
 */
export async function fetchContractsWithFailover(): Promise<RealContract[]> {
  // Check if we have cached SAM.gov data
  if (
    samGovDataCache &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp.getTime() < CACHE_DURATION
  ) {
    console.log("[SAM.gov] Using cached live data");
    return samGovDataCache;
  }

  // Try to fetch from SAM.gov API
  try {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) throw new Error("SAM_GOV_API_KEY not configured");

    const response = await fetch(
      `https://api.sam.gov/prod/opportunities/v1/search?api_key=${apiKey}&limit=50`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`SAM.gov API returned ${response.status}`);
    }

    const data = (await response.json()) as any;
    const opportunities = data.opportunitiesData || [];

    if (opportunities.length === 0) {
      throw new Error("No opportunities returned from SAM.gov");
    }

    const samContracts: RealContract[] = opportunities.map((opp: any) => ({
      id: opp.opportunityID || opp.id,
      samId: opp.opportunityID,
      title: opp.title || "",
      description: opp.description || "",
      simplifiedDescription: opp.description || "",
      agency: opp.organizationName || "",
      value: parseFloat(opp.estimatedAmount || "0"),
      deadline: new Date(opp.responseDeadline || opp.deadline),
      contractType: opp.contractType || "Other",
      simplifiedType: opp.contractType || "Other",
      setAside: opp.setAside || "None",
      url: `https://sam.gov/opp/${opp.opportunityID}`,
      naicsCode: opp.naicsCode || "",
      postedDate: new Date(opp.postedDate),
    }));

    // Cache the live data
    samGovDataCache = samContracts;
    cacheTimestamp = new Date();

    console.log(`✅ [SAM.gov] Fetched ${samContracts.length} live contracts`);
    return samContracts;
  } catch (error) {
    console.warn(
      `⚠️ [SAM.gov] API unavailable, using realistic data fallback:`,
      error instanceof Error ? error.message : "Unknown error"
    );

    // Fall back to realistic data
    return getRealContracts();
  }
}

/**
 * Get current health status
 */
export function getHealthStatus(): HealthCheckResult | null {
  return lastHealthCheck;
}

/**
 * Get data source status (SAM.gov or fallback)
 */
export async function getDataSourceStatus(): Promise<{
  source: "sam.gov" | "fallback";
  isHealthy: boolean;
  lastCheck: Date | null;
  contractCount: number;
}> {
  const health = await checkSamGovHealth();

  return {
    source: health.isHealthy ? "sam.gov" : "fallback",
    isHealthy: health.isHealthy,
    lastCheck: health.lastCheck,
    contractCount: health.isHealthy ? 50 : getRealContracts().length,
  };
}
