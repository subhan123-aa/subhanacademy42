import { CheckoutFlow } from "@/components/checkout-flow";
import { CheckoutHeader } from "@/components/checkout-header";
import { getCurrentUser, getCourseBySlug } from "@/lib/queries";
import { getStore } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{
    course?: string;
    order_id?: string;
    order_ref?: string;
    step?: string;
    payment_status?: string;
  }>;
}) {
  const { course: courseSlug, order_id, order_ref, step, payment_status } = await searchParams;
  const course = await getCourseBySlug(courseSlug || "sabjihub-blueprint");
  if (!course) notFound();
  const user = await getCurrentUser();

  const targetOrderId = order_id || order_ref || "";
  let initialStep: 1 | 2 = step === "2" ? 2 : 1;
  let initialOrder = null;

  if (targetOrderId) {
    const orders = await getStore("orders");
    const foundOrder = orders.find((o) => o.id === targetOrderId || o.providerOrderId === targetOrderId);
    if (foundOrder) {
      if (foundOrder.status === "paid") {
        initialStep = 2;
      }
      initialOrder = {
        id: foundOrder.id,
        total: foundOrder.total,
        status: foundOrder.status,
        emailAddress: foundOrder.emailAddress,
        fullName: foundOrder.fullName
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <CheckoutHeader />
      <CheckoutFlow
        course={course}
        currentUser={user}
        initialStep={initialStep}
        initialOrderId={targetOrderId}
        initialPaymentStatus={payment_status || ""}
        initialOrder={initialOrder}
      />
    </div>
  );
}
