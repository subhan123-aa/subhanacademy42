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
import { isSupabaseConfigured, createSupabaseAdminClient } from "@/lib/supabase/server";

const primaryDataDir = process.env.VERCEL || process.env.NODE_ENV === "production"
  ? path.join("/tmp", ".data")
  : path.join(process.cwd(), ".data");

const bundledDataDir = path.join(process.cwd(), ".data");

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

const tableMap: Record<StoreKey, string> = {
  users: "users",
  courses: "courses",
  enrollments: "enrollments",
  orders: "orders",
  coupons: "coupons",
  certificates: "certificates",
  testimonials: "testimonials",
  blogPosts: "blog_posts",
  announcements: "announcements",
  previewVideos: "preview_videos",
  appShowcaseScreenshots: "app_showcase",
  progress: "progress",
  passwordResets: "password_resets"
};

const memoryStore: Partial<StoreMap> = {};
const memoryStoreTimestamp: Partial<Record<StoreKey, number>> = {};
const CACHE_TTL_MS = 5000; // 5 seconds cache in serverless memory to allow multi-instance freshness
const SUPABASE_READ_TIMEOUT_MS = 1500;
let seedingPromise: Promise<void> | null = null;

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

async function ensureDataDir() {
  try {
    await fs.mkdir(primaryDataDir, { recursive: true });
  } catch {
    // Ignore error if already exists or permission issue
  }
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(primaryDataDir, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    if (primaryDataDir !== bundledDataDir) {
      try {
        const raw = await fs.readFile(path.join(bundledDataDir, fileName), "utf8");
        return JSON.parse(raw) as T;
      } catch {
        // Fallback below
      }
    }
    return fallback;
  }
}

async function writeJson(fileName: string, value: unknown) {
  const content = JSON.stringify(value, null, 2);
  try {
    await ensureDataDir();
    await fs.writeFile(path.join(primaryDataDir, fileName), content, "utf8");
  } catch {
    // Fail silently in read-only / build environments
  }
  if (primaryDataDir !== bundledDataDir) {
    try {
      await fs.mkdir(bundledDataDir, { recursive: true });
      await fs.writeFile(path.join(bundledDataDir, fileName), content, "utf8");
    } catch {
      // Ignore if bundled directory is read-only in serverless
    }
  }
}

// Normalizers from Supabase DB rows to TypeScript interfaces
function normalizeFromDb<K extends StoreKey>(key: K, row: Record<string, unknown>): unknown {
  if (key === "users") {
    return {
      id: String(row.id),
      name: String(row.name || ""),
      email: String(row.email || ""),
      passwordHash: String(row.passwordHash || row.password_hash || ""),
      role: (row.role === "admin" ? "admin" : "student") as User["role"],
      createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
      blocked: Boolean(row.blocked),
      pendingPayment: Boolean(row.pendingPayment ?? row.pending_payment)
    } satisfies User;
  }

  if (key === "orders") {
    return {
      id: String(row.id),
      userId: String(row.userId || row.user_id || ""),
      courseId: String(row.courseId || row.course_id || ""),
      couponCode: row.couponCode ? String(row.couponCode) : (row.coupon_code ? String(row.coupon_code) : undefined),
      referralCode: row.referralCode ? String(row.referralCode) : (row.referral_code ? String(row.referral_code) : undefined),
      fullName: String(row.fullName || row.full_name || ""),
      mobileNumber: String(row.mobileNumber || row.mobile_number || ""),
      emailAddress: String(row.emailAddress || row.email_address || ""),
      country: String(row.country || "India"),
      state: String(row.state || ""),
      subtotal: Number(row.subtotal || 0),
      discount: Number(row.discount || 0),
      total: Number(row.total || 0),
      status: (row.status || "created") as Order["status"],
      refundStatus: (row.refundStatus || row.refund_status || "none") as Order["refundStatus"],
      providerOrderId: row.providerOrderId ? String(row.providerOrderId) : (row.provider_order_id ? String(row.provider_order_id) : undefined),
      providerPaymentId: row.providerPaymentId ? String(row.providerPaymentId) : (row.provider_payment_id ? String(row.provider_payment_id) : undefined),
      createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
      paidAt: row.paidAt ? String(row.paidAt) : (row.paid_at ? String(row.paid_at) : undefined)
    } satisfies Order;
  }

  if (key === "enrollments") {
    const rawLessonIds = row.completedLessonIds || row.completed_lesson_ids;
    return {
      id: String(row.id),
      userId: String(row.userId || row.user_id || ""),
      courseId: String(row.courseId || row.course_id || ""),
      orderId: String(row.orderId || row.order_id || ""),
      enrolledAt: String(row.enrolledAt || row.enrolled_at || new Date().toISOString()),
      completedLessonIds: Array.isArray(rawLessonIds) ? rawLessonIds.map(String) : [],
      status: (row.status || "active") as Enrollment["status"],
      paymentStatus: (row.paymentStatus || row.payment_status || "paid") as Enrollment["paymentStatus"]
    } satisfies Enrollment;
  }

  if (key === "courses") {
    return {
      id: String(row.id),
      slug: String(row.slug || ""),
      title: String(row.title || ""),
      subtitle: String(row.subtitle || ""),
      price: Number(row.price || 0),
      oldPrice: Number(row.oldPrice ?? row.old_price ?? 0),
      showDiscountDisplay: Boolean(row.showDiscountDisplay ?? row.show_discount_display ?? true),
      thumbnail: String(row.thumbnail || ""),
      published: Boolean(row.published ?? true),
      hours: Number(row.hours || 1),
      previewLessonId: row.previewLessonId ? String(row.previewLessonId) : (row.preview_lesson_id ? String(row.preview_lesson_id) : undefined),
      includes: Array.isArray(row.includes) ? row.includes.map(String) : [],
      outcomes: Array.isArray(row.outcomes) ? row.outcomes.map(String) : [],
      modules: Array.isArray(row.modules) ? (row.modules as Course["modules"]) : []
    } satisfies Course;
  }

  return row as unknown;
}

// Convert domain object to Supabase row format
function normalizeToDb<K extends StoreKey>(key: K, item: Record<string, unknown>): Record<string, unknown> {
  if (key === "users") {
    const u = item as unknown as User;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      password_hash: u.passwordHash,
      passwordHash: u.passwordHash,
      role: u.role,
      created_at: u.createdAt,
      createdAt: u.createdAt,
      blocked: Boolean(u.blocked),
      pending_payment: Boolean(u.pendingPayment),
      pendingPayment: Boolean(u.pendingPayment)
    };
  }

  if (key === "orders") {
    const o = item as unknown as Order;
    return {
      id: o.id,
      user_id: o.userId,
      userId: o.userId,
      course_id: o.courseId,
      courseId: o.courseId,
      coupon_code: o.couponCode || null,
      couponCode: o.couponCode || null,
      referral_code: o.referralCode || null,
      referralCode: o.referralCode || null,
      full_name: o.fullName,
      fullName: o.fullName,
      mobile_number: o.mobileNumber,
      mobileNumber: o.mobileNumber,
      email_address: o.emailAddress,
      emailAddress: o.emailAddress,
      country: o.country || "India",
      state: o.state || "",
      subtotal: Number(o.subtotal || 0),
      discount: Number(o.discount || 0),
      total: Number(o.total || 0),
      status: o.status || "created",
      refund_status: o.refundStatus || "none",
      refundStatus: o.refundStatus || "none",
      provider_order_id: o.providerOrderId || null,
      providerOrderId: o.providerOrderId || null,
      provider_payment_id: o.providerPaymentId || null,
      providerPaymentId: o.providerPaymentId || null,
      created_at: o.createdAt,
      createdAt: o.createdAt,
      paid_at: o.paidAt || null,
      paidAt: o.paidAt || null
    };
  }

  if (key === "enrollments") {
    const e = item as unknown as Enrollment;
    return {
      id: e.id,
      user_id: e.userId,
      userId: e.userId,
      course_id: e.courseId,
      courseId: e.courseId,
      order_id: e.orderId,
      orderId: e.orderId,
      enrolled_at: e.enrolledAt,
      enrolledAt: e.enrolledAt,
      completed_lesson_ids: e.completedLessonIds || [],
      completedLessonIds: e.completedLessonIds || [],
      status: e.status || "active",
      payment_status: e.paymentStatus || "paid",
      paymentStatus: e.paymentStatus || "paid"
    };
  }

  if (key === "courses") {
    const c = item as unknown as Course;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle || "",
      price: Number(c.price || 0),
      old_price: Number(c.oldPrice || 0),
      oldPrice: Number(c.oldPrice || 0),
      show_discount_display: Boolean(c.showDiscountDisplay ?? true),
      showDiscountDisplay: Boolean(c.showDiscountDisplay ?? true),
      thumbnail: c.thumbnail || "",
      published: Boolean(c.published ?? true),
      hours: Number(c.hours || 1),
      preview_lesson_id: c.previewLessonId || null,
      previewLessonId: c.previewLessonId || null,
      includes: c.includes || [],
      outcomes: c.outcomes || [],
      modules: c.modules || []
    };
  }

  return item;
}

export async function ensureSeeded() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    try {
      await ensureDataDir();
      const existing = await Promise.all(
        Object.entries(files).map(async ([key, fileName]) => {
          try {
            const raw = await fs.readFile(path.join(primaryDataDir, fileName), "utf8");
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
  const now = Date.now();
  const lastFetched = memoryStoreTimestamp[key] || 0;
  if (memoryStore[key] && now - lastFetched < CACHE_TTL_MS) {
    return memoryStore[key] as StoreMap[K];
  }

  const fallback = (seed[key as keyof SiteSeed] ?? []) as unknown as StoreMap[K];

  // Try fetching from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseAdminClient();
      const tableName = tableMap[key];
      const { data, error } = await withTimeout(
        supabase.from(tableName).select("*"),
        SUPABASE_READ_TIMEOUT_MS
      );

      if (error) {
        console.warn(`[supabase] getStore(${key}) failed: ${error.message}. Falling back to file store.`);
      } else if (Array.isArray(data)) {
        if (data.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
          // If Supabase table is empty on first boot, auto-seed with initial seed data
          try {
            const seedPayload = fallback.map((item) => normalizeToDb(key, item as Record<string, unknown>));
            await supabase.from(tableName).upsert(seedPayload);
          } catch (seedErr) {
            console.warn(`[supabase] Auto-seed ${tableName} warning:`, seedErr);
          }
          memoryStore[key] = fallback;
          memoryStoreTimestamp[key] = now;
          return fallback;
        }

        const normalized = data.map((row) => normalizeFromDb(key, row as Record<string, unknown>)) as StoreMap[K];
        
        // Merge in seed users/courses if any are missing from the query
        if (key === "users" && Array.isArray(fallback)) {
          const loadedUsers = normalized as unknown as User[];
          for (const seedUser of fallback as unknown as User[]) {
            if (!loadedUsers.some((u) => u.email.toLowerCase() === seedUser.email.toLowerCase())) {
              loadedUsers.unshift(seedUser);
            }
          }
        }

        memoryStore[key] = normalized;
        memoryStoreTimestamp[key] = now;
        return normalized;
      }
    } catch (dbErr) {
      console.warn(`[supabase] Connection error on ${key}:`, dbErr instanceof Error ? dbErr.message : dbErr);
    }
  }

  // Fallback to local file store
  const value = await readJson<StoreMap[K]>(files[key], fallback);
  const resolved = (Array.isArray(value) ? value : fallback) as StoreMap[K];
  memoryStore[key] = resolved;
  memoryStoreTimestamp[key] = now;
  return resolved;
}

export async function saveStore<K extends StoreKey>(key: K, value: StoreMap[K]) {
  memoryStore[key] = value;
  memoryStoreTimestamp[key] = Date.now();
  await writeJson(files[key], value);

  // Synchronize to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseAdminClient();
      const tableName = tableMap[key];
      if (Array.isArray(value) && value.length > 0) {
        const payload = value.map((item) => normalizeToDb(key, item as Record<string, unknown>));
        // Upsert all records safely
        const { error } = await supabase.from(tableName).upsert(payload);
        if (error) {
          console.error(`[supabase] saveStore(${key}) error:`, error.message);
        }
      }
    } catch (saveErr) {
      console.error(`[supabase] saveStore(${key}) network error:`, saveErr instanceof Error ? saveErr.message : saveErr);
    }
  }
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
