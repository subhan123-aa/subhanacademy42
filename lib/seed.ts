import { hashPassword } from "@/lib/auth";
import type { SiteSeed } from "@/lib/types";

export const seed: SiteSeed = {
  users: [
    {
      id: "admin-1",
      name: "Subhan Academy Admin",
      email: "admin@subhanacademy.in",
      passwordHash: hashPassword("Admin@123"),
      role: "admin",
      createdAt: new Date().toISOString()
    },
    {
      id: "student-1",
      name: "Aarav Khan",
      email: "student@subhanacademy.in",
      passwordHash: hashPassword("Student@123"),
      role: "student",
      createdAt: new Date().toISOString()
    }
  ],
  courses: [
    {
      id: "course-1",
      slug: "sabjihub-blueprint",
      title: "SabjiHub Blueprint - From Idea to Launch",
      subtitle: "A practical course on building and launching a local grocery delivery platform.",
      price: 5,
      oldPrice: 999,
      showDiscountDisplay: true,
      thumbnail: "/images/course-thumb.svg",
      published: true,
      hours: 10,
      includes: [
        "Lifetime access",
        "Certificate of completion",
        "Downloadable resources",
        "Community support",
        "Future updates"
      ],
      outcomes: [
        "Validate a local grocery business idea",
        "Plan the app, admin panel, and delivery flow",
        "Launch with Instagram, Facebook, and WhatsApp marketing",
        "Track orders, customers, and growth"
      ],
      modules: [
        {
          id: "mod-1",
          title: "SabjiHub Idea & Story",
          description: "How the idea started and what problem it solves.",
          order: 1,
          lessons: [
            {
              id: "lesson-1",
              title: "Origin story and business opportunity",
              duration: "18 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "An overview of how SabjiHub came together."
            }
          ]
        },
        {
          id: "mod-2",
          title: "Local Market Research",
          description: "Understand demand, competition, and delivery areas.",
          order: 2,
          lessons: [
            {
              id: "lesson-2",
              title: "Researching your city",
              duration: "24 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Identify neighborhoods and customer segments."
            }
          ]
        },
        {
          id: "mod-3",
          title: "Platform Planning",
          description: "Map the app, order flow, and operations.",
          order: 3,
          lessons: [
            {
              id: "lesson-3",
              title: "Planning the delivery workflow",
              duration: "21 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Translate the idea into a clear product plan."
            }
          ]
        },
        {
          id: "mod-4",
          title: "App Development",
          description: "Build the customer app and admin surfaces.",
          order: 4,
          lessons: [
            {
              id: "lesson-4",
              title: "Core app architecture",
              duration: "29 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Set up the customer experience and admin base."
            }
          ]
        },
        {
          id: "mod-5",
          title: "Admin Panel & Management",
          description: "Manage products, orders, and operations.",
          order: 5,
          lessons: [
            {
              id: "lesson-5",
              title: "Admin workflows",
              duration: "20 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "How to keep the business organized."
            }
          ]
        },
        {
          id: "mod-6",
          title: "Delivery Operations",
          description: "Handle fulfillment, riders, and service levels.",
          order: 6,
          lessons: [
            {
              id: "lesson-6",
              title: "Order fulfillment process",
              duration: "17 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Keep deliveries predictable and reliable."
            }
          ]
        },
        {
          id: "mod-7",
          title: "Local Orders Strategy",
          description: "Build repeat orders from nearby customers.",
          order: 7,
          lessons: [
            {
              id: "lesson-7",
              title: "Creating order loops",
              duration: "23 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Encourage repeat buying through smart ops."
            }
          ]
        },
        {
          id: "mod-8",
          title: "Launch Strategy",
          description: "Plan your launch and early traction.",
          order: 8,
          lessons: [
            {
              id: "lesson-8",
              title: "Launch checklist",
              duration: "16 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Launch with confidence and a process."
            }
          ]
        },
        {
          id: "mod-9",
          title: "Marketing & Growth",
          description: "Use social channels to get your first users.",
          order: 9,
          lessons: [
            {
              id: "lesson-9",
              title: "Instagram, Facebook, WhatsApp",
              duration: "26 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Practical low-cost marketing for local businesses."
            }
          ]
        },
        {
          id: "mod-10",
          title: "Real SabjiHub Case Study",
          description: "What worked, what changed, and what to learn.",
          order: 10,
          lessons: [
            {
              id: "lesson-10",
              title: "Case study and takeaways",
              duration: "31 min",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              summary: "Review the full journey and key lessons."
            }
          ]
        }
      ]
    }
  ],
  enrollments: [],
  orders: [],
  coupons: [
    {
      id: "coupon-launch",
      code: "LAUNCH50",
      type: "percent",
      value: 50,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
      usageLimit: 100,
      usedCount: 0,
      active: true
    }
  ],
  certificates: [],
  testimonials: [
    {
      id: "test-1",
      name: "Nisha Sharma",
      location: "Indore",
      rating: 5,
      review: "The course feels practical, clear, and grounded in a real business journey.",
      avatar: "/images/avatar-1.svg"
    },
    {
      id: "test-2",
      name: "Mohit Verma",
      location: "Surat",
      rating: 5,
      review: "I like that the modules focus on launch steps instead of generic theory.",
      avatar: "/images/avatar-2.svg"
    }
  ],
  blogPosts: [
    {
      id: "blog-1",
      slug: "how-to-start-a-local-grocery-delivery-business",
      title: "How to Start a Local Grocery Delivery Business",
      excerpt: "A practical starting guide for local entrepreneurs.",
      content: "Start small, validate demand, map routes, and build a reliable customer experience.",
      publishedAt: new Date().toISOString(),
      author: "Subhan Academy"
    },
    {
      id: "blog-2",
      slug: "how-to-build-a-grocery-delivery-app",
      title: "How to Build a Grocery Delivery App",
      excerpt: "What the product stack and workflow should include.",
      content: "Focus on order flow, inventory, delivery status, and admin visibility.",
      publishedAt: new Date().toISOString(),
      author: "Subhan Academy"
    },
    {
      id: "blog-3",
      slug: "how-to-get-your-first-100-customers",
      title: "How to Get Your First 100 Customers",
      excerpt: "Simple local tactics that compound fast.",
      content: "Use WhatsApp, referrals, local posters, reels, and launch offers.",
      publishedAt: new Date().toISOString(),
      author: "Subhan Academy"
    }
  ],
  announcements: [
    {
      id: "ann-1",
      title: "New student dashboard now live",
      body: "Students can track progress and download certificates from one place.",
      createdAt: new Date().toISOString()
    }
  ],
  previewVideos: [
    {
      id: "preview-1",
      title: "See How SabjiHub Was Built",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
      description: "See how I built SabjiHub and what you will learn inside the course.",
      thumbnailUrl: "/images/mentor-subhan.png",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  appShowcaseScreenshots: [
    {
      id: "appshot-1",
      title: "Home screen",
      category: "customer-app",
      imageUrl: "/images/app-showcase/customer-home-1.svg",
      order: 1,
      caption: "A clean customer home screen with featured collections and quick navigation.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appshot-2",
      title: "Browse products",
      category: "customer-app",
      imageUrl: "/images/app-showcase/customer-home-2.svg",
      order: 2,
      caption: "Discover offers and fresh items with a simple, mobile-first layout.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appshot-3",
      title: "Categories and products",
      category: "customer-app",
      imageUrl: "/images/app-showcase/products-1.svg",
      order: 3,
      caption: "Shoppers can move from category browsing into product details quickly.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appshot-4",
      title: "Cart and checkout",
      category: "customer-app",
      imageUrl: "/images/app-showcase/orders-1.svg",
      order: 4,
      caption: "A smooth cart and checkout flow designed for quick repeat orders.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  progress: [],
  passwordResets: []
};
