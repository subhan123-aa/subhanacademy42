import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "subhan_session";

function decodePayload(token?: string | null) {
  if (!token) return null;
  const [payload] = token.split(".");
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    if (json && typeof json === "object" && typeof json.exp === "number") {
      if (json.exp < Date.now()) return null;
      return json as { role?: "student" | "admin" };
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/student") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = decodePayload(req.cookies.get(SESSION_COOKIE)?.value);
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
