/**
 * SAM.gov Contract Data Sync Service
 * Pulls live government contract opportunities from SAM.gov API
 * Falls back to FedBizOpps RSS feed if SAM.gov is unavailable
 */

import { getDb } from '../db';
import { contracts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface SAMContract {
  id: string;
  title: string;
  agency: string;
  description: string;
  value: number;
  deadline: Date;
  contractType: string;
  setAside?: string;
  naicsCode?: string;
  url?: string;
}

/**
 * Fetch contracts from SAM.gov API
 */
async function fetchFromSAMGov(): Promise<SAMContract[]> {
  try {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) {
      console.warn('[SAM.gov Sync] API key not configured');
      return [];
    }

    const response = await fetch(
      `https://api.sam.gov/prod/opportunities/v1/search?api_key=${apiKey}&limit=100&status=active`,
      { timeout: 10000 }
    );

    if (!response.ok) {
      console.warn('[SAM.gov Sync] API returned:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.opportunitiesData || !Array.isArray(data.opportunitiesData)) {
      console.warn('[SAM.gov Sync] No opportunities found in response');
      return [];
    }

    return data.opportunitiesData.map((opp: any) => ({
      id: opp.opportunityID || `sam-${Date.now()}-${Math.random()}`,
      title: opp.title || 'Untitled Opportunity',
      agency: opp.agencyName || 'Unknown Agency',
      description: opp.description || '',
      value: opp.estimatedAmount ? parseInt(opp.estimatedAmount) : 0,
      deadline: opp.responseDeadLine ? new Date(opp.responseDeadLine) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contractType: opp.contractType || 'Firm Fixed Price',
      setAside: opp.setAsideType,
      naicsCode: opp.naicsCode,
      url: `https://sam.gov/opp/${opp.opportunityID}`,
    }));
  } catch (error) {
    console.error('[SAM.gov Sync] Error fetching from SAM.gov:', error);
    return [];
  }
}

/**
 * Fetch contracts from FedBizOpps RSS feed (fallback)
 */
async function fetchFromFedBizOpps(): Promise<SAMContract[]> {
  try {
    const response = await fetch('https://www.fbo.gov/api/s/opportunities?status=active&limit=100', {
      timeout: 10000,
    });

    if (!response.ok) {
      console.warn('[SAM.gov Sync] FedBizOpps returned:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('[SAM.gov Sync] FedBizOpps response not an array');
      return [];
    }

    return data.map((opp: any) => ({
      id: opp.id || `fbo-${Date.now()}-${Math.random()}`,
      title: opp.title || 'Untitled Opportunity',
      agency: opp.agency || 'Unknown Agency',
      description: opp.description || '',
      value: opp.estimatedAmount ? parseInt(opp.estimatedAmount) : 0,
      deadline: opp.deadline ? new Date(opp.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contractType: opp.contractType || 'Firm Fixed Price',
      setAside: opp.setAside,
      naicsCode: opp.naicsCode,
      url: opp.url,
    }));
  } catch (error) {
    console.error('[SAM.gov Sync] Error fetching from FedBizOpps:', error);
    return [];
  }
}

/**
 * Sync contracts from SAM.gov (with FedBizOpps fallback)
 */
export async function syncSAMGovContracts(): Promise<number> {
  try {
    console.log('[SAM.gov Sync] Starting contract sync...');
    
    // Try SAM.gov first, fall back to FedBizOpps
    let samContracts = await fetchFromSAMGov();
    
    if (samContracts.length === 0) {
      console.log('[SAM.gov Sync] SAM.gov unavailable, falling back to FedBizOpps');
      samContracts = await fetchFromFedBizOpps();
    }

    if (samContracts.length === 0) {
      console.warn('[SAM.gov Sync] No contracts found from any source');
      return 0;
    }

    const db = await getDb();
    if (!db) {
      console.error('[SAM.gov Sync] Database connection failed');
      return 0;
    }

    let insertedCount = 0;

    for (const contract of samContracts) {
      try {
        // Check if contract already exists
        const existing = await db
          .select()
          .from(contracts)
          .where(eq(contracts.samId, contract.id))
          .limit(1);

        if (existing.length === 0) {
          // Insert new contract
          await db.insert(contracts).values({
            samId: contract.id,
            title: contract.title,
            agency: contract.agency,
            description: contract.description,
            value: contract.value,
            deadline: contract.deadline,
            contractType: contract.contractType,
            simplifiedType: contract.contractType,
            setAside: contract.setAside,
            naicsCode: contract.naicsCode,
            difficulty: getDifficulty(contract.value),
            simplifiedDescription: simplifyDescription(contract.description),
            source: 'sam.gov',
          });
          insertedCount++;
        }
      } catch (err) {
        console.error('[SAM.gov Sync] Error inserting contract:', contract.id, err);
      }
    }

    console.log(`[SAM.gov Sync] Sync complete: ${insertedCount} new contracts added`);
    return insertedCount;
  } catch (error) {
    console.error('[SAM.gov Sync] Sync failed:', error);
    return 0;
  }
}

/**
 * Determine contract difficulty based on value
 */
function getDifficulty(value: number): 'easy' | 'moderate' | 'hard' {
  if (value < 50000) return 'easy';
  if (value < 500000) return 'moderate';
  return 'hard';
}

/**
 * Simplify contract description to plain English
 */
function simplifyDescription(description: string): string {
  if (!description) return 'Government contract opportunity';
  
  // Remove common jargon and shorten
  let simplified = description
    .replace(/\b(shall|must|required to)\b/gi, 'needs to')
    .replace(/\b(in accordance with|per)\b/gi, 'following')
    .replace(/\b(hereinafter|aforementioned)\b/gi, 'the')
    .substring(0, 200);

  return simplified.trim() + (description.length > 200 ? '...' : '');
}
