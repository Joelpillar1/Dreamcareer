/**
 * Careerhut Whop Checkout & Plan Configuration
 * 
 * Replace the checkout URLs below with your live Whop checkout links from your Whop dashboard.
 */

export const WHOP_PLANS = {
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Founder Pass',
    price: '$9.99',
    billingPeriod: '/ lifetime',
    badge: 'Limited to First 50 People',
    description: 'One-time payment for lifetime access to all direct company portals.',
    features: [
      'Direct company career portals & ATS links',
      'Reachable hiring team contacts (where available)',
      'Lifetime access & all future updates (zero renewal fees)'
    ],
    // Replace with your real Whop checkout URL:
    whopCheckoutUrl: 'https://whop.com/checkout/careerhut-lifetime-access'
  }
};
