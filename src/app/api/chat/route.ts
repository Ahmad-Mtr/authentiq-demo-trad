import {
  convertToModelMessages,
  embed,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { mistral } from "@ai-sdk/mistral";
import z from "zod";
import { createClient } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";
import { findCandidatesTool, addReasoningTool } from "@/components/tools/find-candidates-tool";
import { extractQueryTool } from "@/components/tools/extract-query-tool";
import { SYSTEM_PROMPT } from "./system-prompt";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: mistral("mistral-large-latest"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      extractQueryTool,
      findCandidatesTool,
      addReasoningTool,
    },
    stopWhen: stepCountIs(6),
  });

  return result.toUIMessageStreamResponse();
}
