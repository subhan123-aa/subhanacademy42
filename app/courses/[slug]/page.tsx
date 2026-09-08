import { Badge, ButtonLink, Container, Footer, Navbar, SectionHeading, FeatureList } from "@/components/site";
import { getCourseBySlug } from "@/lib/queries";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getCoursePricing } from "@/lib/pricing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.subtitle
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const pricing = getCoursePricing(course);

  return (
    <div className="min-h-screen bg-white">
      <Navbar price={pricing.offerPrice} />
      <Container className="py-16">
        <Badge>Course detail</Badge>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading title={course.title} description={course.subtitle} />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/checkout?course=${course.slug}`}>Join Now - {formatCurrency(pricing.offerPrice)}</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Login
              </ButtonLink>
            </div>
            <div className="mt-8">
              <FeatureList items={course.outcomes} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
            <div className="text-sm font-semibold text-slate-500">Included</div>
            <div className="mt-3 flex items-end gap-2">
              {pricing.showDiscountDisplay && pricing.hasDiscount ? (
                <span className="text-sm text-slate-400 line-through">{formatCurrency(pricing.originalPrice)}</span>
              ) : null}
              <div className="text-4xl font-semibold text-slate-950">{formatCurrency(pricing.offerPrice)}</div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p>10+ hours content</p>
              <p>Lifetime access</p>
              <p>Certificate</p>
              <p>Community support</p>
            </div>
            <div className="mt-6 grid gap-3">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-medium text-slate-950">
                    {module.order.toString().padStart(2, "0")} - {module.title}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
