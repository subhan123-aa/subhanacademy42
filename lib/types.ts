export type Role = "student" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  blocked?: boolean;
  pendingPayment?: boolean;
};

export type LessonResource = {
  title: string;
  url: string;
  type?: "pdf" | "link" | "video";
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  description?: string;
  thumbnail?: string;
  resources?: LessonResource[];
};

export type Module = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  oldPrice: number;
  showDiscountDisplay?: boolean;
  thumbnail: string;
  published: boolean;
  hours: number;
  previewLessonId?: string;
  includes: string[];
  outcomes: string[];
  modules: Module[];
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  orderId: string;
  enrolledAt: string;
  completedLessonIds: string[];
};

export type Order = {
  id: string;
  userId: string;
  courseId: string;
  couponCode?: string;
  referralCode?: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  country: string;
  state: string;
  subtotal: number;
  discount: number;
  total: number;
  status: "created" | "paid" | "failed";
  refundStatus?: "none" | "requested" | "refunded";
  providerOrderId?: string;
  providerPaymentId?: string;
  createdAt: string;
  paidAt?: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
};

export type Certificate = {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  avatar: string;
  visible?: boolean;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type PreviewVideo = {
  id: string;
  title: string;
  youtubeUrl: string;
  embedUrl: string;
  description: string;
  thumbnailUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppShowcaseCategory = "customer-app" | "products" | "orders";

export type AppShowcaseScreenshot = {
  id: string;
  title: string;
  caption?: string;
  category: AppShowcaseCategory;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PasswordReset = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
};

export type ProgressRecord = {
  userId: string;
  courseId: string;
  percent: number;
  lastLessonId?: string;
  updatedAt: string;
};

export type SiteSeed = {
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

export type SiteConfig = {
  heroHeadline: string;
  heroSubheadline: string;
  stats: {
    label: string;
    value: string;
    detail: string;
  }[];
  dashboardShowcaseImage?: string;
  whyTitle?: string;
  whyDescription?: string;
  whyPoints?: {
    title: string;
    description: string;
  }[];
  mentorName?: string;
  mentorRole?: string;
  mentorBio?: string;
  mentorExperience?: string;
  mentorQuote?: string;
  learnTitle?: string;
  learnDescription?: string;
  learnCards?: {
    title: string;
    description: string;
  }[];
  storyTitle?: string;
  storyDescription?: string;
  storySteps?: {
    title: string;
    description: string;
  }[];
  faqTitle?: string;
  faqs?: {
    question: string;
    answer: string;
  }[];
  ctaTitle?: string;
  ctaDescription?: string;
  announcement?: string;
  paymentSettings?: {
    provider: string;
    enabled: boolean;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
};
