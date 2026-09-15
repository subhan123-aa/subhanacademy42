import { NextRequest, NextResponse } from "next/server";
import { authSchema } from "@/lib/schemas";
import { getStore } from "@/lib/data";
import { signSession, verifyPassword } from "@/lib/auth";
import { createSupabaseAuthClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { User } from "@/lib/types";

function loginResponse(req: NextRequest, user: Pick<User, "id" | "email" | "role" | "name">, requestedNext?: string) {
  const safeNext = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;
  const nextUrl = user.role === "admin"
    ? safeNext?.startsWith("/admin") ? safeNext : "/admin"
    : safeNext?.startsWith("/student") ? safeNext : "/student/dashboard";
  const token = signSession(user);
  const forwardedProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
  const isHttps = req.nextUrl.protocol === "https:" || forwardedProto.includes("https") || process.env.NODE_ENV === "production";
  const response = NextResponse.json({ message: "Logged in successfully.", nextUrl });
  response.cookies.set("subhan_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = authSchema.parse(await req.json());

    // Production credentials are verified by Supabase Auth. The local data
    // store remains a fallback only when Supabase has not been configured.
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseAuthClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password
      });
      const user = data.user;
      if (error || !user || !user.email) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
      }

      const roleClaim = user.app_metadata?.role || user.user_metadata?.role;
      const role = typeof roleClaim === "string" && roleClaim.toLowerCase() === "admin" ? "admin" : "student";
      const name = typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : user.email.split("@")[0];
      return loginResponse(req, { id: user.id, email: user.email, role, name }, body.nextUrl);
    }

    const users = await getStore("users");
    const user = users.find((item) => item.email.toLowerCase() === body.email.toLowerCase());
    if (!user || user.blocked || user.pendingPayment || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    return loginResponse(req, user, body.nextUrl);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
