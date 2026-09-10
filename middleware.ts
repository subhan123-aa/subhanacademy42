import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "subhan_session";

function getSessionSecret() {
  const raw = process.env.SESSION_SECRET?.trim();
  if (raw) {
    const unquoted = raw.replace(/^["']|["']$/g, "").trim();
    if (unquoted) return unquoted;
  }
  return "subhan-academy-default-session-secret-key-32ch";
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
    if (json.role !== "student" && json.role !== "admin") return null;
    return json as { role: "student" | "admin" };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/student") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*"]
};
