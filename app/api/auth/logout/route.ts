import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("subhan_session", "", { path: "/", maxAge: 0 });
  return response;
}
