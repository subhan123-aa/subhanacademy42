import { CoursePlayer } from "@/components/course-player";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCourseById, getCurrentUser, getEnrollment } from "@/lib/queries";
import { getStore } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function StudentCoursePage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [currentUser, course] = await Promise.all([getCurrentUser(), getCourseById(courseId)]);
  if (!currentUser || !course) notFound();

  const [enrollment, orders] = await Promise.all([
    getEnrollment(currentUser.id, course.id),
    getStore("orders")
  ]);
  const hasPaid = Boolean(
    (enrollment?.status === "active" || enrollment?.status === undefined) &&
    (enrollment?.paymentStatus === "paid" || enrollment?.paymentStatus === undefined) &&
    orders.some((order) => order.userId === currentUser.id && order.courseId === course.id && order.status === "paid")
  );

  return (
    <DashboardShell title={course.title} subtitle={course.subtitle} studentCourseHref={`/student/courses/${course.id}`}>
      <CoursePlayer course={course} enrollment={enrollment} canAccess={hasPaid} />
    </DashboardShell>
  );
}
