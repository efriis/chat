import { createClient } from "@supabase/supabase-js";
import "server-only";
import constants from "./constants";

const supabase = createClient(
  constants.NEXT_PUBLIC_SUPABASE_URL,
  constants.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;
