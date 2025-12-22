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

  console.log("////////New User Name///////////////", record.name);
  console.log("///Resume Data//////////////////////", record.parsed_resume);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // TODO: Modify the prompt to use that format
  const { text: summary } = await generateText({
    model: mistral("mistral-large-latest"),
    prompt: `Write a detailed technical profile for this candidate based on the profile record provided. Mention their senior roles, specific technologies used in production, complex projects handled, educational background and noteworthy Certifications & Awards. Focus on hard skills and domain knowledge. The response is going to be embedded so keep it super concise (Max 1000 characters): ${JSON.stringify(
      record.parsed_resume
    )}`,
  });

  console.log("@summary: \n", summary);

  const { embedding } = await embed({
    model: mistral.textEmbedding("mistral-embed"),
    value: summary,
  });

  console.log("@embedding: \n", embedding);

  // TODO: Add other metadata fields like location, role, total years of experience, skills, etc.
  const { error } = await supabaseAdmin.from("candidate_search_index").upsert(
    {
      user_id: record.user_id,
      summary_text: summary,
      embedding: embedding,
      total_yoe: record.total_yoe || 0,
      skill_list:
        record.parsed_resume?.skills
          ?.map((s: Skill) => s.name)
          .filter(Boolean) || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) console.error(error);

  return new Response("Success", { status: 200 });
}
