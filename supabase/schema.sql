-- ==============================================================================
-- SUBHAN ACADEMY — PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
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

-- Index for fast user lookups by email and role
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
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- 12. SITE CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
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
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to courses, testimonials, announcements, preview videos, app showcase
CREATE POLICY "Public courses are viewable by everyone" ON public.courses FOR SELECT USING (published = true);
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING (visible = true);
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Preview videos are viewable by everyone" ON public.preview_videos FOR SELECT USING (active = true);
CREATE POLICY "App showcase is viewable by everyone" ON public.app_showcase FOR SELECT USING (true);
CREATE POLICY "Site config is viewable by everyone" ON public.site_config FOR SELECT USING (true);

-- Authenticated student policies
CREATE POLICY "Users can read their own profile" ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own enrollments" ON public.enrollments FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own progress" ON public.progress FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own progress" ON public.progress FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid()::text = user_id);

-- Note: The server uses the Supabase Service Role Key (via createSupabaseAdminClient)
-- for privileged backend operations (creating registrations, processing Cashfree webhooks,
-- completing orders, managing courses, and serving the Admin console).
-- The Service Role automatically bypasses RLS safely on the server side.
