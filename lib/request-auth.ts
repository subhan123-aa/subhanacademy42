import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { authCookieName, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";
import type { User } from "@/lib/types";

export async function extractAuthToken(req?: NextRequest): Promise<string | null> {
  const cookieName = authCookieName();

  // 1. NextRequest cookies
  const tokenFromReq = req?.cookies?.get(cookieName)?.value;
  if (tokenFromReq) return tokenFromReq;

  // 2. Next.js cookies() from next/headers
  try {
    const cookieStore = await cookies();
    const tokenFromStore = cookieStore.get(cookieName)?.value;
    if (tokenFromStore) return tokenFromStore;
  } catch {
    // Outside Next.js request context or streaming
  }

  // 3. Raw Cookie header
  const rawCookie = req?.headers?.get("cookie");
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  // 4. Authorization: Bearer <token>
  const authHeader = req?.headers?.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export async function getRequestUser(req: NextRequest, allowPendingPayment = false): Promise<User | null> {
  const token = await extractAuthToken(req);
  const session = verifySession(token);
  if (!session) return null;

  const users = await getStore("users");
  const user = users.find((item) => item.id === session.sub);
  if (user) {
    if (user.blocked || (!allowPendingPayment && user.pendingPayment)) return null;
    return user;
  }

  // If user record is missing in ephemeral store (e.g. serverless cold start),
  // but has a cryptographically verified admin token:
  if (session.role === "admin") {
    return {
      id: session.sub || "admin-1",
      name: session.name || "Subhan Academy Admin",
      email: session.email || "admin@subhanacademy.in",
      passwordHash: "",
      role: "admin",
      createdAt: new Date().toISOString()
    };
  }

  if (!allowPendingPayment) {
    return {
      id: session.sub,
      name: session.name || "Student",
      email: session.email,
      passwordHash: "",
      role: session.role || "student",
      createdAt: new Date().toISOString()
    };
  }

  return null;
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

