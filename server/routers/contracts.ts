import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contracts, savedContracts } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { fetchContractsWithFailover } from "../_core/samGovHealthCheck";

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
        const contracts = await fetchContractsWithFailover();
        console.log("[Contracts] Returning contracts, count:", contracts.length);
        
        let filtered = contracts;
        
        // Apply value filters
        if (input.minValue !== undefined && input.minValue > 0) {
          filtered = filtered.filter((c) => c.value >= input.minValue);
        }
        if (input.maxValue !== undefined && input.maxValue > 0) {
          filtered = filtered.filter((c) => c.value <= input.maxValue);
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
      const realContracts = getRealContracts();
      return realContracts.find((c) => c.id === input.id || c.samId === input.id) || null;
    }),

  /**
   * Save contract for authenticated user
   */
  save: protectedProcedure
    .input(z.object({ contractId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        // Check if already saved
        const existing = await db
          .select()
          .from(savedContracts)
          .where(
            and(
              eq(savedContracts.userId, ctx.user.id),
              eq(savedContracts.contractId, input.contractId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          return { success: true, message: "Already saved" };
        }

        // Save contract
        await db.insert(savedContracts).values({
          userId: ctx.user.id,
          contractId: input.contractId,
          savedAt: new Date(),
        });

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
        const db = getDb();
        
        await db
          .delete(savedContracts)
          .where(
            and(
              eq(savedContracts.userId, ctx.user.id),
              eq(savedContracts.contractId, input.contractId)
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
      const db = getDb();
      const saved = await db
        .select()
        .from(savedContracts)
        .where(eq(savedContracts.userId, ctx.user.id));

      const realContracts = getRealContracts();
      return saved
        .map((s) => realContracts.find((c) => c.id === s.contractId || c.samId === s.contractId))
        .filter(Boolean);
    } catch (error) {
      console.error("[Contracts] Error getting saved:", error);
      return [];
    }
  }),
});
