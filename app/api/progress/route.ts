import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { progressSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { getRequestUser } from "@/lib/request-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = progressSchema.parse(await req.json());
    const course = (await getStore("courses")).find((item) => item.id === body.courseId);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const [enrollments, orders] = await Promise.all([getStore("enrollments"), getStore("orders")]);
    const enrollment = enrollments.find((item) => item.userId === user.id && item.courseId === body.courseId);
    const hasPaidOrder = orders.some((order) => order.userId === user.id && order.courseId === body.courseId && order.status === "paid");
    if (!enrollment || (enrollment.status !== "active" && enrollment.status !== undefined) || (enrollment.paymentStatus !== "paid" && enrollment.paymentStatus !== undefined) || !hasPaidOrder) {
      return NextResponse.json({ error: "A verified payment is required." }, { status: 403 });
    }

    if (!enrollment.completedLessonIds.includes(body.lessonId)) {
      enrollment.completedLessonIds.push(body.lessonId);
    }
    await saveStore("enrollments", enrollments);

    const allLessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
    const completedCount = enrollment.completedLessonIds.filter((lessonId) => allLessonIds.includes(lessonId)).length;
    const percent = Math.round((completedCount / allLessonIds.length) * 100);

    const progress = await getStore("progress");
    const existing = progress.find((item) => item.userId === user.id && item.courseId === body.courseId);
    if (existing) {
      existing.percent = percent;
      existing.lastLessonId = body.lessonId;
      existing.updatedAt = new Date().toISOString();
    } else {
      progress.push({
        userId: user.id,
        courseId: body.courseId,
        percent,
        lastLessonId: body.lessonId,
        updatedAt: new Date().toISOString()
      });
    }
    await saveStore("progress", progress);

    let certificateId: string | null = null;
    if (completedCount === allLessonIds.length) {
      const certificates = await getStore("certificates");
      let certificate = certificates.find((item) => item.userId === user.id && item.courseId === body.courseId);
      if (!certificate) {
        certificate = {
          id: crypto.randomUUID(),
          userId: user.id,
          courseId: body.courseId,
          certificateNumber: `SA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          issuedAt: new Date().toISOString()
        };
        certificates.push(certificate);
        await saveStore("certificates", certificates);
      }
      certificateId = certificate.id;
    }

    return NextResponse.json({
      message: "Progress updated.",
      enrollment,
      certificateId
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
