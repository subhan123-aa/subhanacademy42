import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { CertificatePreview } from "@/components/certificate";
import { getCurrentUser } from "@/lib/queries";
import { getStore } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function CertificatePage({
  params
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) notFound();
  const certificates = await getStore("certificates");
  const certificate = certificates.find((item) => item.id === certificateId && item.userId === currentUser.id);
  if (!certificate) notFound();
  const courses = await getStore("courses");
  const course = courses.find((item) => item.id === certificate.courseId);
  if (!course) notFound();

  return (
    <DashboardShell title="My certificate" subtitle="Download and share your completion certificate.">
      <div className="grid gap-6">
        <CertificatePreview certificate={certificate} course={course} user={currentUser} />
        <div className="flex gap-3">
          <Link href={`/api/certificates/${certificate.id}`} className="inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white">
            Download certificate
          </Link>
          <Link href="/student/dashboard" className="inline-flex h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
