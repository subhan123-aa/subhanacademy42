import { promises as fs } from "fs";
import path from "path";
import type {
  Announcement,
  AppShowcaseScreenshot,
  BlogPost,
  Certificate,
  Course,
  Coupon,
  Enrollment,
  Order,
  PasswordReset,
  PreviewVideo,
  ProgressRecord,
  SiteSeed,
  Testimonial,
  User
} from "@/lib/types";
import { seed } from "@/lib/seed";

const dataDir = process.env.VERCEL || process.env.NODE_ENV === "production"
  ? path.join("/tmp", ".data")
  : path.join(process.cwd(), ".data");

const files = {
  users: "users.json",
  courses: "courses.json",
  enrollments: "enrollments.json",
  orders: "orders.json",
  coupons: "coupons.json",
  certificates: "certificates.json",
  testimonials: "testimonials.json",
  blogPosts: "blog-posts.json",
  announcements: "announcements.json",
  previewVideos: "preview-videos.json",
  appShowcaseScreenshots: "app-showcase.json",
  progress: "progress.json",
  passwordResets: "password-resets.json"
} as const;

type StoreKey = keyof typeof files;
type StoreMap = {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  orders: Order[];
  coupons: Coupon[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  announcements: Announcement[];
  previewVideos: PreviewVideo[];
  appShowcaseScreenshots: AppShowcaseScreenshot[];
  progress: ProgressRecord[];
  passwordResets: PasswordReset[];
};

const memoryStore: Partial<StoreMap> = {};
let seedingPromise: Promise<void> | null = null;

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // Ignore error if already exists or permission issue
  }
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(fileName: string, value: unknown) {
  try {
    await ensureDataDir();
    await fs.writeFile(path.join(dataDir, fileName), JSON.stringify(value, null, 2), "utf8");
  } catch {
    // Fail silently in read-only / build environments
  }
}

export async function ensureSeeded() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    try {
      await ensureDataDir();
      const existing = await Promise.all(
        Object.entries(files).map(async ([key, fileName]) => {
          try {
            const raw = await fs.readFile(path.join(dataDir, fileName), "utf8");
            return [key, Boolean(raw)] as const;
          } catch {
            return [key, false] as const;
          }
        })
      );

      await Promise.all(
        Object.entries(files)
          .filter(([key]) => existing.some(([existingKey, present]) => existingKey === key && !present))
          .map(([key, fileName]) => writeJson(fileName, seed[key as keyof SiteSeed] ?? []))
      );
    } catch {
      // Ignore seeding errors in restricted environments
    }
  })();
  return seedingPromise;
}

export async function getStore<K extends StoreKey>(key: K): Promise<StoreMap[K]> {
  if (memoryStore[key]) {
    return memoryStore[key] as StoreMap[K];
  }
  const fallback = (seed[key as keyof SiteSeed] ?? []) as unknown as StoreMap[K];
  const value = await readJson<StoreMap[K]>(files[key], fallback);
  const resolved = (Array.isArray(value) ? value : fallback) as StoreMap[K];
  memoryStore[key] = resolved;
  return resolved;
}

export async function saveStore<K extends StoreKey>(key: K, value: StoreMap[K]) {
  memoryStore[key] = value;
  await writeJson(files[key], value);
}

export async function updateStore<K extends StoreKey>(
  key: K,
  updater: (current: StoreMap[K]) => StoreMap[K] | Promise<StoreMap[K]>
) {
  const current = await getStore(key);
  const next = await updater(current);
  await saveStore(key, next);
  return next;
}
