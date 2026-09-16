"use client";

import { CheckCircle2, Lock, PlayCircle, SkipBack, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Course, Lesson, Enrollment } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";

function youtubeEmbedUrl(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const videoId = hostname === "youtu.be"
      ? pathParts[0]
      : parsed.searchParams.get("v") || (pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live" ? pathParts[1] : null);
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
  const sortedModules = useMemo(() => [...course.modules].sort((a, b) => a.order - b.order).slice(0, 1), [course.modules]);
  const lessons = useMemo(() => sortedModules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))), [sortedModules]);
  const [activeLesson, setActiveLesson] = useState<Lesson & { moduleTitle: string } | null>(lessons[0] ?? null);
  const [busy, setBusy] = useState(false);

  const completedLessonIds = enrollment?.completedLessonIds ?? [];
  const completedCount = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const activeVideoUrl = activeLesson?.videoUrl || activeLesson?.resources?.find((resource) => resource.type === "video")?.url;

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
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-soft">
          <div className="border-b border-white/10 px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/60">Now playing</p>
                <h2 className="mt-1 text-xl font-semibold">{activeLesson?.title}</h2>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{activeLesson?.duration}</div>
            </div>
          </div>
          <div className="aspect-video bg-gradient-to-br from-brand-950 via-slate-950 to-brand-800 p-8 text-white">
            <div className="grid h-full place-items-center rounded-[1.5rem] border border-white/10 bg-white/5">
              {canAccess && activeLesson && youtubeEmbedUrl(activeVideoUrl) ? (
                <iframe className="h-full w-full rounded-[1.5rem]" src={youtubeEmbedUrl(activeVideoUrl) ?? undefined} title={activeLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : <div className="text-center">
                <PlayCircle className="mx-auto h-16 w-16 text-brand-300" />
                <p className="mt-4 text-sm text-white/70">{canAccess ? "Video link unavailable" : "Purchase required to unlock lessons"}</p>
                {!canAccess ? <Link href={`/checkout?course=${course.slug}`} className="mt-5 inline-flex items-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white">Join Now - {formatCurrency(course.price)}</Link> : null}
              </div>}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Course progress</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{progress}% complete</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                <SkipBack className="h-4 w-4" />
                Previous
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                Next
                <SkipForward className="h-4 w-4" />
              </button>
              <button
                onClick={markCompleted}
                disabled={!canAccess || busy}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark completed
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Modules</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">{sortedModules.length} modules</h3>
          </div>
          {!canAccess ? <Lock className="h-5 w-5 text-slate-400" /> : null}
        </div>

        <div className="mt-5 grid gap-4">
          {sortedModules.map((module) => (
            <div key={module.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-950">
                {module.order.toString().padStart(2, "0")} - {module.title}
              </div>
              <p className="mt-1 text-xs leading-6 text-slate-500">{module.description}</p>
              <div className="mt-3 grid gap-2">
                {module.lessons.map((lesson) => {
                  const completed = completedLessonIds.includes(lesson.id);
                  const active = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => canAccess && setActiveLesson({ ...lesson, moduleTitle: module.title })}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-sm transition",
                        active ? "bg-brand-50 text-brand-800" : "hover:bg-slate-50",
                        !canAccess && "cursor-not-allowed opacity-70"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {completed ? <CheckCircle2 className="h-4 w-4 text-brand-600" /> : <PlayCircle className="h-4 w-4 text-slate-400" />}
                        <span>{lesson.title}</span>
                      </span>
                      <span className="text-xs text-slate-500">{lesson.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
