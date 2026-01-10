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

const addReasoningSchema = z.object({
  candidates_with_reasoning: z
    .array(
      z.object({
        user_id: z.string().describe("The candidate's user_id from the search results"),
        reasoning: z
          .string()
          .describe(
            "One short sentence (max 12 words) answering WHY this candidate fits. Be specific and concise."
          ),
      })
    )
    .describe("Array of candidates with brief reasoning for each match"),
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

    if (!candidates || candidates.length === 0) {
      return candidates;
    }

    // console.log("[find_candidates] @candidates, ", candidates);
    const userIds = candidates.map((c: any) => c.user_id);
    console.log("[find_candidates] candidate IDs, ", userIds);
    
    const { data: profiles, error: profilesError } = await supabase.rpc(
      "get_profiles_by_ids_ordered",
      { user_ids: userIds }
    );

    if (profilesError) throw profilesError;
    
    console.log("[find_candidates] profiles, ", profiles);

    return candidates.map((c: any) => {
      const profile = profiles?.find((p: any) => p.user_id === c.user_id);
      return {
        ...c,
        name: profile?.name,
        total_yoe: profile?.total_yoe,
        pfp_url: profile?.pfp_url,
        bio: profile?.bio,
        location: profile?.location,
      };
    });
  },
});

export const addReasoningTool = tool({
  description: `After findCandidatesTool returns candidates, call this tool to add reasoning for why each candidate matches the job. 
Analyze each candidate's profile (name, experience, bio) against the job requirements and provide a brief, specific explanation for each.`,
  inputSchema: addReasoningSchema,

  execute: async ({ candidates_with_reasoning }) => {
    console.log("[add_reasoning] Adding reasoning for", candidates_with_reasoning.length, "candidates");
    return candidates_with_reasoning;
  },
});
