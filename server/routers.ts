import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { insertSubscriber, getSubscriberCount, getAllSubscribers } from "./db";
import { notifyOwner } from "./_core/notification";
import { sendSignupConfirmation } from "./_core/emailService";
import { stripeRouter } from "./routers/stripe";
import { dashboardRouter } from "./routers/dashboard";
import { notificationsRouter } from "./routers/notifications";
import { contractsRouter } from "./routers/contracts";
import { bidAnalysisRouter } from "./routers/bidAnalysis";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  stripe: stripeRouter,
  dashboard: dashboardRouter,
  notifications: notificationsRouter,
  contracts: contractsRouter,
  bidAnalysis: bidAnalysisRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  subscriber: router({
    /** Public endpoint — anyone can subscribe with their email */
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("Please enter a valid email address"),
          source: z.string().optional().default("cheatsheet"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await insertSubscriber(input.email, input.source);

        // Send confirmation email and notify owner on new subscriber (fire-and-forget)
        if (!result.alreadyExists) {
          // Send welcome email
          sendSignupConfirmation(input.email).catch((err) => {
            console.error('[Subscriber] Failed to send confirmation email:', err);
          });
          // Notify owner
          notifyOwner({
            title: `New Subscriber: ${input.email}`,
            content: `A new lead just signed up for the GovCon Cheat Sheet.\n\nEmail: ${input.email}\nSource: ${input.source}\nTime: ${new Date().toISOString()}`,
          }).catch(() => {
            // Notification failure is non-critical
          });
        }

        return {
          success: result.success,
          message: result.alreadyExists
            ? "You're already on the list. Check your inbox!"
            : "You're in! Check your inbox for the cheat sheet.",
        };
      }),

    /** Admin-only: get total subscriber count */
    count: adminProcedure.query(async () => {
      const count = await getSubscriberCount();
      return { count };
    }),

    /** Admin-only: list all subscribers */
    list: adminProcedure.query(async () => {
      const subs = await getAllSubscribers();
      return subs;
    }),
  }),
});

export type AppRouter = typeof appRouter;
