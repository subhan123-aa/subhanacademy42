import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SESSION_COOKIE = "subhan_session";

function getSessionSecret() {
  const raw = process.env.SESSION_SECRET?.trim();
  if (raw) {
    const unquoted = raw.replace(/^["']|["']$/g, "").trim();
    if (unquoted) return unquoted;
  }
  if (process.env.NODE_ENV !== "production") {
    return "subhan-academy-local-development-session-secret";
  }
  throw new Error("SESSION_SECRET is not configured.");
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

async function verifyToken(rawToken?: string | null) {
  const token = cleanToken(rawToken);
  if (!token) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  try {
    const actual = decodeBase64Url(signature);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSessionSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
    if (expected.length !== actual.length) return null;

    let difference = 0;
    for (let index = 0; index < expected.length; index += 1) {
      difference |= expected[index] ^ actual[index];
    }
    if (difference !== 0) return null;

    const json = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    if (!json || typeof json !== "object" || typeof json.exp !== "number" || json.exp < Date.now()) return null;
    const roleLower = String(json.role || "").toLowerCase();
    if (roleLower !== "student" && roleLower !== "admin") return null;
    return { role: roleLower as "student" | "admin" };
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
        const roleClaim = user.app_metadata?.role || user.user_metadata?.role;
        const role = typeof roleClaim === "string" && roleClaim.toLowerCase() === "admin" ? "admin" : "student";
        supabaseUser = { role };
      }
    } catch {
      // Supabase auth check error handled gracefully
    }
  }

  const session = (await verifyToken(req.cookies.get(SESSION_COOKIE)?.value)) || supabaseUser;
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
