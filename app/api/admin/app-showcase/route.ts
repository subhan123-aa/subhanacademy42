import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

function normalizeTitle(title: unknown, fallback: string) {
  const value = String(title ?? "").trim();
  return value || fallback;
}

function normalizeCaption(caption: unknown) {
  const value = String(caption ?? "").trim();
  return value || undefined;
}

function normalizeImage(imageUrl: unknown) {
  const value = String(imageUrl ?? "").trim();
  if (!value) throw new Error("Upload a screenshot or provide an image URL.");
  return value;
}

function normalizeMultipleImages(body: Record<string, unknown>, startOrder: number) {
  const images = Array.isArray(body.images) ? body.images : [];
  if (!images.length) throw new Error("images are required.");
  return images.map((item, index) => {
    const entry = (item ?? {}) as Record<string, unknown>;
    const order = startOrder + index;
    return {
      id: crypto.randomUUID(),
      title: normalizeTitle(entry.title, `Screenshot ${order}`),
      caption: normalizeCaption(entry.caption),
      category: "customer-app" as const,
      imageUrl: normalizeImage(entry.imageUrl),
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
  return NextResponse.json({ screenshots: await getStore("appShowcaseScreenshots") });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
    const body = (await req.json()) as Record<string, unknown>;
    const screenshots = await getStore("appShowcaseScreenshots");
    const now = new Date().toISOString();

    if (Array.isArray(body.images) && body.images.length) {
      const nextItems = normalizeMultipleImages(body, screenshots.length + 1);
      await saveStore("appShowcaseScreenshots", [...screenshots, ...nextItems]);
      return NextResponse.json({ message: "Screenshots created.", screenshots: nextItems });
    }

    const id = typeof body.id === "string" && body.id ? body.id : crypto.randomUUID();
    const imageUrl = normalizeImage(body.imageUrl);
    const title = normalizeTitle(body.title, `Screenshot ${screenshots.length + 1}`);
    const caption = normalizeCaption(body.caption);
    const existing = screenshots.find((item) => item.id === id);
    const nextItem = {
      id,
      title,
      caption,
      category: "customer-app" as const,
      imageUrl,
      order: typeof body.order === "number" ? body.order : existing?.order ?? screenshots.length + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    const nextScreenshots = existing ? screenshots.map((item) => (item.id === id ? nextItem : item)) : [...screenshots, nextItem];
    await saveStore("appShowcaseScreenshots", nextScreenshots);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: existing ? "Screenshot updated." : "Screenshot created.", screenshot: nextItem });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
    const body = (await req.json()) as Record<string, unknown>;
    const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.map(String) : [];
    if (!orderedIds.length) throw new Error("orderedIds are required.");
    const screenshots = await getStore("appShowcaseScreenshots");
    const lookup = new Map(screenshots.map((item) => [item.id, item]));
    const reordered = orderedIds.map((id, index) => {
      const existing = lookup.get(id);
      if (!existing) throw new Error("One or more screenshots were not found.");
      return { ...existing, order: index + 1, updatedAt: new Date().toISOString() };
    });
    const remainder = screenshots.filter((item) => !orderedIds.includes(item.id)).map((item, index) => ({
      ...item,
      order: orderedIds.length + index + 1
    }));
    await saveStore("appShowcaseScreenshots", [...reordered, ...remainder]);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: "Screenshot order updated." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
