import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { SpecRequest } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const body: SpecRequest = await req.json();

  if (!body.idea || body.idea.trim().length < 20) {
    return new Response(
      JSON.stringify({ error: "Please describe your idea in more detail (at least 20 characters)." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: buildUserPrompt(body),
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
