import type { Course, Coupon } from "@/lib/types";

export function calculateCouponDiscount(course: Course, coupon: Coupon) {
  return coupon.type === "percent"
    ? Math.round((course.price * coupon.value) / 100)
    : Math.min(coupon.value, course.price);
}

export function validateCoupon(
  coupons: Coupon[],
  code: string,
  course: Course
): { coupon: Coupon; discount: number } | { error: string } {
  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return { error: "Enter a coupon code first." };
  }

  const coupon = coupons.find((item) => item.code.toLowerCase() === trimmedCode.toLowerCase());
  if (!coupon) {
    return { error: "Invalid coupon code. Please check and try again." };
  }

  if (!coupon.active) {
    return { error: "This coupon is currently inactive." };
  }

  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { error: "This coupon has expired." };
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { error: "This coupon has reached its usage limit." };
  }

  return {
    coupon,
    discount: calculateCouponDiscount(course, coupon)
  };
}

