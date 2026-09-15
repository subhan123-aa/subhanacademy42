"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Image,
  FileDown,
  Globe2,
  ListOrdered,
  Loader2,
  Megaphone,
  BadgePercent,
  Plus,
  PlaySquare,
  Search,
  Upload,
  ShieldCheck,
  Star,
  UserRound,
  Wallet
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShowcaseManager } from "@/components/app-showcase";
import type {
  Announcement,
  Course,
  Coupon,
  Enrollment,
  Lesson,
  Order,
  ProgressRecord,
  AppShowcaseScreenshot,
  PreviewVideo,
  SiteConfig,
  Testimonial,
  User
} from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getCoursePricing } from "@/lib/pricing";

async function api(url: string, method: string, body?: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (typeof window !== "undefined") {
    let token: string | null = null;
    try {
      token = localStorage.getItem("subhan_session");
    } catch {
      // localStorage may be disabled
    }
    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)subhan_session=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }
    }
    if (token) {
      const clean = token.replace(/^["']|["']$/g, "").trim();
      if (clean) {
        headers["Authorization"] = `Bearer ${clean}`;
      }
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function safeParseArray<T>(value: FormDataEntryValue | null, fallback: T[]) {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function safeString(value: FormDataEntryValue | null, fallback = "") {
  const text = String(value ?? fallback).trim();
  return text || fallback;
}

type PricingFormState = { originalPrice: string; offerPrice: string; showDiscountDisplay: boolean };

function toMoneyInputValue(value?: number) {
  return Number.isFinite(value ?? NaN) ? String(value) : "";
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

function AdminSection({ id, activeSection, children }: { id: string; activeSection: string; children: React.ReactNode }) {
  if (id === "pricing" || activeSection !== id) return null;
  return <div className="animate-[admin-section-in_220ms_ease-out]">{children}</div>;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminConsole({
  sessionToken,
  courses: rawCourses,
  coupons: rawCoupons,
  testimonials: rawTestimonials,
  announcements: rawAnnouncements,
  previewVideos: rawPreviewVideos,
  appShowcaseScreenshots: rawAppShowcaseScreenshots,
  orders: rawOrders,
  users: rawUsers,
  enrollments: rawEnrollments,
  progress: rawProgress,
  siteConfig
}: {
  sessionToken?: string;
  courses?: Course[] | null;
  coupons?: Coupon[] | null;
  testimonials?: Testimonial[] | null;
  announcements?: Announcement[] | null;
  previewVideos?: PreviewVideo[] | null;
  appShowcaseScreenshots?: AppShowcaseScreenshot[] | null;
  orders?: Order[] | null;
  users?: User[] | null;
  enrollments?: Enrollment[] | null;
  progress?: ProgressRecord[] | null;
  siteConfig: SiteConfig;
}) {
  const courses = Array.isArray(rawCourses) ? rawCourses : [];
  const coupons = Array.isArray(rawCoupons) ? rawCoupons : [];
  const testimonials = Array.isArray(rawTestimonials) ? rawTestimonials : [];
  const announcements = Array.isArray(rawAnnouncements) ? rawAnnouncements : [];
  const previewVideos = Array.isArray(rawPreviewVideos) ? rawPreviewVideos : [];
  const appShowcaseScreenshots = Array.isArray(rawAppShowcaseScreenshots) ? rawAppShowcaseScreenshots : [];
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const users = Array.isArray(rawUsers) ? rawUsers : [];
  const enrollments = Array.isArray(rawEnrollments) ? rawEnrollments : [];
  const progress = Array.isArray(rawProgress) ? rawProgress : [];

  useEffect(() => {
    if (sessionToken && typeof window !== "undefined") {
      try {
        localStorage.setItem("subhan_session", sessionToken);
      } catch {
        // Ignore storage error
      }
    }
  }, [sessionToken]);

  const router = useRouter();
  const refreshData = () => {
    router.refresh();
  };

  const [studentQuery, setStudentQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "active" | "blocked">("all");
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");
  const [selectedCouponId, setSelectedCouponId] = useState(coupons[0]?.id ?? "");
  const [selectedTestimonialId, setSelectedTestimonialId] = useState(testimonials[0]?.id ?? "");
  const [selectedPreviewVideoId, setSelectedPreviewVideoId] = useState(previewVideos[0]?.id ?? "");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pricingForm, setPricingForm] = useState<PricingFormState>({
    originalPrice: toMoneyInputValue(courses[0]?.oldPrice ?? 0),
    offerPrice: toMoneyInputValue(courses[0]?.price ?? 0),
    showDiscountDisplay: courses[0]?.showDiscountDisplay ?? true
  });
  const [activeSection, setActiveSection] = useState("overview");
  const [dashboardShowcasePreview, setDashboardShowcasePreview] = useState(
    siteConfig.dashboardShowcaseImage || "/images/sabjihub-dashboard-showcase.svg"
  );

  useEffect(() => {
    const updateSection = () => setActiveSection(window.location.hash.replace("#", "") || "overview");
    updateSection();
    window.addEventListener("hashchange", updateSection);
    return () => window.removeEventListener("hashchange", updateSection);
  }, []);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const selectedCoupon = coupons.find((coupon) => coupon.id === selectedCouponId) ?? coupons[0];
  const selectedTestimonial = testimonials.find((item) => item.id === selectedTestimonialId) ?? testimonials[0];
  const selectedPreviewVideo = previewVideos.find((item) => item.id === selectedPreviewVideoId);

  useEffect(() => {
    setPricingForm({
      originalPrice: toMoneyInputValue(selectedCourse?.oldPrice ?? 0),
      offerPrice: toMoneyInputValue(selectedCourse?.price ?? 0),
      showDiscountDisplay: selectedCourse?.showDiscountDisplay ?? true
    });
  }, [selectedCourse?.id]);

  useEffect(() => {
    setDashboardShowcasePreview(siteConfig.dashboardShowcaseImage || "/images/sabjihub-dashboard-showcase.svg");
  }, [siteConfig.dashboardShowcaseImage]);

  const totalRevenue = orders.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.total, 0);
  const today = new Date().toDateString();
  const todaySales = orders.filter((order) => order.status === "paid" && new Date(order.paidAt || order.createdAt).toDateString() === today).reduce((sum, order) => sum + order.total, 0);
  const pendingPayments = orders.filter((order) => order.status === "created").length;
  const paidOrders = orders.filter((order) => order.status === "paid");
  const completedEnrollments = enrollments.filter((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    const lessonCount = course?.modules?.flatMap((module) => module.lessons ?? []).length ?? 0;
    return lessonCount > 0 && (enrollment.completedLessonIds?.length ?? 0) >= lessonCount;
  }).length;
  const selectedCoursePricing = selectedCourse ? getCoursePricing(selectedCourse) : null;
  const pricingPreview = (() => {
    if (!selectedCourse) return null;
    const originalPrice = Number(pricingForm.originalPrice);
    const offerPrice = Number(pricingForm.offerPrice);
    if (Number.isFinite(originalPrice) && Number.isFinite(offerPrice) && originalPrice >= 0 && offerPrice >= 0) {
      const hasDiscount = originalPrice > offerPrice;
      const discountAmount = hasDiscount ? originalPrice - offerPrice : 0;
      return { originalPrice, offerPrice, discountAmount, discountPercent: hasDiscount && originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0, hasDiscount };
    }
    return selectedCoursePricing ? { ...selectedCoursePricing } : null;
  })();
  const filteredStudents = useMemo(() => {
    const query = studentQuery.trim().toLowerCase();
    return users
      .filter((user) => user.role === "student")
      .filter((user) => {
        if (studentFilter === "active") return !user.blocked;
        if (studentFilter === "blocked") return Boolean(user.blocked);
        return true;
      })
      .filter((user) => {
        if (!query) return true;
        return [user.name, user.email].some((value) => value.toLowerCase().includes(query));
      });
  }, [studentFilter, studentQuery, users]);

  return (
    <div className="grid gap-8">
      <AdminSection id="overview" activeSection={activeSection}>
      <section id="overview" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Admin dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Platform command center</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Manage students, course structure, payments, coupons, testimonials, announcements, and website content from one place.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
            <ShieldCheck className="h-4 w-4" />
            Subhan Academy SaaS admin
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total students" value={String(users.filter((user) => user.role === "student").length)} detail="Registered learners" icon={<UserRound className="h-4 w-4" />} />
          <MetricCard title="Enrollments" value={String(enrollments.length)} detail={`${completedEnrollments} completed`} icon={<BookOpen className="h-4 w-4" />} />
          <MetricCard title="Revenue" value={formatCurrency(totalRevenue)} detail="Successful paid orders" icon={<CircleDollarSign className="h-4 w-4" />} />
          <MetricCard title="Today's sales" value={formatCurrency(todaySales)} detail={`${pendingPayments} payments pending`} icon={<Wallet className="h-4 w-4" />} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Pending payments</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingPayments}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Course completion</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{completedEnrollments}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Active courses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{courses.filter((course) => course.published).length}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="bg-slate-950 px-5 py-4 text-sm font-semibold text-white">Recent orders</div>
          <div className="grid gap-3 bg-white p-5 md:grid-cols-2 xl:grid-cols-3">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{order.fullName}</p>
                    <p className="text-sm text-slate-500">{order.emailAddress}</p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", order.status === "paid" ? "bg-emerald-50 text-emerald-700" : order.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="students" activeSection={activeSection}>
      <section id="students" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Students"
          description="Search learners, review enrollment and payment state, and block or unblock access when needed."
          icon={<UserRound className="h-5 w-5" />}
        />
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={studentQuery}
              onChange={(event) => setStudentQuery(event.target.value)}
              placeholder="Search students by name or email"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "blocked"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStudentFilter(item)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  studentFilter === item ? "bg-brand-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Enrollment</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length ? (
                filteredStudents.map((student) => {
                  const studentEnrollments = enrollments.filter((item) => item.userId === student.id);
                  const studentOrders = orders.filter((item) => item.userId === student.id);
                  const studentProgress = progress.find((item) => item.userId === student.id);
                  return (
                    <tr key={student.id} className="border-b border-slate-100">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 font-semibold text-brand-700">{initials(student.name)}</div>
                          <div>
                            <div className="font-medium text-slate-950">{student.name}</div>
                            <div className="text-sm text-slate-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-slate-700">{studentEnrollments.length} course(s)</div>
                        <div className="text-xs text-slate-500">{student.blocked ? "Blocked account" : "Active account"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-slate-700">{studentOrders.filter((order) => order.status === "paid").length} paid</div>
                        <div className="text-xs text-slate-500">{studentOrders.filter((order) => order.status === "created").length} pending</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-slate-700">{studentProgress?.percent ?? 0}% complete</div>
                        <div className="text-xs text-slate-500">{studentProgress?.lastLessonId ? `Last lesson: ${studentProgress.lastLessonId}` : "No progress yet"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={busyKey === `student:${student.id}`}
                          onClick={async () => {
                            setBusyKey(`student:${student.id}`);
                            try {
                              await api("/api/admin/users", "PATCH", { id: student.id, blocked: !student.blocked });
                              toast.success(student.blocked ? "Student unblocked" : "Student blocked");
                              refreshData();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Unable to update student");
                            } finally {
                              setBusyKey(null);
                            }
                          }}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition",
                            student.blocked ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-700"
                          )}
                        >
                          {busyKey === `student:${student.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          {student.blocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={5}>
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="courses" activeSection={activeSection}>
      <section id="courses" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Courses"
          description="Manage course details and video lessons in one focused workspace."
          icon={<BookOpen className="h-5 w-5" />}
        />
        <div className="mt-5 max-w-2xl">
          <form
            key={selectedCourse?.id ?? "new-course"}
            className="grid gap-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedCourse) return;
              setBusyKey("course");
              try {
                const formData = new FormData(event.currentTarget);
                const thumbnailFile = formData.get("thumbnailFile");
                const thumbnail = thumbnailFile instanceof File && thumbnailFile.size
                  ? await fileToDataUrl(thumbnailFile)
                  : selectedCourse?.thumbnail ?? "/images/course-thumb.svg";
                const existingModules = selectedCourse?.modules ?? [];
                const firstModule = existingModules[0] ?? {
                  id: crypto.randomUUID(),
                  title: "Course lessons",
                  description: "Video lessons",
                  order: 1,
                  lessons: []
                };
                const existingLesson = firstModule.lessons[0];
                const youtubeUrl = safeString(formData.get("youtubeUrl"));
                const videoLesson: Lesson = {
                  id: existingLesson?.id ?? crypto.randomUUID(),
                  title: existingLesson?.title ?? "SabjiHub Blueprint",
                  duration: existingLesson?.duration ?? "Video",
                  videoUrl: youtubeUrl,
                  summary: existingLesson?.summary ?? "SabjiHub Blueprint video lesson.",
                  description: existingLesson?.description,
                  thumbnail: existingLesson?.thumbnail,
                  resources: existingLesson?.resources
                };
                const payload = {
                  id: selectedCourse?.id,
                  slug: selectedCourse.slug,
                  title: safeString(formData.get("title")),
                  subtitle: selectedCourse.subtitle,
                  price: selectedCourse.price,
                  oldPrice: selectedCourse.oldPrice,
                  showDiscountDisplay: selectedCourse.showDiscountDisplay ?? true,
                  thumbnail,
                  published: selectedCourse.published,
                  hours: selectedCourse.hours,
                  previewLessonId: selectedCourse.previewLessonId,
                  includes: selectedCourse.includes,
                  outcomes: selectedCourse.outcomes,
                  modules: existingModules.length ? [{ ...firstModule, lessons: [videoLesson] }].concat(existingModules.slice(1)) : [{ ...firstModule, lessons: [videoLesson] }]
                };
                await api("/api/admin/courses", "POST", payload);
                toast.success("Course saved");
                refreshData();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save course");
              } finally {
                setBusyKey(null);
              }
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Course Title</span>
              <input name="title" defaultValue={selectedCourse?.title} className="h-11 rounded-2xl border border-slate-200 px-4" required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Course Thumbnail Upload</span>
              <input name="thumbnailFile" type="file" accept="image/*" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">YouTube Video Link</span>
              <input name="youtubeUrl" type="url" defaultValue={selectedCourse?.modules?.[0]?.lessons?.[0]?.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm" required />
            </label>
            <button type="submit" disabled={busyKey === "course"} className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
              {busyKey === "course" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Save Course
            </button>
          </form>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="pricing" activeSection={activeSection}>
      <section id="pricing" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Pricing"
          description="Control the course's original price, offer price, and discount visibility from one backend-backed setting."
          icon={<BadgePercent className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <form
            key={`pricing-${selectedCourse?.id ?? "new-course"}`}
            className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedCourse) return;
              setBusyKey("pricing");
              try {
                const originalPrice = Number(pricingForm.originalPrice);
                const offerPrice = Number(pricingForm.offerPrice);
                if (!Number.isFinite(originalPrice) || !Number.isFinite(offerPrice) || originalPrice < 0 || offerPrice < 0) {
                  throw new Error("Enter valid non-negative prices.");
                }

                await api("/api/admin/courses", "POST", {
                  id: selectedCourse.id,
                  slug: selectedCourse.slug,
                  title: selectedCourse.title,
                  subtitle: selectedCourse.subtitle,
                  price: offerPrice,
                  oldPrice: originalPrice,
                  showDiscountDisplay: pricingForm.showDiscountDisplay,
                  thumbnail: selectedCourse.thumbnail,
                  published: selectedCourse.published,
                  hours: selectedCourse.hours,
                  previewLessonId: selectedCourse.previewLessonId,
                  includes: selectedCourse.includes,
                  outcomes: selectedCourse.outcomes,
                  modules: selectedCourse.modules
                });
                selectedCourse.price = offerPrice;
                selectedCourse.oldPrice = originalPrice;
                selectedCourse.showDiscountDisplay = pricingForm.showDiscountDisplay;
                toast.success("Pricing saved");
                refreshData();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save pricing");
              } finally {
                setBusyKey(null);
              }
            }}
          >
            <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Select course</span>
                <select
                  value={selectedCourse?.id ?? ""}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Discount display</span>
                <button
                  type="button"
                  onClick={() => setPricingForm((current) => ({ ...current, showDiscountDisplay: !current.showDiscountDisplay }))}
                  className={cn(
                    "flex h-11 items-center justify-between rounded-2xl border px-4 text-sm font-medium transition",
                    pricingForm.showDiscountDisplay
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600"
                  )}
                >
                  <span>{pricingForm.showDiscountDisplay ? "Visible" : "Hidden"}</span>
                  <span className={cn("inline-flex h-6 w-10 items-center rounded-full p-1 transition", pricingForm.showDiscountDisplay ? "bg-emerald-600" : "bg-slate-300")}>
                    <span className={cn("h-4 w-4 rounded-full bg-white transition", pricingForm.showDiscountDisplay ? "translate-x-4" : "translate-x-0")} />
                  </span>
                </button>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Original Price</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={pricingForm.originalPrice}
                  onChange={(event) => setPricingForm((current) => ({ ...current, originalPrice: event.target.value }))}
                  placeholder="999"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Offer Price / Final Price</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={pricingForm.offerPrice}
                  onChange={(event) => setPricingForm((current) => ({ ...current, offerPrice: event.target.value }))}
                  placeholder="499"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={busyKey === "pricing"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busyKey === "pricing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
                Save Pricing
              </button>
            </div>
          </form>

          <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Live preview</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {selectedCourse?.title ?? "Selected course"}
                </h3>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", pricingForm.showDiscountDisplay ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}>
                {pricingForm.showDiscountDisplay ? "Discount visible" : "Discount hidden"}
              </span>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Original Price</span>
                  <span className="text-sm font-medium text-slate-500 line-through">
                    {pricingPreview ? formatCurrency(pricingPreview.originalPrice) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-emerald-700">Offer Price</span>
                  <span className="text-lg font-semibold text-slate-950">
                    {pricingPreview ? formatCurrency(pricingPreview.offerPrice) : "—"}
                  </span>
                </div>
                {pricingPreview && pricingPreview.hasDiscount && pricingForm.showDiscountDisplay ? (
                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                    <span className="text-sm font-medium text-emerald-700">
                      Discount ({pricingPreview.discountPercent}% OFF)
                    </span>
                    <span className="text-sm font-semibold text-emerald-700">
                      -{formatCurrency(pricingPreview.discountAmount)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                  <span className="text-sm font-medium text-slate-900">Total</span>
                  <span className="text-2xl font-bold tracking-tight text-slate-950">
                    {pricingPreview ? formatCurrency(pricingPreview.offerPrice) : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                  Lifetime Access
                </span>
                <span className="text-xs font-medium text-slate-500">Final total always follows the offer price.</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Example: Original ₹999, Offer ₹499, Discount ₹500, Total ₹499.
            </p>
          </div>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="enrollments" activeSection={activeSection}>
      <section id="enrollments" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Enrollments"
          description="Track which students purchased which course, enrollment dates, completion state, and progress."
          icon={<ListOrdered className="h-5 w-5" />}
        />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Progress</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length ? enrollments.map((enrollment) => {
                const student = users.find((user) => user.id === enrollment.userId);
                const course = courses.find((item) => item.id === enrollment.courseId);
                const record = progress.find((item) => item.userId === enrollment.userId && item.courseId === enrollment.courseId);
                return (
                  <tr key={enrollment.id} className="border-b border-slate-100">
                    <td className="px-4 py-4">{student?.name ?? enrollment.userId}</td>
                    <td className="px-4 py-4">{course?.title ?? enrollment.courseId}</td>
                    <td className="px-4 py-4">{formatDate(enrollment.enrolledAt)}</td>
                    <td className="px-4 py-4">{record?.percent ?? 0}%</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={4}>No enrollments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="payments" activeSection={activeSection}>
      <section id="payments" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Payments and orders"
          description="Review successful, pending, and failed payments, refund status, amounts, and payment IDs."
          icon={<Wallet className="h-5 w-5" />}
        />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Refund</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length ? orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-950">{order.fullName}</div>
                    <div className="text-xs text-slate-500">{order.providerPaymentId || order.providerOrderId || "No provider IDs yet"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", order.status === "paid" ? "bg-emerald-50 text-emerald-700" : order.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-4">{order.refundStatus ?? "none"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(["none", "requested", "refunded"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={async () => {
                            setBusyKey(`order:${order.id}:${status}`);
                            try {
                              await api("/api/admin/orders", "PATCH", { id: order.id, refundStatus: status });
                              toast.success("Order updated");
                              window.location.reload();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Unable to update order");
                            } finally {
                              setBusyKey(null);
                            }
                          }}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold transition",
                            order.refundStatus === status ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          {busyKey === `order:${order.id}:${status}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={5}>No orders recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="coupons" activeSection={activeSection}>
      <section id="coupons" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Coupons"
          description="Create, edit, and delete percentage or fixed coupons with expiry, limits, and enable state."
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form
            key={selectedCoupon?.id ?? "coupon-new"}
            className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusyKey("coupon");
              try {
                const formData = new FormData(event.currentTarget);
                await api("/api/admin/coupons", "POST", {
                  id: selectedCoupon?.id,
                  code: safeString(formData.get("code")),
                  type: safeString(formData.get("type"), "percent"),
                  value: Number(formData.get("value")),
                  expiresAt: safeString(formData.get("expiresAt")),
                  usageLimit: Number(formData.get("usageLimit")),
                  active: formData.get("active") === "on"
                });
                toast.success("Coupon saved");
                window.location.reload();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save coupon");
              } finally {
                setBusyKey(null);
              }
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Select coupon</span>
              <select value={selectedCoupon?.id ?? ""} onChange={(event) => setSelectedCouponId(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm">
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>{coupon.code}</option>
                ))}
              </select>
            </label>
            <input name="code" defaultValue={selectedCoupon?.code} placeholder="Coupon code" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="type" defaultValue={selectedCoupon?.type ?? "percent"} className="h-11 rounded-2xl border border-slate-200 px-4">
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
              <input name="value" type="number" defaultValue={selectedCoupon?.value} placeholder="value" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="expiresAt" type="date" defaultValue={selectedCoupon?.expiresAt?.slice(0, 10)} className="h-11 rounded-2xl border border-slate-200 px-4" required />
              <input name="usageLimit" type="number" defaultValue={selectedCoupon?.usageLimit} placeholder="usage limit" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input name="active" type="checkbox" defaultChecked={selectedCoupon?.active} />
              Active
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busyKey === "coupon"} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-70">
                {busyKey === "coupon" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save coupon
              </button>
              <button
                type="button"
                disabled={!selectedCoupon}
                onClick={async () => {
                  if (!selectedCoupon) return;
                  if (!window.confirm(`Delete coupon "${selectedCoupon.code}"?`)) return;
                  try {
                    await api(`/api/admin/coupons/${selectedCoupon.id}`, "DELETE");
                    toast.success("Coupon deleted");
                    window.location.reload();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to delete coupon");
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete coupon
              </button>
            </div>
          </form>
          <div className="grid gap-3">
            {coupons.map((coupon) => (
              <button
                key={coupon.id}
                type="button"
                onClick={() => setSelectedCouponId(coupon.id)}
                className={cn(
                  "rounded-[1.5rem] border p-4 text-left transition",
                  selectedCoupon?.id === coupon.id ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-brand-200"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{coupon.code}</div>
                    <div className="text-sm text-slate-500">{coupon.type} discount, {coupon.value}</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">{coupon.active ? "Active" : "Inactive"}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="testimonials" activeSection={activeSection}>
      <section id="testimonials" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Testimonials"
          description="Add, edit, hide, and delete testimonials with ratings, names, photos, and review copy."
          icon={<Star className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form
            key={selectedTestimonial?.id ?? "testimonial-new"}
            className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusyKey("testimonial");
              try {
                const formData = new FormData(event.currentTarget);
                await api("/api/admin/testimonials", "POST", {
                  id: selectedTestimonial?.id,
                  name: safeString(formData.get("name")),
                  location: safeString(formData.get("location")),
                  rating: Number(formData.get("rating")),
                  review: safeString(formData.get("review")),
                  avatar: safeString(formData.get("avatar")),
                  visible: formData.get("visible") === "on"
                });
                toast.success("Testimonial saved");
                window.location.reload();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save testimonial");
              } finally {
                setBusyKey(null);
              }
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Select testimonial</span>
              <select value={selectedTestimonial?.id ?? ""} onChange={(event) => setSelectedTestimonialId(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm">
                {testimonials.map((testimonial) => (
                  <option key={testimonial.id} value={testimonial.id}>{testimonial.name}</option>
                ))}
              </select>
            </label>
            <input name="name" defaultValue={selectedTestimonial?.name} placeholder="student name" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="location" defaultValue={selectedTestimonial?.location} placeholder="location" className="h-11 rounded-2xl border border-slate-200 px-4" required />
              <input name="rating" type="number" min="1" max="5" defaultValue={selectedTestimonial?.rating} placeholder="rating" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            </div>
            <input name="avatar" defaultValue={selectedTestimonial?.avatar} placeholder="avatar path" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            <textarea name="review" defaultValue={selectedTestimonial?.review} placeholder="review" className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3" required />
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input name="visible" type="checkbox" defaultChecked={selectedTestimonial?.visible ?? true} />
              Show on website
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busyKey === "testimonial"} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-70">
                {busyKey === "testimonial" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save testimonial
              </button>
              <button
                type="button"
                disabled={!selectedTestimonial}
                onClick={async () => {
                  if (!selectedTestimonial) return;
                  if (!window.confirm(`Delete testimonial "${selectedTestimonial.name}"?`)) return;
                  try {
                    await api(`/api/admin/testimonials/${selectedTestimonial.id}`, "DELETE");
                    toast.success("Testimonial deleted");
                    window.location.reload();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to delete testimonial");
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete testimonial
              </button>
            </div>
          </form>
          <div className="grid gap-3">
            {testimonials.map((testimonial) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => setSelectedTestimonialId(testimonial.id)}
                className={cn(
                  "rounded-[1.5rem] border p-4 text-left transition",
                  selectedTestimonial?.id === testimonial.id ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-brand-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">{initials(testimonial.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-950">{testimonial.name}</div>
                      <div className="inline-flex items-center gap-1 text-xs text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {testimonial.rating}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">{testimonial.location}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{testimonial.review}</div>
                    <div className="mt-2 text-xs font-semibold text-slate-500">{testimonial.visible ? "Visible" : "Hidden"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="preview-videos" activeSection={activeSection}>
      <section id="preview-videos" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Preview Videos"
          description="Manage the YouTube video shown in the home hero preview. Only one video can be active at a time."
          icon={<PlaySquare className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            key={selectedPreviewVideo?.id ?? "preview-video-new"}
            className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusyKey("preview-video");
              try {
                const formData = new FormData(event.currentTarget);
                await api("/api/admin/preview-videos", "POST", {
                  id: selectedPreviewVideo?.id,
                  title: safeString(formData.get("title")),
                  youtubeUrl: safeString(formData.get("youtubeUrl")),
                  description: safeString(formData.get("description")),
                  thumbnailUrl: safeString(formData.get("thumbnailUrl"), "/images/course-thumb.svg"),
                  active: formData.get("active") === "on"
                });
                toast.success(selectedPreviewVideo ? "Preview video updated" : "Preview video added");
                window.location.reload();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save preview video");
              } finally {
                setBusyKey(null);
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-950">{selectedPreviewVideo ? "Edit Preview Video" : "New Preview Video"}</h3>
              {selectedPreviewVideo ? <button type="button" onClick={() => setSelectedPreviewVideoId("")} className="text-xs font-semibold text-brand-700">Add new</button> : null}
            </div>
            <label className="grid gap-2"><span className="text-sm font-medium text-slate-700">Video Title</span><input name="title" defaultValue={selectedPreviewVideo?.title} placeholder="e.g. See How SabjiHub Was Built" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm" required /></label>
            <label className="grid gap-2"><span className="text-sm font-medium text-slate-700">YouTube URL</span><input name="youtubeUrl" type="url" defaultValue={selectedPreviewVideo?.youtubeUrl} placeholder="https://www.youtube.com/watch?v=..." className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm" required /></label>
            <label className="grid gap-2"><span className="text-sm font-medium text-slate-700">Short Description</span><textarea name="description" defaultValue={selectedPreviewVideo?.description} placeholder="A short description for the home preview" className="min-h-20 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" required /></label>
            <label className="grid gap-2"><span className="text-sm font-medium text-slate-700">Thumbnail URL</span><input name="thumbnailUrl" type="url" defaultValue={selectedPreviewVideo?.thumbnailUrl} placeholder="https://... or /images/course-thumb.svg" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm" /></label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"><input name="active" type="checkbox" defaultChecked={selectedPreviewVideo?.active ?? !previewVideos.some((video) => video.active)} className="h-4 w-4 accent-emerald-600" />Active on home page</label>
            <button type="submit" disabled={busyKey === "preview-video"} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-70"><Plus className="h-4 w-4" />{busyKey === "preview-video" ? "Saving..." : selectedPreviewVideo ? "Update Preview Video" : "Add Preview Video"}</button>
          </form>

          <div className="grid content-start gap-3">
            {previewVideos.map((video) => (
              <div key={video.id} className={cn("rounded-[1.5rem] border p-4 transition", selectedPreviewVideo?.id === video.id ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-slate-50")}>
                <div className="flex items-start gap-4">
                  <img src={video.thumbnailUrl} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-slate-950">{video.title}</h3><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", video.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>{video.active ? "Active" : "Inactive"}</span></div>
                    <p className="mt-1 truncate text-xs text-slate-500">{video.youtubeUrl}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{video.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
                  <button type="button" onClick={() => setSelectedPreviewVideoId(video.id)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Edit</button>
                  <button type="button" onClick={async () => { try { await api("/api/admin/preview-videos", "POST", { ...video, active: true }); toast.success("Active preview updated"); window.location.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to activate preview"); } }} disabled={video.active} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-50">Set active</button>
                  <button type="button" onClick={async () => { if (!window.confirm(`Delete preview video "${video.title}"?`)) return; try { await api(`/api/admin/preview-videos/${video.id}`, "DELETE"); toast.success("Preview video deleted"); window.location.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete preview video"); } }} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">Delete</button>
                </div>
              </div>
            ))}
            {!previewVideos.length ? <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No preview videos yet. Add a YouTube preview to show on the home page.</div> : null}
          </div>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="app-showcase" activeSection={activeSection}>
      <section id="app-showcase" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="App Showcase"
          description="Upload customer app screenshots, add titles and categories, delete old entries, and reorder the gallery shown on the homepage."
          icon={<Image className="h-5 w-5" />}
        />
        <div className="mt-5">
          <AppShowcaseManager screenshots={appShowcaseScreenshots} onUpdated={() => window.location.reload()} />
        </div>
      </section>
      </AdminSection>

      <AdminSection id="content" activeSection={activeSection}>
      <section id="content" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Website content"
          description="Manage the hero, value props, mentor text, curriculum blocks, success stories, FAQ, CTA, and announcement copy."
          icon={<Globe2 className="h-5 w-5" />}
        />
        <form
          className="mt-5 grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusyKey("content");
            try {
              const formData = new FormData(event.currentTarget);
              await api("/api/admin/site-config", "POST", {
                heroHeadline: safeString(formData.get("heroHeadline")),
                heroSubheadline: safeString(formData.get("heroSubheadline")),
                stats: safeParseArray(formData.get("stats"), siteConfig.stats),
                dashboardShowcaseImage: safeString(formData.get("dashboardShowcaseImage"), dashboardShowcasePreview),
                whyTitle: safeString(formData.get("whyTitle")),
                whyDescription: safeString(formData.get("whyDescription")),
                whyPoints: safeParseArray(formData.get("whyPoints"), siteConfig.whyPoints ?? []),
                mentorName: safeString(formData.get("mentorName")),
                mentorRole: safeString(formData.get("mentorRole")),
                mentorBio: safeString(formData.get("mentorBio")),
                mentorExperience: safeString(formData.get("mentorExperience")),
                mentorQuote: safeString(formData.get("mentorQuote")),
                learnTitle: safeString(formData.get("learnTitle")),
                learnDescription: safeString(formData.get("learnDescription")),
                learnCards: safeParseArray(formData.get("learnCards"), siteConfig.learnCards ?? []),
                storyTitle: safeString(formData.get("storyTitle")),
                storyDescription: safeString(formData.get("storyDescription")),
                storySteps: safeParseArray(formData.get("storySteps"), siteConfig.storySteps ?? []),
                faqTitle: safeString(formData.get("faqTitle")),
                faqs: safeParseArray(formData.get("faqs"), siteConfig.faqs ?? []),
                ctaTitle: safeString(formData.get("ctaTitle")),
                ctaDescription: safeString(formData.get("ctaDescription")),
                announcement: safeString(formData.get("announcement")),
                paymentSettings: {
                  provider: safeString(formData.get("paymentProvider"), "Cashfree"),
                  enabled: formData.get("paymentEnabled") === "on"
                },
                socialLinks: {
                  instagram: safeString(formData.get("instagram")),
                  facebook: safeString(formData.get("facebook")),
                  whatsapp: safeString(formData.get("whatsapp"))
                }
              });
              toast.success("Website content updated");
              window.location.reload();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to update content");
            } finally {
              setBusyKey(null);
            }
          }}
        >
          <input type="hidden" name="dashboardShowcaseImage" value={dashboardShowcasePreview} />
          <div className="grid gap-4 rounded-[1.5rem] border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  <Image className="h-3.5 w-3.5" />
                  SabjiHub Dashboard Showcase
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">Homepage dashboard screenshot</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Upload the screenshot you want to show on the homepage. JPG, PNG and WebP are supported.
                  The homepage will use the saved image automatically, and you can replace it any time.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">
                <Upload className="h-4 w-4" />
                Choose image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      setDashboardShowcasePreview(await fileToDataUrl(file));
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Unable to read the selected image");
                    }
                  }}
                />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Preview before saving</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  The selected screenshot appears here before it is saved to Website Content.
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Last updated through Website Content
                </p>
                <button
                  type="button"
                  onClick={() => setDashboardShowcasePreview(siteConfig.dashboardShowcaseImage || "/images/sabjihub-dashboard-showcase.svg")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Image className="h-3.5 w-3.5" />
                  Reset preview
                </button>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Homepage preview</p>
                  <p className="mt-1 text-sm text-slate-600">Responsive and ready for the browser-style showcase on the homepage.</p>
                </div>
                <div className="bg-slate-100 p-3">
                  <img
                    src={dashboardShowcasePreview}
                    alt="SabjiHub dashboard showcase preview"
                    className="h-full w-full rounded-[1rem] border border-slate-200 bg-white object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <input name="heroHeadline" defaultValue={siteConfig.heroHeadline} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Hero headline" />
            <textarea name="heroSubheadline" defaultValue={siteConfig.heroSubheadline} className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 lg:col-span-2" placeholder="Hero subheadline" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <textarea name="stats" defaultValue={JSON.stringify(siteConfig.stats, null, 2)} className="min-h-44 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs" placeholder="Stats JSON" />
            <textarea name="whyPoints" defaultValue={JSON.stringify(siteConfig.whyPoints ?? [], null, 2)} className="min-h-44 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs" placeholder="Why points JSON" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <input name="whyTitle" defaultValue={siteConfig.whyTitle} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Why section title" />
            <input name="whyDescription" defaultValue={siteConfig.whyDescription} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Why section description" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <input name="mentorName" defaultValue={siteConfig.mentorName} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Mentor name" />
            <input name="mentorRole" defaultValue={siteConfig.mentorRole} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Mentor role" />
            <textarea name="mentorBio" defaultValue={siteConfig.mentorBio} className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 lg:col-span-2" placeholder="Mentor bio" />
            <input name="mentorExperience" defaultValue={siteConfig.mentorExperience} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Mentor experience" />
            <textarea name="mentorQuote" defaultValue={siteConfig.mentorQuote} className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 lg:col-span-2" placeholder="Mentor quote" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <input name="learnTitle" defaultValue={siteConfig.learnTitle} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="What you'll learn title" />
            <input name="learnDescription" defaultValue={siteConfig.learnDescription} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="What you'll learn description" />
            <textarea name="learnCards" defaultValue={JSON.stringify(siteConfig.learnCards ?? [], null, 2)} className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs lg:col-span-2" placeholder="Learn cards JSON" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <input name="storyTitle" defaultValue={siteConfig.storyTitle} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Success stories title" />
            <input name="storyDescription" defaultValue={siteConfig.storyDescription} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Success stories description" />
            <textarea name="storySteps" defaultValue={JSON.stringify(siteConfig.storySteps ?? [], null, 2)} className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs lg:col-span-2" placeholder="Success stories JSON" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <input name="faqTitle" defaultValue={siteConfig.faqTitle} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="FAQ title" />
            <textarea name="faqs" defaultValue={JSON.stringify(siteConfig.faqs ?? [], null, 2)} className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs" placeholder="FAQs JSON" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <input name="ctaTitle" defaultValue={siteConfig.ctaTitle} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="CTA title" />
            <textarea name="ctaDescription" defaultValue={siteConfig.ctaDescription} className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3" placeholder="CTA description" />
            <textarea name="announcement" defaultValue={siteConfig.announcement} className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3" placeholder="Announcement text" />
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <input name="paymentProvider" defaultValue={siteConfig.paymentSettings?.provider ?? "Cashfree"} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Payment provider" />
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input name="paymentEnabled" type="checkbox" defaultChecked={siteConfig.paymentSettings?.enabled ?? true} />
              Payment enabled
            </label>
            <input name="instagram" defaultValue={siteConfig.socialLinks?.instagram} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Instagram URL" />
            <input name="facebook" defaultValue={siteConfig.socialLinks?.facebook} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="Facebook URL" />
            <input name="whatsapp" defaultValue={siteConfig.socialLinks?.whatsapp} className="h-11 rounded-2xl border border-slate-200 px-4" placeholder="WhatsApp URL" />
          </div>
          <button type="submit" disabled={busyKey === "content"} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-70">
            {busyKey === "content" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Save website content
          </button>
        </form>
      </section>
      </AdminSection>

      <AdminSection id="analytics" activeSection={activeSection}>
      <section id="analytics" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Analytics"
          description="Revenue, enrollment, daily sales, and course completion snapshots."
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Revenue" value={formatCurrency(totalRevenue)} detail={`${paidOrders.length} paid orders`} icon={<CircleDollarSign className="h-4 w-4" />} />
          <MetricCard title="Daily sales" value={formatCurrency(todaySales)} detail="Today only" icon={<Clock3 className="h-4 w-4" />} />
          <MetricCard title="Enrollment count" value={String(enrollments.length)} detail={`${completedEnrollments} completed`} icon={<BookOpen className="h-4 w-4" />} />
          <MetricCard title="Completion rate" value={`${enrollments.length ? Math.round((completedEnrollments / enrollments.length) * 100) : 0}%`} detail="Course completion" icon={<CheckCircle2 className="h-4 w-4" />} />
        </div>
      </section>
      </AdminSection>

      <AdminSection id="settings" activeSection={activeSection}>
      <section id="settings" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Admin settings"
          description="Update payment settings, social links, and platform defaults."
          icon={<Megaphone className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Current payment provider</p>
            <p className="mt-2 text-sm text-slate-600">{siteConfig.paymentSettings?.provider ?? "Cashfree"}</p>
            <p className="mt-4 text-sm text-slate-500">
              Status: {siteConfig.paymentSettings?.enabled === false ? "Disabled" : "Enabled"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Website channels</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Instagram: {siteConfig.socialLinks?.instagram || "Not set"}</p>
              <p>Facebook: {siteConfig.socialLinks?.facebook || "Not set"}</p>
              <p>WhatsApp: {siteConfig.socialLinks?.whatsapp || "Not set"}</p>
            </div>
          </div>
        </div>
      </section>
      </AdminSection>

      <AdminSection id="content" activeSection={activeSection}>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <SectionHeader
          title="Announcements"
          description="Create homepage and dashboard announcements for students."
          icon={<FileDown className="h-5 w-5" />}
        />
        <div className="mt-5 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form
            className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                const formData = new FormData(event.currentTarget);
                await api("/api/admin/announcements", "POST", {
                  title: safeString(formData.get("title")),
                  body: safeString(formData.get("body"))
                });
                toast.success("Announcement created");
                window.location.reload();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to create announcement");
              }
            }}
          >
            <input name="title" placeholder="title" className="h-11 rounded-2xl border border-slate-200 px-4" required />
            <textarea name="body" placeholder="body" className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3" required />
            <button className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white">Create announcement</button>
          </form>
          <div className="grid gap-3">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{item.body}</div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api(`/api/admin/announcements/${item.id}`, "DELETE");
                        toast.success("Announcement deleted");
                        window.location.reload();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Unable to delete announcement");
                      }
                    }}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AdminSection>
    </div>
  );
}

function MetricCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">{icon}</div>
      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function LessonEditor({ course, onChange }: { course?: Course; onChange: (lessons: Lesson[]) => void }) {
  const [lessons, setLessons] = useState<Lesson[]>(course?.modules?.[0]?.lessons ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  useEffect(() => {
    setLessons(course?.modules?.[0]?.lessons ?? []);
    resetForm();
  }, [course?.id]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setVideoUrl("");
    setVideoTitle("");
    setVideoDescription("");
    setLessonDescription("");
    setThumbnail(undefined);
  }

  function saveLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const previousLesson = lessons.find((item) => item.id === editingId);
    const preservedResources = previousLesson?.resources?.filter((resource) => resource.type !== "video") ?? [];
    const lesson: Lesson = {
      id: editingId ?? crypto.randomUUID(),
      title: title.trim(),
      duration: "Video",
      videoUrl: videoUrl.trim(),
      summary: videoDescription.trim() || lessonDescription.trim(),
      description: lessonDescription.trim(),
      thumbnail,
      resources: [...preservedResources, { title: videoTitle.trim(), url: videoUrl.trim(), type: "video" }]
    };
    const nextLessons = editingId ? lessons.map((item) => item.id === editingId ? lesson : item) : [...lessons, lesson];
    setLessons(nextLessons);
    onChange(nextLessons);
    resetForm();
    toast.success(editingId ? "Lesson updated" : "Lesson added");
  }

  function editLesson(lesson: Lesson) {
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setVideoUrl(lesson.videoUrl);
    setVideoTitle(lesson.resources?.find((resource) => resource.type === "video")?.title ?? lesson.title);
    setVideoDescription(lesson.summary);
    setLessonDescription(lesson.description ?? "");
    setThumbnail(lesson.thumbnail);
  }

  function deleteLesson(id: string) {
    const nextLessons = lessons.filter((lesson) => lesson.id !== id);
    setLessons(nextLessons);
    onChange(nextLessons);
    if (editingId === id) resetForm();
  }

  return (
    <div className="grid content-start gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-sm text-white/60">Lesson and video management</p>
          <h3 className="mt-1 text-xl font-semibold">{lessons.length} lesson{lessons.length === 1 ? "" : "s"}</h3>
        </div>
        {editingId ? <button type="button" onClick={resetForm} className="text-xs font-semibold text-white/70 hover:text-white">Cancel edit</button> : null}
      </div>
      <form className="grid gap-3" onSubmit={saveLesson}>
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Lesson Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 rounded-2xl border-0 bg-white/10 px-4 text-sm text-white outline-none" required /></label>
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">YouTube Video Link</span><input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="h-11 rounded-2xl border-0 bg-white/10 px-4 text-sm text-white outline-none" required /></label>
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Video Title</span><input value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} className="h-11 rounded-2xl border-0 bg-white/10 px-4 text-sm text-white outline-none" required /></label>
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Video Description</span><textarea value={videoDescription} onChange={(event) => setVideoDescription(event.target.value)} className="min-h-20 rounded-2xl border-0 bg-white/10 px-4 py-3 text-sm text-white outline-none" required /></label>
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Lesson Description</span><textarea value={lessonDescription} onChange={(event) => setLessonDescription(event.target.value)} className="min-h-20 rounded-2xl border-0 bg-white/10 px-4 py-3 text-sm text-white outline-none" /></label>
        <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Lesson Thumbnail Upload</span><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setThumbnail(await fileToDataUrl(file)); }} className="rounded-2xl bg-white/10 px-3 py-3 text-xs text-white/70" /></label>
        <button type="submit" className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400"><Plus className="h-4 w-4" />{editingId ? "Update Lesson" : "Add Lesson"}</button>
      </form>
      <div className="grid gap-2">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-medium">{index + 1}. {lesson.title}</p><p className="mt-1 truncate text-xs text-brand-200">{lesson.videoUrl}</p></div>
              <div className="flex shrink-0 gap-2"><button type="button" onClick={() => editLesson(lesson)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Edit</button><button type="button" onClick={() => deleteLesson(lesson.id)} className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-semibold text-red-200">Delete</button></div>
            </div>
          </div>
        ))}
        {!lessons.length ? <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-white/60">No lessons yet. Add the first video lesson above.</p> : null}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {icon}
          <span>{title}</span>
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
