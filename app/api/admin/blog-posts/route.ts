import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { blogSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = blogSchema.parse(await req.json());
    const blogPosts = await getStore("blogPosts");
    blogPosts.push({
      id: crypto.randomUUID(),
      ...body,
      publishedAt: new Date().toISOString()
    });
    await saveStore("blogPosts", blogPosts);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath("/blog");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: "Blog post created." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
