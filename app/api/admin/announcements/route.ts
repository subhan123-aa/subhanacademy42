import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { announcementSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = announcementSchema.parse(await req.json());
    const announcements = await getStore("announcements");
    announcements.push({ id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() });
    await saveStore("announcements", announcements);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: "Announcement created." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
