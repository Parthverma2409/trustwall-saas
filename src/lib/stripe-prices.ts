// Map plan keys to Stripe Price IDs
// After creating products in Stripe Dashboard, paste the price IDs here
// Stripe Dashboard → Products → Create Product → Copy Price ID (starts with price_)
export const STRIPE_PRICES: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
}

// Reverse lookup: Stripe Price ID → plan key
export function getPlanFromPriceId(priceId: string): string {
  for (const [plan, id] of Object.entries(STRIPE_PRICES)) {
    if (id === priceId) return plan
  }
  return 'free'
}
