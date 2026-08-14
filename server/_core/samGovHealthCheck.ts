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

function buildSamGovUrl(apiKey: string, limit: number, postedFrom: string, postedTo: string) {
  const url = new URL("https://api.sam.gov/opportunities/v2/search");
  url.search = new URLSearchParams({
    api_key: apiKey,
    limit: String(limit),
    postedFrom,
    postedTo,
  }).toString();
  return url;
}

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

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const formatDate = (date: Date) => {
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${m}/${d}/${y}`;
    };

    const response = await fetch(
      buildSamGovUrl(apiKey, 1, formatDate(threeMonthsAgo), formatDate(now)),
      { signal: AbortSignal.timeout(30000) }
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

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const formatDate = (date: Date) => {
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${m}/${d}/${y}`;
    };

    const response = await fetch(
      buildSamGovUrl(apiKey, 50, formatDate(threeMonthsAgo), formatDate(now)),
      { signal: AbortSignal.timeout(30000) }
    );

    if (!response.ok) {
      throw new Error(`SAM.gov API returned ${response.status}`);
    }

    const data = (await response.json()) as any;
    const opportunities = data.opportunitiesData || [];

    if (opportunities.length === 0) {
      throw new Error("No opportunities returned from SAM.gov");
    }

    const samContracts: RealContract[] = opportunities.map((opp: any) => {
      const id = opp.noticeId || opp.opportunityID || opp.id;
      return {
      id,
      samId: id,
      title: opp.title || "",
      description: opp.description || "",
      simplifiedDescription: opp.description || "",
      agency: opp.fullParentPathName || opp.organizationName || opp.department || "",
      value: Number(opp.award?.amount ?? opp.estimatedAmount ?? 0),
      deadline: new Date(opp.responseDeadLine || opp.responseDeadline || opp.deadline),
      contractType: opp.type || opp.baseType || "Other",
      simplifiedType: opp.type || opp.baseType || "Other",
      setAside: opp.typeOfSetAsideDescription || opp.typeOfSetAside || opp.setAside || "None",
      url: opp.uiLink || `https://sam.gov/opp/${id}/view`,
      naicsCode: opp.naicsCode || "",
      postedDate: new Date(opp.postedDate),
    };}).filter((contract: RealContract) => Boolean(contract.id));

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
