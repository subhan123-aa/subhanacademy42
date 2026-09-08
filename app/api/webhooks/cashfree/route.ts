import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { completeCashfreeOrder, verifyCashfreeWebhookSignature } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");
  if (!verifyCashfreeWebhookSignature(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, any>;
    const eventType = String(payload.type || payload.event || "").toUpperCase();
    const data = payload.data || {};
    const orderId = String(data.order?.order_id || data.order?.orderId || "");
    const paymentId = data.payment?.cf_payment_id ? String(data.payment.cf_payment_id) : undefined;
    const isSuccessful = eventType.includes("SUCCESS") || eventType.includes("SUCCESSFUL");
    if (!orderId || !isSuccessful) return NextResponse.json({ received: true });

    const orders = await getStore("orders");
    const order = orders.find((item) => item.providerOrderId === orderId);
    if (!order || order.status === "paid") return NextResponse.json({ received: true });

    await completeCashfreeOrder(order, paymentId);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
