import { NextRequest, NextResponse } from "next/server";
import { resetSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { hashPassword, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = resetSchema.parse(await req.json());
    const resets = await getStore("passwordResets");
    const reset = resets.find((item) => item.token === body.token && !item.used);
    if (!reset || new Date(reset.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Reset token is invalid or expired." }, { status: 400 });
    }

    const users = await getStore("users");
    const user = users.find((item) => item.id === reset.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    user.passwordHash = hashPassword(body.password);
    reset.used = true;
    await saveStore("users", users);
    await saveStore("passwordResets", resets);

    const token = signSession(user);
    const forwardedProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
    const isHttps = req.nextUrl.protocol === "https:" || forwardedProto.includes("https") || process.env.NODE_ENV === "production";
    const response = NextResponse.json({ message: "Password updated successfully.", nextUrl: user.role === "admin" ? "/admin" : "/student/dashboard" });
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
