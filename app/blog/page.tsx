import { Badge, Container, Footer, Navbar, SectionHeading } from "@/components/site";
import { getStore } from "@/lib/data";
import Link from "next/link";

export default async function BlogIndexPage() {
  const posts = await getStore("blogPosts");
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container className="py-16">
        <Badge>Blog</Badge>
        <div className="mt-6">
          <SectionHeading title="Simple, SEO-friendly articles" description="Built for discoverability and educational value." />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft transition hover:-translate-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Blog post</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
