import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, buildSystemPrompt, CHAT_MODEL, MEMORY_TOOL } from "@/lib/anthropic";
import type Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { conversationId, message } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  let convoId = conversationId as string | undefined;
  if (!convoId) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: message.slice(0, 60) })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    convoId = data.id;
  }

  const [{ data: agentConfig }, { data: memories }, { data: history }] = await Promise.all([
    supabase.from("agent_config").select("agent_name, persona").eq("user_id", user.id).single(),
    supabase.from("memories").select("content").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true })
      .limit(40),
  ]);

  await supabase.from("messages").insert({
    conversation_id: convoId,
    user_id: user.id,
    role: "user",
    content: message,
  });

  const system = buildSystemPrompt(
    agentConfig?.agent_name ?? "Nova",
    agentConfig?.persona ?? "assistant",
    (memories ?? []).map((m) => m.content),
  );

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content as string,
    })),
    { role: "user", content: message },
  ];

  const response = await anthropic.messages.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system,
    tools: [MEMORY_TOOL],
    messages,
  });

  let replyText = "";
  const savedFacts: string[] = [];

  for (const block of response.content) {
    if (block.type === "text") {
      replyText += block.text;
    } else if (block.type === "tool_use" && block.name === "save_memory") {
      const fact = (block.input as { fact?: string }).fact;
      if (fact) {
        await supabase.from("memories").insert({ user_id: user.id, content: fact, source: "conversation" });
        await supabase.from("audit_log").insert({
          user_id: user.id,
          actor: "companion",
          action: "memory.save",
          scope: "memories",
          detail: { fact },
        });
        savedFacts.push(fact);
      }
    }
  }

  if (!replyText && savedFacts.length > 0) {
    replyText = "Got it, I'll remember that.";
  }

  await supabase.from("messages").insert({
    conversation_id: convoId,
    user_id: user.id,
    role: "assistant",
    content: replyText,
  });

  return NextResponse.json({ conversationId: convoId, reply: replyText, savedFacts });
}
