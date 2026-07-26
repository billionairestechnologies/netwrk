import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatView from "@/components/chat-view";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("agent_name, persona")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!agentConfig) {
    redirect("/onboarding");
  }

  return <ChatView agentName={agentConfig.agent_name} persona={agentConfig.persona} />;
}
