import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [profile, agentConfig, memories, conversations, messages, permissions, auditLog] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("agent_config").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("memories").select("*").eq("user_id", user.id),
    supabase.from("conversations").select("*").eq("user_id", user.id),
    supabase.from("messages").select("*").eq("user_id", user.id),
    supabase.from("permissions").select("*").eq("user_id", user.id),
    supabase.from("audit_log").select("*").eq("user_id", user.id),
  ]);

  await supabase.from("audit_log").insert({
    user_id: user.id,
    actor: "user",
    action: "data.export",
    scope: "all",
  });

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    agent_config: agentConfig.data,
    memories: memories.data,
    conversations: conversations.data,
    messages: messages.data,
    permissions: permissions.data,
    audit_log: auditLog.data,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=netwrk-data-export.json",
    },
  });
}
