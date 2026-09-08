import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { getRequestUser } from "@/lib/request-auth";
import { validateCoupon } from "@/lib/coupons";
import { createCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";

const PRODUCTION_BASE_URL = "https://subhanacademy42-main.vercel.app";

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
    if (!isCashfreeConfigured()) {
      return NextResponse.json({ error: "Cashfree is not configured in this environment." }, { status: 503 });
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

    // Cashfree callbacks use the canonical Vercel domain in production and the
    // active dev-server origin locally.
    const requestOrigin = new URL(req.url).origin;
    const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    if (process.env.NODE_ENV === "production") {
      const productionBaseUrl = configuredBaseUrl || PRODUCTION_BASE_URL;
      let parsedBaseUrl: URL | null = null;
      try {
        parsedBaseUrl = new URL(productionBaseUrl);
      } catch {
        parsedBaseUrl = null;
      }

      if (
        !parsedBaseUrl ||
        parsedBaseUrl.protocol !== "https:" ||
        parsedBaseUrl.origin !== PRODUCTION_BASE_URL
      ) {
        throw new Error(`NEXT_PUBLIC_BASE_URL must be ${PRODUCTION_BASE_URL} in production.`);
      }
    }
    const baseUrl = process.env.NODE_ENV === "production" ? PRODUCTION_BASE_URL : requestOrigin;
    const cashfreeOrder = await createCashfreeOrder({
      orderId: order.id,
      amount: total,
      customerId: user.id,
      customerName: body.fullName,
      customerEmail: body.emailAddress,
      customerPhone: body.mobileNumber,
      returnUrl: `${baseUrl}/api/payments/cashfree/return?course=${encodeURIComponent(course.slug)}&order_ref=${encodeURIComponent(order.id)}&order_id={order_id}`,
      notifyUrl: `${baseUrl}/api/webhooks/cashfree`
    });

    order.providerOrderId = cashfreeOrder.orderId;

    const orders = await getStore("orders");
    orders.push(order);
    await saveStore("orders", orders);

    return NextResponse.json({
      provider: "cashfree",
      cashfreePaymentSessionId: cashfreeOrder.paymentSessionId,
      order,
      orderSummary: { subtotal, discount, total }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
