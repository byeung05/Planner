/**
 * Natural language quick-add parser
 * Powered by claude-haiku-4-5 for fast, cheap inference (~$0.001 per parse).
 *
 * Input:  "Biology 2hrs at 3pm"
 * Output: { title, startTime, durationMinutes, domain, subjectId, icon }
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface ParsedBlock {
  title: string;
  startTime: string;        // "HH:MM" 24h
  durationMinutes: number;
  domain: "study" | "schedule" | "sleep";
  subjectHint: string | null; // e.g. "Biology" — caller resolves to subjectId
  icon: string;              // single emoji
  confidence: "high" | "low";
}

const SYSTEM_PROMPT = `You parse natural language task input into a structured schedule block.
Today's date context is provided in the user message.
Return ONLY valid JSON matching the schema — no prose, no markdown fences.`;

const SCHEMA = {
  type: "object",
  properties: {
    title:           { type: "string" },
    startTime:       { type: "string", description: "HH:MM in 24h format" },
    durationMinutes: { type: "integer", minimum: 5, maximum: 480 },
    domain:          { type: "string", enum: ["study", "schedule", "sleep"] },
    subjectHint:     { type: ["string", "null"] },
    icon:            { type: "string", description: "single emoji" },
    confidence:      { type: "string", enum: ["high", "low"] },
  },
  required: ["title", "startTime", "durationMinutes", "domain", "subjectHint", "icon", "confidence"],
  additionalProperties: false,
};

export async function parseQuickAdd(
  input: string,
  nowIso: string,           // injected by caller — never in system prompt (cache)
  recentSubjects: string[]  // e.g. ["Calculus", "Biology", "Spanish"]
): Promise<ParsedBlock> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Now: ${nowIso}
Recent subjects: ${recentSubjects.join(", ") || "none"}
Input: "${input}"`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No text block in response");
  return JSON.parse(text.text) as ParsedBlock;
}

// --- Example output for "Biology 2hrs at 3pm" ---
// {
//   title: "Biology",
//   startTime: "15:00",
//   durationMinutes: 120,
//   domain: "study",
//   subjectHint: "Biology",
//   icon: "📖",
//   confidence: "high"
// }
