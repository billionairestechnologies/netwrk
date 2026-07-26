"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-neutral-50">Netwrk</h1>
          <p className="text-sm text-neutral-400">Sign in with a magic link — no password to leak.</p>
        </div>

        {status === "sent" ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            Check <span className="font-medium text-neutral-100">{email}</span> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-50 outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {status === "sending" ? "Sending link..." : "Send magic link"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-400">Something went wrong. Try again.</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
