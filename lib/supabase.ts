import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.startsWith("your-")) {
      throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    }
    _client = createClient(url, key);
  }
  return _client;
}

export type Game = {
  id: number;
  created_at: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  duration_minutes: number;
};
