import { NextRequest, NextResponse } from "next/server";
import { authSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { hashPassword, isAdminCredentials, sessionCookieOptions, signSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = authSchema.parse(await req.json());
    const emailLower = body.email.toLowerCase().trim();
    const users = await getStore("users");
    let user = users.find((item) => item.email.toLowerCase() === emailLower);

    const isAdminAuth = isAdminCredentials(emailLower, body.password);

    if (isAdminAuth) {
      if (!user) {
        user = {
          id: "admin-1",
          name: "Subhan Academy Admin",
          email: emailLower,
          passwordHash: hashPassword(body.password),
          role: "admin",
          createdAt: new Date().toISOString(),
          blocked: false,
          pendingPayment: false
        };
        users.unshift(user);
        await saveStore("users", users);
      } else {
        let changed = false;
        if (user.role !== "admin") {
          user.role = "admin";
          changed = true;
        }
        if (user.blocked) {
          user.blocked = false;
          changed = true;
        }
        if (user.pendingPayment) {
          user.pendingPayment = false;
          changed = true;
        }
        if (!verifyPassword(body.password, user.passwordHash)) {
          user.passwordHash = hashPassword(body.password);
          changed = true;
        }
        if (changed) {
          await saveStore("users", users);
        }
      }
    } else {
      if (!user || user.blocked || !verifyPassword(body.password, user.passwordHash)) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
      }
    }

    const requestedNext = body.nextUrl;
    const safeNext = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;
    const nextUrl = user.role === "admin"
      ? safeNext?.startsWith("/admin") ? safeNext : "/admin"
      : safeNext?.startsWith("/student") ? safeNext : "/student/dashboard";
    const token = signSession(user);
    const forwardedProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(req.nextUrl.hostname);
    const isHttps = !isLocalhost && (req.nextUrl.protocol === "https:" || forwardedProto.includes("https") || process.env.NODE_ENV === "production");
    const response = NextResponse.json({ message: "Logged in successfully.", nextUrl, token });
    response.cookies.set("subhan_session", token, {
      ...sessionCookieOptions(req.nextUrl.hostname, isHttps),
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
