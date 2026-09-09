import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

function parseBody(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  const youtubeUrl = String(body.youtubeUrl ?? "").trim();
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
  if (title.length < 2) throw new Error("Video title is required.");
  if (!embedUrl) throw new Error("Enter a valid YouTube URL.");
  return {
    title,
    youtubeUrl,
    embedUrl,
    description: String(body.description ?? "").trim(),
    thumbnailUrl: String(body.thumbnailUrl ?? "/images/course-thumb.svg").trim() || "/images/course-thumb.svg",
    active: body.active === true
  };
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
  return NextResponse.json({ previewVideos: await getStore("previewVideos") });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
    const body = await req.json() as Record<string, unknown>;
    const values = parseBody(body);
    const previewVideos = await getStore("previewVideos");
    const id = typeof body.id === "string" && body.id ? body.id : crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = previewVideos.find((video) => video.id === id);
    const nextVideo = { id, ...values, createdAt: existing?.createdAt ?? now, updatedAt: now };
    const nextVideos = values.active
      ? previewVideos.map((video) => ({ ...video, active: false })).filter((video) => video.id !== id).concat(nextVideo)
      : existing
        ? previewVideos.map((video) => video.id === id ? nextVideo : video)
        : [...previewVideos, nextVideo];
    await saveStore("previewVideos", nextVideos);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: existing ? "Preview video updated." : "Preview video created." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
