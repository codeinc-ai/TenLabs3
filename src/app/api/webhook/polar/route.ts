// src/app/api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const POLAR_PRODUCT_PLAN_MAP: Record<string, "starter" | "creator" | "pro"> = {
  [process.env.POLAR_STARTER_PRODUCT_ID || ""]: "starter",
  [process.env.POLAR_CREATOR_PRODUCT_ID || ""]: "creator",
  [process.env.POLAR_PRO_PRODUCT_ID || ""]: "pro",
};

function getPlanFromProductId(productId: string): "starter" | "creator" | "pro" | null {
  return POLAR_PRODUCT_PLAN_MAP[productId] || null;
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionActive: async (payload) => {
    await connectToDB();
    const sub = payload.data;
    const plan = getPlanFromProductId(sub.productId);
    if (!plan) return;

    const externalId = sub.customer?.externalId;
    if (!externalId) return;

    await User.findOneAndUpdate(
      { clerkId: externalId },
      {
        $set: {
          plan,
          polarCustomerId: sub.customerId,
          polarSubscriptionId: sub.id,
          polarSubscriptionStatus: sub.status,
        },
      }
    );
  },

  onSubscriptionUpdated: async (payload) => {
    await connectToDB();
    const sub = payload.data;
    const plan = getPlanFromProductId(sub.productId);
    const externalId = sub.customer?.externalId;
    if (!externalId) return;

    const updateData: Record<string, unknown> = {
      polarSubscriptionStatus: sub.status,
    };
    if (plan) {
      updateData.plan = plan;
    }

    await User.findOneAndUpdate(
      { clerkId: externalId },
      { $set: updateData }
    );
  },

  onSubscriptionCanceled: async (payload) => {
    await connectToDB();
    const externalId = payload.data.customer?.externalId;
    if (!externalId) return;

    await User.findOneAndUpdate(
      { clerkId: externalId },
      {
        $set: {
          polarSubscriptionStatus: "canceled",
        },
      }
    );
  },

  onSubscriptionRevoked: async (payload) => {
    await connectToDB();
    const externalId = payload.data.customer?.externalId;
    if (!externalId) return;

    await User.findOneAndUpdate(
      { clerkId: externalId },
      {
        $set: {
          plan: "free",
          polarSubscriptionStatus: "revoked",
          polarSubscriptionId: null,
        },
      }
    );
  },

  onOrderCreated: async (payload) => {
    await connectToDB();
    const order = payload.data;
    const externalId = order.customer?.externalId;
    if (!externalId) return;

    await User.findOneAndUpdate(
      { clerkId: externalId },
      {
        $set: {
          polarCustomerId: order.customerId,
        },
      }
    );
  },

  onSubscriptionUncanceled: async (payload) => {
    await connectToDB();
    const externalId = payload.data.customer?.externalId;
    if (!externalId) return;

    await User.findOneAndUpdate(
      { clerkId: externalId },
      {
        $set: {
          polarSubscriptionStatus: "active",
        },
      }
    );
  },
});
