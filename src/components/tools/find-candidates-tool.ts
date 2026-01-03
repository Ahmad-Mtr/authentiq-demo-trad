import supabase from "@/lib/supabase";
import { mistral } from "@ai-sdk/mistral";
import { embed, tool } from "ai";
import z from "zod";

const findCandidatesSchema = z.object({
  semantic_query: z
    .string()
    .describe(
      'The distinct technical summary of the ideal candidate (e.g. "Senior React dev with Fintech")'
    ),
  min_yoe: z.number().describe("Minimum years of experience required"),
  required_skills: z
    .array(z.string())
    .describe(
      'List of critical technical skills (e.g. ["React", "TypeScript"])'
    ),
  location: z
    .string()
    .optional()
    .describe('Preferred location (e.g. "Jordan")'),
});


export const findCandidatesTool = tool({
  description:
    "Search for candidates based on the query you extracted previously via extractQueryTool.",
  inputSchema: findCandidatesSchema,

  execute: async ({ semantic_query, min_yoe, required_skills }) => {
    
    console.log("[find_candidates] Semantic Query, ", semantic_query);

    const { embedding } = await embed({
      model: mistral.textEmbedding("mistral-embed"),
      value: semantic_query,
    });

    console.log("[find_candidates] embedding DONE, ");

    const { data: candidates, error } = await supabase.rpc(
      "search_candidates",
      {
        query_embedding: embedding,
        min_yoe: min_yoe,
        required_skills: required_skills || [],
        match_count: 20,
      }
    );

    if (error) throw error;

    console.log("[find_candidates] @candidates, ", candidates);
    return candidates;
  },
});
