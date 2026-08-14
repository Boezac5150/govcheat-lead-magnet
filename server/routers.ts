import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { createPasswordUser, getSubscriberCount, getAllSubscribers, getUserByEmail, insertSubscriber, touchUserSignIn } from "./db";
import { createSessionToken, hashPassword, verifyPassword } from "./_core/auth";
import { notifyOwner } from "./_core/notification";
import { sendSignupConfirmation } from "./_core/resendService";
import { pushLeadToGHL } from "./_core/ghlService";
import { stripeRouter } from "./routers/stripe";
import { dashboardRouter } from "./routers/dashboard";
import { notificationsRouter } from "./routers/notifications";
import { contractsRouter } from "./routers/contracts";
import { bidAnalysisRouter } from "./routers/bidAnalysis";
import { alertsRouter } from "./routers/alerts";
import { bidsRouter } from "./routers/bids";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  stripe: stripeRouter,
  dashboard: dashboardRouter,
  notifications: notificationsRouter,
  contracts: contractsRouter,
  bidAnalysis: bidAnalysisRouter,
  alerts: alertsRouter,
  bids: bidsRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      const user = opts.ctx.user;
      if (!user) return null;
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    }),
    register: publicProcedure
      .input(z.object({
        name: z.string().trim().min(2).max(120),
        email: z.string().email(),
        password: z.string().min(10).max(200),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) throw new Error("An account already exists for this email");
        const user = await createPasswordUser({
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
        });
        if (!user) throw new Error("Unable to create account");
        const token = await createSessionToken(user.id);
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 30 * 24 * 60 * 60 * 1000 });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1).max(200) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
          throw new Error("Invalid email or password");
        }
        await touchUserSignIn(user.id);
        const token = await createSessionToken(user.id);
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 30 * 24 * 60 * 60 * 1000 });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }),
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

        // Send confirmation email, push to HighLevel CRM, and notify owner (fire-and-forget)
        if (!result.alreadyExists) {
          // Push lead to HighLevel CRM (upsert contact + pipeline opportunity + welcome email)
          pushLeadToGHL({
            email: input.email,
            source: input.source,
          }).catch((err) => {
            console.error('[Subscriber] Failed to push lead to HighLevel:', err);
          });
          console.log(`[Subscriber] Attempting to send confirmation email to: ${input.email}`);
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
