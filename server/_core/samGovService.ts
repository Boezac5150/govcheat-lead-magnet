/**
 * SAM.gov API integration service
 * Fetches live government contract opportunities from SAM.gov
 */

import { ENV } from './env';

// Try multiple endpoints - SAM.gov API has been updated
const ENDPOINTS = [
  'https://api.sam.gov/prod/opportunities/v1/search',
  'https://api.sam.gov/opportunities/v1/search',
  'https://api.sam.gov/prod/opportunities/v2/search',
  'https://api.sam.gov/opportunities/v2/search',
];

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
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Try next endpoint
  }
  return null;
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

    const body = {
      api_key: ENV.samGovApiKey,
      limit,
      offset,
      ...(keywords && { keyword: keywords }),
    };

    // Try each endpoint until one works
    let data = null;
    for (const endpoint of ENDPOINTS) {
      console.log(`[SAM.gov] Trying endpoint: ${endpoint}`);
      data = await tryEndpoint(endpoint, body);
      if (data) {
        console.log(`[SAM.gov] Successfully connected to ${endpoint}`);
        break;
      }
    }

    if (!data) {
      console.error('[SAM.gov] All endpoints failed');
      return [];
    }

    // Transform SAM.gov response to our contract format
    const opportunities = (data.opportunitiesData || data.opportunities || []).map((opp: any) => ({
      id: opp.id || opp.noticeId || '',
      title: opp.title || opp.solicitationNumber || '',
      description: opp.description || opp.solicitationDescription || '',
      agency: opp.agency || opp.organizationName || '',
      contractType: opp.type_of_set_aside || opp.typeOfSetAside || 'Open Market',
      value: opp.base_opportunities_amount 
        ? parseInt(opp.base_opportunities_amount) 
        : opp.estimatedAmount 
        ? parseInt(opp.estimatedAmount)
        : undefined,
      deadline: opp.response_deadline_date || opp.responseDeadlineDate || opp.deadline,
      naicsCode: opp.naics_code || opp.naicsCode,
      setAside: opp.type_of_set_aside || opp.typeOfSetAside,
      url: opp.listing_url || opp.listingUrl || opp.url,
    }));

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

    const body = {
      api_key: ENV.samGovApiKey,
      limit: 1,
    };

    for (const endpoint of ENDPOINTS) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`[SAM.gov] Connection test successful on ${endpoint}`);
        return true;
      }
    }

    console.error('[SAM.gov] Connection test failed on all endpoints');
    return false;
  } catch (error) {
    console.error('[SAM.gov] Connection test failed:', error);
    return false;
  }
}
