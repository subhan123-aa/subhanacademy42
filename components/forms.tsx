"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/site";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function AuthForm({
  title,
  subtitle,
  submitLabel,
  fields,
  onSubmit,
  footer
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  fields: { name: string; label: string; type?: string; placeholder?: string }[];
  onSubmit: (form: FormData) => Promise<void>;
  footer?: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-5"
      action={async (formData) => {
        setBusy(true);
        setError(null);
        try {
          await onSubmit(formData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      {fields.map((field) => (
        <label key={field.name} className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          <input
            name={field.name}
            type={field.type || "text"}
            placeholder={field.placeholder}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            required
          />
        </label>
      ))}

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700",
          busy && "cursor-wait opacity-80"
        )}
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </button>

      {footer}
    </form>
  );
}
