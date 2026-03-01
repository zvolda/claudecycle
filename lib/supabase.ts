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

export type Room = {
  id: string;
  pin: string;
  name: string;
  teams: string[];
  duration_minutes: number;
  two_groups: boolean;
  team_groups: Record<string, string>;
  last_active_at: string;
  created_at: string;
};

export type Game = {
  id: number;
  created_at: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  duration_minutes: number;
  room_id: string;
};

/** Create a new room with a random 4-digit PIN (1000–9999). Retries on collision. */
export async function createRoom(): Promise<Room> {
  const sb = getSupabase();
  for (let attempt = 0; attempt < 10; attempt++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const { data, error } = await sb
      .from("rooms")
      .insert({ pin })
      .select()
      .single();
    if (data) return data as Room;
    // 23505 = unique_violation (PIN collision) — retry
    if (error && error.code === "23505") continue;
    throw new Error(error?.message ?? "Failed to create room");
  }
  throw new Error("Could not generate a unique PIN after 10 attempts");
}

/** Join an existing room by PIN. Returns the room or null if not found. */
export async function joinRoom(pin: string): Promise<Room | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("rooms")
    .select("*")
    .eq("pin", pin.trim())
    .single();
  if (error || !data) return null;
  return data as Room;
}

/** Persist teams array to the room. */
export async function updateRoomTeams(roomId: string, teams: string[]): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("rooms").update({ teams }).eq("id", roomId);
  if (error) throw new Error(error.message);
}

/** Persist duration preset to the room. */
export async function updateRoomDuration(roomId: string, minutes: number): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("rooms").update({ duration_minutes: minutes }).eq("id", roomId);
  if (error) throw new Error(error.message);
}

/** Update the tournament name for a room. */
export async function updateRoomName(roomId: string, name: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("rooms").update({ name }).eq("id", roomId);
  if (error) throw new Error(error.message);
}

/** Update two-groups toggle and team-to-group mapping. */
export async function updateRoomGroupSettings(roomId: string, twoGroups: boolean, teamGroups: Record<string, string>): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("rooms").update({ two_groups: twoGroups, team_groups: teamGroups }).eq("id", roomId);
  if (error) throw new Error(error.message);
}

/** Bump last_active_at so the room doesn't auto-expire. */
export async function touchRoom(roomId: string): Promise<void> {
  const sb = getSupabase();
  await sb.from("rooms").update({ last_active_at: new Date().toISOString() }).eq("id", roomId);
}

/** Fetch all games for a room, newest first. */
export async function fetchRoomGames(roomId: string): Promise<Game[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("games")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Game[];
}

/** Fetch all rooms that have a name, ordered by most recently active. */
export async function fetchAllRooms(): Promise<Room[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("rooms")
    .select("*")
    .neq("name", "")
    .order("last_active_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Room[];
}
