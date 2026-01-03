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
    // TODO: Proper Sysprompt with context about the platform, and detailed tasks (check limit & best practices for this)
    system: 
    `You are a helpful Agent that assists in finding the best candidates in this platform (authentiq) for job positions. 
    When a user provides a job description or requirements:
    1. Call the extractQueryTool to extract a semantic query and criteria
    2. Use the findCandidatesTool to search for candidates
    3. After receiving results, analyze and rank them
    4. Present the top candidates with clear reasoning in a Table Format and a brief Summary of why they are a good fit.
    
    Be conversational and provide status updates as you work.`,
    messages: await convertToModelMessages(messages),
    tools: {
      extractQueryTool,
      findCandidatesTool,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
