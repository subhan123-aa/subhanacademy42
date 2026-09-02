import { CoursePlayer } from "@/components/course-player";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCourseById, getCurrentUser, getEnrollment } from "@/lib/queries";
import { notFound } from "next/navigation";

export default async function StudentCoursePage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [currentUser, course] = await Promise.all([getCurrentUser(), getCourseById(courseId)]);
  if (!currentUser || !course) notFound();

  const enrollment = await getEnrollment(currentUser.id, course.id);
  const hasPaid = Boolean(enrollment);

  return (
    <DashboardShell title={course.title} subtitle={course.subtitle}>
      <CoursePlayer course={course} enrollment={enrollment} canAccess={hasPaid} />
    </DashboardShell>
  );
}
