"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VOICE_SPEAKERS, DEFAULT_VOICE_SPEAKER } from "@/lib/sarvam";
import { Play, CircleNotch, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const PERSONAS = [
  { value: "friend", label: "Friend", blurb: "Casual and warm, talks like someone who knows you." },
  { value: "companion", label: "Companion", blurb: "Close and personal, present for the emotional stuff too." },
  { value: "assistant", label: "Assistant", blurb: "Focused and efficient, gets things done." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("Nova");
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]["value"]>("assistant");
  const [voiceSpeaker, setVoiceSpeaker] = useState<string>(DEFAULT_VOICE_SPEAKER);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handlePreviewVoice(speaker: string) {
    setPreviewingVoice(speaker);
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Hi, I'm ${name.trim() || "Nova"}. This is what I sound like.`, speaker }),
      });
      const data = await res.json();
      if (res.ok) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        await audio.play();
      }
    } finally {
      setPreviewingVoice(null);
    }
  }

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
      voice_speaker: voiceSpeaker,
    });

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-bg px-4 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
        <div className="space-y-1.5 text-center">
          <h1 className="text-xl font-medium text-text-primary">Set up your companion</h1>
          <p className="text-sm text-text-secondary">
            Name it, pick how it shows up, and how it sounds. You can change any of this later.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nova"
            className="w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-strong"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">Mode</label>
          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setPersona(p.value)}
                className={`w-full rounded-[var(--radius-md)] border px-4 py-3 text-left transition ${
                  persona === p.value
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-bg-elevated hover:border-border-strong"
                }`}
              >
                <div className="text-sm font-medium text-text-primary">{p.label}</div>
                <div className="text-xs text-text-secondary">{p.blurb}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">Voice</label>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_SPEAKERS.map((v) => (
              <button
                type="button"
                key={v.id}
                onClick={() => setVoiceSpeaker(v.id)}
                className={`flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition ${
                  voiceSpeaker === v.id
                    ? "border-accent bg-accent-soft text-text-primary"
                    : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong"
                }`}
              >
                <span>{v.label}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewVoice(v.id);
                  }}
                  className="text-text-tertiary transition hover:text-text-primary"
                >
                  {previewingVoice === v.id ? (
                    <CircleNotch size={15} className="animate-spin" />
                  ) : (
                    <Play size={15} weight="fill" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-accent px-4 py-3 text-sm font-medium text-accent-contrast transition active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
          {!saving && <ArrowRight size={16} weight="bold" />}
        </button>
      </form>
    </main>
  );
}
