import env from "@config/env";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover", // pin to a specific version — important
  typescript: true,
});

export default stripe;
