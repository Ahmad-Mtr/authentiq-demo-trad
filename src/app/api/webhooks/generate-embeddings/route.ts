// app/api/webhooks/generate-embeddings/route.ts
import { mistral } from "@ai-sdk/mistral";
import { embed, generateText } from "ai";
import { createClient } from "@supabase/supabase-js";
import { Profile } from "@/lib/interfaces/profile";
import { Skill } from "@/lib/interfaces/resume";

export async function POST(req: Request) {
  const headerSecret = req.headers.get("x-webhook-secret");
  if (headerSecret !== process.env.WEBHOOK_SECRET)
    return new Response("Unauthorized", { status: 401 });

  const payload = await req.json();
  const { record }: { record: Profile } = payload;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // TODO: Modify the prompt to use that format
  const { text: summary } = await generateText({
    model: mistral("mistral-large-latest"),
    prompt: `Summarize this resume for a recruiter: ${JSON.stringify(
      record.parsed_resume
    )}`,
  });

  const { embedding } = await embed({
    model: mistral.textEmbedding("mistral-embed"),
    value: summary,
  });

  // TODO: Add other metadata fields like location, role, total years of experience, skills, etc.
  const { error } = await supabaseAdmin.from("candidate_search_index").upsert(
    {
      user_id: record.user_id,
      summary_text: summary,
      embedding: embedding,
      total_yoe: record.total_yoe || 0,
      skill_list: record.parsed_resume?.skills?.map((s: Skill) => s.name).filter(Boolean) || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) console.error(error);

  return new Response("Success", { status: 200 });
}
