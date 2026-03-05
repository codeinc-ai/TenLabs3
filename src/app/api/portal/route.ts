// src/app/api/portal/route.ts
import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getExternalCustomerId: async () => {
    const { userId } = await auth();
    return userId || "";
  },
  server: process.env.POLAR_ENVIRONMENT?.trim() === "sandbox" ? "sandbox" : "production",
});
