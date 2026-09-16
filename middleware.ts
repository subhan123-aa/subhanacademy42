import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SESSION_COOKIE = "subhan_session";

function getSessionSecret() {
  const raw = process.env.SESSION_SECRET?.trim();
  if (raw) {
    const unquoted = raw.replace(/^["']|["']$/g, "").trim();
    if (unquoted) return unquoted;
  }
  // Fallback to a deterministic value (like Supabase URL) if SESSION_SECRET is missing in production,
  // to prevent login crashes on live sites that missed configuring this variable.
  const fallbackKey = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "subhan-academy-default-session-secret-key-32ch";
  return fallbackKey.trim();
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function cleanToken(raw?: string | null): string | null {
  if (!raw) return null;
  let token = raw.trim();
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }
  return token || null;
}

function extractCandidateTokens(req: NextRequest): string[] {
  const candidates: string[] = [];

  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const raw = authHeader.slice(7).trim();
    const token = cleanToken(raw);
    if (token) candidates.push(token);
  }

  // 2. req.cookies.get(SESSION_COOKIE)
  const cookieVal = cleanToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (cookieVal) {
    candidates.push(cookieVal);
    try {
      const decoded = cleanToken(decodeURIComponent(cookieVal));
      if (decoded && decoded !== cookieVal) candidates.push(decoded);
    } catch {
      // ignore
    }
  }

  // 3. Raw Cookie header
  const rawCookie = req.headers.get("cookie");
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
    if (match && match[1]) {
      const rawVal = cleanToken(match[1]);
      if (rawVal) candidates.push(rawVal);
      try {
        const decoded = cleanToken(decodeURIComponent(match[1]));
        if (decoded) candidates.push(decoded);
      } catch {
        // ignore
      }
    }
  }

  return Array.from(new Set(candidates));
}

async function verifyToken(rawToken?: string | null) {
  const token = cleanToken(rawToken);
  if (!token) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  try {
    const primarySecret = getSessionSecret();
    const rawSecret = process.env.SESSION_SECRET?.trim();
    const fallbackSecret = "subhan-academy-default-session-secret-key-32ch";
    const secretsToTry = Array.from(new Set([primarySecret, rawSecret, fallbackSecret].filter(Boolean) as string[]));

    const actual = decodeBase64Url(signature);
    let valid = false;

    for (const secret of secretsToTry) {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
      if (expected.length !== actual.length) continue;

      let difference = 0;
      for (let index = 0; index < expected.length; index += 1) {
        difference |= expected[index] ^ actual[index];
      }
      if (difference === 0) {
        valid = true;
        break;
      }
    }

    if (!valid) return null;

    const json = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    if (!json || typeof json !== "object" || typeof json.exp !== "number" || json.exp < Date.now()) return null;

    const email = String(json.email || "").toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@subhanacademy.in").toLowerCase().trim();
    const isExplicitAdmin = email === adminEmail || email === "admin@subhanacademy.in";

    let roleLower = String(json.role || "").toLowerCase();
    if (isExplicitAdmin) {
      roleLower = "admin";
    }

    if (roleLower !== "student" && roleLower !== "admin") return null;
    return { role: roleLower as "student" | "admin", email };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/student") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request: req });
  let supabaseUser: { role: "student" | "admin" } | null = null;

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)?.replace(/^["']|["']$/g, "").trim();
  const supabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY
  )?.replace(/^["']|["']$/g, "").trim();

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          }
        }
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = user.user_metadata?.role?.toLowerCase() === "admin" ? "admin" : "student";
        supabaseUser = { role };
      }
    } catch {
      // Supabase auth check error handled gracefully
    }
  }

  const candidateTokens = extractCandidateTokens(req);
  let session = null;
  for (const token of candidateTokens) {
    session = await verifyToken(token);
    if (session) break;
  }
  if (!session) {
    session = supabaseUser;
  }

  if (!session && candidateTokens.length > 0) {
    return supabaseResponse;
  }

  if (!session) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*"]
};
