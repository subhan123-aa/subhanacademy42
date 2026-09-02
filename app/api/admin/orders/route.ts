import { NextRequest, NextResponse } from "next/server";
import { adminOrderSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const orders = await getStore("orders");
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  try {
    const body = adminOrderSchema.parse(await req.json());
    const orders = await getStore("orders");
    const order = orders.find((item) => item.id === body.id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (body.refundStatus) {
      order.refundStatus = body.refundStatus;
    }
    await saveStore("orders", orders);
    return NextResponse.json({ message: "Order updated.", order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
