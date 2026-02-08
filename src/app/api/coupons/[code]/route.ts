// src/app/api/coupons/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { isAdmin } from "@/constants/admin";
import { validateCoupon, deactivateCoupon } from "@/lib/services/couponService";

/**
 * GET /api/coupons/[code]
 * Validate a coupon code (public for redeem page).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const result = await validateCoupon(code);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 }
      );
    }

    // Return limited info (don't expose internal details)
    const coupon = result.coupon!;
    return NextResponse.json({
      valid: true,
      type: coupon.type,
      plan: coupon.plan,
      discountPercent: coupon.discountPercent,
      durationDays: coupon.durationDays,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coupons/[code]
 * Deactivate a coupon (admin only).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
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

    const { code } = await params;
    const result = await deactivateCoupon(code);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to deactivate coupon" },
      { status: 500 }
    );
  }
}
