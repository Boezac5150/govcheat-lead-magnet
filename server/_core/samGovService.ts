/**
 * SAM.gov API integration service
 * Fetches live government contract opportunities from SAM.gov
 */

import { ENV } from './env';

const SAM_GOV_ENDPOINT = 'https://api.sam.gov/opportunities/v2/search';

export interface SamGovOpportunity {
  id: string;
  title: string;
  description: string;
  agency: string;
  contractType: string;
  value?: number;
  deadline?: string;
  naicsCode?: string;
  setAside?: string;
  url?: string;
}

async function tryEndpoint(
  endpoint: string,
  body: Record<string, any>
): Promise<any> {
  try {
    // For v2, we must use GET with query parameters as POST is not supported on all versions
    const url = new URL(endpoint);
    Object.entries(body).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Try next endpoint
  }
  return null;
}

export function mapSamGovOpportunity(opp: any): SamGovOpportunity {
  const id = opp.noticeId || opp.opportunityID || opp.id || '';
  const awardAmount = Number(opp.award?.amount ?? opp.estimatedAmount);

  return {
    id,
    title: opp.title || opp.solicitationNumber || 'Untitled opportunity',
    description: opp.description || opp.solicitationDescription || '',
    agency: opp.fullParentPathName || opp.organizationName || opp.department || '',
    contractType: opp.type || opp.baseType || 'Open Market',
    value: Number.isFinite(awardAmount) ? awardAmount : undefined,
    deadline: opp.responseDeadLine || opp.responseDeadline || opp.deadline,
    naicsCode: opp.naicsCode,
    setAside: opp.typeOfSetAsideDescription || opp.typeOfSetAside || opp.setAside,
    url: opp.uiLink || (id ? `https://sam.gov/opp/${id}/view` : undefined),
  };
}

export async function searchSamGovContracts(
  keywords?: string,
  limit: number = 100,
  offset: number = 0
): Promise<SamGovOpportunity[]> {
  try {
    if (!ENV.samGovApiKey) {
      console.warn('[SAM.gov] API key not configured');
      return [];
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

    const body = {
      api_key: ENV.samGovApiKey,
      limit,
      offset,
      postedFrom: formatDate(threeMonthsAgo),
      postedTo: formatDate(now),
      ...(keywords && { keyword: keywords }),
    };

    const data = await tryEndpoint(SAM_GOV_ENDPOINT, body);

    if (!data) {
      console.error('[SAM.gov] All endpoints failed');
      return [];
    }

    // Transform SAM.gov response to our contract format
    const opportunities = (data.opportunitiesData || data.opportunities || [])
      .map(mapSamGovOpportunity)
      .filter((opportunity: SamGovOpportunity) => Boolean(opportunity.id));

    return opportunities;
  } catch (error) {
    console.error('[SAM.gov] Failed to fetch contracts:', error);
    return [];
  }
}

/**
 * Test SAM.gov API connectivity
 */
export async function testSamGovConnection(): Promise<boolean> {
  try {
    if (!ENV.samGovApiKey) {
      console.warn('[SAM.gov] API key not configured');
      return false;
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const formatDate = (date: Date) =>
      `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    const body = {
      api_key: ENV.samGovApiKey,
      limit: 1,
      postedFrom: formatDate(yesterday),
      postedTo: formatDate(now),
    };
    return Boolean(await tryEndpoint(SAM_GOV_ENDPOINT, body));
  } catch (error) {
    console.error('[SAM.gov] Connection test failed:', error);
    return false;
  }
}
