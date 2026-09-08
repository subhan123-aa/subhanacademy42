import { CheckoutFlow } from "@/components/checkout-flow";
import { CheckoutHeader } from "@/components/checkout-header";
import { Container } from "@/components/site";
import { getCurrentUser, getCourseBySlug } from "@/lib/queries";
import { notFound } from "next/navigation";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course: courseSlug } = await searchParams;
  const course = await getCourseBySlug(courseSlug || "sabjihub-blueprint");
  if (!course) notFound();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <CheckoutHeader />
      <Container className="flex items-center justify-center py-2 sm:py-3">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5" aria-label="Checkout progress">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
            1
          </span>
          <span className="h-px w-8 bg-slate-300 sm:w-10" />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 sm:h-8 sm:w-8 sm:text-sm">
            2
          </span>
        </div>
      </Container>
      <Container className="max-w-6xl py-8 md:py-10">
        <CheckoutFlow course={course} currentUser={user} />
      </Container>
    </div>
  );
}
