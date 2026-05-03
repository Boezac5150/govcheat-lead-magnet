import { z } from 'zod';
import { adminProcedure, router } from '../_core/trpc';
import { syncSAMGovContracts } from '../_core/samGovSync';

export const samGovSyncRouter = router({
  /**
   * Admin-only: Manually trigger SAM.gov contract sync
   */
  syncNow: adminProcedure.mutation(async () => {
    try {
      const count = await syncSAMGovContracts();
      return {
        success: true,
        message: `Synced ${count} new contracts from SAM.gov`,
        count,
      };
    } catch (error) {
      console.error('[SAM.gov Sync Router] Error:', error);
      return {
        success: false,
        message: 'Sync failed',
        count: 0,
      };
    }
  }),
});
