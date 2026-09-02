import { z } from "zod";
import { INDIA_COUNTRY, INDIAN_STATES_AND_UTS } from "@/lib/india";

export const authSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email(),
  password: z.string().min(6),
  pendingPayment: z.coerce.boolean().optional(),
  nextUrl: z.string().optional()
});

export const forgotSchema = z.object({
  email: z.string().trim().email()
});

export const resetSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(6)
});

const indianMobileSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number.");

const lessonResourceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.string().trim().url(),
  type: z.enum(["pdf", "link", "video"]).optional()
});

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2),
  duration: z.string().trim().min(1),
  videoUrl: z.string().trim().url(),
  summary: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
  thumbnail: z.string().trim().optional(),
  resources: z.array(lessonResourceSchema).default([])
});

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2),
  description: z.string().trim().min(3),
  order: z.coerce.number().int().min(1),
  lessons: z.array(lessonSchema).default([])
});

const currencySchema = z.coerce.number().finite().min(0, "Price cannot be negative.");

export const checkoutCustomerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  emailAddress: z.string().trim().email("Enter a valid email address."),
  mobileNumber: indianMobileSchema,
  country: z.literal(INDIA_COUNTRY),
  state: z.enum(INDIAN_STATES_AND_UTS, {
    errorMap: () => ({ message: "Please select a state or union territory." })
  })
});

export const checkoutSignupSchema = checkoutCustomerSchema.extend({
  password: z.string().min(6, "Create a password with at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm your password.")
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

export const createOrderSchema = z.object({
  courseId: z.string().min(1),
  couponCode: z.string().trim().optional(),
  referralCode: z.string().trim().max(80).optional(),
  fullName: z.string().trim().min(2),
  emailAddress: z.string().trim().email(),
  mobileNumber: indianMobileSchema,
  country: z.literal(INDIA_COUNTRY),
  state: z.enum(INDIAN_STATES_AND_UTS)
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1).optional(),
  razorpayPaymentId: z.string().min(1).optional(),
  razorpaySignature: z.string().min(1).optional(),
  mode: z.enum(["razorpay", "mock"]).default("mock")
});

export const progressSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1)
});

export const courseSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(3),
  title: z.string().trim().min(4),
  subtitle: z.string().trim().min(6),
  price: currencySchema,
  oldPrice: currencySchema,
  showDiscountDisplay: z.coerce.boolean().default(true),
  thumbnail: z.string().trim().min(1),
  published: z.coerce.boolean().default(false),
  hours: z.coerce.number().min(1),
  includes: z.array(z.string().min(1)).min(1),
  outcomes: z.array(z.string().min(1)).min(1)
});

export const adminCourseSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(3),
  title: z.string().trim().min(4),
  subtitle: z.string().trim().min(6),
  price: currencySchema,
  oldPrice: currencySchema,
  showDiscountDisplay: z.coerce.boolean().default(true),
  thumbnail: z.string().trim().min(1),
  published: z.coerce.boolean().default(false),
  hours: z.coerce.number().min(1),
  previewLessonId: z.string().optional(),
  includes: z.array(z.string().min(1)).min(1),
  outcomes: z.array(z.string().min(1)).min(1),
  modules: z.array(moduleSchema).default([])
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(24),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(1),
  expiresAt: z.string().min(1),
  usageLimit: z.coerce.number().min(1),
  active: z.coerce.boolean().default(true)
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2),
  location: z.string().trim().min(2),
  rating: z.coerce.number().min(1).max(5),
  review: z.string().trim().min(10),
  avatar: z.string().trim().min(1),
  visible: z.coerce.boolean().default(true)
});

export const blogSchema = z.object({
  title: z.string().trim().min(4),
  slug: z.string().trim().min(3),
  excerpt: z.string().trim().min(10),
  content: z.string().trim().min(10),
  author: z.string().trim().min(2)
});

export const announcementSchema = z.object({
  title: z.string().trim().min(4),
  body: z.string().trim().min(10)
});

export const adminUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).optional(),
  blocked: z.coerce.boolean().optional()
});

export const adminOrderSchema = z.object({
  id: z.string().min(1),
  refundStatus: z.enum(["none", "requested", "refunded"]).optional()
});

export const siteConfigSchema = z.object({
  heroHeadline: z.string().trim().min(4),
  heroSubheadline: z.string().trim().min(10),
  stats: z.array(
    z.object({
      label: z.string().trim().min(2),
      value: z.string().trim().min(1),
      detail: z.string().trim().min(2)
    })
  ).min(1),
  dashboardShowcaseImage: z.string().trim().optional(),
  whyTitle: z.string().trim().optional(),
  whyDescription: z.string().trim().optional(),
  whyPoints: z.array(z.object({ title: z.string().trim().min(2), description: z.string().trim().min(4) })).optional(),
  mentorName: z.string().trim().optional(),
  mentorRole: z.string().trim().optional(),
  mentorBio: z.string().trim().optional(),
  mentorExperience: z.string().trim().optional(),
  mentorQuote: z.string().trim().optional(),
  learnTitle: z.string().trim().optional(),
  learnDescription: z.string().trim().optional(),
  learnCards: z.array(z.object({ title: z.string().trim().min(2), description: z.string().trim().min(4) })).optional(),
  storyTitle: z.string().trim().optional(),
  storyDescription: z.string().trim().optional(),
  storySteps: z.array(z.object({ title: z.string().trim().min(2), description: z.string().trim().min(4) })).optional(),
  faqTitle: z.string().trim().optional(),
  faqs: z.array(z.object({ question: z.string().trim().min(2), answer: z.string().trim().min(4) })).optional(),
  ctaTitle: z.string().trim().optional(),
  ctaDescription: z.string().trim().optional(),
  announcement: z.string().trim().optional(),
  paymentSettings: z.object({
    provider: z.string().trim().min(1),
    enabled: z.coerce.boolean()
  }).optional(),
  socialLinks: z.object({
    instagram: z.string().trim().optional(),
    facebook: z.string().trim().optional(),
    whatsapp: z.string().trim().optional()
  }).optional()
});
