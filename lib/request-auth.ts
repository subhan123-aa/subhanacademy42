import { NextRequest } from "next/server";
import { authCookieName, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";

export async function getRequestUser(req: NextRequest, allowPendingPayment = false) {
  const token = req.cookies.get(authCookieName())?.value;
  const session = verifySession(token);
  if (!session) return null;
  const users = await getStore("users");
  const user = users.find((item) => item.id === session.sub);
  if (!user || user.blocked || (!allowPendingPayment && user.pendingPayment)) return null;
  return user;
}

export async function requireUser(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) {
    return { error: "Unauthorized", status: 401 as const };
  }
  return { user };
}

export async function requireAdmin(req: NextRequest) {
  const result = await requireUser(req);
  if ("error" in result) return result;
  if (result.user.role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }
  return result;
}
