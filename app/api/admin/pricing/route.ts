import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";
import { adminPricingSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const pricing = adminPricingSchema.parse(await req.json());
    const courses = await getStore("courses");
    const course = courses.find((item) => item.id === pricing.courseId);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    course.oldPrice = pricing.originalPrice;
    course.price = pricing.offerPrice;
    course.showDiscountDisplay = pricing.showDiscountDisplay;
    await saveStore("courses", courses);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/checkout");

    return NextResponse.json({ message: "Pricing updated.", course });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid pricing update." }, { status: 400 });
  }
}
