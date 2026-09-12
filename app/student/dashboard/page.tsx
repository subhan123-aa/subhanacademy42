import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/queries";
import { getStore } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [currentUser, courses, enrollments, orders, progress] = await Promise.all([
    getCurrentUser(),
    getStore("courses"),
    getStore("enrollments"),
    getStore("orders"),
    getStore("progress")
  ]);

  if (!currentUser) redirect("/auth/login?next=/student/dashboard");
  const paidCourseIds = new Set(orders.filter((order) => order.userId === currentUser.id && order.status === "paid").map((order) => order.courseId));
  const enrolledCourseIds = new Set(enrollments.filter((enrollment) => enrollment.userId === currentUser.id && (enrollment.status === "active" || enrollment.status === undefined)).map((enrollment) => enrollment.courseId));
  const purchasedCourses = courses.filter((item) => paidCourseIds.has(item.id) && enrolledCourseIds.has(item.id));
  const course = purchasedCourses[0];
  const enrollment = enrollments.find((item) => item.userId === currentUser.id && item.courseId === course?.id);
  const userProgress = progress.find((item) => item.userId === currentUser.id && item.courseId === course?.id);
  const completed = enrollment?.completedLessonIds.length ?? 0;
  const totalLessons = course?.modules.flatMap((module) => module.lessons).length ?? 0;
  const percent = userProgress?.percent ?? (totalLessons ? Math.round((completed / totalLessons) * 100) : 0);

  return (
    <DashboardShell
      title="Student Dashboard"
      subtitle="Continue learning and track your progress."
      studentCourseHref={course ? `/student/courses/${course.id}` : "/student/dashboard?tab=courses"}
    >
      <div className="grid gap-6">
        {course ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
            <div className="grid lg:grid-cols-[280px_1fr]">
              <div className="h-52 bg-brand-100 lg:h-full lg:min-h-64">
                <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Your course</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">SabjiHub Blueprint</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{course.subtitle}</p></div>
                  <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{percent}% complete</span>
                </div>
                <div className="mt-7 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} /></div>
                <div className="mt-3 flex flex-wrap justify-between gap-3 text-sm text-slate-500"><span>{completed} of {totalLessons} lessons completed</span><span>{Math.max(totalLessons - completed, 0)} remaining</span></div>
                <Link href={`/student/courses/${course.id}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"><PlayCircle className="h-4 w-4" />Continue Learning</Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid place-items-center rounded-[2rem] border border-dashed border-brand-200 bg-white px-6 py-14 text-center shadow-soft sm:px-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><BookOpen className="h-7 w-7" /></div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">No course enrolled yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Start learning with Subhan Academy and build practical skills at your own pace.</p>
            <Link href="/courses" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"><BookOpen className="h-4 w-4" />Browse Courses</Link>
          </section>
        )}

      </div>
    </DashboardShell>
  );
}
