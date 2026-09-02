"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { BackLink } from "@/components/ui/BackLink";
import { ClientPageShell } from "@/components/ui/ClientPageShell";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <ClientPageShell>
      <BackLink href="/admin/login" label="Back to login" />
      <ContentCard padding="lg" className="mx-auto w-full max-w-sm">
        <p className="label-kicker mb-2 text-center">Account recovery</p>
        <h1 className="text-center font-serif text-2xl italic text-brand-ink">
          New password
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Choose a new password for your admin account.
        </p>

        {!ready ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-brand-muted">
              Open the reset link from your email to continue.
            </p>
            <Link
              href="/admin/forgot-password"
              className="inline-block text-sm font-semibold text-brand-brown hover:underline"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-kicker mb-2 block">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="field"
              />
            </div>
            <div>
              <label className="label-kicker mb-2 block">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="field"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving…" : "Save password"}
            </Button>
          </form>
        )}
      </ContentCard>
    </ClientPageShell>
  );
}
