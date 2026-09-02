"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const inputClass = "field text-sm py-2.5";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function AccountSettings() {
  const supabase = createClient();
  const [currentEmail, setCurrentEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        setCurrentEmail(user?.email ?? "");
        setLoadingUser(false);
      });
  }, []);

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError("");
    setEmailMessage("");

    const nextEmail = normalizeEmail(newEmail);
    if (!nextEmail || nextEmail === currentEmail) {
      setEmailError("Enter a new email address.");
      setEmailSaving(false);
      return;
    }
    if (!emailPassword) {
      setEmailError("Enter your current password to confirm.");
      setEmailSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: emailPassword,
    });
    if (signInError) {
      setEmailError("Current password is incorrect.");
      setEmailSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: nextEmail });
    setEmailSaving(false);
    if (error) {
      setEmailError(error.message);
      return;
    }

    setEmailPassword("");
    setNewEmail("");
    setEmailMessage(
      "Confirmation sent to your new email. Click the link there to finish the change. You can still sign in with your current email until it is confirmed.",
    );
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      setPasswordSaving(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setPasswordSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordError("Current password is incorrect.");
      setPasswordSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
  }

  if (loadingUser) {
    return (
      <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
        <p className="text-sm text-brand-muted">Loading account…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Account</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Signed in as <span className="font-medium text-brand-ink">{currentEmail}</span>
      </p>

      <form className="mt-6 space-y-3 border-t border-brand-brown/10 pt-4" onSubmit={changeEmail}>
        <h4 className="text-sm font-semibold text-brand-ink">Change email</h4>
        <p className="text-xs text-brand-muted">
          Supabase will email a confirmation link to the new address before the change
          takes effect.
        </p>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink">
            New email
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink">
            Current password
          </label>
          <input
            type="password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={emailSaving} className="px-6 py-2 text-sm">
          {emailSaving ? "Sending…" : "Update email"}
        </Button>
        {emailMessage && (
          <p className="text-sm font-medium text-green-800">{emailMessage}</p>
        )}
        {emailError && <p className="text-sm text-red-700">{emailError}</p>}
      </form>

      <form
        className="mt-6 space-y-3 border-t border-brand-brown/10 pt-4"
        onSubmit={changePassword}
      >
        <h4 className="text-sm font-semibold text-brand-ink">Change password</h4>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink">
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={passwordSaving} className="px-6 py-2 text-sm">
          {passwordSaving ? "Saving…" : "Update password"}
        </Button>
        {passwordMessage && (
          <p className="text-sm font-medium text-green-800">{passwordMessage}</p>
        )}
        {passwordError && <p className="text-sm text-red-700">{passwordError}</p>}
      </form>
    </div>
  );
}
