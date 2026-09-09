import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { couponSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = couponSchema.parse(await req.json());
    const coupons = await getStore("coupons");
    const existingIndex = coupons.findIndex((coupon) => coupon.id === (body as { id?: string }).id || coupon.code.toLowerCase() === body.code.toLowerCase());
    const nextCoupon = {
      id: (body as { id?: string }).id ?? coupons[existingIndex]?.id ?? crypto.randomUUID(),
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      expiresAt: body.expiresAt,
      usageLimit: body.usageLimit,
      usedCount: coupons[existingIndex]?.usedCount ?? 0,
      active: body.active
    };

    if (existingIndex >= 0) {
      coupons[existingIndex] = nextCoupon;
    } else {
      coupons.push(nextCoupon);
    }
    await saveStore("coupons", coupons);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath("/checkout");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: "Coupon saved.", coupon: nextCoupon });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
