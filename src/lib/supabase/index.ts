import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT!;

// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;


if (!supabaseKey) {
  throw new Error("SUPABASE_KEY is not defined ");
}
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
