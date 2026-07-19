import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { contractAlerts, alertHistory, contracts } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendContractAlert, sendEmail } from "../_core/resendService";
import { TRPCError } from "@trpc/server";
import { users } from "../../drizzle/schema";

export const alertsRouter = router({
  /**
   * Create a new contract alert for the user
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Alert name required"),
        searchKeywords: z.array(z.string()).min(1, "At least one keyword required"),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
        category: z.string().optional(),
        setAside: z.string().optional(),
        emailFrequency: z.enum(["daily", "weekly", "instantly"]).default("daily"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(contractAlerts).values({
        userId: ctx.user.id,
        name: input.name,
        searchKeywords: JSON.stringify(input.searchKeywords),
        minValue: input.minValue,
        maxValue: input.maxValue,
        difficulty: input.difficulty,
        category: input.category,
        setAside: input.setAside,
        emailFrequency: input.emailFrequency,
        minTierRequired: "scout",
      });

      return { success: true };
    }),

  /**
   * Get all alerts for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userAlerts = await db
      .select()
      .from(contractAlerts)
      .where(eq(contractAlerts.userId, ctx.user.id));

    return userAlerts.map((alert) => ({
      ...alert,
      searchKeywords: JSON.parse(alert.searchKeywords),
    }));
  }),

  /**
   * Update an alert
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        searchKeywords: z.array(z.string()).optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
        category: z.string().optional(),
        setAside: z.string().optional(),
        emailFrequency: z.enum(["daily", "weekly", "instantly"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const alert = await db
        .select()
        .from(contractAlerts)
        .where(eq(contractAlerts.id, input.id));

      if (!alert[0] || alert[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.searchKeywords) updateData.searchKeywords = JSON.stringify(input.searchKeywords);
      if (input.minValue !== undefined) updateData.minValue = input.minValue;
      if (input.maxValue !== undefined) updateData.maxValue = input.maxValue;
      if (input.difficulty) updateData.difficulty = input.difficulty;
      if (input.category) updateData.category = input.category;
      if (input.setAside) updateData.setAside = input.setAside;
      if (input.emailFrequency) updateData.emailFrequency = input.emailFrequency;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await db
        .update(contractAlerts)
        .set(updateData)
        .where(eq(contractAlerts.id, input.id));

      return { success: true };
    }),

  /**
   * Delete an alert
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const alert = await db
        .select()
        .from(contractAlerts)
        .where(eq(contractAlerts.id, input.id));

      if (!alert[0] || alert[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.delete(contractAlerts).where(eq(contractAlerts.id, input.id));

      return { success: true };
    }),

  /**
   * Check for new contracts matching an alert and send email
   * This would typically be called by a scheduled job
   */
  checkAndNotify: publicProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const alert = await db
        .select()
        .from(contractAlerts)
        .where(and(eq(contractAlerts.id, input.alertId), eq(contractAlerts.isActive, true)));

      if (!alert[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const alertData = alert[0];
      const keywords = JSON.parse(alertData.searchKeywords);

      // Build WHERE conditions
      const conditions: any[] = [eq(contracts.isActive, true)];

      if (alertData.minValue) {
        conditions.push(gte(contracts.value, alertData.minValue));
      }
      if (alertData.maxValue) {
        conditions.push(lte(contracts.value, alertData.maxValue));
      }
      if (alertData.difficulty) {
        conditions.push(eq(contracts.difficulty, alertData.difficulty));
      }
      if (alertData.category) {
        conditions.push(eq(contracts.category, alertData.category));
      }
      if (alertData.setAside) {
        conditions.push(eq(contracts.setAside, alertData.setAside));
      }

      const matchingContracts = await db
        .select()
        .from(contracts)
        .where(and(...conditions));

      // Filter by keywords in title/description
      const filteredContracts = matchingContracts.filter((contract) =>
        keywords.some(
          (keyword: string) =>
            contract.title.toLowerCase().includes(keyword.toLowerCase()) ||
            contract.simplifiedDescription.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (filteredContracts.length === 0) {
        return { matched: 0, sent: false };
      }

      // Send email
      const contractList = filteredContracts
        .map(
          (c) =>
            `<li><strong>${c.title}</strong> - $${(c.value ? (c.value / 1000).toFixed(0) : 'N/A')}K (${c.agency})</li>`
        )
        .join("");

      const emailBody = `
        <h2>New Contracts Matching Your Alert: ${alertData.name}</h2>
        <p>We found ${filteredContracts.length} new contract(s) matching your search criteria:</p>
        <ul>${contractList}</ul>
        <p><a href="https://govcheat.com/contracts">View all contracts</a></p>
      `;

      // Get user email from users table
      const userRecords = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, alertData.userId));

      if (userRecords[0]?.email) {
        // Send alert email to user
        await sendEmail({
          to: userRecords[0].email,
          subject: `${filteredContracts.length} New Contracts Match Alert: ${alertData.name}`,
          html: emailBody,
        });
      }

      // Record in alert history
      for (const contract of filteredContracts) {
        await db.insert(alertHistory).values({
          alertId: alertData.id,
          contractId: contract.id,
        });
      }

      // Update last alert sent time
      await db
        .update(contractAlerts)
        .set({ lastAlertSentAt: new Date() })
        .where(eq(contractAlerts.id, alertData.id));

      return { matched: filteredContracts.length, sent: true };
    }),
});
