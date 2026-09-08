import type { Course } from "@/lib/types";

export type CoursePricing = {
  originalPrice: number;
  offerPrice: number;
  discountAmount: number;
  discountPercent: number;
  hasDiscount: boolean;
  showDiscountDisplay: boolean;
};

function normalizeCurrency(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function getCoursePricing(course: Pick<Course, "price" | "oldPrice" | "showDiscountDisplay">): CoursePricing {
  const offerPrice = normalizeCurrency(course.price);
  const originalPrice = normalizeCurrency(course.oldPrice);
  const hasDiscount = originalPrice > offerPrice;
  const discountAmount = hasDiscount ? originalPrice - offerPrice : 0;
  const discountPercent = hasDiscount && originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  return {
    originalPrice,
    offerPrice,
    discountAmount,
    discountPercent,
    hasDiscount,
    showDiscountDisplay: course.showDiscountDisplay ?? true
  };
}
