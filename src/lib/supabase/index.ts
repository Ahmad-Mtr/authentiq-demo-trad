import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_ENDPOINT ||
  "https://qpbsatwgxujshyxocsfz.supabase.co";

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error("SUPABASE_KEY is not defined ");
}
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
