"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Microphone,
  Stop,
  ArrowUp,
  SpeakerHigh,
  SpeakerSlash,
  Play,
  SlidersHorizontal,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatView({ agentName, persona }: { agentName: string; persona: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function playReply(text: string) {
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        new Audio(`data:audio/wav;base64,${data.audio}`).play();
      }
    } catch {
      // voice playback is best-effort, don't block the chat on TTS failures
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });
      const data = await res.json();
      if (res.ok) {
        setConversationId(data.conversationId);
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (voiceReplies && data.reply) {
          playReply(data.reply);
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  }

  async function handleMicClick() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setTranscribing(true);

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "recording.webm");

      try {
        const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
        const data = await res.json();
        if (res.ok && data.transcript) {
          await sendMessage(data.transcript);
        }
      } finally {
        setTranscribing(false);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-bg">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-sm font-semibold text-accent-contrast">
            {agentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">{agentName}</div>
            <div className="text-xs capitalize text-text-tertiary">{persona} mode</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setVoiceReplies((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition hover:bg-bg-elevated ${
              voiceReplies ? "text-accent" : "text-text-tertiary"
            }`}
            title="Toggle voice replies"
          >
            {voiceReplies ? <SpeakerHigh size={18} /> : <SpeakerSlash size={18} />}
          </button>
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary"
            title="Data dashboard"
          >
            <SlidersHorizontal size={18} />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary"
            title="Sign out"
          >
            <SignOut size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 pt-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-lg font-semibold text-accent">
                {agentName.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-text-tertiary">Say hi to {agentName}, by text or by the mic.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group relative max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-[var(--radius-lg)] rounded-br-[6px] bg-accent text-accent-contrast"
                    : "rounded-[var(--radius-lg)] rounded-bl-[6px] bg-bg-elevated text-text-primary"
                }`}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    onClick={() => playReply(m.content)}
                    className="ml-1.5 inline-flex align-middle text-text-tertiary opacity-0 transition group-hover:opacity-100 hover:text-text-primary"
                    title="Play"
                  >
                    <Play size={13} weight="fill" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary" />
              {agentName} is typing
            </div>
          )}
          {transcribing && <div className="text-xs text-text-tertiary">Transcribing...</div>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border py-4">
          <button
            type="button"
            onClick={handleMicClick}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border transition active:scale-[0.96] ${
              recording
                ? "border-danger bg-danger-soft text-danger"
                : "border-border text-text-secondary hover:border-border-strong"
            }`}
            title={recording ? "Stop recording" : "Record a voice message"}
          >
            {recording ? <Stop size={17} weight="fill" /> : <Microphone size={18} />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agentName}...`}
            className="h-11 flex-1 rounded-[var(--radius-pill)] border border-border bg-bg-elevated px-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-strong"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-accent text-accent-contrast transition active:scale-[0.96] disabled:opacity-40"
          >
            <ArrowUp size={18} weight="bold" />
          </button>
        </form>
      </div>
    </main>
  );
}
