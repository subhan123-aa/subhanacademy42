import type { Certificate, Course, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CertificatePreview({
  certificate,
  course,
  user
}: {
  certificate: Certificate;
  course: Course;
  user: User;
}) {
  return (
    <div className="rounded-[2rem] border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-6 shadow-soft">
      <div className="rounded-[1.5rem] border border-brand-100 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-700">Certificate of Completion</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Subhan Academy</h2>
        <p className="mt-3 text-sm text-slate-600">This certifies that</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{user.name}</p>
        <p className="mt-3 text-sm text-slate-600">has successfully completed</p>
        <p className="mt-2 text-xl font-semibold text-brand-700">{course.title}</p>
        <div className="mt-8 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Certificate ID</p>
            <p className="mt-1 font-medium text-slate-950">{certificate.certificateNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Issued</p>
            <p className="mt-1 font-medium text-slate-950">{formatDate(certificate.issuedAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 font-medium text-brand-700">Verified Completion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
