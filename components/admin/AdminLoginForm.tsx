"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  loadRememberedLogin,
  saveRememberedLogin,
} from "@/lib/admin-auth-storage";
import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { BackLink } from "@/components/ui/BackLink";
import { ClientPageShell } from "@/components/ui/ClientPageShell";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = loadRememberedLogin();
    setRememberMe(saved.rememberMe);
    setEmail(saved.email);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createClient({ rememberMe });
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    saveRememberedLogin(rememberMe, normalizedEmail);
    router.push("/admin");
    router.refresh();
  }

  return (
    <ClientPageShell>
      <BackLink href="/" label="Home" />
      <ContentCard padding="lg" className="mx-auto w-full max-w-sm">
        <h1 className="text-center font-serif text-2xl text-brand-ink">
          Admin Login
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Manage appointments and your calendar
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-ink">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => setEmail(e.target.value.trim().toLowerCase())}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              required
              className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-3 text-brand-ink focus:border-brand-brown focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-ink">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={rememberMe ? "current-password" : "off"}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-3 pr-12 text-brand-ink focus:border-brand-brown focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-muted"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 accent-brand-brown"
            />
            Remember me
          </label>
          {error && (
            <p className="text-sm text-red-700">
              {error.toLowerCase().includes("invalid login credentials")
                ? "Email or password is incorrect. Check for extra spaces and that the password ends with !"
                : error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </ContentCard>
    </ClientPageShell>
  );
}
