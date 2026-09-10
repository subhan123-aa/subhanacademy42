import { cookies } from "next/headers";
import { authCookieName, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";
import type { Role } from "@/lib/types";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName())?.value;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;
  const users = await getStore("users");
  const user = users.find((candidate) => candidate.id === session.sub) ?? null;
  if (!user) {
    if (session.role === "admin") {
      return {
        id: session.sub || "admin-1",
        name: session.name || "Subhan Academy Admin",
        email: session.email || "admin@subhanacademy.in",
        passwordHash: "",
        role: "admin" as const,
        createdAt: new Date().toISOString()
      };
    }
    return {
      id: session.sub,
      name: session.name || "Student",
      email: session.email,
      passwordHash: "",
      role: (session.role as Role) || "student",
      createdAt: new Date().toISOString()
    };
  }
  if (user.blocked) return null;
  if (user.role !== "admin" && user.pendingPayment) return null;
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
