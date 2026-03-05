// src/app/api/checkout/route.ts
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=success&checkout_id={CHECKOUT_ID}`,
  server: (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "production",
});
