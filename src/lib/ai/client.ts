import Anthropic from "@anthropic-ai/sdk";

// Vision-capable, most capable default. Override with CLAUDE_MODEL.
export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

export interface ImageInput {
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  data: string; // base64, no data: prefix
}

// A tool definition forces Claude to return JSON matching `inputSchema`.
export interface JsonTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/**
 * Call Claude and force it to invoke `tool`, returning the validated tool input
 * as typed JSON. Optionally attaches images for vision analysis.
 */
export async function callToolJSON<T>(opts: {
  system: string;
  prompt: string;
  tool: JsonTool;
  images?: ImageInput[];
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getClient();

  const content: Anthropic.ContentBlockParam[] = [];
  for (const img of opts.images ?? []) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: img.mediaType, data: img.data },
    });
  }
  content.push({ type: "text", text: opts.prompt });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    tools: [
      {
        name: opts.tool.name,
        description: opts.tool.description,
        // Cast to any: our JSON schema is hand-authored and version-stable,
        // avoiding coupling to the SDK's exact InputSchema type name.
        input_schema: opts.tool.inputSchema as any,
      },
    ],
    tool_choice: { type: "tool", name: opts.tool.name },
    messages: [{ role: "user", content }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error(`Model did not return a ${opts.tool.name} tool call.`);
  }
  return toolUse.input as T;
}
