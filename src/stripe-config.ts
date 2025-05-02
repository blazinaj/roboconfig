export const STRIPE_PRODUCTS = {
  ROBOCONFIG: {
    priceId: 'price_1RJTlrD6jKJlFdN5yyI01Rn0', // Replace with your actual Stripe price ID
    name: 'RoboConfig',
    description: 'Professional robotics configuration and risk assessment platform',
    mode: 'subscription' as const
  }
} as const;