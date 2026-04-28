import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications, getUserPushNotifications, getUserPushSubscriptions, insertPushNotification } from "../db";
import { sendPushNotificationBatch } from "../_core/pushService";

export const notificationsRouter = router({
  /**
   * Subscribe to push notifications
   * Protected: requires authenticated user
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        auth: z.string(),
        p256dh: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await subscribeToPushNotifications(ctx.user!.id, {
          userId: ctx.user!.id,
          endpoint: input.endpoint,
          auth: input.auth,
          p256dh: input.p256dh,
          userAgent: ctx.req.headers["user-agent"],
        });

        return { success: true };
      } catch (error: any) {
        console.error("[Notifications] Failed to subscribe:", error);
        throw new Error("Failed to subscribe to push notifications");
      }
    }),

  /**
   * Unsubscribe from push notifications
   * Protected: requires authenticated user
   */
  unsubscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await unsubscribeFromPushNotifications(ctx.user!.id, input.endpoint);
        return { success: true };
      } catch (error: any) {
        console.error("[Notifications] Failed to unsubscribe:", error);
        throw new Error("Failed to unsubscribe from push notifications");
      }
    }),

  /**
   * Get user's push notification subscriptions
   * Protected: requires authenticated user
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscriptions = await getUserPushSubscriptions(ctx.user!.id);
      return subscriptions;
    } catch (error: any) {
      console.error("[Notifications] Failed to get subscriptions:", error);
      return [];
    }
  }),

  /**
   * Get user's push notification history
   * Protected: requires authenticated user
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const notifications = await getUserPushNotifications(ctx.user!.id, input.limit);
        return notifications;
      } catch (error: any) {
        console.error("[Notifications] Failed to get history:", error);
        return [];
      }
    }),

  /**
   * Send push notification to a user
   * Admin only: for sending notifications to users
   */
  send: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        title: z.string().max(256),
        body: z.string(),
        icon: z.string().url().optional(),
        badge: z.string().url().optional(),
        tag: z.string().max(128).optional(),
        type: z.enum(["contract", "bid", "subscription", "payment", "alert", "info"]).default("info"),
        actionUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Store notification in database
        await insertPushNotification({
          userId: input.userId,
          title: input.title,
          body: input.body,
          icon: input.icon,
          badge: input.badge,
          tag: input.tag,
          type: input.type,
          actionUrl: input.actionUrl,
        });

        // Get user's push subscriptions
        const subscriptions = await getUserPushSubscriptions(input.userId);

        if (subscriptions.length > 0) {
          // Send push notifications to all user subscriptions
          const result = await sendPushNotificationBatch(subscriptions, {
            title: input.title,
            body: input.body,
            icon: input.icon,
            badge: input.badge,
            tag: input.tag,
            actionUrl: input.actionUrl,
          });

          console.log(`[Notifications] Sent to user ${input.userId}: ${result.successful} successful, ${result.failed} failed`);
        } else {
          console.log(`[Notifications] No push subscriptions found for user ${input.userId}`);
        }

        return { success: true };
      } catch (error: any) {
        console.error("[Notifications] Failed to send notification:", error);
        throw new Error("Failed to send notification");
      }
    }),
});
