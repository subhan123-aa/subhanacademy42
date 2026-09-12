"use client";

import { CheckCircle2, Clock3, PlayCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Course, Lesson, Enrollment } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";

function youtubeEmbedUrl(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const videoId = parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function CoursePlayer({
  course,
  enrollment,
  canAccess
}: {
  course: Course;
  enrollment?: Enrollment | null;
  canAccess: boolean;
}) {
  const sortedModules = useMemo(() => [...course.modules].sort((a, b) => a.order - b.order), [course.modules]);
  const lessons = useMemo(() => sortedModules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))), [sortedModules]);
  const activeLesson = lessons[0] ?? null;
  const [busy, setBusy] = useState(false);

  const completedLessonIds = enrollment?.completedLessonIds ?? [];
  const completedCount = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  async function markCompleted() {
    if (!activeLesson) return;
    setBusy(true);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          lessonId: activeLesson.id
        })
      });
      if (!response.ok) throw new Error("Unable to save progress.");
      toast.success("Lesson marked as completed");
      const data = await response.json();
      if (data.enrollment?.completedLessonIds?.length === lessons.length && data.certificateId) {
        toast.success("Course completed. Certificate unlocked.");
      }
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-soft">
        <div className="border-b border-white/10 px-5 py-5 text-white sm:px-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-200">Your complete learning experience</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">SabjiHub Blueprint</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{activeLesson?.title}</p>
            </div>
            {activeLesson ? <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80"><Clock3 className="h-3.5 w-3.5" />{activeLesson.duration}</span> : null}
          </div>
        </div>
        <div className="aspect-video bg-gradient-to-br from-brand-950 via-slate-950 to-brand-800 p-3 sm:p-7">
          <div className="grid h-full place-items-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
            {canAccess && activeLesson && youtubeEmbedUrl(activeLesson.videoUrl) ? (
              <iframe className="h-full w-full" src={youtubeEmbedUrl(activeLesson.videoUrl) ?? undefined} title={activeLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : <div className="text-center">
              <PlayCircle className="mx-auto h-16 w-16 text-brand-300" />
              <p className="mt-4 text-sm text-white/70">{canAccess ? "Video link unavailable" : "Purchase required to unlock the course"}</p>
              {!canAccess ? <Link href={`/checkout?course=${course.slug}`} className="mt-5 inline-flex items-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white">Join Now - {formatCurrency(course.price)}</Link> : null}
            </div>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex items-center gap-3 text-brand-700"><Sparkles className="h-5 w-5" /><p className="text-sm font-semibold uppercase tracking-[0.18em]">About this course</p></div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Build your grocery delivery business with confidence.</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{course.subtitle} Follow the complete SabjiHub journey from the first idea through planning, building, launching, and growing a practical local delivery business.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">Practical business lessons</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">Learn at your own pace</span>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm text-slate-500">Course progress</p><p className="mt-1 text-3xl font-semibold text-slate-950">{progress}%</p></div>
            <CheckCircle2 className="mt-1 h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-sm text-slate-500">{completedCount} of {lessons.length} lessons completed</p>
          <button onClick={markCompleted} disabled={!canAccess || busy || !activeLesson || completedLessonIds.includes(activeLesson?.id ?? "")} className={cn("mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50")}>
            <CheckCircle2 className="h-4 w-4" />
            {completedLessonIds.includes(activeLesson?.id ?? "") ? "Completed" : "Mark completed"}
          </button>
        </div>
      </section>
    </div>
  );
}
