import supabase from "@/lib/supabase";
import { mistral } from "@ai-sdk/mistral";
import { embed, tool } from "ai";
import z from "zod";

const extractQuerySchema = z.object({
  semantic_query: z
    .string()
    .describe(
      'The distinct technical summary of the ideal candidate (e.g. "Senior React dev with Fintech"), make as detailed as possible. 300 chartacter limit'
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
    .describe(
      'Preferred location (e.g. "City, Country", or "Remote", or leave empty if not mentioned)'
    ),
});

export const extractQueryTool = tool({
  description:
    "Extract a semantic query and criteria from a job description or requirements.",
  inputSchema: extractQuerySchema,

  execute: async ({ semantic_query, min_yoe, required_skills }) => {
    console.log("[extract_query] Params: ", {semantic_query, min_yoe, required_skills});

    return { semantic_query, min_yoe, required_skills };
  },
});
