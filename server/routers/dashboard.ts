import { protectedProcedure, router } from "../_core/trpc";
import { getUserSubscription, getUserPaymentHistory } from "../db";

export const dashboardRouter = router({
  /**
   * Get current subscription status for the logged-in user
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscription = await getUserSubscription(ctx.user.id);

      if (!subscription) {
        return {
          hasSubscription: false,
          subscription: null,
        };
      }

      return {
        hasSubscription: true,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          status: subscription.status,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          canceledAt: subscription.canceledAt,
          createdAt: subscription.createdAt,
        },
      };
    } catch (error) {
      console.error("[Dashboard] Failed to get subscription:", error);
      throw new Error("Failed to fetch subscription");
    }
  }),

  /**
   * Get payment history for the logged-in user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const payments = await getUserPaymentHistory(ctx.user.id);

      return {
        payments: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          description: p.description,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
        })),
        total: payments.length,
      };
    } catch (error) {
      console.error("[Dashboard] Failed to get payment history:", error);
      throw new Error("Failed to fetch payment history");
    }
  }),

  /**
   * Get subscription metrics (for dashboard summary)
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscription = await getUserSubscription(ctx.user.id);
      const payments = await getUserPaymentHistory(ctx.user.id);

      const paidPayments = payments.filter((p) => p.status === "paid");
      const totalSpent = paidPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        isSubscribed: subscription?.status === "active",
        tier: subscription?.tier || "scout",
        nextBillingDate: subscription?.currentPeriodEnd,
        totalPayments: payments.length,
        totalSpent: totalSpent / 100, // Convert cents to dollars
        lastPaymentDate: paidPayments.length > 0 ? paidPayments[paidPayments.length - 1]?.paidAt : null,
      };
    } catch (error) {
      console.error("[Dashboard] Failed to get metrics:", error);
      throw new Error("Failed to fetch metrics");
    }
  }),
});
