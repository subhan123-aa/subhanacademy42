"use client";

import { GripVertical, Image as ImageIcon, Plus, RotateCw, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppShowcaseScreenshot } from "@/lib/types";
import { cn } from "@/lib/utils";

async function api(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

function sortScreenshots(screenshots: AppShowcaseScreenshot[]) {
  return [...screenshots].sort((a, b) => a.order - b.order);
}

function PhoneShell({ screenshot }: { screenshot: AppShowcaseScreenshot }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[500px]">
      <div className="rounded-[2.8rem] border border-emerald-200/80 bg-[#f4fbf7] p-3 shadow-[0_28px_90px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/80 sm:p-4">
        <div className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-950">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              SabjiHub App
            </div>
          </div>

          <div className="bg-[#F6FCF8] p-2.5 sm:p-3">
            <div className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white">
              <img
                key={screenshot.id}
                src={screenshot.imageUrl}
                alt={screenshot.title || "SabjiHub app screenshot"}
                className="block aspect-[9/19] w-full object-contain transition-all duration-700 ease-out"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShowcaseSection({ screenshots }: { screenshots: AppShowcaseScreenshot[] }) {
  const sortedScreenshots = useMemo(() => sortScreenshots(screenshots), [screenshots]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sortedScreenshots.length) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % sortedScreenshots.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [sortedScreenshots.length]);

  useEffect(() => {
    if (activeIndex >= sortedScreenshots.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, sortedScreenshots.length]);

  const current = sortedScreenshots[activeIndex] ?? sortedScreenshots[0];

  return (
    <section className="border-y border-emerald-100 bg-gradient-to-b from-white to-brand-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            See the SabjiHub App in Action
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Explore the real customer app experience behind SabjiHub.
          </p>
        </div>

        <div className="mt-10">
          {current ? (
            <PhoneShell screenshot={current} />
          ) : (
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No screenshots have been added yet. Use the App Showcase admin section to upload customer app screenshots.
            </div>
          )}
        </div>

        {sortedScreenshots.length > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-2" aria-label="App showcase progress">
            {sortedScreenshots.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  "block rounded-full transition-all duration-300",
                  index === activeIndex ? "h-2.5 w-8 bg-brand-600" : "h-2.5 w-2.5 bg-brand-200"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AppShowcaseManager({
  screenshots,
  onUpdated
}: {
  screenshots: AppShowcaseScreenshot[];
  onUpdated?: () => void;
}) {
  const sortedScreenshots = useMemo(() => sortScreenshots(screenshots), [screenshots]);
  const [selectedId, setSelectedId] = useState<string>(sortedScreenshots[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreview, setPendingPreview] = useState<string>("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const selected = sortedScreenshots.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !sortedScreenshots.some((item) => item.id === selectedId)) {
      setSelectedId(sortedScreenshots[0]?.id ?? "");
      return;
    }
    if (selected) {
      setTitle(selected.title || "");
      setCaption(selected.caption || "");
      setPendingPreview(selected.imageUrl);
      setPendingFiles([]);
    } else {
      setTitle("");
      setCaption("");
      setPendingPreview("");
      setPendingFiles([]);
    }
  }, [selected, selectedId, sortedScreenshots]);

  async function uploadPayload() {
    const uploads = await Promise.all(pendingFiles.map((file) => fileToDataUrl(file)));
    return uploads;
  }

  async function refreshReorder(nextItems: AppShowcaseScreenshot[]) {
    await api("/api/admin/app-showcase", "PUT", { orderedIds: nextItems.map((item) => item.id) });
    onUpdated?.();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form
        className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setBusyKey("save");
            const imageUrls = pendingFiles.length ? await uploadPayload() : [];

            if (pendingFiles.length > 1) {
              await api("/api/admin/app-showcase", "POST", {
                images: imageUrls.map((imageUrl, index) => ({
                  imageUrl,
                  title: title.trim() ? `${title.trim()} ${index + 1}` : `Screenshot ${sortedScreenshots.length + index + 1}`,
                  caption: caption.trim()
                }))
              });
              toast.success("Screenshots uploaded");
            } else if (pendingFiles.length === 1) {
              await api("/api/admin/app-showcase", "POST", {
                id: selected?.id,
                imageUrl: imageUrls[0],
                title: title.trim(),
                caption: caption.trim(),
                order: selected?.order
              });
              toast.success(selected ? "Screenshot updated" : "Screenshot uploaded");
            } else if (selected) {
              await api("/api/admin/app-showcase", "POST", {
                id: selected.id,
                imageUrl: selected.imageUrl,
                title: title.trim(),
                caption: caption.trim(),
                order: selected.order
              });
              toast.success("Screenshot updated");
            } else {
              toast.error("Choose one or more images to upload.");
              return;
            }

            onUpdated?.();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save screenshot");
          } finally {
            setBusyKey(null);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">App Showcase</h3>
            <p className="text-sm text-slate-600">Upload customer app screenshots, reorder them, and set optional titles or captions.</p>
          </div>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-2xl border border-slate-200 px-4"
            placeholder="Home screen"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Caption</span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Optional caption for the screenshot"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Upload screenshots</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              setPendingFiles(files);
              if (files[0]) {
                try {
                  setPendingPreview(await fileToDataUrl(files[0]));
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to read the selected image");
                }
              }
            }}
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Preview</p>
            <p className="mt-1 text-sm text-slate-600">
              {pendingFiles.length > 1
                ? `${pendingFiles.length} files selected`
                : pendingFiles.length === 1
                  ? "New screenshot selected"
                  : "Current screenshot preview"}
            </p>
            <button
              type="button"
              onClick={() => {
                if (!selected) return;
                setTitle(selected.title || "");
                setCaption(selected.caption || "");
                setPendingFiles([]);
                setPendingPreview(selected.imageUrl);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Reset preview
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-100 p-3">
              {pendingPreview || selected ? (
                <img
                  src={pendingPreview || selected?.imageUrl || ""}
                  alt="Screenshot preview"
                  className="h-auto w-full rounded-[1rem] border border-slate-200 bg-white object-contain"
                />
              ) : (
                <div className="flex aspect-[9/19] items-center justify-center rounded-[1rem] border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                  No image selected
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={busyKey === "save"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {busyKey === "save" ? <Plus className="h-4 w-4 animate-pulse" /> : <Upload className="h-4 w-4" />}
          {pendingFiles.length > 1
            ? `Upload ${pendingFiles.length} images`
            : selected
              ? pendingFiles.length === 1
                ? "Update screenshot"
                : "Update details"
              : "Upload screenshot"}
        </button>
      </form>

      <div className="grid gap-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Uploaded screenshots</h3>
              <p className="mt-1 text-sm text-slate-600">Edit, delete, and reorder the customer app screenshots used on the homepage.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{sortedScreenshots.length} items</span>
          </div>

          <div className="mt-5 grid gap-3">
            {sortedScreenshots.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <img src={item.imageUrl} alt={item.title || "Screenshot"} className="h-24 w-16 rounded-xl border border-slate-200 object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.title || `Screenshot ${index + 1}`}</p>
                      {item.caption ? <p className="mt-1 text-sm leading-6 text-slate-600">{item.caption}</p> : null}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">0{item.order}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setPendingFiles([]);
                        setPendingPreview(item.imageUrl);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (index === 0) return;
                        const nextItems = [...sortedScreenshots];
                        const moved = nextItems.splice(index, 1)[0];
                        nextItems.splice(index - 1, 0, moved);
                        nextItems.forEach((entry, idx) => {
                          entry.order = idx + 1;
                        });
                        try {
                          setBusyKey("reorder");
                          await refreshReorder(nextItems);
                          toast.success("Screenshot moved up");
                          onUpdated?.();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Unable to reorder screenshots");
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-40"
                      disabled={index === 0 || busyKey === "reorder"}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (index === sortedScreenshots.length - 1) return;
                        const nextItems = [...sortedScreenshots];
                        const moved = nextItems.splice(index, 1)[0];
                        nextItems.splice(index + 1, 0, moved);
                        nextItems.forEach((entry, idx) => {
                          entry.order = idx + 1;
                        });
                        try {
                          setBusyKey("reorder");
                          await refreshReorder(nextItems);
                          toast.success("Screenshot moved down");
                          onUpdated?.();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Unable to reorder screenshots");
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-40"
                      disabled={index === sortedScreenshots.length - 1 || busyKey === "reorder"}
                    >
                      <GripVertical className="h-3.5 w-3.5 rotate-180" />
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete screenshot "${item.title || `Screenshot ${index + 1}`}"?`)) return;
                        try {
                          setBusyKey("delete");
                          await api(`/api/admin/app-showcase/${item.id}`, "DELETE");
                          toast.success("Screenshot deleted");
                          onUpdated?.();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Unable to delete screenshot");
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!sortedScreenshots.length ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No screenshots uploaded yet. Add customer app screenshots to populate the gallery.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
