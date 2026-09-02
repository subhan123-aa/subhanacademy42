import { AuthPanel } from "@/components/auth-panel";
import { Container } from "@/components/site";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <Container className="max-w-lg">
        <AuthPanel mode="forgot" nextUrl="/auth/reset-password" />
      </Container>
    </main>
  );
}
