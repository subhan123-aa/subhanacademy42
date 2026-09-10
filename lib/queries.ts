import { cookies } from "next/headers";
import { authCookieName, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName())?.value;
  const verified = verifySession(token);
  if (verified) return verified;

  if (isSupabaseConfigured()) {
    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userRole = (user.user_metadata?.role?.toLowerCase() === "admin" ? "admin" : "student") as Role;
        return {
          sub: user.id,
          email: user.email || "",
          role: userRole,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Student",
          exp: Date.now() + 1000 * 60 * 60 * 24 * 7
        };
      }
    } catch {
      // Supabase auth session check failed or unconfigured
    }
  }

  return null;
}

export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;
  const users = await getStore("users");
  const user = users.find((candidate) => candidate.id === session.sub || candidate.email.toLowerCase() === session.email.toLowerCase()) ?? null;
  if (!user) {
    if (session.role === "admin") {
      return {
        id: session.sub || "admin-1",
        name: session.name || "Subhan Academy Admin",
        email: session.email || "admin@subhanacademy.in",
        passwordHash: "",
        role: "admin" as const,
        createdAt: new Date().toISOString(),
        blocked: false
      };
    }
    return {
      id: session.sub,
      name: session.name || "Student",
      email: session.email,
      passwordHash: "",
      role: (session.role as Role) || "student",
      createdAt: new Date().toISOString(),
      blocked: false,
      pendingPayment: false
    };
  }
  if (user.blocked) return null;
  // Never log out authenticated users due to pendingPayment flag.
  // The pages and checkout stepper handle payment flow gracefully.
  return user;
}

export async function getCourseBySlug(slug: string) {
  const courses = await getStore("courses");
  return courses.find((course) => course.slug === slug) ?? null;
}

export async function getCourseById(courseId: string) {
  const courses = await getStore("courses");
  return courses.find((course) => course.id === courseId) ?? null;
}

export async function getActivePreviewVideo() {
  const previewVideos = await getStore("previewVideos");
  return previewVideos.find((video) => video.active) ?? previewVideos[0] ?? null;
}

export async function getEnrollment(userId: string, courseId: string) {
  const enrollments = await getStore("enrollments");
  return enrollments.find((enrollment) => enrollment.userId === userId && enrollment.courseId === courseId) ?? null;
}

export async function getCertificate(userId: string, courseId: string) {
  const certificates = await getStore("certificates");
  return certificates.find((certificate) => certificate.userId === userId && certificate.courseId === courseId) ?? null;
}
