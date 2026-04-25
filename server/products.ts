/**
 * Stripe Product & Price Configuration
 * All IDs are from live Stripe mode
 */

export const STRIPE_PRODUCTS = {
  scout: {
    name: "GovCheat Scout",
    priceId: null, // Free tier - no Stripe price
    description: "Start learning the game",
  },
  operator: {
    name: "GovCheat Operator",
    productId: "prod_UOir36yWFSI6Lz",
    priceId: "price_1TPvQJJVJchndhWxook6uPjI",
    amount: 2900, // $29.00 in cents
    description: "Find and bid on contracts",
  },
  contractor: {
    name: "GovCheat Contractor",
    productId: "prod_UOir66TX2o6IuT",
    priceId: "price_1TPvQQJVJchndhWxbTZ2JTTV",
    amount: 7900, // $79.00 in cents
    description: "Win consistently",
  },
  prime: {
    name: "GovCheat Prime",
    productId: "prod_UOirZ0N8ZQQo9i",
    priceId: "price_1TPvQXJVJchndhWxM2cjzgTM",
    amount: 29900, // $299.00 in cents
    description: "Dominate your NAICS codes",
  },
} as const;

export type TierKey = keyof typeof STRIPE_PRODUCTS;

export function getTierByPriceId(priceId: string): TierKey | null {
  for (const [key, tier] of Object.entries(STRIPE_PRODUCTS)) {
    if (tier.priceId === priceId) {
      return key as TierKey;
    }
  }
  return null;
}
