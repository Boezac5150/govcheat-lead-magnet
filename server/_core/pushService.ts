import webpush from "web-push";
import { ENV } from "./env";

// Configure web-push with VAPID keys
if (process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VITE_VAPID_PUBLIC_KEY || "",
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actionUrl?: string;
}

/**
 * Send a push notification to a user's subscription
 */
export async function sendPushNotification(
  subscription: any,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    if (!process.env.VAPID_PRIVATE_KEY) {
      console.warn("[Push Service] VAPID_PRIVATE_KEY not configured, skipping push");
      return false;
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      data: {
        ...payload.data,
        actionUrl: payload.actionUrl,
      },
    });

    await webpush.sendNotification(subscription, pushPayload);
    console.log("[Push Service] Notification sent successfully");
    return true;
  } catch (error: any) {
    if (error.statusCode === 410) {
      // Subscription expired or invalid
      console.log("[Push Service] Subscription expired, should be removed");
      return false;
    }

    console.error("[Push Service] Failed to send notification:", error.message);
    throw error;
  }
}

/**
 * Send push notifications to multiple subscriptions
 */
export async function sendPushNotificationBatch(
  subscriptions: any[],
  payload: PushNotificationPayload
): Promise<{ successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    try {
      const sent = await sendPushNotification(subscription, payload);
      if (sent) {
        successful++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  console.log(`[Push Service] Batch complete: ${successful} successful, ${failed} failed`);
  return { successful, failed };
}
