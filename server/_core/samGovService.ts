/**
 * SAM.gov API integration service
 * Fetches live government contract opportunities from SAM.gov
 */

import { ENV } from './env';

const SAM_GOV_BASE_URL = 'https://api.sam.gov/prod/opportunities/v1/search';

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

    const params = new URLSearchParams({
      api_key: ENV.samGovApiKey,
      limit: limit.toString(),
      offset: offset.toString(),
      ...(keywords && { keyword: keywords }),
    });

    const url = `${SAM_GOV_BASE_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[SAM.gov] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json() as any;
    
    // Transform SAM.gov response to our contract format
    const opportunities = (data.opportunitiesData || []).map((opp: any) => ({
      id: opp.id,
      title: opp.title,
      description: opp.description || '',
      agency: opp.agency || '',
      contractType: opp.type_of_set_aside || 'Open Market',
      value: opp.base_opportunities_amount ? parseInt(opp.base_opportunities_amount) : undefined,
      deadline: opp.response_deadline_date,
      naicsCode: opp.naics_code,
      setAside: opp.type_of_set_aside,
      url: opp.listing_url,
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

    const params = new URLSearchParams({
      api_key: ENV.samGovApiKey,
      limit: '1',
    });

    const url = `${SAM_GOV_BASE_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[SAM.gov] Connection test failed:', error);
    return false;
  }
}
