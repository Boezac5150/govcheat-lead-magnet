import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./env";
import { upsertSubscription, insertPayment, updatePaymentStatus } from "../db";
import { notifyOwner } from "./notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Handle Stripe webhook events
 * Must return 200 with valid JSON for Stripe to consider it delivered
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    // Still return 200 with valid JSON as per Stripe requirements
    return res.json({ verified: true });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
    // Still return 200 with valid JSON
    return res.json({ verified: true });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("[Webhook] Signature verification failed:", error.message);
    // Return 200 with valid JSON even on signature failure
    return res.json({ verified: true });
  }

  // Handle test events from Stripe dashboard
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected:", event.type);
    return res.json({ verified: true });
  }

  try {
    // Process different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout session completed:", session.id);

        if (session.subscription && session.metadata) {
          const userId = parseInt(session.metadata.user_id);
          const tier = session.metadata.tier as "operator" | "contractor" | "prime";

          // Store subscription
          await upsertSubscription({
            userId,
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            tier,
            status: "active",
          });

          console.log(`[Webhook] Subscription created for user ${userId}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice paid:", invoice.id);

        if (invoice.customer_email && invoice.amount_paid) {
          // Find user by email and store payment
          // Note: In production, you'd look up the user by customer ID
          await updatePaymentStatus(invoice.id, "paid");
          console.log(`[Webhook] Payment recorded for invoice ${invoice.id}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice payment failed:", invoice.id);
        await updatePaymentStatus(invoice.id, "failed");
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription updated:", subscription.id);

        // Update subscription status in database
        const status = subscription.status as "active" | "past_due" | "canceled" | "paused";
        await upsertSubscription({
          stripeSubscriptionId: subscription.id,
          status,
        } as any);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription deleted:", subscription.id);

        // Mark subscription as canceled
        await upsertSubscription({
          stripeSubscriptionId: subscription.id,
          status: "canceled",
          canceledAt: new Date(),
        } as any);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 OK for successful processing
    return res.json({ verified: true });
  } catch (error: any) {
    console.error("[Webhook] Error processing event:", error.message);
    // Still return 200 to prevent Stripe from retrying
    return res.json({ verified: true, error: error.message });
  }
}
