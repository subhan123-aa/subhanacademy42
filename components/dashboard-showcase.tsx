"use client";

import { Circle, Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function DashboardShowcase({
  src,
  alt,
  updatedText = "Managed from Website Content"
}: {
  src: string;
  alt: string;
  updatedText?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const image = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[1rem] border border-slate-200 bg-white text-left"
      aria-label="Open SabjiHub dashboard screenshot"
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.01]")}
      />
    </button>
  );

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-2 sm:p-3">
          <div className="overflow-hidden rounded-[1.15rem] bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:inline-flex">
                <Circle className="h-2.5 w-2.5 fill-brand-500 text-brand-500" />
                SabjiHub Admin
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Minus className="h-3 w-3" />
                <Square className="h-3 w-3" />
              </div>
            </div>

            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">Dashboard preview</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">SabjiHub operations and admin tools</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-brand-700">
                  LIVE SCREENSHOT
                </span>
              </div>
            </div>

            <div className="bg-slate-100 p-3 sm:p-4">
              <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white">
                <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Website content showcase</p>
                    <p className="mt-1 text-xs text-slate-500">{updatedText}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Orders", "Revenue", "Students"].map((item) => (
                      <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 sm:p-4">{image}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <div
                className="relative w-full max-w-[90vw] animate-[dashboard-modal-in_180ms_ease-out] sm:max-h-[90vh]"
                role="dialog"
                aria-modal="true"
                aria-label="SabjiHub dashboard screenshot"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/85 text-white shadow-lg transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label="Close dashboard preview"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
                  <div className="max-h-[90vh] overflow-auto p-3 sm:p-4">
                    <img
                      src={src}
                      alt={alt}
                      className="mx-auto h-auto w-full max-w-[90vw] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
