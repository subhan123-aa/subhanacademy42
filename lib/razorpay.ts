import crypto from "crypto";
import { getStore, saveStore } from "@/lib/data";

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID?.trim() || null;
}

export function getRazorpayWebhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || null;
}

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return false;
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (!signature || expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function createRazorpayOrder({
  amount,
  currency,
  receipt,
  notes,
  payment_capture = 1
}: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
  payment_capture?: number;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes,
      payment_capture
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const description = data?.error?.description || "Razorpay order creation failed.";
    throw new Error(description);
  }

  return {
    id: String(data.id),
    amount: Number(data.amount),
    currency: String(data.currency),
    receipt: String(data.receipt),
    status: String(data.status)
  };
}

export async function activateCourseEnrollment(userId: string, courseId: string, orderId: string) {
  const enrollments = await getStore("enrollments");
  const existing = enrollments.find((item) => item.userId === userId && item.courseId === courseId);

  if (existing) {
    existing.orderId = orderId;
    existing.enrolledAt = existing.enrolledAt || new Date().toISOString();
    await saveStore("enrollments", enrollments);
    return existing;
  }

  const enrollment = {
    id: crypto.randomUUID(),
    userId,
    courseId,
    orderId,
    enrolledAt: new Date().toISOString(),
    completedLessonIds: []
  };

  enrollments.push(enrollment);
  await saveStore("enrollments", enrollments);
  return enrollment;
}
