"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
      // voice playback is best-effort — don't block the chat on TTS failures
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
    <main className="flex min-h-screen flex-col bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-900 px-6 py-4">
        <div>
          <div className="text-sm font-medium text-neutral-50">{agentName}</div>
          <div className="text-xs text-neutral-500 capitalize">{persona} mode</div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setVoiceReplies((v) => !v)}
            className={`text-xs ${voiceReplies ? "text-emerald-400" : "text-neutral-500"} hover:text-neutral-100`}
            title="Toggle voice replies"
          >
            {voiceReplies ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
          <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-100">
            Data dashboard
          </Link>
          <button onClick={handleSignOut} className="text-neutral-400 hover:text-neutral-100">
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 && (
            <p className="pt-16 text-center text-sm text-neutral-500">
              Say hi to {agentName} — by text or by holding the mic.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-neutral-50 text-neutral-950"
                    : "bg-neutral-900 text-neutral-100"
                }`}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    onClick={() => playReply(m.content)}
                    className="ml-2 align-middle text-xs text-neutral-500 hover:text-neutral-200"
                    title="Play"
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && <div className="text-sm text-neutral-500">{agentName} is typing...</div>}
          {transcribing && <div className="text-sm text-neutral-500">Transcribing...</div>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-neutral-900 py-4">
          <button
            type="button"
            onClick={handleMicClick}
            className={`rounded-lg border px-3 py-2.5 text-sm transition ${
              recording
                ? "border-red-500 bg-red-500/10 text-red-400"
                : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
            }`}
            title={recording ? "Stop recording" : "Record a voice message"}
          >
            {recording ? "■" : "🎤"}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agentName}...`}
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-50 outline-none focus:border-neutral-600"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
