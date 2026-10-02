/**
 * SAM.gov API Health Check & Failover Service
 * Monitors SAM.gov API availability and automatically switches to live data when stable
 */

import { type RealContract } from "./realDataService";
import { getDb } from "../db";
import { contracts } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Read the real synced SAM.gov contracts from the database.
 * This is the fallback when the live SAM.gov API is unreachable — the nightly
 * sync keeps this table populated with genuine opportunities, so users never
 * see fabricated data.
 */
export async function getDbContracts(): Promise<RealContract[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(contracts)
    .where(eq(contracts.isActive, true))
    .orderBy(desc(contracts.createdAt))
    .limit(500);
  return rows.map(
    (r): RealContract => ({
      id: r.samId,
      samId: r.samId,
      title: r.title,
      description: r.description,
      simplifiedDescription: r.simplifiedDescription,
      agency: r.agency,
      value: r.value ?? 0,
      deadline: r.deadline,
      contractType: r.contractType,
      simplifiedType: r.simplifiedType,
      setAside: r.setAside ?? "None",
      url: r.url ?? `https://sam.gov/opp/${r.samId}/view`,
      naicsCode: r.naicsCode ?? "",
      postedDate: r.createdAt,
    })
  );
}

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
const SAM_GOV_HEADERS = {
  Accept: "application/json",
  "User-Agent": "GovCheat/1.0 (info@govcheat.com)",
};

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
      { headers: SAM_GOV_HEADERS, signal: AbortSignal.timeout(30000) }
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
      // SAM.gov empirically returns 404 for API keys it does not recognize,
      // so surface that interpretation alongside the raw status.
      const hint =
        response.status === 404
          ? ' (SAM.gov returns 404 for unrecognized API keys — key likely not provisioned for the Opportunities API)'
          : response.status === 401 || response.status === 403
            ? ' (API key rejected)'
            : '';
      lastHealthCheck = {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime,
        errorMessage: `HTTP ${response.status}${hint}`,
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
      { headers: SAM_GOV_HEADERS, signal: AbortSignal.timeout(30000) }
    );

    if (!response.ok) {
      // Surface the real failure: status + body, with an interpretation.
      // Empirically, SAM.gov returns 404 (not 401/403) for API keys it does
      // not recognize, so a 404 here almost always means a bad/unprovisioned
      // key rather than a wrong endpoint URL.
      const bodySnippet = await response
        .text()
        .then((t) => t.slice(0, 500))
        .catch(() => '<unreadable>');
      const hint =
        response.status === 404
          ? ' (SAM.gov returns 404 for unrecognized API keys — the key is likely not provisioned for the Opportunities API; request one from the SAM.gov Account Details page)'
          : response.status === 401 || response.status === 403
            ? ' (API key rejected — request a fresh key from the SAM.gov Account Details page)'
            : '';
      throw new Error(
        `SAM.gov API returned ${response.status}${hint}. Body: ${bodySnippet}`
      );
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
      `⚠️ [SAM.gov] API unavailable, falling back to synced database contracts:`,
      error instanceof Error ? error.message : "Unknown error"
    );

    // Fall back to the real contracts stored by the nightly sync — never
    // fabricated data.
    try {
      return await getDbContracts();
    } catch (dbError) {
      console.error(
        "[SAM.gov] Database fallback failed:",
        dbError instanceof Error ? dbError.message : "Unknown error"
      );
      return [];
    }
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
  totalContracts: number;
}> {
  const health = await checkSamGovHealth();

  // When the live API is down, the count reflects real synced contracts in
  // the database — never fabricated data.
  let fallbackCount = 0;
  if (!health.isHealthy) {
    try {
      fallbackCount = (await getDbContracts()).length;
    } catch {
      fallbackCount = 0;
    }
  }

  // Total real contracts in the database (populated by the nightly sync).
  let totalContracts = 0;
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select({ n: sql<number>`count(*)` })
        .from(contracts)
        .where(eq(contracts.isActive, true));
      totalContracts = Number(rows[0]?.n ?? 0);
    }
  } catch {
    totalContracts = 0;
  }

  return {
    source: health.isHealthy ? "sam.gov" : "fallback",
    isHealthy: health.isHealthy,
    lastCheck: health.lastCheck,
    contractCount: health.isHealthy ? 50 : fallbackCount,
    totalContracts,
  };
}
