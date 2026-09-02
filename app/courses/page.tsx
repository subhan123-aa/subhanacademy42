import { Badge, ButtonLink, Container, Footer, Navbar, SectionHeading } from "@/components/site";
import { getStore } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { getCoursePricing } from "@/lib/pricing";

export default async function CoursesPage() {
  const courses = await getStore("courses");
  const primaryPricing = getCoursePricing(courses[0] ?? { price: 0, oldPrice: 0, showDiscountDisplay: true });

  return (
    <div className="min-h-screen bg-white">
      <Navbar price={primaryPricing.offerPrice} />
      <Container className="py-16">
        <Badge>Courses</Badge>
        <div className="mt-6">
          <SectionHeading
            title="Practical courses for local business builders"
            description="The catalog is intentionally compact and focused on the flagship SabjiHub Blueprint course."
          />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {courses.map((course) => {
            const pricing = getCoursePricing(course);
            return (
              <div key={course.id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
                <p className="text-sm font-semibold text-brand-700">{course.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{course.subtitle}</p>
                <div className="mt-4 flex items-end gap-2">
                  {pricing.showDiscountDisplay && pricing.hasDiscount ? (
                    <span className="text-sm text-slate-400 line-through">{formatCurrency(pricing.originalPrice)}</span>
                  ) : null}
                  <div className="text-3xl font-semibold text-slate-950">{formatCurrency(pricing.offerPrice)}</div>
                </div>
                <div className="mt-5 flex gap-3">
                  <ButtonLink href={`/courses/${course.slug}`}>View Course</ButtonLink>
                  <ButtonLink href={`/checkout?course=${course.slug}`} variant="secondary">
                    Join Now
                  </ButtonLink>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
