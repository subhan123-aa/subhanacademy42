"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">We could not complete that request.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">Please try again or return to the homepage.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white">
            Try again
          </button>
          <Link href="/" className="inline-flex h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
