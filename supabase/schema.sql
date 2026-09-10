-- ==============================================================================
-- SUBHAN ACADEMY — COMPLETE DATABASE SCHEMA FOR SUPABASE
-- Run this entire script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tlbhwvvzdiisjaagvcmt/sql/new
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  "passwordHash" TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  pending_payment BOOLEAN NOT NULL DEFAULT FALSE,
  "pendingPayment" BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  old_price NUMERIC NOT NULL DEFAULT 0,
  "oldPrice" NUMERIC NOT NULL DEFAULT 0,
  show_discount_display BOOLEAN NOT NULL DEFAULT TRUE,
  "showDiscountDisplay" BOOLEAN NOT NULL DEFAULT TRUE,
  thumbnail TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  hours NUMERIC NOT NULL DEFAULT 1,
  preview_lesson_id TEXT,
  "previewLessonId" TEXT,
  includes JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses (slug);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  "userId" TEXT,
  course_id TEXT NOT NULL,
  "courseId" TEXT,
  coupon_code TEXT,
  "couponCode" TEXT,
  referral_code TEXT,
  "referralCode" TEXT,
  full_name TEXT NOT NULL,
  "fullName" TEXT,
  mobile_number TEXT NOT NULL,
  "mobileNumber" TEXT,
  email_address TEXT NOT NULL,
  "emailAddress" TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT NOT NULL DEFAULT '',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'created',
  refund_status TEXT DEFAULT 'none',
  "refundStatus" TEXT DEFAULT 'none',
  provider_order_id TEXT,
  "providerOrderId" TEXT,
  provider_payment_id TEXT,
  "providerPaymentId" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  "paidAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_order_id ON public.orders (provider_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- 4. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  "userId" TEXT,
  course_id TEXT NOT NULL,
  "courseId" TEXT,
  order_id TEXT NOT NULL,
  "orderId" TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  "paymentStatus" TEXT NOT NULL DEFAULT 'paid',
  completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  "completedLessonIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments (user_id, course_id);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  usage_limit NUMERIC NOT NULL DEFAULT 100,
  "usageLimit" NUMERIC NOT NULL DEFAULT 100,
  used_count NUMERIC NOT NULL DEFAULT 0,
  "usedCount" NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  "userId" TEXT,
  course_id TEXT NOT NULL,
  "courseId" TEXT,
  certificate_number TEXT NOT NULL UNIQUE,
  "certificateNumber" TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.progress (
  user_id TEXT NOT NULL,
  "userId" TEXT,
  course_id TEXT NOT NULL,
  "courseId" TEXT,
  percent NUMERIC NOT NULL DEFAULT 0,
  last_lesson_id TEXT,
  "lastLessonId" TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- 8. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  rating NUMERIC NOT NULL DEFAULT 5,
  review TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PREVIEW VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.preview_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL DEFAULT '',
  "youtubeUrl" TEXT DEFAULT '',
  embed_url TEXT NOT NULL DEFAULT '',
  "embedUrl" TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  "thumbnailUrl" TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 11. APP SHOWCASE TABLE
CREATE TABLE IF NOT EXISTS public.app_showcase (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'customer-app',
  image_url TEXT NOT NULL,
  "imageUrl" TEXT,
  "order" NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Admin',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "publishedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);

-- 13. PASSWORD RESETS TABLE
CREATE TABLE IF NOT EXISTS public.password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  "userId" TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SITE CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & PERMISSIONS SETUP
-- Enable RLS and grant full read/write access so web & admin operations succeed
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preview_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated full access policies
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to courses" ON public.courses;
CREATE POLICY "Allow all access to courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to enrollments" ON public.enrollments;
CREATE POLICY "Allow all access to enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to coupons" ON public.coupons;
CREATE POLICY "Allow all access to coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to certificates" ON public.certificates;
CREATE POLICY "Allow all access to certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to progress" ON public.progress;
CREATE POLICY "Allow all access to progress" ON public.progress FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to testimonials" ON public.testimonials;
CREATE POLICY "Allow all access to testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to announcements" ON public.announcements;
CREATE POLICY "Allow all access to announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to preview_videos" ON public.preview_videos;
CREATE POLICY "Allow all access to preview_videos" ON public.preview_videos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to app_showcase" ON public.app_showcase;
CREATE POLICY "Allow all access to app_showcase" ON public.app_showcase FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to blog_posts" ON public.blog_posts;
CREATE POLICY "Allow all access to blog_posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to password_resets" ON public.password_resets;
CREATE POLICY "Allow all access to password_resets" ON public.password_resets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to site_config" ON public.site_config;
CREATE POLICY "Allow all access to site_config" ON public.site_config FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- INITIAL DEFAULT ADMIN USER
-- Email: admin@subhanacademy.in | Password: Admin@123
-- ==============================================================================
INSERT INTO public.users (id, name, email, password_hash, "passwordHash", role, blocked, pending_payment, "pendingPayment", created_at, "createdAt")
VALUES (
  'admin-1',
  'Subhan Academy Admin',
  'admin@subhanacademy.in',
  '42994b0f1c125321a4a93401854f4307:5025dc409826b70e85044277553affeff9eec026b2b365791df4fd730b52d1649530a6657afdf39f44d4da57c95ac45350e72ce725317d79ee0e5ef884cab4ca',
  '42994b0f1c125321a4a93401854f4307:5025dc409826b70e85044277553affeff9eec026b2b365791df4fd730b52d1649530a6657afdf39f44d4da57c95ac45350e72ce725317d79ee0e5ef884cab4ca',
  'admin',
  FALSE,
  FALSE,
  FALSE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  "passwordHash" = EXCLUDED."passwordHash",
  role = 'admin';
