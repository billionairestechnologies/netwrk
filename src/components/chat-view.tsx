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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
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
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } finally {
      setSending(false);
    }
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
              Say hi to {agentName}.
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
              </div>
            </div>
          ))}
          {sending && <div className="text-sm text-neutral-500">{agentName} is typing...</div>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-neutral-900 py-4">
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
