/**
 * Scheduled SAM.gov contract sync handler
 * Runs internally every day and can also be invoked by an authenticated cron request.
 */

import { Request, Response } from 'express';
import { ENV } from './env';
import { getDb } from '../db';
import { contracts } from '../../drizzle/schema';
import { searchSamGovContracts } from './samGovService';
import { eq } from 'drizzle-orm';

export async function handleSamGovSync(req: Request, res: Response) {
  try {
    const authorization = req.header('authorization');
    if (!ENV.cronSecret || authorization !== `Bearer ${ENV.cronSecret}`) {
      return res.status(403).json({ error: 'cron-only' });
    }
    return res.json(await syncSamGovContracts());
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

export async function syncSamGovContracts() {
  console.log('[SAM.gov Sync] Starting sync...');
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const samContracts = await searchSamGovContracts(undefined, 500);
  if (samContracts.length === 0) throw new Error('No contracts returned from SAM.gov');

  let synced = 0;
  let updated = 0;
  for (const samContract of samContracts) {
    try {
      const existing = await db.select().from(contracts).where(eq(contracts.samId, samContract.id)).limit(1);
      const parsedDeadline = samContract.deadline ? new Date(samContract.deadline) : null;
      const contractData = {
        samId: samContract.id,
        title: samContract.title,
        description: samContract.description,
        simplifiedDescription: samContract.description.substring(0, 500),
        agency: samContract.agency,
        contractType: samContract.contractType,
        value: samContract.value ? Math.round(samContract.value) : null,
        deadline: parsedDeadline && !Number.isNaN(parsedDeadline.getTime()) ? parsedDeadline : null,
        naicsCode: samContract.naicsCode || null,
        setAside: samContract.setAside || null,
        url: samContract.url || null,
        isActive: true,
        difficulty: determineDifficulty(samContract),
        category: determineCategory(samContract),
        simplifiedType: simplifyContractType(samContract.contractType),
      } as const;
      if (existing.length) {
        await db.update(contracts).set(contractData).where(eq(contracts.samId, samContract.id));
        updated++;
      } else {
        await db.insert(contracts).values(contractData);
        synced++;
      }
    } catch (error) {
      console.error(`[SAM.gov Sync] Error processing contract ${samContract.id}:`, error);
    }
  }
  console.log(`[SAM.gov Sync] Completed: ${synced} new, ${updated} updated`);
  return { ok: true, synced, updated, total: samContracts.length, timestamp: new Date().toISOString() };
}

export function startDailySamGovSync() {
  const run = () => syncSamGovContracts().catch(error => console.error('[SAM.gov Sync] Daily run failed:', error));
  const firstRun = setTimeout(run, 30_000);
  const dailyRun = setInterval(run, 24 * 60 * 60 * 1000);
  firstRun.unref();
  dailyRun.unref();
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
