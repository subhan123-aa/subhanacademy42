import type { MetadataRoute } from "next";
import { getStore } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, posts] = await Promise.all([getStore("courses"), getStore("blogPosts")]);
  return [
    { url: "https://subhanacademy.in", lastModified: new Date() },
    { url: "https://subhanacademy.in/courses", lastModified: new Date() },
    { url: "https://subhanacademy.in/blog", lastModified: new Date() },
    ...courses.map((course) => ({ url: `https://subhanacademy.in/courses/${course.slug}`, lastModified: new Date() })),
    ...posts.map((post) => ({ url: `https://subhanacademy.in/blog/${post.slug}`, lastModified: new Date() }))
  ];
}
