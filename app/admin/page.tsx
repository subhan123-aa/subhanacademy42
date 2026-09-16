import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard-shell";
import { AdminConsole } from "@/components/admin-console";
import { getCurrentUser } from "@/lib/queries";
import { getStore } from "@/lib/data";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getSiteConfig } from "@/lib/site-config";
import { authCookieName, cleanToken } from "@/lib/auth";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/auth/login?next=/admin");
  }

  const cookieStore = await cookies();
  const sessionToken = cleanToken(cookieStore.get(authCookieName())?.value) ?? "";

  const [courses, coupons, testimonials, announcements, previewVideos, appShowcaseScreenshots, orders, users, enrollments, progress, siteConfig] = await Promise.all([
    getStore("courses"),
    getStore("coupons"),
    getStore("testimonials"),
    getStore("announcements"),
    getStore("previewVideos"),
    getStore("appShowcaseScreenshots"),
    getStore("orders"),
    getStore("users"),
    getStore("enrollments"),
    getStore("progress"),
    getSiteConfig()
  ]);

  const totalRevenue = orders.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.total, 0);
  const totalStudents = users.filter((user) => user.role === "student").length;

  return (
    <DashboardShell title="Admin dashboard" subtitle="Manage the course platform, content, payments, and announcements." admin>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat title="Students" value={String(totalStudents)} />
          <Stat title="Revenue" value={formatCurrency(totalRevenue)} />
          <Stat title="Courses" value={String(courses.length)} />
          <Stat title="Payments" value={String(orders.length)} />
        </div>
        <AdminConsole
          sessionToken={sessionToken}
          courses={courses}
          coupons={coupons}
          testimonials={testimonials}
          announcements={announcements}
          previewVideos={previewVideos}
          appShowcaseScreenshots={appShowcaseScreenshots}
          enrollments={enrollments}
          siteConfig={siteConfig}
          orders={orders}
          users={users}
          progress={progress}
        />
      </div>
    </DashboardShell>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
