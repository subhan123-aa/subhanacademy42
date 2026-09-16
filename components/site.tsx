"use client";

import Link from "next/link";
import { ArrowRight, Check, Menu, Play, Sparkles, X } from "lucide-react";
import type { PreviewVideo } from "@/lib/types";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700 shadow-glow"
      : variant === "secondary"
        ? "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
        : "text-slate-700 hover:text-slate-950";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5",
        styles,
        className
      )}
    >
      {children}
      {variant === "primary" ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p> : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-pretty text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-soft">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Navbar({
  price = 0,
  ctaLabel
}: {
  price?: number;
  ctaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/#about", label: "About" },
    { href: "/#stories", label: "Success Stories" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#how-it-works", label: "How It Works" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white">
      <Container className="flex h-16 items-center justify-between gap-2 sm:h-[4.25rem] sm:gap-3 lg:gap-4">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo className="h-auto w-[132px] sm:w-[142px] lg:w-[154px]" />
        </Link>

        <nav className="hidden items-center gap-4 xl:gap-5 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[11px] font-medium text-slate-600 transition hover:text-slate-950 xl:text-xs">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/login" variant="secondary" className="border-emerald-100 px-4 py-2 text-xs">
            Login
          </ButtonLink>
          <ButtonLink href="/checkout?course=sabjihub-blueprint" className="px-4 py-2 text-xs">
            {ctaLabel ?? `Join Now - ${formatCurrency(price)}`}
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4 text-slate-700" />
        </button>
      </Container>

      {open ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="grid gap-3 py-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/login" variant="secondary" className="w-full">
              Login
            </ButtonLink>
            <ButtonLink href="/checkout?course=sabjihub-blueprint" className="w-full">
              {ctaLabel ?? `Join Now - ${formatCurrency(price)}`}
            </ButtonLink>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo className="h-auto w-[220px]" />
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
            A modern course platform for practical entrepreneurship, app-building, and local business launch systems.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><Link href="/courses">Courses</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/auth/signup">Signup</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Policies</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
            <li><Link href="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

export function HighlightRow({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-[13px] font-medium text-brand-800 shadow-soft">
          <Check className="h-4 w-4 shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function MockDeviceFrame({
  title,
  subtitle,
  icon
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white">{icon}</div>
          <div>
            <div className="text-sm font-semibold text-slate-950">{title}</div>
            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Today</span>
              <span className="text-xs font-semibold text-brand-700">+18%</span>
            </div>
            <div className="mt-3 h-24 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">Orders</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">42</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">₹12,400</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroVisual({
  previewVideo,
  variant = "default"
}: {
  previewVideo?: PreviewVideo | null;
  variant?: "default" | "mobile";
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = previewVideo?.embedUrl ?? "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";
  const thumbnailUrl =
    previewVideo?.thumbnailUrl && !previewVideo.thumbnailUrl.includes("course-thumb.svg")
      ? previewVideo.thumbnailUrl
      : "/images/mentor-subhan.png";
  const title = previewVideo?.title || "SabjiHub course introduction";
  const description = previewVideo?.description || "See how I built SabjiHub and what you will learn inside the course.";
  const wrapperClassName =
    variant === "mobile" ? "relative flex w-full items-center justify-center overflow-hidden" : "relative flex items-center justify-center";
  const cardClassName =
    variant === "mobile"
      ? "w-full overflow-hidden rounded-[1.75rem] border border-brand-100 bg-white shadow-[0_22px_60px_rgba(22,163,74,0.14)]"
      : "relative w-full max-w-[26rem] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-soft";

  return (
    <div className={wrapperClassName}>
      <div className="pointer-events-none absolute -left-10 top-8 h-36 w-36 rounded-full bg-brand-50 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 top-20 h-44 w-44 rounded-full bg-emerald-100 opacity-60 blur-3xl" />

      <div id="preview" className={cardClassName}>
        <div className="aspect-video">
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative h-full w-full text-left"
            aria-label={`Play ${title}`}
          >
            <img src={thumbnailUrl} alt={`${title} preview`} className="h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/10" />
            <span className="absolute left-4 top-4 rounded-full border border-brand-300/30 bg-slate-950/60 px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-brand-200 sm:left-5 sm:top-5 sm:px-3 sm:py-1.5 sm:text-[10px]">
              FREE PREVIEW
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_0_8px_rgba(22,163,74,0.22)] transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]">
                <Play className="ml-1 h-6 w-6 fill-current sm:h-7 sm:w-7" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <span className="block text-sm font-semibold text-white sm:text-base lg:text-[1.05rem]">Watch the Free Preview</span>
              <span className="mt-1 block text-[11px] leading-5 text-slate-300 sm:text-xs lg:text-sm">{description}</span>
            </span>
          </button>
        </div>
      </div>
      {isPlaying ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-slate-950 shadow-2xl">
            <button type="button" onClick={() => setIsPlaying(false)} className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/70 text-white hover:bg-slate-950" aria-label="Close video preview"><X className="h-5 w-5" /></button>
            <div className="aspect-video">
              <iframe className="h-full w-full" src={embedUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
