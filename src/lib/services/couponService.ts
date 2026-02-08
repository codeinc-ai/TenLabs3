// src/lib/services/couponService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { Coupon, ICoupon } from "@/models/Coupon";
import { User } from "@/models/User";

/**
 * ==========================================
 * Create Coupon Input
 * ==========================================
 */
export interface CreateCouponInput {
  code: string;
  type: "direct_upgrade" | "discount";
  plan?: "starter" | "creator" | "pro";
  discountPercent?: number;
  maxUses: number;
  expiresAt: string; // ISO date
  durationDays: number;
  createdBy: string; // admin clerkId
}

/**
 * ==========================================
 * Coupon Validation Result
 * ==========================================
 */
export interface CouponValidation {
  valid: boolean;
  error?: string;
  coupon?: ICoupon;
}

/**
 * ==========================================
 * Redeem Result
 * ==========================================
 */
export interface RedeemResult {
  success: boolean;
  error?: string;
  type?: "direct_upgrade" | "discount";
  plan?: string;
  durationDays?: number;
  discountPercent?: number;
}

/**
 * ==========================================
 * Create Coupon (Admin)
 * ==========================================
 */
export async function createCoupon(
  input: CreateCouponInput
): Promise<{ success: boolean; coupon?: ICoupon; error?: string }> {
  try {
    await connectToDB();

    // Validate input
    if (input.type === "direct_upgrade" && !input.plan) {
      return { success: false, error: "Plan is required for direct_upgrade coupons" };
    }
    if (input.type === "discount" && (!input.discountPercent || input.discountPercent < 1 || input.discountPercent > 100)) {
      return { success: false, error: "Discount percent must be between 1 and 100" };
    }

    // Check for duplicate code
    const existing = await Coupon.findOne({ code: input.code.toUpperCase() });
    if (existing) {
      return { success: false, error: "A coupon with this code already exists" };
    }

    const coupon = await Coupon.create({
      code: input.code.toUpperCase(),
      type: input.type,
      plan: input.type === "direct_upgrade" ? input.plan : undefined,
      discountPercent: input.type === "discount" ? input.discountPercent : undefined,
      maxUses: input.maxUses,
      usedCount: 0,
      expiresAt: new Date(input.expiresAt),
      durationDays: input.durationDays,
      createdBy: input.createdBy,
      isActive: true,
    });

    return { success: true, coupon };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[couponService] Failed to create coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

/**
 * ==========================================
 * Validate Coupon
 * ==========================================
 * Checks if a coupon code is valid for redemption.
 */
export async function validateCoupon(code: string): Promise<CouponValidation> {
  try {
    await connectToDB();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "This coupon has been deactivated" };
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return { valid: false, error: "This coupon has expired" };
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }

    return { valid: true, coupon };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[couponService] Failed to validate coupon:", error);
    return { valid: false, error: "Failed to validate coupon" };
  }
}

/**
 * ==========================================
 * Redeem Coupon
 * ==========================================
 * Applies a coupon to a user account.
 */
export async function redeemCoupon(
  clerkId: string,
  code: string
): Promise<RedeemResult> {
  try {
    await connectToDB();

    // Validate coupon first
    const validation = await validateCoupon(code);
    if (!validation.valid || !validation.coupon) {
      return { success: false, error: validation.error || "Invalid coupon" };
    }

    const coupon = validation.coupon;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if user already has an active coupon
    if (user.appliedCoupon && user.couponExpiresAt && new Date(user.couponExpiresAt) > new Date()) {
      return { success: false, error: "You already have an active coupon. Wait until it expires or contact support." };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + coupon.durationDays);

    if (coupon.type === "direct_upgrade") {
      // Directly upgrade user's plan
      await User.updateOne(
        { clerkId },
        {
          $set: {
            plan: coupon.plan,
            appliedCoupon: coupon.code,
            couponExpiresAt: expiresAt,
            planExpiresAt: expiresAt,
            discountPercent: undefined,
          },
        }
      );
    } else {
      // Store discount for next checkout
      await User.updateOne(
        { clerkId },
        {
          $set: {
            appliedCoupon: coupon.code,
            couponExpiresAt: expiresAt,
            discountPercent: coupon.discountPercent,
          },
        }
      );
    }

    // Increment usage count
    await Coupon.updateOne(
      { _id: coupon._id },
      { $inc: { usedCount: 1 } }
    );

    return {
      success: true,
      type: coupon.type,
      plan: coupon.plan,
      durationDays: coupon.durationDays,
      discountPercent: coupon.discountPercent,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[couponService] Failed to redeem coupon:", error);
    return { success: false, error: "Failed to redeem coupon" };
  }
}

/**
 * ==========================================
 * Get Coupons (Admin)
 * ==========================================
 */
export async function getCoupons(
  options: { limit?: number; offset?: number } = {}
): Promise<{ coupons: ICoupon[]; total: number }> {
  try {
    await connectToDB();

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const [coupons, total] = await Promise.all([
      Coupon.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(),
    ]);

    return { coupons: coupons as unknown as ICoupon[], total };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[couponService] Failed to get coupons:", error);
    return { coupons: [], total: 0 };
  }
}

/**
 * ==========================================
 * Deactivate Coupon (Admin)
 * ==========================================
 */
export async function deactivateCoupon(
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const result = await Coupon.updateOne(
      { code: code.toUpperCase() },
      { $set: { isActive: false } }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: "Coupon not found" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[couponService] Failed to deactivate coupon:", error);
    return { success: false, error: "Failed to deactivate coupon" };
  }
}

/**
 * ==========================================
 * Get Coupon Stats (Admin)
 * ==========================================
 */
export async function getCouponStats(): Promise<{
  total: number;
  active: number;
  expired: number;
  totalRedemptions: number;
}> {
  try {
    await connectToDB();

    const now = new Date();
    const [total, active, expired, redemptionsResult] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true, expiresAt: { $gt: now } }),
      Coupon.countDocuments({ $or: [{ isActive: false }, { expiresAt: { $lte: now } }] }),
      Coupon.aggregate([{ $group: { _id: null, total: { $sum: "$usedCount" } } }]),
    ]);

    return {
      total,
      active,
      expired,
      totalRedemptions: redemptionsResult[0]?.total || 0,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[couponService] Failed to get coupon stats:", error);
    return { total: 0, active: 0, expired: 0, totalRedemptions: 0 };
  }
}
