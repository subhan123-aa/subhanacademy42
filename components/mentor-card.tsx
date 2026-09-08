import Image from "next/image";
import { BadgeCheck, BookOpen, Code2, Sparkles } from "lucide-react";

export function MentorCard() {
  return (
    <article className="relative overflow-hidden rounded-[2.2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-emerald-400" />

      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-8 py-10 sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_38%)]" />
          <div className="relative w-full max-w-sm">
            <div className="mx-auto flex aspect-square w-full max-w-[18rem] items-center justify-center rounded-full border-4 border-white/90 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="relative aspect-square w-full overflow-hidden rounded-full">
                <Image
                  src="/images/mentor-subhan.png"
                  alt="Subhan Ali portrait"
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                Founder
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
                Verified Mentor
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Mentor Profile</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Subhan Ali</h2>
            <p className="mt-3 max-w-xl text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[0.82rem]">
              Founder, SabjiHub & Full-Stack Flutter Developer
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <Code2 className="h-4 w-4" />
              2+ Years of Development Experience
            </div>

            <blockquote className="mt-7 border-l-4 border-emerald-500 pl-5 text-base leading-8 text-slate-600 sm:text-lg">
              "I built SabjiHub from idea to launch and now I’m sharing the real lessons, strategies and practical knowledge behind the journey through SabjiHub Blueprint."
            </blockquote>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  Practical Teaching
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Built for founders who want real execution, not generic theory.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Premium Experience
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Clean, focused, and designed to help students move from idea to launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

