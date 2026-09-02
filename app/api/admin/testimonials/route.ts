import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { testimonialSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = testimonialSchema.parse(await req.json());
    const testimonials = await getStore("testimonials");
    const input = body as { id?: string };
    const existingIndex = testimonials.findIndex((testimonial) => testimonial.id === input.id);
    const nextTestimonial = {
      id: input.id ?? testimonials[existingIndex]?.id ?? crypto.randomUUID(),
      ...body
    };
    if (existingIndex >= 0) testimonials[existingIndex] = nextTestimonial;
    else testimonials.push(nextTestimonial);
    await saveStore("testimonials", testimonials);
    return NextResponse.json({ message: "Testimonial saved.", testimonial: nextTestimonial });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
