import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { getRequestUser } from "@/lib/request-auth";
import { completeCashfreeOrder, isCashfreeOrderPaid } from "@/lib/cashfree";

function redirectToCheckout(req: NextRequest, course: string | null, orderId: string, status: string) {
  const url = new URL("/checkout", req.url);
  if (course) url.searchParams.set("course", course);
  url.searchParams.set("order_id", orderId);
  url.searchParams.set("payment_status", status);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const providerOrderId = params.get("order_id") || params.get("cashfree_order_id");
  const course = params.get("course");
  if (!providerOrderId) return redirectToCheckout(req, course, "", "error");

  try {
    const user = await getRequestUser(req, true);
    if (!user) return redirectToCheckout(req, course, providerOrderId, "login_required");

    const orders = await getStore("orders");
    const order = orders.find((item) => item.userId === user.id && (item.id === providerOrderId || item.providerOrderId === providerOrderId));
    if (!order || !order.providerOrderId) return redirectToCheckout(req, course, providerOrderId, "error");

    if (order.status !== "paid") {
      const payment = await isCashfreeOrderPaid(order.providerOrderId);
      if (!payment.paid) return redirectToCheckout(req, course, providerOrderId, "pending");
      await completeCashfreeOrder(order, payment.paymentId);
    } else {
      await completeCashfreeOrder(order);
    }

    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  } catch {
    return redirectToCheckout(req, course, providerOrderId, "error");
  }
}
