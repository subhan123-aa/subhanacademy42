import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { createOrderSchema } from "@/lib/schemas";
import { validateCoupon } from "@/lib/coupons";
import { getCourseById } from "@/lib/queries";

export async function POST(req: NextRequest) {
  try {
    const body = createOrderSchema.pick({ courseId: true, couponCode: true }).parse(await req.json());
    const course = await getCourseById(body.courseId);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const coupons = await getStore("coupons");
    const result = validateCoupon(coupons, body.couponCode ?? "", course);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const subtotal = course.price;
    return NextResponse.json({
      message: "Coupon applied successfully.",
      couponCode: result.coupon.code,
      discount: result.discount,
      subtotal,
      total: Math.max(0, subtotal - result.discount)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}

