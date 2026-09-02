import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { getRequestUser } from "@/lib/request-auth";
import { activateCourseEnrollment, verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req, true);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = verifyPaymentSchema.parse(await req.json());
    const orders = await getStore("orders");
    const order = orders.find((item) => item.id === body.orderId && item.userId === user.id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (order.status === "paid") {
      return NextResponse.json({ message: "Payment verified and enrollment complete.", nextUrl: "/student/dashboard" });
    }

    if (body.mode === "razorpay") {
      if (!body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
        order.status = "failed";
        await saveStore("orders", orders);
        return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
      }

      if (order.providerOrderId && order.providerOrderId !== body.razorpayOrderId) {
        order.status = "failed";
        await saveStore("orders", orders);
        return NextResponse.json({ error: "Order mismatch during payment verification." }, { status: 400 });
      }

      if (!verifyRazorpaySignature({
        orderId: body.razorpayOrderId,
        paymentId: body.razorpayPaymentId,
        signature: body.razorpaySignature
      })) {
        order.status = "failed";
        order.providerPaymentId = body.razorpayPaymentId;
        await saveStore("orders", orders);
        return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
      }

      order.providerOrderId = body.razorpayOrderId;
      order.providerPaymentId = body.razorpayPaymentId;
    }

    order.status = "paid";
    order.paidAt = new Date().toISOString();
    await saveStore("orders", orders);

    const users = await getStore("users");
    const account = users.find((item) => item.id === user.id);
    if (account?.pendingPayment) {
      account.pendingPayment = false;
      await saveStore("users", users);
    }

    await activateCourseEnrollment(user.id, order.courseId, order.id);

    if (order.couponCode) {
      const coupons = await getStore("coupons");
      const coupon = coupons.find((item) => item.code.toLowerCase() === order.couponCode?.toLowerCase());
      if (coupon) {
        coupon.usedCount += 1;
        await saveStore("coupons", coupons);
      }
    }

    return NextResponse.json({ message: "Payment verified and enrollment complete.", nextUrl: "/student/dashboard" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
