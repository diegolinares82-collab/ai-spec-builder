import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { GENERATE_SPEC_SYSTEM_PROMPT, buildGenerateSpecPrompt } from "@/lib/prompts";
import { GenerateSpecResponse } from "@/lib/types";

const client = new Anthropic();

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const raw = text.match(/\{[\s\S]*\}/);
  if (raw) return raw[0];
  return text.trim();
}

export async function POST(req: NextRequest) {
  let body: { description?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (description.length < 10) {
    return Response.json(
      { error: "Please provide a description of at least 10 characters." },
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
