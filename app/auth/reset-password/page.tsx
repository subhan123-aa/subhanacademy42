import { AuthPanel } from "@/components/auth-panel";
import { Container } from "@/components/site";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="min-h-screen bg-white py-12">
      <Container className="max-w-lg">
        <AuthPanel mode="reset" token={token} nextUrl="/student/dashboard" />
      </Container>
    </main>
  );
}
