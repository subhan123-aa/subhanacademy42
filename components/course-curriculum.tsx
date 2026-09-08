import {
  AppWindow,
  BarChart3,
  BookOpen,
  Globe2,
  MapPin,
  Megaphone,
  Repeat,
  Rocket,
  Search,
  Truck
} from "lucide-react";

const curriculum = [
  [BookOpen, "SabjiHub Idea & Business Model", "Learn how the SabjiHub idea started, the problem it solved, and how the business model works."],
  [Search, "Market Research & Business Planning", "Learn how to find demand, study competitors, select your target area and build a practical launch plan."],
  [AppWindow, "App + Admin Panel Development", "Learn how the customer app, admin panel, and core order flow are structured and built."],
  [Truck, "Delivery & Daily Operations", "Learn how to manage delivery areas, order fulfillment, riders, and day-to-day business operations."],
  [Megaphone, "Launch, Marketing & First Customers", "Learn practical ways to launch, promote the business, and win your first customers locally."],
  [Globe2, "Real SabjiHub Case Study", "See the real journey, challenges, mistakes, lessons learned and what actually worked for SabjiHub."],
  [BarChart3, "Pricing, Profit & Unit Economics", "Learn how to set pricing, calculate margins, understand delivery costs, and track real business profit."],
  [Repeat, "Customer Retention & Repeat Orders", "Learn practical WhatsApp, offers, referral, and repeat-order strategies to turn first-time customers into loyal customers."],
  [Rocket, "Scaling & Growth Strategy", "Learn how to scale daily orders, manage riders and operations, expand your delivery area, and grow the business."]
] as const;

export default function CourseCurriculum() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">What You'll Learn</h3>
        <p className="mt-4 text-pretty text-base leading-7 text-slate-600">
          Everything you need to build, launch and grow a local grocery delivery business like SabjiHub.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {curriculum.map(([Icon, title, description], index) => (
          <article
            key={title}
            className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-colors hover:border-brand-300 hover:bg-brand-50/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold tracking-[0.12em] text-brand-700">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h4 className="mt-6 text-lg font-semibold leading-7 text-slate-950">{title}</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
