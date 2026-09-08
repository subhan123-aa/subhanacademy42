import { cookies } from "next/headers";
import { authCookieName, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/data";

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
  if (!user || user.blocked || user.pendingPayment) return null;
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
