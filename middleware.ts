import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "subhan_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "subhan-academy-dev-secret";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function verifyToken(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  const actual = decodeBase64Url(signature);
  if (expected.length !== actual.length) return null;
  let equal = true;
  for (let index = 0; index < expected.length; index += 1) {
    equal = equal && expected[index] === actual[index];
  }
  if (!equal) return null;
  const json = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
  if (json.exp < Date.now()) return null;
  return json as { role: "student" | "admin" };
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
