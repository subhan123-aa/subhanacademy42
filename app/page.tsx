import { BookOpen, CheckCircle2, Lightbulb, Route, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { ArrowRight, Coffee, Dumbbell, ShoppingBasket, Store, UsersRound } from "lucide-react";
import { ButtonLink, Container, Footer, Navbar, SectionHeading } from "@/components/site";
import CourseCurriculum from "@/components/course-curriculum";
import { MentorCard } from "@/components/mentor-card";
import TestimonialsCarousel from "@/components/testimonials-carousel";
import { getStore } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { getCoursePricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const whyLearnFeatures: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: BookOpen, title: "Real Business Experience", description: "Learn from the actual journey of building and running SabjiHub." },
  { icon: Route, title: "Step-by-Step Learning", description: "Follow a clear roadmap from idea and development to launch and growth." },
  { icon: Lightbulb, title: "Practical Knowledge", description: "Learn the strategies, tools and processes that are actually used in a real business." },
  { icon: Users, title: "Learn & Build", description: "Turn what you learn into your own local grocery delivery business." }
];

export default async function HomePage() {
  const courses = await getStore("courses");

  const course = courses[0] ?? { price: 0, oldPrice: 0, showDiscountDisplay: true };
  const pricing = getCoursePricing(course);

  return (
    <div className="min-h-screen">
      <Navbar price={pricing.offerPrice} ctaLabel="Enroll Now" />

      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute -left-24 top-48 h-80 w-80 rounded-full bg-emerald-50/70 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-[32rem] w-[42rem] rounded-full bg-gradient-to-bl from-emerald-50/80 via-green-50/35 to-transparent blur-2xl" />
          <Container className="relative grid max-w-[1180px] gap-12 py-12 sm:py-16 lg:grid-cols-[0.91fr_1.09fr] lg:items-center lg:gap-6 lg:py-[4.8rem]">
            <div className="relative z-10 max-w-[35rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3.5 py-1.5 text-[11px] font-semibold text-brand-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Practical Business Learning
              </div>
              <h1 className="mt-6 max-w-[35rem] text-[clamp(3.15rem,6vw,5.25rem)] font-semibold leading-[0.97] tracking-[-0.055em] text-slate-950">
                Real Business<br />
                Education<br />
                <span className="text-brand-600">for Real Life.</span>
              </h1>
              <p className="mt-7 max-w-[31rem] text-[15px] leading-7 text-slate-600 sm:text-base">
                Step-by-step video course to start, manage and grow your own local business, whatever your business idea.
              </p>

              <div className="mt-7 grid max-w-[34rem] gap-x-5 gap-y-3 sm:grid-cols-2">
                {[
                  [BookOpen, "Step-by-Step Video Lessons"],
                  [Route, "Real Examples You Can Apply"],
                  [Lightbulb, "Practical Business Guidance"],
                  [UsersRound, "Learn at Your Own Pace"]
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700 sm:text-xs">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-white text-brand-600 shadow-sm">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/checkout?course=sabjihub-blueprint" className="h-11 px-5 text-sm sm:h-12 sm:px-6">
                  Enroll Now
                </ButtonLink>
                <ButtonLink href="#how-it-works" variant="secondary" className="h-11 border-emerald-200 px-5 text-sm text-slate-700 sm:h-12 sm:px-6">
                  View Course Curriculum
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto h-[30rem] w-full max-w-[39rem] sm:h-[37rem] lg:h-[39rem]">
              <div className="absolute left-[17%] top-[7%] h-[78%] w-[66%] rounded-[2.75rem] bg-gradient-to-br from-emerald-50 via-green-100/70 to-emerald-50" />
              <div className="absolute left-[21%] top-[6%] h-[73%] w-[56%] overflow-hidden rounded-[1.7rem] border border-white bg-slate-100 shadow-[0_24px_55px_rgba(15,23,42,0.14)] sm:rounded-[2rem]">
                <Image src="/images/mentor-subhan.png" alt="Subhan Academy mentor" fill priority sizes="(max-width: 1024px) 55vw, 390px" className="object-cover object-top" />
              </div>

              <div className="absolute right-0 top-[7%] z-20 grid w-[9.5rem] gap-2 sm:right-[1%] sm:w-[10.5rem] sm:gap-2.5">
                {[
                  [ShoppingBasket, "Grocery Store", "bg-emerald-50 text-brand-600"],
                  [Coffee, "Cafe / Tea Stall", "bg-orange-50 text-orange-500"],
                  [Store, "Retail Store", "bg-sky-50 text-sky-600"],
                  [Dumbbell, "Gym / Fitness", "bg-violet-50 text-violet-500"],
                  [Users, "And Many More...", "bg-pink-50 text-pink-500"]
                ].map(([Icon, label, color]) => (
                  <div key={label as string} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/95 px-2.5 py-2.5 text-[9px] font-medium text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.08)] sm:px-3 sm:text-[10px]">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${color as string}`}><Icon className="h-3.5 w-3.5" /></span>
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-[14%] left-[21%] z-20 w-[56%] rounded-xl border-2 border-slate-800 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 px-3 py-2.5 text-center shadow-[0_16px_32px_rgba(15,23,42,0.18)] sm:rounded-2xl sm:px-5 sm:py-3">
                <div className="grid grid-cols-4 text-[11px] font-semibold leading-5 text-slate-700 sm:text-sm">
                  <span>Ideas</span><span>Planning</span><span>Execution</span><span className="text-brand-600">Growth</span>
                </div>
              </div>

              <div className="absolute bottom-[10%] left-0 z-20 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[9px] font-semibold leading-4 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.10)] sm:bottom-[12%] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-[10px]">
                <span className="block text-slate-500">Same</span>
                <span className="block">Framework.</span>
                <span className="block text-brand-600">Any Business.</span>
              </div>

              <div className="absolute bottom-[5%] right-[-1%] z-20 grid w-[5.1rem] gap-1.5 sm:right-[-2%] sm:w-[6rem]">
                {["Strategy", "Marketing", "Operations", "Customers", "Growth"].map((item) => (
                  <div key={item} className="rounded-md border border-slate-100 bg-white/95 px-2 py-1 text-[8px] font-medium text-slate-600 shadow-sm sm:text-[9px]">{item}</div>
                ))}
              </div>
              <ArrowRight className="absolute bottom-[1%] left-[48%] h-5 w-5 rotate-[-35deg] text-brand-400/60" />
            </div>
          </Container>
        </section>
        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Why Subhan Academy?</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Why Learn With Subhan Academy?</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Learn from real business experience, not just theory.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {whyLearnFeatures.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-colors hover:border-brand-300 hover:bg-brand-50/40">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>

            <p className="mt-8 text-center text-sm font-medium text-slate-600">Built from real experience. Designed to help you build your own.</p>
          </Container>
        </section>

        <section className="bg-slate-50 py-20">
          <Container>
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Mentor Profile</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Meet the Mentor</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">A clean, professional profile card that introduces the founder behind the course.</p>
            </div>
            <div className="mx-auto max-w-6xl">
              <MentorCard />
            </div>
          </Container>
        </section>

        <section id="how-it-works" className="py-20">
          <Container>
            <div className="max-w-7xl">
              <CourseCurriculum />
            </div>
          </Container>
        </section>

        <section id="about" className="bg-white py-20">
          <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeading
                eyebrow="Success Stories"
                title="The SabjiHub journey"
                description="A transparent look at the real progression, presented as an editable case study instead of inflated marketing."
              />
              <div className="mt-8 grid gap-4">
                {["Idea", "Development", "Launch", "First Customers", "Local Marketing", "Growth"].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">0{index + 1}</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">{item}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item === "Idea"
                        ? "Identified a local grocery convenience gap."
                        : item === "Development"
                          ? "Translated the idea into an app and admin flow."
                          : item === "Launch"
                            ? "Opened the platform in a small local market area."
                            : item === "First Customers"
                              ? "Used local trust, direct outreach, and promotions."
                              : item === "Local Marketing"
                                ? "Focused on Instagram, Facebook, and WhatsApp."
                                : "Refined operations and built repeat orders."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <TestimonialsCarousel />

        <section className="py-20">
          <Container>
            <SectionHeading
              eyebrow="Invest in your next step"
              title="Build your local grocery business with confidence"
              description="One practical blueprint, built from the real SabjiHub journey."
              align="center"
            />
            <div className="relative mx-auto mt-10 max-w-lg overflow-hidden rounded-[2rem] border border-brand-200 bg-white p-7 shadow-[0_20px_60px_rgba(22,163,74,0.14)] sm:p-9">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-600" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-brand-700">ONE-TIME PAYMENT</span>
                {pricing.showDiscountDisplay && pricing.hasDiscount ? (
                  <span className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white">
                    {pricing.discountPercent}% OFF
                  </span>
                ) : (
                  <span className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white">Offer Price</span>
                )}
              </div>

              <div className="mt-7">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">SabjiHub Blueprint</h3>
                <p className="mt-1 text-sm font-medium text-brand-700">From Idea to Launch</p>
              </div>

              <div className="mt-7 flex items-end gap-3 border-b border-slate-100 pb-7">
                {pricing.showDiscountDisplay && pricing.hasDiscount ? (
                  <span className="text-lg text-slate-400 line-through">{formatCurrency(pricing.originalPrice)}</span>
                ) : null}
                <span className="text-5xl font-semibold tracking-tight text-slate-950">{formatCurrency(pricing.offerPrice)}</span>
              </div>

              <ul className="mt-7 grid gap-3 text-sm text-slate-700">
                {[
                  "Lifetime Course Access",
                  "Future Updates",
                  "Downloadable Resources",
                  "Certificate of Completion",
                  "Community Support"
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <ButtonLink href="/checkout?course=sabjihub-blueprint" className="w-full rounded-2xl bg-brand-600 py-4 text-base shadow-glow hover:bg-brand-700">
                  Enroll Now for {formatCurrency(pricing.offerPrice)} →
                </ButtonLink>
                <p className="mt-3 text-center text-xs font-medium text-slate-600">Secure payment • Instant access</p>
                <div className="mt-3 flex items-center justify-center gap-2 sm:gap-2.5">
                  {[
                    { label: "VISA", src: "/images/payment-visa.svg" },
                    { label: "UPI", src: "/images/payment-upi.svg" },
                    { label: "RuPay", src: "/images/payment-rupay.svg" }
                  ].map((method) => (
                    <div key={method.label} className="flex h-9 w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white px-2 shadow-sm sm:h-10 sm:w-[48px]">
                      <img
                        src={method.src}
                        alt={method.label}
                        className="h-5 w-auto max-w-[36px] object-contain sm:max-w-[38px]"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-7 text-center text-sm font-medium text-slate-600">Learn from the real SabjiHub journey.</p>
            </div>
          </Container>
        </section>

        <section id="faq" className="bg-white py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">FAQ</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Quick answers to the most common questions before you join the course.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-2">
              {[
                {
                  question: "Who is this course for?",
                  answer:
                    "This course is for founders, students, and aspiring entrepreneurs who want to understand how a real local grocery delivery business is built, launched, and grown."
                },
                {
                  question: "Is coding required?",
                  answer:
                    "No. You do not need to be a programmer to follow the course. We explain the product, business, and workflow in a practical way that is easy to understand."
                },
                {
                  question: "How long is the course?",
                  answer:
                    "The course is designed as a focused, practical blueprint you can go through at your own pace, with lessons that are easy to revisit whenever you need them."
                },
                {
                  question: "Do I get lifetime access?",
                  answer:
                    "Yes. Once enrolled, you get lifetime access to the course content and future updates included with the course."
                },
                {
                  question: "Is a certificate included?",
                  answer: "Yes. A certificate of completion is included after you finish the course."
                },
                {
                  question: "What is the refund policy?",
                  answer:
                    "Refunds follow the existing Subhan Academy refund policy. Please review the policy on the site before purchase for full details."
                }
              ].map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 shadow-soft transition-colors open:border-brand-200 open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-950 marker:hidden">
                    <span>{item.question}</span>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-brand-700 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

      </main>

      <Footer />
    </div>
  );
}

