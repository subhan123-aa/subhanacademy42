import { NextRequest, NextResponse } from "next/server";
import { authSchema } from "@/lib/schemas";
import { getStore } from "@/lib/data";
import { signSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = authSchema.parse(await req.json());
    const users = await getStore("users");
    const user = users.find((item) => item.email.toLowerCase() === body.email.toLowerCase());
    if (!user || user.blocked || user.pendingPayment || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const requestedNext = body.nextUrl;
    const safeNext = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;
    const nextUrl = user.role === "admin"
      ? safeNext?.startsWith("/admin") ? safeNext : "/admin"
      : safeNext?.startsWith("/student") ? safeNext : "/student/dashboard";
    const token = signSession(user);
    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    const response = NextResponse.json({ message: "Logged in successfully.", nextUrl, token });
    response.cookies.set("subhan_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
