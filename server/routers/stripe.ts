import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { STRIPE_PRODUCTS, type TierKey } from "../products";
import { ENV } from "../_core/env";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const stripeRouter = router({
  /**
   * Create a Stripe Checkout session for a given tier
   * Protected: requires authenticated user
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["operator", "contractor", "prime"] as const),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tier = STRIPE_PRODUCTS[input.tier as TierKey];

      if (!tier || !tier.priceId) {
        throw new Error(`Invalid tier: ${input.tier}`);
      }

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price: tier.priceId,
              quantity: 1,
            },
          ],
          customer_email: ctx.user?.email || undefined,
          client_reference_id: ctx.user?.id.toString(),
          metadata: {
            user_id: ctx.user?.id.toString() || "",
            customer_email: ctx.user?.email || "",
            customer_name: ctx.user?.name || "",
            tier: input.tier,
          },
          success_url: `${input.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&status=success`,
          cancel_url: `${input.origin}/thank-you?status=cancel`,
          allow_promotion_codes: true,
        });

        return {
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("[Stripe] Checkout session creation failed:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Retrieve checkout session details (for post-purchase verification)
   * Protected: requires authenticated user
   */
  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        return {
          id: session.id,
          status: session.payment_status,
          customer_email: session.customer_email,
          subscription: session.subscription,
          metadata: session.metadata,
        };
      } catch (error) {
        console.error("[Stripe] Failed to retrieve session:", error);
        throw new Error("Failed to retrieve checkout session");
      }
    }),
});
