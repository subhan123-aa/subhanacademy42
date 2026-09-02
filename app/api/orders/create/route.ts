import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { getRequestUser } from "@/lib/request-auth";
import { validateCoupon } from "@/lib/coupons";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req, true);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = createOrderSchema.parse(await req.json());
    const courses = await getStore("courses");
    const course = courses.find((item) => item.id === body.courseId || item.slug === body.courseId);
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const coupons = await getStore("coupons");
    let discount = 0;
    const couponCode = body.couponCode?.trim();
    let coupon = null;
    if (couponCode) {
      const result = validateCoupon(coupons, couponCode, course);
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      coupon = result.coupon;
      discount = result.discount;
    }

    const subtotal = course.price;
    const total = Math.max(0, subtotal - discount);
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured in this environment." }, { status: 503 });
    }

    const order = {
      id: crypto.randomUUID(),
      userId: user.id,
      courseId: course.id,
      couponCode: coupon?.code,
      referralCode: body.referralCode,
      fullName: body.fullName,
      mobileNumber: body.mobileNumber,
      emailAddress: body.emailAddress,
      country: body.country,
      state: body.state,
      subtotal,
      discount,
      total,
      status: "created" as const,
      providerOrderId: "",
      createdAt: new Date().toISOString()
    };

    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: order.id,
      notes: {
        userId: user.id,
        courseId: course.id,
        orderId: order.id,
        emailAddress: body.emailAddress
      }
    });

    order.providerOrderId = razorpayOrder.id;

    const orders = await getStore("orders");
    orders.push(order);
    await saveStore("orders", orders);

    return NextResponse.json({
      provider: "razorpay",
      razorpayKeyId: keyId,
      order,
      orderSummary: { subtotal, discount, total }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
