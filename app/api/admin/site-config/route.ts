import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/request-auth";
import { saveSiteConfig } from "@/lib/site-config";
import { siteConfigSchema } from "@/lib/schemas";

export async function GET() {
  return NextResponse.json({ message: "Use server components to read site config." });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  try {
    const config = siteConfigSchema.parse(await req.json());
    await saveSiteConfig(config);
    return NextResponse.json({ message: "Homepage content updated." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
