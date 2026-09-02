"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BadgePercent, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Course, User } from "@/lib/types";
import { INDIA_COUNTRY, INDIA_COUNTRY_LABEL, INDIAN_STATES_AND_UTS } from "@/lib/india";
import { checkoutCustomerSchema, checkoutSignupSchema } from "@/lib/schemas";
import { getCoursePricing } from "@/lib/pricing";

type FormState = {
  emailAddress: string;
  fullName: string;
  mobileNumber: string;
  country: typeof INDIA_COUNTRY;
  state: string;
  password: string;
  confirmPassword: string;
  couponCode: string;
  referralCode: string;
};

type CouponSummary = {
  code: string;
  discount: number;
  subtotal: number;
  total: number;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const emptyErrors: FieldErrors = {
  emailAddress: "",
  fullName: "",
  mobileNumber: "",
  state: "",
  password: "",
  confirmPassword: "",
    couponCode: "",
    referralCode: ""
};

export function CheckoutFlow({
  course,
  currentUser
}: {
  course: Course;
  currentUser: User | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => ({
    emailAddress: currentUser?.email ?? "",
    fullName: currentUser?.name ?? "",
    mobileNumber: "",
    country: INDIA_COUNTRY,
    state: "",
    password: "",
  confirmPassword: "",
  couponCode: "",
  referralCode: ""
  }));
  const [errors, setErrors] = useState<FieldErrors>(emptyErrors);
  const [couponSummary, setCouponSummary] = useState<CouponSummary | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [busy, setBusy] = useState(false);

  const pricing = getCoursePricing(course);
  const subtotal = pricing.offerPrice;
  const total = useMemo(() => couponSummary?.total ?? subtotal, [couponSummary, subtotal]);
  const canShowPasswordFields = !currentUser;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));

    if (key === "couponCode") {
      setCouponSummary(null);
      setCouponError(null);
      setCouponMessage(null);
    }

    if (key in emptyErrors) {
      setErrors((current) => ({ ...current, [key]: "" }));
    }
  }

  function applyClientErrors(issues: { path: (string | number)[]; message: string }[]) {
    const next: FieldErrors = {};
    for (const issue of issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        next[key as keyof FormState] = issue.message;
      }
    }
    setErrors((current) => ({ ...current, ...next }));
  }

  async function validateCoupon(codeValue = form.couponCode) {
    const code = codeValue.trim();
    if (!code) {
      setCouponSummary(null);
      setCouponError(null);
      setCouponMessage(null);
      return null;
    }

    setCouponBusy(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: code
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to validate coupon.");

      setCouponSummary({
        code: data.couponCode,
        discount: data.discount,
        subtotal: data.subtotal,
        total: data.total
      });
      setCouponMessage("Coupon applied successfully.");
      setCouponError(null);
      toast.success("Coupon applied.");
      return data.couponCode as string;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to validate coupon.";
      setCouponSummary(null);
      setCouponMessage(null);
      setCouponError(message);
      toast.error(message);
      return null;
    } finally {
      setCouponBusy(false);
    }
  }

  async function startPayment() {
    const schema = currentUser ? checkoutCustomerSchema : checkoutSignupSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      applyClientErrors(parsed.error.issues);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    let couponCode = couponSummary?.code ?? "";
    const typedCoupon = form.couponCode.trim();
    if (typedCoupon && typedCoupon.toLowerCase() !== couponCode.toLowerCase()) {
      const validCoupon = await validateCoupon(typedCoupon);
      if (!validCoupon) return;
      couponCode = validCoupon;
    }

    setBusy(true);
    try {
      if (!currentUser) {
        const signupResponse = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.fullName.trim(),
            email: form.emailAddress.trim(),
            password: form.password,
            pendingPayment: true
          })
        });
        const signupData = await signupResponse.json();
        if (!signupResponse.ok) throw new Error(signupData.error || "Unable to create account.");
      }

      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: couponCode || undefined,
          fullName: form.fullName.trim(),
          emailAddress: form.emailAddress.trim(),
          mobileNumber: form.mobileNumber.trim(),
          country: INDIA_COUNTRY,
          state: form.state,
          referralCode: form.referralCode.trim() || undefined
        })
      });

      const data = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(data.error || "Unable to create order.");

      const razorpayKey = data.razorpayKeyId;
      if (!razorpayKey) {
        throw new Error("Razorpay is not configured. Please set the Razorpay keys before checkout.");
      }

      if (typeof window === "undefined") {
        throw new Error("Razorpay checkout is only available in the browser.");
      }

      await new Promise<void>((resolve, reject) => {
        if ((window as Window & { Razorpay?: unknown }).Razorpay) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Unable to load Razorpay checkout script."));
        document.body.appendChild(script);
      });

      const razorpayConstructor = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
      const options = {
        key: razorpayKey,
        order_id: data.order.providerOrderId,
        amount: Math.round((data.order.total ?? 0) * 100),
        currency: "INR",
        name: "Subhan Academy",
        description: course.title,
        prefill: {
          name: form.fullName.trim(),
          email: form.emailAddress.trim(),
          contact: form.mobileNumber.trim()
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled. Your course remains locked.");
          }
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              mode: "razorpay"
            })
          });
          const result = await verify.json();
          if (!verify.ok) {
            toast.error(result.error || "Payment verification failed.");
            return;
          }
          toast.success("Payment successful. Enrollment complete.");
          router.push(result.nextUrl || "/student/dashboard");
          router.refresh();
        }
      };

      const checkout = new razorpayConstructor(options);
      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const savingsAmount = pricing.hasDiscount ? pricing.discountAmount : 0;

  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.65fr_1fr] xl:gap-8">
      <div className="order-2 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:order-1 lg:p-9">
        <div>
          <h1 className="text-[1.35rem] font-bold tracking-tight text-slate-950 sm:text-2xl lg:text-[1.875rem]">Complete Your Enrollment</h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">Enter your details to get lifetime access</p>
        </div>

        <form
          className="mt-6 grid gap-4 sm:mt-8 sm:gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await startPayment();
          }}
        >
          <div className="grid gap-4 sm:gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800">Email Address *</span>
              <input
                value={form.emailAddress}
                onChange={(event) => setField("emailAddress", event.target.value)}
                type="email"
                placeholder="you@example.com"
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              {errors.emailAddress ? <span className="text-xs font-medium text-red-600">{errors.emailAddress}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800">Full Name *</span>
              <input
                value={form.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
                placeholder="Your full name"
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              {errors.fullName ? <span className="text-xs font-medium text-red-600">{errors.fullName}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800">Mobile Number *</span>
              <input
                value={form.mobileNumber}
                onChange={(event) => setField("mobileNumber", event.target.value)}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              {errors.mobileNumber ? <span className="text-xs font-medium text-red-600">{errors.mobileNumber}</span> : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_0.78fr]">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-800">Country</span>
                <div className="relative">
                  <input
                    value={INDIA_COUNTRY_LABEL}
                    readOnly
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-500 outline-none"
                  />
                  <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-800">State *</span>
                <select
                  value={form.state}
                  onChange={(event) => setField("state", event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES_AND_UTS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state ? <span className="text-xs font-medium text-red-600">{errors.state}</span> : null}
              </label>
            </div>

            {canShowPasswordFields ? (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800">Create Password *</span>
                  <input
                    value={form.password}
                    onChange={(event) => setField("password", event.target.value)}
                    type="password"
                    placeholder="Minimum 6 characters"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                  {errors.password ? <span className="text-xs font-medium text-red-600">{errors.password}</span> : null}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800">Confirm Password *</span>
                  <input
                    value={form.confirmPassword}
                    onChange={(event) => setField("confirmPassword", event.target.value)}
                    type="password"
                    placeholder="Confirm password"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                  {errors.confirmPassword ? <span className="text-xs font-medium text-red-600">{errors.confirmPassword}</span> : null}
                </label>
              </div>
            ) : null}

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-800">Coupon Code <span className="font-normal text-slate-500">(Optional)</span></span>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
                <div className="relative min-w-0">
                  <BadgePercent className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  <input
                    value={form.couponCode}
                    onChange={(event) => setField("couponCode", event.target.value)}
                    placeholder="Enter coupon code"
                    className="h-11 min-w-0 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:h-12"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await validateCoupon();
                  }}
                  disabled={couponBusy}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:px-5"
                >
                  {couponBusy ? "Applying..." : "Apply"}
                </button>
              </div>
              {couponError ? <p className="text-sm font-medium text-red-600">{couponError}</p> : null}
              {couponMessage ? <p className="text-sm font-medium text-emerald-700">{couponMessage}</p> : null}
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800">Referral Code <span className="font-normal text-slate-500">(optional)</span></span>
              <input
                value={form.referralCode}
                onChange={(event) => setField("referralCode", event.target.value)}
                placeholder="Enter referral code"
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          <p className="mt-1.5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 sm:mt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Secure payment • Instant course access after successful payment
          </p>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(22,163,74,0.28)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-[15px]"
          >
            {busy ? (
              "Processing..."
            ) : (
              <span className="flex min-w-0 items-center justify-center gap-2.5 whitespace-nowrap">
                <LockKeyhole className="h-4 w-4 shrink-0 text-white" />
                <span className="truncate">Complete Secure Payment</span>
              </span>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-500 sm:text-xs">
            By continuing, you agree to our{" "}
            <Link
              href="/terms-and-conditions"
              className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-950 hover:decoration-slate-500"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-950 hover:decoration-slate-500"
            >
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>

      <aside className="order-1 rounded-[1.75rem] border border-slate-900/5 bg-slate-950 p-5 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.16)] sm:p-7 lg:order-2 lg:p-8">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Order Summary</h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-400 sm:mt-2 sm:text-sm sm:leading-6">Secure lifetime access to the full blueprint</p>
            </div>
            <span className="inline-flex shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200 sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
              Best Value
            </span>
          </div>

          <div className="mt-4 sm:mt-6">
            <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">SabjiHub Blueprint</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400 sm:mt-1.5 sm:text-sm sm:leading-6">From Idea to Launch</p>
            {pricing.showDiscountDisplay && pricing.hasDiscount ? (
              <span className="mt-2.5 inline-flex rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 sm:mt-3 sm:px-3 sm:text-xs">
                {pricing.discountPercent}% OFF • Limited Offer
              </span>
            ) : null}
            <p className="mt-2.5 text-xs leading-5 text-slate-300 sm:mt-3 sm:text-sm sm:leading-6">Build and launch a local grocery delivery business with the practical framework behind SabjiHub.</p>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-slate-800/90 bg-slate-900/60 p-3.5 shadow-inner shadow-slate-950/10 sm:mt-6 sm:p-5">
            <div className="space-y-2 sm:space-y-2.5">
              {pricing.showDiscountDisplay && pricing.hasDiscount ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 sm:text-sm">Original Price</span>
                  <span className="text-xs font-medium text-slate-500 line-through sm:text-sm">{formatCurrency(pricing.originalPrice)}</span>
                </div>
              ) : null}
              {pricing.showDiscountDisplay && pricing.hasDiscount ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-emerald-300 sm:text-sm">Discount ({pricing.discountPercent}% OFF)</span>
                  <span className="text-xs font-semibold text-emerald-300 sm:text-sm">- {formatCurrency(savingsAmount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 border-t border-slate-700/90 pt-2.5 sm:pt-3">
                <span className="text-xs font-medium text-white sm:text-sm">Offer Price</span>
                <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">{formatCurrency(pricing.offerPrice)}</span>
              </div>
            </div>
            {couponSummary && couponSummary.discount > 0 ? (
              <div className="mt-2.5 border-t border-slate-700/90 pt-2.5 sm:mt-3 sm:pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-300 sm:text-sm">Coupon Discount</span>
                  <span className="text-xs font-semibold text-emerald-300 sm:text-sm">-{formatCurrency(couponSummary.discount)}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/18 via-emerald-500/10 to-slate-900 p-3.5 shadow-[0_18px_40px_rgba(16,185,129,0.14)] sm:mt-5 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/85 sm:text-xs sm:tracking-[0.22em]">Total</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl sm:mt-1">{formatCurrency(total)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-2 sm:gap-2.5 sm:px-3 sm:py-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 sm:h-8 sm:w-8">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap text-xs font-semibold text-emerald-200 sm:text-sm">Lifetime Access</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs font-medium text-slate-200 sm:mt-3 sm:text-sm">Pay once, learn anytime</p>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4 sm:mt-6 sm:pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-sm sm:tracking-[0.18em]">What&apos;s Included</h4>
            <ul className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                "Complete SabjiHub Blueprint",
                "Step-by-Step Business Strategy",
                "App & Admin Panel Development",
                "Local Customer Acquisition & Marketing",
                "Practical Resources & Templates",
                "Lifetime Access + Future Updates"
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs leading-5 text-slate-200 sm:text-sm">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] p-3 sm:mt-4">
              <p className="text-xs font-semibold text-emerald-200 sm:text-sm">Built from a real business journey</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-400 sm:text-xs">Learn the strategies, mistakes and practical lessons behind building SabjiHub from scratch.</p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4 sm:mt-6 sm:pt-5">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 sm:tracking-[0.25em]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              100% Secure Payment By
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-2.5">
              {[
                { label: "VISA", src: "/images/payment-visa.svg" },
                { label: "UPI", src: "/images/payment-upi.svg" },
                { label: "RuPay", src: "/images/payment-rupay.svg" },
                { label: "Razorpay", src: "/images/payment-razorpay.svg" }
              ].map((method) => (
                <div key={method.label} className="flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-white px-2 shadow-sm sm:h-10 sm:px-2.5">
                  <Image
                    src={method.src}
                    alt={method.label}
                    width={180}
                    height={52}
                    className="h-5 w-auto max-w-full object-contain sm:h-6"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
