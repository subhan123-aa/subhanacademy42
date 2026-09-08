import { AuthPanel } from "@/components/auth-panel";
import { Container } from "@/components/site";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextUrl = next && next.startsWith("/") && !next.startsWith("//") ? next : "/student/dashboard";
  return (
    <main className="min-h-screen bg-white py-12">
      <Container className="max-w-lg">
        <AuthPanel mode="login" nextUrl={nextUrl} />
      </Container>
    </main>
  );
}
