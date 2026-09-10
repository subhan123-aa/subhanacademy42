import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { authCookieName, cleanToken, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";
import type { User } from "@/lib/types";

export async function extractCandidateTokens(req?: NextRequest): Promise<string[]> {
  const cookieName = authCookieName();
  const candidates: string[] = [];

  // 1. Authorization: Bearer <token> (highest priority)
  const authHeader = req?.headers?.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const raw = authHeader.slice(7).trim();
    const token = cleanToken(raw);
    if (token) candidates.push(token);
  }

  // 2. NextRequest cookies
  const tokenFromReq = cleanToken(req?.cookies?.get(cookieName)?.value);
  if (tokenFromReq) candidates.push(tokenFromReq);

  // 3. Next.js cookies() from next/headers
  try {
    const cookieStore = await cookies();
    const tokenFromStore = cleanToken(cookieStore.get(cookieName)?.value);
    if (tokenFromStore) candidates.push(tokenFromStore);
  } catch {
    // Outside Next.js request context or streaming
  }

  // 4. Raw Cookie header
  const rawCookie = req?.headers?.get("cookie");
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
    if (match && match[1]) {
      const decoded = cleanToken(decodeURIComponent(match[1]));
      if (decoded) candidates.push(decoded);
    }
  }

  return Array.from(new Set(candidates));
}

export async function extractAuthToken(req?: NextRequest): Promise<string | null> {
  const candidates = await extractCandidateTokens(req);
  if (candidates.length === 0) return null;

  // Return the first token that successfully validates cryptographically
  for (const candidate of candidates) {
    if (verifySession(candidate)) return candidate;
  }

  // If none validated, return the first raw candidate
  return candidates[0] || null;
}

export async function getRequestUser(req: NextRequest, allowPendingPayment = false): Promise<User | null> {
  const candidates = await extractCandidateTokens(req);
  let session = null;

  for (const token of candidates) {
    const verified = verifySession(token);
    if (verified) {
      session = verified;
      break;
    }
  }

  if (!session) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[request-auth] Authentication failed: No valid session token. (method=${req.method}, path=${req.nextUrl?.pathname})`);
    }
    return null;
  }

  const users = await getStore("users");
  const user = users.find((item) => item.id === session.sub);
  if (user) {
    if (user.blocked) {
      console.warn(`[request-auth] Access denied: User account is blocked (userId=${user.id})`);
      return null;
    }
    // Admins are never blocked by pending payment status
    if (user.role !== "admin" && !allowPendingPayment && user.pendingPayment) {
      console.warn(`[request-auth] Access denied: Student account has pending payment (userId=${user.id})`);
      return null;
    }
    return user;
  }

  // If user record is missing in ephemeral store (e.g. serverless cold start / fresh lambda instance),
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

  // Verified student session fallback for serverless cold start:
  return {
    id: session.sub,
    name: session.name || "Student",
    email: session.email,
    passwordHash: "",
    role: session.role || "student",
    createdAt: new Date().toISOString()
  };
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
    console.warn(`[request-auth] Forbidden: User role is '${result.user.role}', 'admin' required.`);
    return { error: "Forbidden", status: 403 as const };
  }
  return result;
}

