import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/data";
import { activateCourseEnrollment, verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature");
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const event = String(payload.event ?? "");
  const paymentEntity = (payload as { payload?: { payment?: { entity?: Record<string, unknown> } } }).payload?.payment?.entity;
  const orderEntity = (payload as { payload?: { order?: { entity?: Record<string, unknown> } } }).payload?.order?.entity;
  const paymentId = paymentEntity && typeof paymentEntity.id === "string" ? paymentEntity.id : null;
  const orderId = paymentEntity && typeof paymentEntity.order_id === "string" ? paymentEntity.order_id : orderEntity && typeof orderEntity.id === "string" ? orderEntity.id : null;

  if (!orderId || !paymentId) {
    return NextResponse.json({ received: true });
  }

  const captured =
    event === "payment.captured" ||
    event === "payment.authorized" ||
    event === "order.paid" ||
    (paymentEntity && typeof paymentEntity.captured === "boolean" ? paymentEntity.captured : false);

  if (!captured) {
    return NextResponse.json({ received: true });
  }

  const orders = await getStore("orders");
  const order = orders.find((item) => item.providerOrderId === orderId || item.providerPaymentId === paymentId);

  if (!order) {
    return NextResponse.json({ received: true });
  }

  if (order.status === "paid") {
    return NextResponse.json({ received: true });
  }

  order.providerOrderId = orderId;
  order.providerPaymentId = paymentId;
  order.status = "paid";
  order.paidAt = new Date().toISOString();
  await saveStore("orders", orders);

  const users = await getStore("users");
  const account = users.find((item) => item.id === order.userId);
  if (account?.pendingPayment) {
    account.pendingPayment = false;
    await saveStore("users", users);
  }

  await activateCourseEnrollment(order.userId, order.courseId, order.id);

  return NextResponse.json({ received: true });
}
