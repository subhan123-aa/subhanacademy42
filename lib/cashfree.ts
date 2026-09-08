import crypto from "crypto";
import { getStore, saveStore } from "@/lib/data";
import type { Order } from "@/lib/types";

const CASHFREE_API_VERSION = "2025-01-01";
const CASHFREE_API_BASE_URL = "https://api.cashfree.com/pg";

function getCashfreeConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID?.trim();
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET?.trim();
  const environment = process.env.CASHFREE_ENVIRONMENT?.trim().toLowerCase();

  return {
    clientId,
    clientSecret,
    environment,
    baseUrl: CASHFREE_API_BASE_URL
  };
}

export function isCashfreeConfigured() {
  const { clientId, clientSecret, environment } = getCashfreeConfig();
  return Boolean(environment === "production" && clientId && clientSecret && !/^TEST/i.test(clientId));
}

async function cashfreeRequest(path: string, init?: RequestInit) {
  const { clientId, clientSecret, environment, baseUrl } = getCashfreeConfig();
  if (environment !== "production") throw new Error("Cashfree Production environment is required.");
  if (!clientId || !clientSecret) throw new Error("Cashfree Production credentials are not configured.");
  if (/^TEST/i.test(clientId)) throw new Error("A non-Production Cashfree App ID cannot be used for Production payments.");

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      ...(init?.headers ?? {})
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.message?.[0] || "Cashfree request failed.");
  }
  return data as Record<string, unknown>;
}

export async function createCashfreeOrder({
  orderId,
  amount,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  returnUrl,
  notifyUrl
}: {
  orderId: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
}) {
  const data = await cashfreeRequest("/orders", {
    method: "POST",
    headers: { "x-idempotency-key": orderId },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Number(amount.toFixed(2)),
      order_currency: "INR",
      order_note: "Subhan Academy course enrollment",
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: { return_url: returnUrl, notify_url: notifyUrl }
    })
  });

  return {
    orderId: String(data.order_id),
    paymentSessionId: String(data.payment_session_id)
  };
}

export async function isCashfreeOrderPaid(orderId: string) {
  const order = await cashfreeRequest(`/orders/${encodeURIComponent(orderId)}`);
  if (String(order.order_status).toUpperCase() === "PAID") {
    return { paid: true, paymentId: null };
  }

  const payments = await cashfreeRequest(`/orders/${encodeURIComponent(orderId)}/payments`);
  const successfulPayment = Array.isArray(payments)
    ? payments.find((payment) => String((payment as Record<string, unknown>).payment_status).toUpperCase() === "SUCCESS") as Record<string, unknown> | undefined
    : undefined;

  return {
    paid: Boolean(successfulPayment),
    paymentId: successfulPayment?.cf_payment_id ? String(successfulPayment.cf_payment_id) : null
  };
}

export function verifyCashfreeWebhookSignature(rawBody: string, signature: string | null, timestamp: string | null) {
  const secret = process.env.CASHFREE_CLIENT_SECRET?.trim();
  if (!secret || !signature || !timestamp) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}${rawBody}`).digest("base64");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function activateCourseEnrollment(userId: string, courseId: string, orderId: string) {
  const enrollments = await getStore("enrollments");
  const existing = enrollments.find((item) => item.userId === userId && item.courseId === courseId);

  if (existing) {
    existing.orderId = orderId;
    existing.enrolledAt = existing.enrolledAt || new Date().toISOString();
    existing.status = "active";
    existing.paymentStatus = "paid";
    await saveStore("enrollments", enrollments);
    return existing;
  }

  const enrollment = {
    id: crypto.randomUUID(),
    userId,
    courseId,
    orderId,
    enrolledAt: new Date().toISOString(),
    completedLessonIds: [],
    status: "active" as const,
    paymentStatus: "paid" as const
  };

  enrollments.push(enrollment);
  await saveStore("enrollments", enrollments);
  return enrollment;
}

export async function completeCashfreeOrder(order: Order, paymentId?: string | null) {
  const wasPaid = order.status === "paid";
  order.providerPaymentId = paymentId || order.providerPaymentId;
  order.status = "paid";
  order.paidAt = order.paidAt || new Date().toISOString();

  const orders = await getStore("orders");
  const storedOrder = orders.find((item) => item.id === order.id);
  if (storedOrder) {
    Object.assign(storedOrder, order);
    await saveStore("orders", orders);
  }

  const users = await getStore("users");
  const account = users.find((item) => item.id === order.userId);
  if (account?.pendingPayment) {
    account.pendingPayment = false;
    await saveStore("users", users);
  }

  await activateCourseEnrollment(order.userId, order.courseId, order.id);

  if (!wasPaid && order.couponCode) {
    const coupons = await getStore("coupons");
    const coupon = coupons.find((item) => item.code.toLowerCase() === order.couponCode?.toLowerCase());
    if (coupon) {
      coupon.usedCount += 1;
      await saveStore("coupons", coupons);
    }
  }
}
