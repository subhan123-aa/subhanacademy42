import { createBrowserClient } from "@supabase/ssr";

function cleanEnv(val?: string | null): string {
  if (!val) return "";
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

export function createSupabaseBrowserClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const publishableKey = cleanEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY
  );

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(url, publishableKey);
}