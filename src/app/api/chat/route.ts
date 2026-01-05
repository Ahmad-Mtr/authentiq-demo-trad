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
import { findCandidatesTool } from "@/components/tools/find-candidates-tool";
import { extractQueryTool } from "@/components/tools/extract-query-tool";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: mistral("mistral-large-latest"),
    system: `You are a helpful Agent that assists in finding the best candidates in this platform (authentiq) for job positions. 

When a user provides a job description or requirements:
1. Call the extractQueryTool to extract a semantic query and criteria from their input
2. Use the findCandidatesTool to search for matching candidates in the database
3. The candidates will be displayed in a visual artifact panel on the right side

After the search completes, provide a brief conversational summary like:
- How many candidates were found
- Key highlights about the top matches
- Any observations about the talent pool

Keep your text responses concise since the detailed candidate cards are shown in the artifact panel.
Be conversational and helpful throughout the process.`,
    messages: await convertToModelMessages(messages),
    tools: {
      extractQueryTool,
      findCandidatesTool,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
