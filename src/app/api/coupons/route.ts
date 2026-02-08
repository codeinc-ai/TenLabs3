// src/app/api/coupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { isAdmin } from "@/constants/admin";
import { getCoupons, createCoupon, getCouponStats } from "@/lib/services/couponService";

/**
 * GET /api/coupons
 * List all coupons (admin only).
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!isAdmin(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const [data, stats] = await Promise.all([
      getCoupons({ limit, offset }),
      getCouponStats(),
    ]);

    return NextResponse.json({ ...data, stats });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coupons
 * Create a new coupon (admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!isAdmin(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { code, type, plan, discountPercent, maxUses, expiresAt, durationDays } = body;

    if (!code || !type || !maxUses || !expiresAt || !durationDays) {
      return NextResponse.json(
        { error: "Missing required fields: code, type, maxUses, expiresAt, durationDays" },
        { status: 400 }
      );
    }

    const result = await createCoupon({
      code,
      type,
      plan,
      discountPercent,
      maxUses,
      expiresAt,
      durationDays,
      createdBy: userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, coupon: result.coupon });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
