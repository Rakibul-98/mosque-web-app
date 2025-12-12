import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get authenticated client with user ID header
export const getAuthClient = () => {
  if (typeof window === "undefined") {
    return supabase;
  }

  const userId = localStorage.getItem("user_id");

  if (!userId) {
    return supabase;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-user-id": userId,
      },
    },
  });
};

export const STORAGE_BUCKET = "committee_photos";
