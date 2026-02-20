import Link from "next/link";
import { getSupabase, Game } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getGames(): Promise<Game[]> {
  try {
    const { data } = await getSupabase()
      .from("games")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HistoryPage() {
  const games = await getGames();

  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-6">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Game History</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-gray-500 mt-12">No games saved yet.</p>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-3">
          {games.map((game) => {
            const winner =
              game.player1_score > game.player2_score
                ? game.player1_name
                : game.player2_score > game.player1_score
                ? game.player2_name
                : null;
            const date = new Date(game.created_at).toLocaleString();
            return (
              <div key={game.id} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">{date} · {game.duration_minutes} min</span>
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <span className={game.player1_score > game.player2_score ? "text-green-400" : ""}>
                      {game.player1_name}
                    </span>
                    <span className="text-2xl font-bold tabular-nums text-gray-300">
                      {game.player1_score} – {game.player2_score}
                    </span>
                    <span className={game.player2_score > game.player1_score ? "text-green-400" : ""}>
                      {game.player2_name}
                    </span>
                  </div>
                  {winner && <span className="text-xs text-green-400">{winner} wins</span>}
                  {!winner && <span className="text-xs text-gray-400">Draw</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
