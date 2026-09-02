import { NextRequest, NextResponse } from "next/server";
import { forgotSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = forgotSchema.parse(await req.json());
    const users = await getStore("users");
    const user = users.find((item) => item.email.toLowerCase() === body.email.toLowerCase());
    if (!user) {
      return NextResponse.json({ message: "If the account exists, a reset link has been created." });
    }

    const token = crypto.randomUUID().replace(/-/g, "");
    const resets = await getStore("passwordResets");
    resets.push({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      used: false
    });
    await saveStore("passwordResets", resets);

    return NextResponse.json({
      message: "Reset link created.",
      nextUrl: `/auth/reset-password?token=${token}`
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
