import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { GENERATE_SPEC_SYSTEM_PROMPT, buildGenerateSpecPrompt } from "@/lib/prompts";
import { GenerateSpecResponse } from "@/lib/types";
import { checkRateLimit } from "@/lib/ratelimit";

const client = new Anthropic();

function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, retryAfter } = checkRateLimit(ip);

  if (!allowed) {
    return Response.json(
      { error: "Has generado demasiadas especificaciones. Espera un momento e inténtalo de nuevo." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { description?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = typeof body.description === "string" ? body.description : "";

  if (raw.trim().length === 0) {
    return Response.json(
      { error: "La descripción no puede estar vacía." },
      { status: 400 }
    );
  }

  if (raw.length > 2000) {
    return Response.json(
      { error: `La descripción no puede superar los 2000 caracteres (recibido: ${raw.length}).` },
      { status: 400 }
    );
  }

  const description = sanitize(raw).trim();

  if (description.length < 10) {
    return Response.json(
      { error: "La descripción debe tener al menos 10 caracteres." },
      { status: 400 }
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: GENERATE_SPEC_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildGenerateSpecPrompt(description),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "No response received from Claude." }, { status: 500 });
    }

    let spec: GenerateSpecResponse;
    try {
      spec = JSON.parse(extractJSON(textBlock.text));
    } catch {
      return Response.json(
        { error: "Failed to parse the generated spec. Please try again." },
        { status: 500 }
      );
    }

    return Response.json(spec);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: `API error: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }
    return Response.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}
