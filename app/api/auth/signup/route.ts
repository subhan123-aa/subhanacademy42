import { NextRequest, NextResponse } from "next/server";
import { authSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { hashPassword, signSession } from "@/lib/auth";
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
    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    const response = NextResponse.json({ message: "Account created successfully.", nextUrl: "/student/dashboard", token });
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
