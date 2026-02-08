// src/models/Coupon.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * ==========================================
 * Coupon Document Interface
 * ==========================================
 * Defines the TypeScript type for a Coupon document in MongoDB.
 *
 * type "direct_upgrade" – redeems a plan for durationDays
 * type "discount"       – gives discountPercent off next upgrade
 */
export interface ICoupon extends Document {
  /** Unique coupon code (uppercase, e.g. "TENLABS2026") */
  code: string;
  /** Coupon type: direct plan upgrade or percentage discount */
  type: "direct_upgrade" | "discount";
  /** Target plan (required for direct_upgrade) */
  plan?: "starter" | "creator" | "pro";
  /** Discount percentage 1-100 (required for discount type) */
  discountPercent?: number;
  /** Maximum number of times this coupon can be redeemed */
  maxUses: number;
  /** How many times this coupon has been redeemed so far */
  usedCount: number;
  /** When this coupon expires and can no longer be redeemed */
  expiresAt: Date;
  /** How many days the plan/discount lasts once redeemed */
  durationDays: number;
  /** Clerk ID of the admin who created this coupon */
  createdBy: string;
  /** Whether the coupon is currently active */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Coupon Schema
 * ==========================================
 */
const CouponSchema: Schema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["direct_upgrade", "discount"],
      required: true,
    },
    plan: {
      type: String,
      enum: ["starter", "creator", "pro"],
    },
    discountPercent: {
      type: Number,
      min: 1,
      max: 100,
    },
    maxUses: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by code
CouponSchema.index({ code: 1 });
// Index for admin listing (active + expiry)
CouponSchema.index({ isActive: 1, expiresAt: 1 });

export const Coupon =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
