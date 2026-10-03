import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(6000),
});

const bodySchema = z.object({
  cocktailName: z.string().max(160),
  fieldLabel: z.string().max(80),
  selectedText: z.string().min(1).max(4000),
  surroundingText: z.string().max(12000),
  mode: z.enum(["human", "enrich", "verify", "custom"]),
  note: z.string().max(2000).optional(),
  messages: z.array(messageSchema).max(16),
});

const MODE_TASK: Record<z.infer<typeof bodySchema>["mode"], string> = {
  human:
    "Rewrite the selection so it sounds like a person wrote it. Use plain sentences, no slogans, and no filler. Keep the facts.",
  enrich:
    "Add concrete detail a bartender would use. Do not invent brands, amounts, dates, or history you cannot support from the passage. If a detail is uncertain, leave it out.",
  verify:
    "Check the selection for factual mistakes. If it is sound, return it unchanged. If something is doubtful, correct only that part. Do not add a review or commentary.",
  custom: "Apply the editor's note to the selection.",
};

function providers() {
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const openaiKey = process.env.OPENAI_API_KEY || "";
  const deepseekKey = process.env.DEEPSEEK_API_KEY || "";
  return [
    geminiKey
      ? {
          name: "gemini",
          key: geminiKey,
          base:
            process.env.GEMINI_BASE_URL ||
            "https://generativelanguage.googleapis.com/v1beta/openai",
          model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        }
      : null,
    deepseekKey
      ? {
          name: "deepseek",
          key: deepseekKey,
          base: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
          model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        }
      : null,
    openaiKey
      ? {
          name: "openai",
          key: openaiKey,
          base: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function cleanSuggestion(raw: string) {
  let text = raw.trim();
  text = text.replace(/^```(?:\w+)?\s*/i, "").replace(/\s*```$/, "");
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("“") && text.endsWith("”"))
  ) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

async function complete(messages: { role: string; content: string }[]) {
  const list = providers();
  if (!list.length) {
    throw new Error("NO_PROVIDER");
  }
  let last = "AI request failed";
  for (const provider of list) {
    try {
      const response = await fetch(`${provider.base.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.4,
          messages,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        last = `${provider.name} returned ${response.status}`;
        continue;
      }
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (content?.trim()) return cleanSuggestion(content);
      last = `${provider.name} returned an empty suggestion`;
    } catch (error) {
      last = (error as Error).message || last;
    }
  }
  throw new Error(last);
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid edit request" }, { status: 400 });
  }

  const { cocktailName, fieldLabel, selectedText, surroundingText, mode, note, messages } =
    parsed.data;

  const system = [
    "You edit one passage of Cocktale cocktail copy for an admin.",
    "Return only the replacement passage. No title, no quotes, no markdown, no explanation.",
    "Keep drink brand names in their original spelling.",
    "Match the language of the selected passage.",
    "If the conversation already contains a suggestion, revise that suggestion instead of starting over.",
    MODE_TASK[mode],
  ].join(" ");

  const transcript = [
    {
      role: "system" as const,
      content: system,
    },
    {
      role: "user" as const,
      content: [
        `Cocktail: ${cocktailName || "Untitled"}`,
        `Field: ${fieldLabel}`,
        `Selected passage:\n${selectedText}`,
        surroundingText && surroundingText !== selectedText
          ? `Full field for context:\n${surroundingText}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    ...(note?.trim() ? [{ role: "user" as const, content: note.trim() }] : []),
  ];

  try {
    const suggestion = await complete(transcript);
    if (!suggestion) {
      return NextResponse.json({ error: "The model returned an empty suggestion" }, { status: 502 });
    }
    return NextResponse.json({ suggestion });
  } catch (err) {
    const message = (err as Error).message;
    if (message === "NO_PROVIDER") {
      return NextResponse.json(
        { error: "AI editing is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY on the server." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message || "AI editing failed" }, { status: 502 });
  }
}
