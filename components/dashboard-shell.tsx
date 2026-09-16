"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Image,
  PlaySquare,
  Settings,
  ShieldCheck,
  BadgePercent,
  Star,
  UserRound,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

const studentNavItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/dashboard?tab=courses", label: "My Course", icon: BookOpen },
  { href: "/student/dashboard?tab=settings", label: "Settings", icon: Settings },
  { href: "/api/auth/logout", label: "Logout", icon: LogOut }
];

const adminNavItems = [
  { href: "#overview", label: "Overview", icon: ShieldCheck },
  { href: "#students", label: "Students", icon: UserRound },
  { href: "#courses", label: "Courses", icon: BookOpen },
  { href: "#pricing", label: "Pricing", icon: BadgePercent },
  { href: "#enrollments", label: "Enrollments", icon: LayoutDashboard },
  { href: "#payments", label: "Payments", icon: Wallet },
  { href: "#coupons", label: "Coupons", icon: CircleDollarSign },
  { href: "#testimonials", label: "Testimonials", icon: Star },
  { href: "#preview-videos", label: "Preview Videos", icon: PlaySquare },
  { href: "#app-showcase", label: "App Showcase", icon: Image },
  { href: "#content", label: "Website Content", icon: MessageSquare },
  { href: "#analytics", label: "Analytics", icon: BarChart3 },
  { href: "#settings", label: "Settings", icon: Settings },
  { href: "/api/auth/logout", label: "Logout", icon: LogOut }
];

export function DashboardShell({
  title,
  subtitle,
  children,
  admin = false,
  studentCourseHref
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  admin?: boolean;
  studentCourseHref?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash.replace("#", ""));
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const currentHref = useMemo(() => {
    const search = searchParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const navItems = admin
    ? adminNavItems
    : studentNavItems.map((item) => item.label === "My Course" && studentCourseHref ? { ...item, href: studentCourseHref } : item);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="flex items-center gap-3 px-2">
            <BrandLogo className="h-auto w-[210px]" />
          </div>

          <nav className="mt-8 grid gap-2 max-lg:flex max-lg:overflow-x-auto max-lg:pb-1">
            {navItems.map((item) => {
              const active = admin
                ? hash === item.href.replace("#", "") || (!hash && item.href === "#overview")
                : currentHref === item.href || pathname === item.href;
              const Icon = item.icon;
              const linkClassName = cn(
                "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              );

              if (admin && item.href.startsWith("#")) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      window.location.hash = item.href.slice(1);
                    }}
                    className={linkClassName}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (item.href === "/api/auth/logout" && typeof window !== "undefined") {
                      try {
                        localStorage.removeItem("subhan_session");
                      } catch {
                        // ignore
                      }
                    }
                  }}
                  className={linkClassName}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
            </div>
            <div className="pt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
