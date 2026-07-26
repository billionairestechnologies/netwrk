"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PERSONAS = [
  { value: "friend", label: "Friend", blurb: "Casual, warm, talks like someone who knows you." },
  { value: "companion", label: "Companion", blurb: "Close, personal, present for the emotional stuff too." },
  { value: "assistant", label: "Assistant", blurb: "Focused, efficient, gets things done." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("Nova");
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]["value"]>("assistant");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("agent_config").upsert({
      user_id: user.id,
      agent_name: name.trim() || "Nova",
      persona,
    });

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-neutral-50">Set up your companion</h1>
          <p className="text-sm text-neutral-400">Name it and pick how it should show up. Change this anytime.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nova"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-50 outline-none focus:border-neutral-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Mode</label>
          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setPersona(p.value)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  persona === p.value
                    ? "border-neutral-100 bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                }`}
              >
                <div className="text-sm font-medium text-neutral-50">{p.label}</div>
                <div className="text-xs text-neutral-400">{p.blurb}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
