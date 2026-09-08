import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">The page you were looking for is not available.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white">
          Back home
        </Link>
      </div>
    </main>
  );
}
