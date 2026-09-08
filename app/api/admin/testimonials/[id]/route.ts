import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const testimonials = await getStore("testimonials");
  await saveStore("testimonials", testimonials.filter((testimonial) => testimonial.id !== id));
  return NextResponse.json({ message: "Testimonial deleted." });
}
