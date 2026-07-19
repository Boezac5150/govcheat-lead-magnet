/**
 * Scheduled SAM.gov contract sync handler
 * Called daily by Heartbeat to fetch and update live contracts
 */

import { Request, Response } from 'express';
import { sdk } from './sdk';
import { getDb } from '../db';
import { contracts } from '../../drizzle/schema';
import { searchSamGovContracts } from './samGovService';
import { eq } from 'drizzle-orm';

export async function handleSamGovSync(req: Request, res: Response) {
  try {
    // Authenticate as cron
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: 'cron-only' });
    }

    console.log('[SAM.gov Sync] Starting scheduled sync...');

    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        error: 'Database not available',
        context: { taskUid: user.taskUid },
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch live contracts from SAM.gov
    console.log('[SAM.gov Sync] Fetching contracts from SAM.gov...');
    const samContracts = await searchSamGovContracts(undefined, 500);

    if (!samContracts || samContracts.length === 0) {
      console.warn('[SAM.gov Sync] No contracts returned from SAM.gov');
      return res.json({
        ok: true,
        synced: 0,
        message: 'No contracts returned from SAM.gov',
      });
    }

    console.log(`[SAM.gov Sync] Fetched ${samContracts.length} contracts from SAM.gov`);

    // Process each contract
    let synced = 0;
    let updated = 0;

    for (const samContract of samContracts) {
      try {
        // Check if contract already exists
        const existing = await db
          .select()
          .from(contracts)
          .where(eq(contracts.samId, samContract.id))
          .limit(1);

        const contractData = {
          samId: samContract.id,
          title: samContract.title,
          description: samContract.description,
          simplifiedDescription: samContract.description.substring(0, 500),
          agency: samContract.agency,
          contractType: samContract.contractType,
          value: samContract.value || null,
          deadline: samContract.deadline ? new Date(samContract.deadline) : null,
          naicsCode: samContract.naicsCode || null,
          setAside: samContract.setAside || null,
          url: samContract.url || null,
          isActive: true,
          difficulty: determineDifficulty(samContract),
          category: determineCategory(samContract),
          simplifiedType: simplifyContractType(samContract.contractType),
          lastSyncedAt: new Date(),
        };

        if (existing.length > 0) {
          // Update existing contract
          await db
            .update(contracts)
            .set(contractData)
            .where(eq(contracts.samId, samContract.id));
          updated++;
        } else {
          // Insert new contract
          await db.insert(contracts).values(contractData);
          synced++;
        }
      } catch (error) {
        console.error(`[SAM.gov Sync] Error processing contract ${samContract.id}:`, error);
        // Continue with next contract
      }
    }

    console.log(`[SAM.gov Sync] Completed: ${synced} new, ${updated} updated`);

    return res.json({
      ok: true,
      synced,
      updated,
      total: samContracts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[SAM.gov Sync] Error:', error);
    return res.status(500).json({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Determine difficulty level based on contract characteristics
 */
function determineDifficulty(contract: any): 'easy' | 'moderate' | 'hard' {
  const value = contract.value || 0;
  const description = (contract.description || '').toLowerCase();

  // Easy: low value, simple requirements
  if (value < 50000 && !description.includes('security clearance')) {
    return 'easy';
  }

  // Hard: high value, complex requirements
  if (value > 500000 || description.includes('secret') || description.includes('top secret')) {
    return 'hard';
  }

  return 'moderate';
}

/**
 * Determine category based on contract type and description
 */
function determineCategory(contract: any): string {
  const description = (contract.description || '').toLowerCase();
  const contractType = (contract.contractType || '').toLowerCase();

  if (description.includes('it') || description.includes('software') || description.includes('technology')) {
    return 'IT Services';
  }
  if (description.includes('construction') || description.includes('building')) {
    return 'Construction';
  }
  if (description.includes('consulting') || description.includes('professional services')) {
    return 'Consulting';
  }
  if (description.includes('supply') || description.includes('product')) {
    return 'Supplies';
  }
  if (description.includes('maintenance') || description.includes('janitorial')) {
    return 'Facilities';
  }

  return 'General Services';
}

/**
 * Simplify contract type for display
 */
function simplifyContractType(type: string): string {
  const t = (type || '').toLowerCase();

  if (t.includes('set-aside') || t.includes('setaside')) {
    if (t.includes('8a')) return '8(a) Set-Aside';
    if (t.includes('women') || t.includes('wosb')) return 'Women-Owned Set-Aside';
    if (t.includes('veteran') || t.includes('vosb')) return 'Veteran-Owned Set-Aside';
    if (t.includes('hubzone')) return 'HUBZone Set-Aside';
    return 'Set-Aside';
  }

  if (t.includes('small business')) return 'Small Business';
  if (t.includes('open')) return 'Open Market';

  return type || 'General';
}
