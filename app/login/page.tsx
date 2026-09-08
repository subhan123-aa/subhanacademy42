import { AuthPanel } from "@/components/auth-panel";
import { Container } from "@/components/site";
import { BrandLogo } from "@/components/brand-logo";
import { BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const nextUrl = next && next.startsWith("/") && !next.startsWith("//") ? next : "/student/dashboard";
  return (
    <main className="min-h-screen bg-white bg-[linear-gradient(rgba(22,163,74,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.045)_1px,transparent_1px)] bg-[size:32px_32px] py-8 sm:py-12">
      <Container className="flex min-h-[calc(100vh-4rem)] items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_0.86fr] lg:gap-20">
          <section className="max-w-xl px-2 py-4 lg:px-0">
            <a href="/" className="mb-10 inline-flex items-center gap-3 text-slate-950">
              <BrandLogo className="h-auto w-[220px] sm:w-[280px]" />
            </a>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Your next chapter starts here</p>
            <h1 className="max-w-lg text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Welcome Back to Your Learning Journey
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Pick up where you left off, learn at your own pace, and turn your goals into real-world skills.
            </p>
            <ul className="mt-9 grid gap-4 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><BookOpenCheck className="h-4 w-4" /></span>Learn from practical, expert-led courses</li>
              <li className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><GraduationCap className="h-4 w-4" /></span>Build skills that move your career forward</li>
              <li className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><ShieldCheck className="h-4 w-4" /></span>Learn in a focused, supportive community</li>
            </ul>
          </section>
          <AuthPanel mode="login" nextUrl={nextUrl} variant="branded-login" />
        </div>
      </Container>
    </main>
  );
}
