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
    const order = orders.find((item) => item.id === body.orderId && item.userId === user.id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (order.status === "paid") {
      await completeCashfreeOrder(order);
      return NextResponse.json({ message: "Payment verified and enrollment complete.", nextUrl: "/student/dashboard" });
    }

    const providerOrderId = body.cashfreeOrderId || order.providerOrderId;
    if (!providerOrderId || providerOrderId !== order.providerOrderId) {
      return NextResponse.json({ error: "Order mismatch during payment verification." }, { status: 400 });
    }
    const payment = await isCashfreeOrderPaid(providerOrderId);
    if (!payment.paid) return NextResponse.json({ error: "Cashfree payment is not successful yet." }, { status: 400 });
    order.providerOrderId = providerOrderId;
    await completeCashfreeOrder(order, body.cashfreePaymentId || payment.paymentId);

    return NextResponse.json({ message: "Payment verified and enrollment complete.", nextUrl: "/student/dashboard" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
