import { AuthPanel } from "@/components/auth-panel";
import { Container } from "@/components/site";
import { BrandLogo } from "@/components/brand-logo";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="min-h-screen bg-white py-12">
      <Container className="max-w-lg">
        <a href="/" className="mb-8 block w-fit">
          <BrandLogo className="h-auto w-[220px]" />
        </a>
        <AuthPanel mode="signup" nextUrl={next || "/student/dashboard"} />
      </Container>
    </main>
  );
}
