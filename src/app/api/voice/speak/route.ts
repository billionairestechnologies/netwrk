import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { synthesizeSpeech, DEFAULT_VOICE_SPEAKER } from "@/lib/sarvam";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { text, speaker: speakerOverride } = await request.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  let speaker = speakerOverride as string | undefined;
  if (!speaker) {
    const { data: agentConfig } = await supabase
      .from("agent_config")
      .select("voice_speaker")
      .eq("user_id", user.id)
      .maybeSingle();
    speaker = agentConfig?.voice_speaker ?? DEFAULT_VOICE_SPEAKER;
  }

  const audioBase64 = await synthesizeSpeech(text, speaker);

  return NextResponse.json({ audio: audioBase64 });
}
