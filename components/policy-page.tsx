import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Footer, Navbar } from "@/components/site";

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: boolean;
};

export function PolicyPage({ title, sections }: { title: string; sections: PolicySection[] }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Container className="py-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <header className="mt-8 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50/60 p-6 shadow-soft sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">Subhan Academy</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
              <p className="mt-4 text-sm font-medium text-slate-500">Last Updated: September 1, 2026</p>
            </header>
            <article className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft sm:mt-8">
              <div className="divide-y divide-slate-200 px-6 sm:px-10">
                {sections.map((section) => (
                  <section key={section.title} className={section.callout ? "my-6 rounded-2xl border border-brand-100 bg-brand-50/70 p-5 sm:p-6" : "py-7 first:pt-8 last:pb-9 sm:py-9"}>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{paragraph}</p>)}
                    {section.bullets ? <ul className="mt-4 grid gap-2.5 pl-5 text-sm leading-7 text-slate-600 marker:text-brand-600 sm:text-base">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
                  </section>
                ))}
              </div>
            </article>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
