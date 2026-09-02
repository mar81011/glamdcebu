"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { BackLink } from "@/components/ui/BackLink";
import { ClientPageShell } from "@/components/ui/ClientPageShell";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/admin/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo },
    );

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <ClientPageShell>
      <BackLink href="/admin/login" label="Back to login" />
      <ContentCard padding="lg" className="mx-auto w-full max-w-sm">
        <p className="label-kicker mb-2 text-center">Account recovery</p>
        <h1 className="text-center font-serif text-2xl italic text-brand-ink">
          Reset password
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          We&apos;ll email you a link to choose a new password.
        </p>

        {sent ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-brand-ink">
              If an account exists for that email, a reset link was sent. Check your
              inbox and spam folder.
            </p>
            <Link
              href="/admin/login"
              className="inline-block text-sm font-semibold text-brand-brown hover:underline"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-kicker mb-2 block">
                Admin email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => setEmail(e.target.value.trim().toLowerCase())}
                autoComplete="email"
                required
                className="field"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </ContentCard>
    </ClientPageShell>
  );
}
