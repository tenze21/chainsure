import type { PolicyTemplate } from "@database/models";
import stripe from "@config/stripe";

export async function createStripeProduct(template: PolicyTemplate, amount: number): Promise<string> {
  const product = await stripe.products.create({
    name: template.name,
    description: template.description,
    metadata: {
      templateId: template.id,
      category: template.category.name,
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(Number(amount) * 100),
    currency: "usd",
    recurring: {
      interval: template.billingCycle === "yearly" ? "year" : "month",
    },
    metadata: {
      templateId: template.id,
    },
  });

  return price.id;
}

export async function deleteStripeProduct(stripePriceId: string): Promise<void> {
  const price = await stripe.prices.retrieve(stripePriceId);
  const productId = price.product as string;

  await stripe.prices.update(stripePriceId, { active: false });
  await stripe.products.del(productId);
}
