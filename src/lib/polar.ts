// src/lib/polar.ts
import { Polar } from "@polar-sh/sdk";

const environment = process.env.POLAR_ENVIRONMENT?.trim() === "sandbox" ? "sandbox" : "production";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: environment,
});
