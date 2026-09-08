import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const blogPosts = await getStore("blogPosts");
  await saveStore("blogPosts", blogPosts.filter((post) => post.id !== id));
  return NextResponse.json({ message: "Blog post deleted." });
}
