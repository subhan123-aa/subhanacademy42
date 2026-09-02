import { NextRequest, NextResponse } from "next/server";
import { authCookieName, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(authCookieName())?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ user: null });
  }
  const users = await getStore("users");
  const user = users.find((item) => item.id === session.sub) ?? null;
  if (!user || user.blocked) return NextResponse.json({ user: null });
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
