"use client";

import { Play } from "lucide-react";
import { useState } from "react";

const previewVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";

export default function VideoPreview() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="preview" className="bg-slate-950 py-16 sm:py-20" aria-labelledby="preview-heading">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
            <span className="inline-flex rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] text-brand-300">
              FREE PREVIEW
            </span>
            <h2 id="preview-heading" className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Watch the Free Preview
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              See how I built SabjiHub and what you'll learn inside the course.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="aspect-video">
              {isPlaying ? (
                <iframe
                  className="h-full w-full"
                  src={previewVideoUrl}
                  title="SabjiHub course introduction"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group relative h-full w-full text-left"
                  aria-label="Play the SabjiHub course introduction"
                >
                  <img src="/images/course-thumb.svg" alt="SabjiHub Blueprint course preview" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_0_10px_rgba(22,163,74,0.2)] transition-transform duration-200 group-hover:scale-105 sm:h-24 sm:w-24">
                      <Play className="ml-1 h-8 w-8 fill-current sm:h-9 sm:w-9" />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <span className="block text-lg font-semibold text-white sm:text-xl">A practical blueprint for building local commerce</span>
                    <span className="mt-1 block text-sm text-slate-300">Start with the idea, understand the system, and build with clarity.</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}