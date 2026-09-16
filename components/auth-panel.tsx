"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ButtonLink } from "@/components/site";

type Mode = "login" | "signup" | "forgot" | "reset";

export function AuthPanel({
  mode,
  nextUrl = "/student/dashboard",
  token,
  variant = "default"
}: {
  mode: Mode;
  nextUrl?: string;
  token?: string;
  variant?: "default" | "branded-login";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const config = {
    login: {
      title: variant === "branded-login" ? "Sign In" : "Login",
      subtitle: variant === "branded-login" ? "Access your learning dashboard and continue your courses" : "Access your student dashboard and course player.",
      endpoint: "/api/auth/login",
      fields: [
        { name: "email", label: variant === "branded-login" ? "Email Address" : "Email", type: "email" },
        { name: "password", label: "Password", type: "password" }
      ],
      submit: variant === "branded-login" ? "Sign In" : "Login"
    },
    signup: {
      title: "Create account",
      subtitle: "Sign up to buy the course and unlock the student dashboard.",
      endpoint: "/api/auth/signup",
      fields: [
        { name: "name", label: "Name" },
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Password", type: "password" }
      ],
      submit: "Create account"
    },
    forgot: {
      title: "Forgot password",
      subtitle: "Request a reset token for your account.",
      endpoint: "/api/auth/forgot",
      fields: [{ name: "email", label: "Email", type: "email" }],
      submit: "Send reset link"
    },
    reset: {
      title: "Reset password",
      subtitle: "Set a new password using your reset token.",
      endpoint: "/api/auth/reset",
      fields: [
        { name: "token", label: "Reset token", type: "text" },
        { name: "password", label: "New password", type: "password" }
      ],
      submit: "Reset password"
    }
  }[mode];

  return (
    <div className={variant === "branded-login" ? "grid gap-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-9" : "grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft"}>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{config.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{config.subtitle}</p>
      </div>

      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          const formData = new FormData(event.currentTarget);
          try {
            const response = await fetch(config.endpoint, {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...Object.fromEntries(formData.entries()),
                ...(mode === "login" ? { nextUrl } : {})
              })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Request failed");
            if (data.token && typeof window !== "undefined") {
              try {
                localStorage.setItem("subhan_session", data.token);
              } catch {
                // Ignore storage quota or disabled storage
              }
            }
            toast.success(data.message || "Success");
            const targetUrl = data.nextUrl || nextUrl;
            if (typeof window !== "undefined") {
              window.location.href = targetUrl;
            } else {
              router.push(targetUrl);
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {config.fields.map((field) => (
          <label key={field.name} className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <div className="relative">
              <input
                name={field.name}
                type={field.type === "password" && showPassword ? "text" : field.type || "text"}
                defaultValue={field.name === "token" ? token : undefined}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                required
              />
              {field.type === "password" ? (
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : null}
            </div>
          </label>
        ))}

        {mode === "login" ? <Link href="/auth/forgot-password" className="-mt-1 text-sm font-medium text-brand-700 hover:text-brand-800">Forgot password?</Link> : null}

        {variant === "branded-login" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-xs leading-5 text-brand-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Your information is kept private and secure.</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Please wait..." : config.submit}
        </button>
      </form>

      {variant === "branded-login" ? <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>NEW HERE?</span><span className="h-px flex-1 bg-slate-200" /></div> : null}

      <div className={variant === "branded-login" ? "text-center text-sm text-slate-600" : "flex flex-wrap gap-3 text-sm text-slate-600"}>
        {variant !== "branded-login" && mode !== "login" ? <Link href="/login" className="hover:text-slate-950">Login</Link> : null}
        {variant !== "branded-login" && mode !== "signup" ? <Link href="/auth/signup" className="hover:text-slate-950">Signup</Link> : null}
        {variant !== "branded-login" && mode !== "forgot" ? <Link href="/auth/forgot-password" className="hover:text-slate-950">Forgot password</Link> : null}
        {variant !== "branded-login" && mode !== "reset" ? <Link href="/auth/reset-password" className="hover:text-slate-950">Reset password</Link> : null}
        {variant !== "branded-login" ? <ButtonLink href="/courses" variant="ghost" className="px-0 py-0">Browse courses</ButtonLink> : null}
        {mode === "login" ? <Link href="/checkout?course=sabjihub-blueprint" className="font-semibold text-brand-700 hover:text-brand-800">Don't have an account? Enroll Now</Link> : null}
      </div>
      {variant === "branded-login" ? <p className="text-center text-xs leading-5 text-slate-500">By signing in, you agree to our <Link href="/terms-and-conditions" className="font-medium text-slate-700 underline underline-offset-2">Terms</Link> and <Link href="/privacy-policy" className="font-medium text-slate-700 underline underline-offset-2">Privacy Policy</Link>.</p> : null}
    </div>
  );
}
