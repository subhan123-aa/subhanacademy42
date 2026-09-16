import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSchema } from "@/lib/schemas";
import { getStore } from "@/lib/data";
import { getRequestUser } from "@/lib/request-auth";
import { completeCashfreeOrder, isCashfreeOrderPaid } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req, true);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = verifyPaymentSchema.parse(await req.json());
    const orders = await getStore("orders");
    const order = orders.find(
      (item) =>
        (item.id === body.orderId ||
          item.providerOrderId === body.orderId ||
          (body.cashfreeOrderId && item.providerOrderId === body.cashfreeOrderId)) &&
        (item.userId === user.id || user.role === "admin")
    );

    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const courses = await getStore("courses");
    const course = courses.find((item) => item.id === order.courseId);

    // Payment bypass is intentionally disabled; Cashfree verification is required.
    const providerOrderId = body.cashfreeOrderId || order.providerOrderId;
    if (!providerOrderId) {
      return NextResponse.json({ error: "Order mismatch during payment verification." }, { status: 400 });
    }

    const payment = await isCashfreeOrderPaid(providerOrderId);
    if (!payment.paid) {
      return NextResponse.json({
        error: "Cashfree payment is not successful yet.",
        status: "pending",
        isPending: true
      }, { status: 400 });
    }

    order.providerOrderId = providerOrderId;
    await completeCashfreeOrder(order, body.cashfreePaymentId || payment.paymentId);

    return NextResponse.json({
      success: true,
      verified: true,
      status: "paid",
      message: "Payment verified and enrollment complete.",
      order: {
        id: order.id,
        courseId: order.courseId,
        courseTitle: course?.title || "SabjiHub Blueprint",
        courseSlug: course?.slug || "sabjihub-blueprint",
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        emailAddress: order.emailAddress,
        fullName: order.fullName
      },
      nextUrl: "/student/dashboard"
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
