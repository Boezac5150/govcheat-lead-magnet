import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { insertSubscriber, getSubscriberCount, getAllSubscribers } from "./db";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
        return {
          success: result.success,
          message: result.alreadyExists
            ? "You're already on the list. Check your inbox!"
            : "You're in! Check your inbox for the cheat sheet.",
        };
      }),

    /** Admin-only: get total subscriber count */
    count: protectedProcedure.query(async () => {
      const count = await getSubscriberCount();
      return { count };
    }),

    /** Admin-only: list all subscribers */
    list: protectedProcedure.query(async () => {
      const subs = await getAllSubscribers();
      return subs;
    }),
  }),
});

export type AppRouter = typeof appRouter;
