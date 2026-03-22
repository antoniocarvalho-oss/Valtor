// Stripe Products & Prices for Clube Valtor
// Prices in centavos (BRL)

export const STRIPE_PRODUCTS = {
  clubeValtor: {
    name: "Clube Valtor",
    description: "Assinatura mensal do Clube Valtor — acesso a todas as ferramentas premium, extensão Chrome e análises avançadas.",
    priceMonthly: 4780, // R$ 47,80 in centavos (12x de R$ 47,80 = R$ 573,60/ano)
    currency: "brl",
    interval: "month" as const,
  },
};

// Price ID cache — populated at runtime when creating checkout sessions
// In production, create a Price in Stripe Dashboard and hardcode the ID here
// e.g. export const CLUBE_VALTOR_PRICE_ID = "price_xxxxx";
