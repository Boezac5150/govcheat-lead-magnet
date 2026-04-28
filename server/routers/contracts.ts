import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contracts, savedContracts } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { mockContracts } from "../mockContracts";

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
      const db = await getDb();
      if (!db) {
        // Return mock data if database unavailable
        return mockContracts.slice(input.offset, input.offset + input.limit);
      }

      try {
        let results;
        if (input.category) {
          results = await db
            .select()
            .from(contracts)
            .where(eq(contracts.category, input.category))
            .limit(input.limit)
            .offset(input.offset);
        } else {
          results = await db
            .select()
            .from(contracts)
            .limit(input.limit)
            .offset(input.offset);
        }
        
        // Apply value filters in application layer
        return (results || []).filter((c) => {
          if (input.minValue !== undefined && input.minValue > 0 && (!c.value || c.value < input.minValue)) {
            return false;
          }
          if (input.maxValue !== undefined && input.maxValue > 0 && c.value && c.value > input.maxValue) {
            return false;
          }
          return true;
        });

      } catch (error) {
        console.error("[Contracts] Failed to list contracts:", error);
        return (mockContracts || []).slice(input.offset, input.offset + input.limit);
      }
    }),

  /**
   * Search contracts by keyword
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Check if user has exceeded daily search limit (free tier: 5/day)
      if (ctx.user && ctx.user.role === "user") {
        // TODO: Implement search count tracking
      }

      if (!db) {
        // Search mock data
        return mockContracts
          .filter(
            (c) =>
              c.title.toLowerCase().includes(input.query.toLowerCase()) ||
              c.simplifiedDescription
                .toLowerCase()
                .includes(input.query.toLowerCase())
          )
          .slice(0, input.limit);
      }

      try {
        const searchPattern = `%${input.query}%`;
        const results = await db
          .select()
          .from(contracts)
          .where(
            sql`${contracts.title} LIKE ${searchPattern}`
          )
          .limit(input.limit);

        return results || [];
      } catch (error) {
        console.error("[Contracts] Search failed:", error);
        return (mockContracts || [])
          .filter(
            (c) =>
              c.title.toLowerCase().includes(input.query.toLowerCase()) ||
              c.simplifiedDescription
                .toLowerCase()
                .includes(input.query.toLowerCase())
          )
          .slice(0, input.limit);
      }
    }),

  /**
   * Get contract details
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return mockContracts.find((c) => c.samId === input.id);
      }

      try {
        const idNum = parseInt(input.id);
        const result = await db
          .select()
          .from(contracts)
          .where(eq(contracts.id, idNum))
          .limit(1);

        return result[0];
      } catch (error) {
        console.error("[Contracts] Failed to get contract:", error);
        return mockContracts.find((c) => c.samId === input.id);
      }
    }),

  /**
   * Save contract for authenticated user
   */
  save: protectedProcedure
    .input(z.object({ contractId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        const contractIdNum = typeof input.contractId === 'string' ? parseInt(input.contractId) : input.contractId;
        
        await db.insert(savedContracts).values({
          userId: ctx.user.id,
          contractId: contractIdNum,
          status: 'saved',
        });

        return { success: true };
      } catch (error) {
        console.error("[Contracts] Failed to save contract:", error);
        return { success: false, error: "Failed to save contract" };
      }
    }),

  /**
   * Get saved contracts for user
   */
  getSaved: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const saved = await db
        .select()
        .from(savedContracts)
        .where(eq(savedContracts.userId, ctx.user.id));

      const contractIds = saved.map((s) => s.contractId);
      if (contractIds.length === 0) return [];

      // Fetch contract details for saved contracts
      if (contractIds.length === 0) return [];
      
      const contractDetails = await db
        .select()
        .from(contracts)
        .where(
          sql`${contracts.id} IN (${contractIds.join(',')})`
        );

      return contractDetails || [];
    } catch (error) {
      console.error("[Contracts] Failed to get saved contracts:", error);
      return [];
    }
  }),

  /**
   * Remove saved contract
   */
  removeSaved: protectedProcedure
    .input(z.object({ contractId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        // Parse contractId as number if it's a string
        const contractIdNum = typeof input.contractId === 'string' ? parseInt(input.contractId) : input.contractId;
        
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
        console.error("[Contracts] Failed to remove saved contract:", error);
        return { success: false, error: "Failed to remove contract" };
      }
    }),
});
