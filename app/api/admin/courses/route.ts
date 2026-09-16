import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminCourseSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";
import type { Course } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const parsed = adminCourseSchema.parse(await req.json());
    const body = parsed as {
      id?: string;
      slug: string;
      title: string;
      subtitle: string;
      price: number;
      oldPrice: number;
      showDiscountDisplay: boolean;
      thumbnail: string;
      published: boolean;
      hours: number;
      previewLessonId?: string;
      includes: string[];
      outcomes: string[];
      modules: Course["modules"];
    };

    const courses = await getStore("courses");
    const existingIndex = courses.findIndex((item) => item.slug === body.slug || item.id === body.id);
    const nextCourse: Course = {
      id: body.id ?? courses[existingIndex]?.id ?? crypto.randomUUID(),
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle,
      price: body.price,
      oldPrice: body.oldPrice,
      showDiscountDisplay: body.showDiscountDisplay ?? true,
      thumbnail: body.thumbnail,
      published: body.published ?? false,
      hours: body.hours,
      previewLessonId: body.previewLessonId,
      includes: body.includes,
      outcomes: body.outcomes,
      modules:
        body.modules ??
        courses[existingIndex]?.modules ??
        []
    };

    if (existingIndex >= 0) courses[existingIndex] = nextCourse;
    else courses.push(nextCourse);
    await saveStore("courses", courses);

    try {
      revalidatePath("/admin");
      revalidatePath("/courses");
      revalidatePath(`/courses/${nextCourse.slug}`);
      revalidatePath("/checkout");
    } catch {
      // ignore in non-request contexts
    }

    return NextResponse.json({ message: "Course saved.", course: nextCourse });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
