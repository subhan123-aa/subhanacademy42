import { NextRequest, NextResponse } from "next/server";
import { authSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { hashPassword, sessionCookieOptions, signSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = authSchema.parse(await req.json());
    const users = await getStore("users");
    if (users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 400 });
    }

    const user = {
      id: crypto.randomUUID(),
      name: body.name ?? "Student",
      email: body.email.toLowerCase(),
      passwordHash: hashPassword(body.password),
      role: "student" as const,
      createdAt: new Date().toISOString(),
      blocked: false,
      pendingPayment: body.pendingPayment ?? false
    };

    users.push(user);
    await saveStore("users", users);

    const token = signSession(user);
    const forwardedProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(req.nextUrl.hostname);
    const isHttps = !isLocalhost && (req.nextUrl.protocol === "https:" || forwardedProto.includes("https") || process.env.NODE_ENV === "production");
    const response = NextResponse.json({ message: "Account created successfully.", nextUrl: "/student/dashboard", token });
    response.cookies.set("subhan_session", token, {
      ...sessionCookieOptions(req.nextUrl.hostname, isHttps),
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
