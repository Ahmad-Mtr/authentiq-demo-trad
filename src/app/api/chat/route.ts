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

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: mistral("mistral-large-latest"),
    system: `You are a helpful Agent that assists in finding the best candidates in this platform (authentiq) for job positions. 

When a user provides a job description or requirements:
1. Call the extractQueryTool to extract a semantic query and criteria from their input
2. Use the findCandidatesTool to search for matching candidates in the database
3. IMPORTANT: After findCandidatesTool returns, you MUST call addReasoningTool to provide a brief reasoning for why each candidate (use their user_id) matches the job requirements. Base your reasoning on their experience, skills mentioned in bio, and alignment with the job.
4. The candidates with reasoning will be displayed in a visual artifact panel

After all tools complete, provide a brief conversational summary.
Keep your text responses concise since the detailed candidate cards are shown in the artifact panel.`,
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
