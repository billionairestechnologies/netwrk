import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CHAT_MODEL = "claude-sonnet-5";

const PERSONA_PROMPTS: Record<string, string> = {
  friend: "You are a warm, casual friend. Talk like someone who knows the user well — relaxed, honest, no corporate tone.",
  companion: "You are a close personal companion. Be present, attentive, and emotionally engaged, not clinical.",
  assistant: "You are a focused, efficient personal assistant. Be clear and get to the point, while still being personable.",
};

export function buildSystemPrompt(agentName: string, persona: string, memories: string[]) {
  const personaPrompt = PERSONA_PROMPTS[persona] ?? PERSONA_PROMPTS.assistant;
  const memoryBlock =
    memories.length > 0
      ? `\n\nThings you remember about this user (only use naturally, don't recite this list):\n${memories.map((m) => `- ${m}`).join("\n")}`
      : "";

  return `Your name is ${agentName}. ${personaPrompt}

You have a memory tool (save_memory) — use it when the user shares a durable fact worth remembering across conversations (preferences, ongoing situations, important people/dates). Don't save trivial small talk. Everything you save is visible to the user in their data dashboard and they can delete it anytime, so only save what's genuinely useful to remember.${memoryBlock}`;
}

export const MEMORY_TOOL: Anthropic.Tool = {
  name: "save_memory",
  description:
    "Save a durable fact about the user for future conversations. Only use for things worth remembering long-term, not routine chat.",
  input_schema: {
    type: "object",
    properties: {
      fact: {
        type: "string",
        description: "The fact to remember, written concisely in third person (e.g. 'Prefers morning workouts').",
      },
    },
    required: ["fact"],
  },
};
