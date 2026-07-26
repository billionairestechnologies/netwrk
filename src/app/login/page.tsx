"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, EnvelopeSimple, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-accent text-lg font-semibold text-accent-contrast">
            N
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-medium text-text-primary">Sign in to Netwrk</h1>
            <p className="text-sm text-text-secondary">A magic link, no password to remember or leak.</p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-bg-elevated p-4 text-sm text-text-secondary">
            <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-accent" />
            <p>
              Check <span className="font-medium text-text-primary">{email}</span> for a sign-in link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <EnvelopeSimple
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated py-3 pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-strong"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-accent px-4 py-3 text-sm font-medium text-accent-contrast transition active:scale-[0.98] disabled:opacity-50"
            >
              {status === "sending" ? "Sending link..." : "Continue"}
              {status !== "sending" && <ArrowRight size={16} weight="bold" />}
            </button>
            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-danger">
                <WarningCircle size={16} />
                <p>Something went wrong. Try again.</p>
              </div>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
