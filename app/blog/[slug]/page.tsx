import { Badge, Container, Footer, Navbar, SectionHeading } from "@/components/site";
import { getStore } from "@/lib/data";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getStore("blogPosts");
  const post = posts.find((item) => item.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getStore("blogPosts");
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container className="py-16">
        <Badge>Blog</Badge>
        <div className="mt-6 max-w-3xl">
          <SectionHeading title={post.title} description={post.excerpt} />
        </div>
        <article className="mt-10 max-w-3xl rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-soft">
          <p className="text-sm text-slate-500">By {post.author}</p>
          <div className="prose mt-6 max-w-none prose-slate">
            <p>{post.content}</p>
          </div>
        </article>
      </Container>
      <Footer />
    </div>
  );
}
