import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bids, bidStatusHistory } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const bidsRouter = router({
  /**
   * Create a new bid on a contract
   */
  create: protectedProcedure
    .input(
      z.object({
        contractId: z.string(),
        contractTitle: z.string(),
        contractValue: z.number().optional(),
        bidAmount: z.number(),
        bidNotes: z.string().optional(),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(bids).values({
          userId: ctx.user.id,
          contractId: input.contractId,
          contractTitle: input.contractTitle,
          contractValue: input.contractValue,
          bidAmount: input.bidAmount,
          bidNotes: input.bidNotes,
          deadline: input.deadline,
          bidStatus: "active",
        } as any);

        return { success: true, bidId: (result as any).insertId };
      } catch (error) {
        console.error("[Bids] Error creating bid:", error);
        throw error;
      }
    }),

  /**
   * Get all bids for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "won", "lost", "working_on", "submitted"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        let query = db.select().from(bids).where(eq(bids.userId, ctx.user.id));

        if (input.status) {
          query = db
            .select()
            .from(bids)
            .where(and(eq(bids.userId, ctx.user.id), eq(bids.bidStatus, input.status)));
        }

        const allBids = await query;
        return allBids.slice(input.offset, input.offset + input.limit);
      } catch (error) {
        console.error("[Bids] Error listing bids:", error);
        return [];
      }
    }),

  /**
   * Get a single bid by ID
   */
  getById: protectedProcedure
    .input(z.object({ bidId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const bid = await db
          .select()
          .from(bids)
          .where(and(eq(bids.id, input.bidId), eq(bids.userId, ctx.user.id)))
          .limit(1);

        return bid[0] || null;
      } catch (error) {
        console.error("[Bids] Error getting bid:", error);
        return null;
      }
    }),

  /**
   * Update bid status (active, won, lost, working_on, submitted)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        bidId: z.number(),
        newStatus: z.enum(["active", "won", "lost", "working_on", "submitted"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get current bid
        const bid = await db
          .select()
          .from(bids)
          .where(and(eq(bids.id, input.bidId), eq(bids.userId, ctx.user.id)))
          .limit(1);

        if (!bid[0]) {
          throw new Error("Bid not found");
        }

        const oldStatus = bid[0].bidStatus;

        // Update bid status
        await db
          .update(bids)
          .set({ bidStatus: input.newStatus })
          .where(eq(bids.id, input.bidId));

        // Log status change
        await db.insert(bidStatusHistory).values({
          bidId: input.bidId,
          userId: ctx.user.id,
          oldStatus,
          newStatus: input.newStatus,
          notes: input.notes,
        } as any);

        return { success: true };
      } catch (error) {
        console.error("[Bids] Error updating status:", error);
        throw error;
      }
    }),

  /**
   * Update bid notes
   */
  updateNotes: protectedProcedure
    .input(
      z.object({
        bidId: z.number(),
        bidNotes: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(bids)
          .set({ bidNotes: input.bidNotes })
          .where(and(eq(bids.id, input.bidId), eq(bids.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Bids] Error updating notes:", error);
        throw error;
      }
    }),

  /**
   * Delete a bid
   */
  delete: protectedProcedure
    .input(z.object({ bidId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .delete(bids)
          .where(and(eq(bids.id, input.bidId), eq(bids.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Bids] Error deleting bid:", error);
        throw error;
      }
    }),

  /**
   * Get bid statistics for user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userBids = await db.select().from(bids).where(eq(bids.userId, ctx.user.id));

      const stats = {
        totalBids: userBids.length,
        activeBids: userBids.filter((b: any) => b.bidStatus === "active").length,
        wonBids: userBids.filter((b: any) => b.bidStatus === "won").length,
        lostBids: userBids.filter((b: any) => b.bidStatus === "lost").length,
        workingOn: userBids.filter((b: any) => b.bidStatus === "working_on").length,
        totalBidValue: userBids.reduce((sum: number, b: any) => sum + (b.bidAmount || 0), 0),
        totalWonValue: userBids
          .filter((b: any) => b.bidStatus === "won")
          .reduce((sum: number, b: any) => sum + (b.bidAmount || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error("[Bids] Error getting stats:", error);
      return {
        totalBids: 0,
        activeBids: 0,
        wonBids: 0,
        lostBids: 0,
        workingOn: 0,
        totalBidValue: 0,
        totalWonValue: 0,
      };
    }
  }),
});
