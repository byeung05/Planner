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

// ─────────────────────────────────────────────────
// Gap suggestion — Haiku sees the full schedule so
// suggestions are context-aware (e.g. recommends CS
// when that subject is behind on its weekly target).
// ─────────────────────────────────────────────────

export interface ScheduledBlock {
  title: string;
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
  domain: "study" | "schedule" | "sleep";
}

export interface GapSuggestion {
  title: string;
  durationMinutes: number;
  domain: "study" | "schedule" | "sleep";
  icon: string;
  reason: string;   // one-line rationale e.g. "CS is 2h 15m behind target"
}

const GAP_SYSTEM_PROMPT = `You suggest what to fill a free gap in someone's daily schedule.
You are given the full schedule for context. Return ONLY valid JSON — no prose, no markdown fences.`;

const GAP_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title:           { type: "string" },
          durationMinutes: { type: "integer", minimum: 5, maximum: 480 },
          domain:          { type: "string", enum: ["study", "schedule", "sleep"] },
          icon:            { type: "string" },
          reason:          { type: "string" },
        },
        required: ["title", "durationMinutes", "domain", "icon", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

export async function suggestForGap(
  gapStartTime: string,        // "HH:MM"
  gapEndTime: string,          // "HH:MM"
  currentSchedule: ScheduledBlock[],
  weeklyGoals: { subject: string; targetHours: number; completedHours: number }[],
  nowIso: string,
): Promise<GapSuggestion[]> {
  const scheduleText = currentSchedule
    .map(b => `  ${b.startTime}–${b.endTime}  [${b.domain}]  ${b.title}`)
    .join("\n");

  const goalsText = weeklyGoals
    .map(g => `  ${g.subject}: ${g.completedHours}h done / ${g.targetHours}h target (${Math.round((g.completedHours/g.targetHours)*100)}%)`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: GAP_SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: GAP_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Now: ${nowIso}
Free gap: ${gapStartTime} – ${gapEndTime}

Today's schedule:
${scheduleText}

Weekly study goals:
${goalsText}

Suggest 3–5 things to fill the gap. Prefer subjects that are behind on their weekly target.`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No text block in gap response");
  const parsed = JSON.parse(text.text) as { suggestions: GapSuggestion[] };
  return parsed.suggestions;
}

// --- Example parseQuickAdd output for "Biology 2hrs at 3pm" ---
// {
//   title: "Biology",
//   startTime: "15:00",
//   durationMinutes: 120,
//   domain: "study",
//   subjectHint: "Biology",
//   icon: "📖",
//   confidence: "high"
// }
