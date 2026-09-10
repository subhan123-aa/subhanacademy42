import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { completeCashfreeOrder, isCashfreeOrderPaid } from "@/lib/cashfree";
import { authCookieName, signSession } from "@/lib/auth";

function redirectToCheckout(
  req: NextRequest,
  course: string | null,
  orderId: string,
  step: 1 | 2,
  status: string
) {
  const url = new URL("/checkout", req.url);
  if (course) url.searchParams.set("course", course);
  if (orderId) url.searchParams.set("order_id", orderId);
  url.searchParams.set("step", String(step));
  url.searchParams.set("payment_status", status);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const providerOrderId = params.get("order_id") || params.get("cashfree_order_id") || params.get("order_ref");
  const orderRef = params.get("order_ref");
  const courseSlug = params.get("course");

  if (!providerOrderId && !orderRef) {
    return redirectToCheckout(req, courseSlug, "", 1, "invalid_order");
  }

  try {
    const orders = await getStore("orders");
    const order = orders.find(
      (item) =>
        (orderRef && item.id === orderRef) ||
        (providerOrderId && (item.id === providerOrderId || item.providerOrderId === providerOrderId))
    );

    if (!order) {
      console.warn(`[payments/cashfree/return] Order not found for order_id='${providerOrderId}', order_ref='${orderRef}'`);
      return redirectToCheckout(req, courseSlug, providerOrderId || orderRef || "", 1, "order_not_found");
    }

    const courses = await getStore("courses");
    const course = courses.find((item) => item.id === order.courseId);
    const resolvedSlug = course?.slug || courseSlug || "sabjihub-blueprint";
    const cfOrderId = order.providerOrderId || providerOrderId;

    // Server-side verification: Check actual Cashfree payment status if not already marked paid
    if (order.status !== "paid") {
      if (!cfOrderId) {
        return redirectToCheckout(req, resolvedSlug, order.id, 1, "order_mismatch");
      }

      const payment = await isCashfreeOrderPaid(cfOrderId);
      if (!payment.paid) {
        console.warn(`[payments/cashfree/return] Cashfree payment check not paid for cfOrderId='${cfOrderId}'`);
        return redirectToCheckout(req, resolvedSlug, order.id, 1, "pending");
      }

      await completeCashfreeOrder(order, payment.paymentId);
    }

    // Payment is verified and CONFIRMED: Redirect to STEP 2
    const redirectUrl = new URL("/checkout", req.url);
    redirectUrl.searchParams.set("course", resolvedSlug);
    redirectUrl.searchParams.set("order_id", order.id);
    redirectUrl.searchParams.set("step", "2");
    redirectUrl.searchParams.set("payment_status", "success");

    const response = NextResponse.redirect(redirectUrl);

    // Re-establish or refresh authenticated user session cookie for smooth transition
    try {
      const users = await getStore("users");
      const user = users.find((item) => item.id === order.userId);
      if (user) {
        const token = signSession(user);
        const forwardedProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
        const isHttps = req.nextUrl.protocol === "https:" || forwardedProto.includes("https") || process.env.NODE_ENV === "production";
        response.cookies.set(authCookieName(), token, {
          httpOnly: true,
          sameSite: "lax",
          secure: isHttps,
          path: "/",
          maxAge: 60 * 60 * 24 * 7
        });
      }
    } catch {
      // Non-critical session sync error
    }

    return response;
  } catch (error) {
    console.error("[payments/cashfree/return] Unexpected error:", error);
    return redirectToCheckout(req, courseSlug, providerOrderId || orderRef || "", 1, "error");
  }
}
