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

  const parsedResume =
    typeof record.parsed_resume === "string"
      ? JSON.parse(record.parsed_resume)
      : record.parsed_resume;
  console.log("/////////////////New User Name: ", record.name);
  console.log("Resume Data //////////////////////");
  console.log(parsedResume?.skills || []);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { text: summary } = await generateText({
    model: mistral("mistral-large-latest"),
    prompt: `
    SYSTEM: You are a data compression engine for a vector search database. 
    Task: Convert the Candidate Profile into a dense semantic string.
    
    Rules:
    1. NO filler words (e.g., remove "is a", "looking for", "passionate about").
    2. Format as a continuous block of text, separating sections with pipes "|".
    3. Focus heavily on: Hard Skills, specific libraries, industry domains (e.g., Fintech, AI), and measurable outcomes.
    4. Contextualize skills (e.g., instead of just "Python", say "Python for Machine Learning").
    5. Include Role, Location, and YoE explicitly at the start.
    
    INPUT DATA:
    - Role: ${record.role}
    - Location: ${record.location}
    - Years Experience: ${
      record.total_yoe ?? "Unknown"
    } (Do not calculate, just use provided)
    - Resume JSON: ${JSON.stringify(parsedResume)}
    OUTPUT FORMAT EXAMPLE:
    Role: Senior Frontend | Loc: Jordan | YoE: 5 | Tech: React, TypeScript, Tailwind | Domains: Fintech, Crypto | Exp: Lead Dev at X (built payment gateway handling 10k tx/s using Node.js), Architect at Y (migrated monolith to microservices) | Edu: BS CS from GJU.
  `,
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
      role: record.role,
      total_yoe: record.total_yoe || 0,
      location: record.location,
      skill_list:
        parsedResume?.skills
          ?.map((s: Skill) => s.name)
          .filter(Boolean) || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) console.error(error);

  return new Response("Success", { status: 200 });
}
