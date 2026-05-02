/**
 * SAM.gov Daily Sync Job
 * Pulls live government contracts from SAM.gov and stores them in the database
 * Runs once per day to keep contract data fresh
 */

import { searchSamGovContracts } from './samGovService';
import { getDb } from '../db';
import { contracts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Jargon-to-plain-English translation mapping
const contractTypeTranslations: Record<string, { simplified: string; category: string; difficulty: 'easy' | 'moderate' | 'hard'; minTier: 'scout' | 'operator' | 'contractor' | 'prime' }> = {
  'Micro-Purchase': { simplified: 'Quick Win Under $15K', category: 'Quick Wins', difficulty: 'easy', minTier: 'scout' },
  'Simplified Acquisition': { simplified: 'Fast-Track Bid ($15K-$350K)', category: 'Fast-Track', difficulty: 'moderate', minTier: 'operator' },
  'GSA Schedule': { simplified: 'Pre-Approved Vendor List', category: 'Vendor Lists', difficulty: 'easy', minTier: 'scout' },
  'Small Business Set-Aside': { simplified: 'Small Business Only', category: 'Small Biz', difficulty: 'moderate', minTier: 'operator' },
  'HUBZone': { simplified: 'Historically Underutilized Area', category: 'HUBZone', difficulty: 'hard', minTier: 'contractor' },
  'Women-Owned Small Business': { simplified: 'Women-Owned Business', category: 'Women-Owned', difficulty: 'moderate', minTier: 'operator' },
  'Service-Disabled Veteran': { simplified: 'Veteran-Owned Business', category: 'Veteran', difficulty: 'moderate', minTier: 'operator' },
  'Open Market': { simplified: 'Open to All Bidders', category: 'Open Market', difficulty: 'hard', minTier: 'contractor' },
};

export async function syncSamGovContracts(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    console.log('[SAM.gov Sync] Starting daily sync...');
    const db = await getDb();
    if (!db) {
      errors.push('Database not available');
      console.error('[SAM.gov Sync] Database connection failed');
      return { synced: 0, errors };
    }

    // Fetch contracts from SAM.gov (paginated)
    const allContracts = [];
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore && offset < 1000) { // Limit to 1000 contracts per sync
      console.log(`[SAM.gov Sync] Fetching page at offset ${offset}...`);
      const pageContracts = await searchSamGovContracts(undefined, pageSize, offset);
      
      if (pageContracts.length === 0) {
        hasMore = false;
      } else {
        allContracts.push(...pageContracts);
        offset += pageSize;
      }
    }

    console.log(`[SAM.gov Sync] Fetched ${allContracts.length} contracts from SAM.gov`);

    // Transform and store contracts
    for (const samContract of allContracts) {
      try {
        const translation = contractTypeTranslations[samContract.contractType] || {
          simplified: samContract.contractType,
          category: 'Other',
          difficulty: 'Medium',
          minTier: 'operator',
        };

        // Check if contract already exists
        const existing = await db
          .select()
          .from(contracts)
          .where(eq(contracts.samId, samContract.id))
          .limit(1);

        if (existing.length > 0) {
          // Update existing contract
          await db
            .update(contracts)
            .set({
              title: samContract.title,
              description: samContract.description,
              simplifiedDescription: `${translation.simplified} - ${samContract.agency}`,
              agency: samContract.agency,
              contractType: samContract.contractType,
              simplifiedType: translation.simplified,
              value: samContract.value,
              deadline: samContract.deadline ? new Date(samContract.deadline) : null,
              difficulty: translation.difficulty,
              category: translation.category,
              setAside: samContract.setAside,
              naicsCode: samContract.naicsCode,
              url: samContract.url,
              minTierRequired: translation.minTier,
              updatedAt: new Date(),
            })
            .where(eq(contracts.samId, samContract.id));
        } else {
          // Insert new contract
          await db.insert(contracts).values({
            samId: samContract.id,
            title: samContract.title,
            description: samContract.description,
            simplifiedDescription: `${translation.simplified} - ${samContract.agency}`,
            agency: samContract.agency,
            contractType: samContract.contractType,
            simplifiedType: translation.simplified,
            value: samContract.value || 0,
            deadline: samContract.deadline ? new Date(samContract.deadline) : new Date(),
            difficulty: translation.difficulty,
            category: translation.category,
            setAside: samContract.setAside,
            naicsCode: samContract.naicsCode,
            url: samContract.url,
            minTierRequired: translation.minTier,
          });
        }

        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to sync contract ${samContract.id}: ${errorMsg}`);
        console.error(`[SAM.gov Sync] Error syncing contract ${samContract.id}:`, err);
      }
    }

    console.log(`[SAM.gov Sync] Successfully synced ${synced} contracts`);
    return { synced, errors };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    errors.push(`Sync job failed: ${errorMsg}`);
    console.error('[SAM.gov Sync] Fatal error:', err);
    return { synced, errors };
  }
}

/**
 * Schedule the daily sync job
 * Runs at 2 AM UTC every day
 */
export function scheduleDailySyncJob() {
  // Calculate time until next 2 AM UTC
  const now = new Date();
  const next = new Date();
  next.setUTCHours(2, 0, 0, 0);
  
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  const delay = next.getTime() - now.getTime();
  console.log(`[SAM.gov Sync] Scheduled daily sync in ${Math.round(delay / 1000 / 60)} minutes`);

  // Run first sync after delay
  setTimeout(() => {
    syncSamGovContracts();
    // Then run every 24 hours
    setInterval(() => {
      syncSamGovContracts();
    }, 24 * 60 * 60 * 1000);
  }, delay);
}
