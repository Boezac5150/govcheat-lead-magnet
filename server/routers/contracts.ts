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
      try {
        // Always return mock contracts for now - database is empty
        console.log("[Contracts] Returning mock contracts, count:", mockContracts.length);
        
        let filtered = mockContracts;
        
        // Apply category filter
        if (input.category) {
          filtered = filtered.filter((c) => c.category === input.category);
        }
        
        // Apply value filters
        if (input.minValue !== undefined && input.minValue > 0) {
          filtered = filtered.filter((c) => c.value && c.value >= input.minValue);
        }
        if (input.maxValue !== undefined && input.maxValue > 0) {
          filtered = filtered.filter((c) => !c.value || c.value <= input.maxValue);
        }
        
        // Apply pagination
        return filtered.slice(input.offset, input.offset + input.limit);
        
      } catch (error) {
        console.error("[Contracts] Error in list:", error);
        return mockContracts.slice(input.offset, input.offset + input.limit);
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
      try {
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
      } catch (error) {
        console.error("[Contracts] Error in search:", error);
        return [];
      }
    }),

  /**
   * Get a single contract by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return mockContracts.find((c) => c.samId === input.id) || null;
      } catch (error) {
        console.error("[Contracts] Error in getById:", error);
        return null;
      }
    }),

  /**
   * Save a contract for authenticated users
   */
  save: protectedProcedure
    .input(z.object({ contractId: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        await db.insert(savedContracts).values({
          userId: ctx.user.id,
          contractId: input.contractId,
          createdAt: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error("[Contracts] Error saving contract:", error);
        throw error;
      }
    }),

  /**
   * Get saved contracts for authenticated user
   */
  getSaved: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];

    try {
      const db = await getDb();
      if (!db) return [];

      const saved = await db
        .select()
        .from(savedContracts)
        .where(eq(savedContracts.userId, ctx.user.id));

      return saved.map((s) => ({
        ...mockContracts.find((c) => c.samId === s.contractId),
        savedId: s.id,
      }));
    } catch (error) {
      console.error("[Contracts] Error getting saved contracts:", error);
      return [];
    }
  }),

  /**
   * Remove a saved contract
   */
  removeSaved: protectedProcedure
    .input(z.object({ contractId: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

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
        console.error("[Contracts] Error removing saved contract:", error);
        throw error;
      }
    }),
});
