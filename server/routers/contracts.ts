import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getSavedContracts, saveContract } from "../db";
import { contracts, savedContracts } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { fetchContractsWithFailover } from "../_core/samGovHealthCheck";
import { getRealContracts } from "../_core/realDataService";

export const contractsRouter = router({
  /**
   * List all contracts with optional filtering
   */
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get contracts with automatic SAM.gov failover
        const contractList = await fetchContractsWithFailover();
        console.log("[Contracts] Returning contracts, count:", contractList.length);
        
        let filtered = contractList;
        
        // Apply value filters
        if (input.minValue !== undefined && input.minValue > 0) {
          const minVal = input.minValue;
          filtered = filtered.filter((c) => c.value && c.value >= minVal);
        }
        if (input.maxValue !== undefined && input.maxValue > 0) {
          const maxVal = input.maxValue;
          filtered = filtered.filter((c) => c.value && c.value <= maxVal);
        }
        
        // Apply pagination
        return filtered.slice(input.offset, input.offset + input.limit);
        
      } catch (error) {
        console.error("[Contracts] Error in list:", error);
        return [];
      }
    }),

  /**
   * Get single contract by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const contractList = await fetchContractsWithFailover();
      return contractList.find((c) => c.id === input.id || c.samId === input.id) || null;
    }),

  /**
   * Save contract for authenticated user
   */
  save: protectedProcedure
    .input(z.object({ contractId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Parse contractId as number for database storage
        const contractIdNum = parseInt(input.contractId, 10);
        if (isNaN(contractIdNum)) {
          throw new Error("Invalid contract ID");
        }

        // Use helper function from db.ts
        await saveContract(ctx.user.id, contractIdNum);
        return { success: true, message: "Contract saved" };
      } catch (error) {
        console.error("[Contracts] Error saving:", error);
        throw error;
      }
    }),

  /**
   * Remove saved contract
   */
  removeSaved: protectedProcedure
    .input(z.object({ contractId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        
        const contractIdNum = parseInt(input.contractId, 10);
        if (isNaN(contractIdNum)) {
          throw new Error("Invalid contract ID");
        }
        
        await db
          .delete(savedContracts)
          .where(
            and(
              eq(savedContracts.userId, ctx.user.id),
              eq(savedContracts.contractId, contractIdNum)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("[Contracts] Error removing:", error);
        throw error;
      }
    }),

  /**
   * Get user's saved contracts
   */
  getSaved: protectedProcedure.query(async ({ ctx }) => {
    try {
      const saved = await getSavedContracts(ctx.user.id);
      const realContracts = getRealContracts();
      return saved
        .map((s) => realContracts.find((c: any) => c.id === s.contractId || c.samId === s.contractId))
        .filter(Boolean);
    } catch (error) {
      console.error("[Contracts] Error getting saved:", error);
      return [];
    }
  }),
});
