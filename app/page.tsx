"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getSupabase, Game } from "@/lib/supabase";

const PRESETS = [5, 6, 7];

// ── Themes ────────────────────────────────────────────────────────────────────
type ThemeKey = "dark" | "light" | "color";

const T = {
  dark: {
    main:        "bg-black text-white",
    panel:       "bg-zinc-950 border border-zinc-800",
    inner:       "bg-zinc-900 border border-zinc-700",
    scoreBox:    "bg-zinc-950 border border-zinc-700 hover:bg-zinc-900",
    timerBox:    "bg-zinc-950",
    input:       "bg-black border border-zinc-700 focus:border-white placeholder-zinc-600 text-white",
    btnPrimary:  "bg-white text-black hover:bg-zinc-200",
    btnSecondary:"bg-black border border-zinc-700 text-white hover:bg-zinc-900",
    select:      "bg-zinc-900 border border-zinc-700 text-white",
    presetOn:    "bg-white text-black border border-white",
    presetOff:   "bg-black border border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white",
    tabOn:       "text-white border-t-2 border-white -mt-[2px] bg-zinc-950",
    tabOff:      "text-zinc-600 hover:text-zinc-300",
    tabBar:      "border-t border-zinc-800 bg-black",
    divider:     "bg-zinc-700",
    textPrimary: "text-white",
    textSec:     "text-zinc-300",
    textMuted:   "text-zinc-600",
    timerIdle:   "#ffffff",
    timerRun:    "#ffffff",
    progressBg:  "bg-zinc-800",
    tableHead:   "border-b-2 border-zinc-700 text-zinc-500",
    tableRow:    "border-b border-zinc-800 hover:bg-zinc-950",
    tableRow0:   "text-white",
    tableRowN:   "text-zinc-500",
    swap:        "text-zinc-400 hover:text-white",
    remove:      "text-zinc-500 hover:text-red-400",
    histLink:    "text-zinc-600 hover:text-zinc-300",
    hint:        "text-zinc-600",
    saved:       "text-zinc-300",
    cellDiag:    "bg-zinc-800",
    cellEmpty:   "bg-zinc-900",
    cellBorder:  "border-zinc-700",
    cellText:    "text-white",
  },
  light: {
    main:        "bg-white text-black",
    panel:       "bg-zinc-100 border border-zinc-300",
    inner:       "bg-zinc-200 border border-zinc-300",
    scoreBox:    "bg-zinc-100 border border-zinc-300 hover:bg-zinc-200",
    timerBox:    "bg-zinc-100",
    input:       "bg-white border border-zinc-300 focus:border-black placeholder-zinc-400 text-black",
    btnPrimary:  "bg-black text-white hover:bg-zinc-800",
    btnSecondary:"bg-white border border-zinc-300 text-black hover:bg-zinc-100",
    select:      "bg-white border border-zinc-300 text-black",
    presetOn:    "bg-black text-white border border-black",
    presetOff:   "bg-white border border-zinc-300 text-zinc-500 hover:bg-zinc-100 hover:text-black",
    tabOn:       "text-black border-t-2 border-black -mt-[2px] bg-zinc-100",
    tabOff:      "text-zinc-400 hover:text-zinc-700",
    tabBar:      "border-t border-zinc-300 bg-white",
    divider:     "bg-zinc-300",
    textPrimary: "text-black",
    textSec:     "text-zinc-700",
    textMuted:   "text-zinc-400",
    timerIdle:   "#000000",
    timerRun:    "#000000",
    progressBg:  "bg-zinc-200",
    tableHead:   "border-b-2 border-zinc-300 text-zinc-400",
    tableRow:    "border-b border-zinc-200 hover:bg-zinc-50",
    tableRow0:   "text-black",
    tableRowN:   "text-zinc-500",
    swap:        "text-zinc-400 hover:text-black",
    remove:      "text-zinc-400 hover:text-red-500",
    histLink:    "text-zinc-400 hover:text-zinc-700",
    hint:        "text-zinc-400",
    saved:       "text-zinc-700",
    cellDiag:    "bg-zinc-300",
    cellEmpty:   "bg-zinc-50",
    cellBorder:  "border-zinc-300",
    cellText:    "text-black",
  },
  color: {
    main:        "bg-gray-950 text-white",
    panel:       "bg-gray-900 border border-gray-800",
    inner:       "bg-gray-800 border border-gray-700",
    scoreBox:    "bg-gray-900 border border-gray-800 hover:bg-gray-800",
    timerBox:    "bg-gray-900",
    input:       "bg-gray-800 border border-gray-700 focus:border-blue-500 placeholder-gray-600 text-white",
    btnPrimary:  "bg-green-700 text-white hover:bg-green-600",
    btnSecondary:"bg-gray-800 border border-gray-700 text-white hover:bg-gray-700",
    select:      "bg-gray-800 border border-gray-700 text-white",
    presetOn:    "bg-blue-600 text-white border border-blue-600",
    presetOff:   "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white",
    tabOn:       "text-white border-t-2 border-blue-500 -mt-[2px] bg-gray-900",
    tabOff:      "text-gray-500 hover:text-gray-300",
    tabBar:      "border-t border-gray-800 bg-gray-950",
    divider:     "bg-gray-700",
    textPrimary: "text-white",
    textSec:     "text-gray-300",
    textMuted:   "text-gray-600",
    timerIdle:   "#6b7280",
    timerRun:    "#3b82f6",
    progressBg:  "bg-gray-800",
    tableHead:   "border-b-2 border-gray-700 text-gray-500",
    tableRow:    "border-b border-gray-800 hover:bg-gray-900",
    tableRow0:   "text-yellow-400",
    tableRowN:   "text-gray-400",
    swap:        "text-gray-400 hover:text-white",
    remove:      "text-gray-500 hover:text-red-400",
    histLink:    "text-gray-600 hover:text-gray-400",
    hint:        "text-gray-600",
    saved:       "text-green-400",
    cellDiag:    "bg-gray-800",
    cellEmpty:   "bg-gray-900",
    cellBorder:  "border-gray-700",
    cellText:    "text-white",
  },
} as const;

// ── Standings ─────────────────────────────────────────────────────────────────
type Standing = {
  team: string; played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; points: number;
};
function computeStandings(games: Game[]): Standing[] {
  const map = new Map<string, Standing>();
  const get = (name: string) => {
    if (!map.has(name)) map.set(name, { team: name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    return map.get(name)!;
  };
  games.forEach((g) => {
    const s1 = get(g.player1_name); const s2 = get(g.player2_name);
    s1.played++; s2.played++;
    s1.gf += g.player1_score; s1.ga += g.player2_score;
    s2.gf += g.player2_score; s2.ga += g.player1_score;
    if (g.player1_score > g.player2_score) { s1.won++; s2.lost++; s1.points += 3; }
    else if (g.player2_score > g.player1_score) { s2.won++; s1.lost++; s2.points += 3; }
    else { s1.drawn++; s2.drawn++; s1.points++; s2.points++; }
  });
  return Array.from(map.values())
    .map((s) => ({ ...s, gd: s.gf - s.ga }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

// ── Deduplicate games (keep latest per team pair) ───────────────────────────
function dedupeGames(games: Game[]): Game[] {
  const seen = new Map<string, Game>();
  for (const g of games) {
    const key = [g.player1_name, g.player2_name].sort().join("\0");
    if (!seen.has(key)) seen.set(key, g); // games already sorted by created_at desc
  }
  return Array.from(seen.values());
}

// ── Cross-reference helpers ──────────────────────────────────────────────────
function getMatchResult(games: Game[], teamA: string, teamB: string): string | null {
  for (const g of games) {
    if (g.player1_name === teamA && g.player2_name === teamB) return `${g.player1_score}:${g.player2_score}`;
    if (g.player1_name === teamB && g.player2_name === teamA) return `${g.player2_score}:${g.player1_score}`;
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GamePage() {
  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [teams, setTeams] = useState<string[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"game" | "settings" | "results">("game");
  const [half, setHalf] = useState<1 | 2>(1);
  const [editingTime, setEditingTime] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedTeams = localStorage.getItem("sport-teams");
    if (storedTeams) {
      const parsed = JSON.parse(storedTeams) as string[];
      setTeams(parsed);
      if (parsed.length > 0) { setPlayer1(parsed[0]); if (parsed.length > 1) setPlayer2(parsed[1]); }
    }
    const storedTheme = localStorage.getItem("sport-theme") as ThemeKey | null;
    if (storedTheme && T[storedTheme]) setTheme(storedTheme);
  }, []);

  const changeTheme = (t: ThemeKey) => {
    setTheme(t);
    localStorage.setItem("sport-theme", t);
  };

  const [fetchError, setFetchError] = useState("");
  const fetchGames = useCallback(async () => {
    setLoadingGames(true); setFetchError("");
    try {
      const { data, error } = await getSupabase().from("games").select("*").order("created_at", { ascending: false });
      if (error) setFetchError(error.message);
      setGames(data ?? []);
    } catch { setGames([]); setFetchError("Connection failed"); } finally { setLoadingGames(false); }
  }, []);

  useEffect(() => { if (tab === "results") fetchGames(); }, [tab, fetchGames]);

  const persistTeams = (list: string[]) => { setTeams(list); localStorage.setItem("sport-teams", JSON.stringify(list)); };
  const addTeam = () => {
    const n = newTeam.trim(); if (!n || teams.includes(n)) return;
    const updated = [...teams, n]; persistTeams(updated); setNewTeam("");
    if (updated.length === 1) setPlayer1(n);
    if (updated.length === 2) setPlayer2(n);
  };
  const removeTeam = (n: string) => persistTeams(teams.filter((t) => t !== n));

  const clearTimer = () => { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; };
  const handleFinish = useCallback(() => { clearTimer(); setRunning(false); setFinished(true); }, []);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => { if (prev <= 1) { handleFinish(); return 0; } return prev - 1; });
      }, 1000);
    }
    return clearTimer;
  }, [running, handleFinish]);

  const selectPreset = (m: number) => { clearTimer(); setRunning(false); setFinished(false); setSaved(false); setEditingTime(false); setSelectedMinutes(m); setSecondsLeft(m * 60); };
  const resetGame = () => { clearTimer(); setRunning(false); setFinished(false); setSaved(false); setSaveError(""); setScore1(0); setScore2(0); setSecondsLeft(selectedMinutes * 60); setHalf(1); };
  const teamsReady = teams.length > 0 && teams.includes(player1) && teams.includes(player2) && player1 !== player2;
  const handleTimerClick = () => { if (editingTime || finished || !teamsReady) return; setRunning((r) => !r); };
  const swapTeams = () => {
    const wasFinished = finished; const p1 = player1, s1 = score1, s2 = score2;
    if (wasFinished) { clearTimer(); setRunning(false); setFinished(false); setSaved(false); setSaveError(""); setSecondsLeft(selectedMinutes * 60); if (half === 1) setHalf(2); }
    setPlayer1(player2); setPlayer2(p1); if (!wasFinished) { setScore1(s2); setScore2(s1); }
  };
  const handleScoreClick = (setter: React.Dispatch<React.SetStateAction<number>>, e: React.MouseEvent) => {
    e.preventDefault();
    setter((prev) => e.type === "contextmenu" ? Math.max(0, prev - 1) : prev + 1);
  };
  const handleTimeSegmentClick = (seg: "min" | "tens" | "ones", e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const inc = e.type !== "contextmenu";
    const m = Math.floor(secondsLeft / 60), ts = Math.floor((secondsLeft % 60) / 10), os = secondsLeft % 10;
    if (seg === "min")  setSecondsLeft(Math.max(0, Math.min(99, m + (inc ? 1 : -1))) * 60 + ts * 10 + os);
    if (seg === "tens") setSecondsLeft(m * 60 + ((ts + (inc ? 1 : 5)) % 6) * 10 + os);
    if (seg === "ones") setSecondsLeft(m * 60 + ts * 10 + (os + (inc ? 1 : 9)) % 10);
  };
  const [saveError, setSaveError] = useState("");
  const saveGame = async () => {
    setSaving(true); setSaveError("");
    try {
      const sb = getSupabase();
      // Delete any existing game between these two teams (either order)
      await sb.from("games").delete().eq("player1_name", player1).eq("player2_name", player2);
      await sb.from("games").delete().eq("player1_name", player2).eq("player2_name", player1);
      // Insert the new/updated result
      const { error } = await sb.from("games").insert({ player1_name: player1, player2_name: player2, player1_score: score1, player2_score: score2, duration_minutes: selectedMinutes });
      if (error) setSaveError(error.message);
      else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch { setSaveError("Connection failed"); }
    setSaving(false);
  };

  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const tenSecs = Math.floor(secs / 10), oneSecs = secs % 10;
  const progress = secondsLeft / (selectedMinutes * 60);
  const th = T[theme];
  const timerColor = finished ? "#ef4444" : editingTime ? "#eab308" : running ? th.timerRun : th.timerIdle;
  const uniqueGames = dedupeGames(games).filter(g => teams.includes(g.player1_name) && teams.includes(g.player2_name));
  const standings = computeStandings(uniqueGames);

  return (
    <main className={`h-screen w-screen overflow-hidden select-none flex flex-col ${th.main}`}>

      {/* ══════════════════ GAME TAB ══════════════════ */}
      {tab === "game" && (
        <div className="flex-1 relative overflow-hidden">
          <Link href="/history" className={`absolute top-3 right-4 text-xs transition-colors z-10 ${th.histLink}`}>History →</Link>

          {/* Team 1 — top-left */}
          <div className="absolute top-[4%] left-[4%] flex flex-col gap-[1vh]">
            <span className={`font-bold text-[3.5vw] w-[18vw] truncate ${th.textPrimary}`}>{player1}</span>
            <div className={`w-[18vw] h-[34vh] rounded-xl flex items-center justify-center cursor-pointer transition-colors ${th.scoreBox}`}
              onClick={(e) => handleScoreClick(setScore1, e)} onContextMenu={(e) => handleScoreClick(setScore1, e)}
              title="Left click +1 · Right click −1">
              <span className={`font-black tabular-nums leading-none text-[15vw] ${th.textPrimary}`}>{score1}</span>
            </div>
          </div>

          {/* Team 2 — top-right */}
          <div className="absolute top-[4%] right-[4%] flex flex-col gap-[1vh] items-end">
            <span className={`font-bold text-[3.5vw] w-[18vw] truncate text-right ${th.textPrimary}`}>{player2}</span>
            <div className={`w-[18vw] h-[34vh] rounded-xl flex items-center justify-center cursor-pointer transition-colors ${th.scoreBox}`}
              onClick={(e) => handleScoreClick(setScore2, e)} onContextMenu={(e) => handleScoreClick(setScore2, e)}
              title="Left click +1 · Right click −1">
              <span className={`font-black tabular-nums leading-none text-[15vw] ${th.textPrimary}`}>{score2}</span>
            </div>
          </div>

          {/* Half indicator */}
          <div className="absolute flex justify-center" style={{ left: "24%", right: "24%", top: "28%" }}>
            <span className={`text-[3vw] font-bold ${th.textMuted}`}>{half === 1 ? "1st" : "2nd"}</span>
          </div>

          {/* Timer — framed like score boxes */}
          <div onClick={handleTimerClick}
            className={`absolute rounded-xl flex flex-col items-center justify-center ${th.timerBox}`}
            style={{ left: "24%", right: "24%", top: "35%", bottom: "11%", cursor: editingTime || finished ? "default" : "pointer" }}>

            {editingTime ? (
              <div className="flex items-baseline font-mono font-black tabular-nums leading-none" style={{ fontSize: "clamp(3rem, 20vw, 26rem)" }}>
                {(["min", "tens", "ones"] as const).map((seg, i) => (
                  <span key={seg}>
                    {i === 1 && <span style={{ color: timerColor }} className="mx-[0.2vw]">:</span>}
                    <span className="cursor-pointer text-yellow-400 hover:text-yellow-200 transition-colors rounded-lg px-[0.3vw]"
                      style={{ backgroundColor: "transparent" }}
                      onClick={(e) => handleTimeSegmentClick(seg, e)}
                      onContextMenu={(e) => handleTimeSegmentClick(seg, e)}
                      title={seg === "min" ? "Left +1m · Right −1m" : seg === "tens" ? "Left +10s · Right −10s" : "Left +1s · Right −1s"}
                    >{seg === "min" ? String(mins).padStart(2, "0") : seg === "tens" ? tenSecs : oneSecs}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-mono font-black tabular-nums leading-none" style={{ fontSize: "clamp(3rem, 20vw, 26rem)", color: timerColor }}>
                {timeStr}
              </span>
            )}

            {!running && !finished && !editingTime && (
              <span className={`absolute bottom-[10%] text-[1.1vw] font-medium ${!teamsReady ? "text-red-500" : th.hint}`}>
                {!teamsReady ? "select two different teams to start" : "click to start"}
              </span>
            )}
            {editingTime && <span className="absolute bottom-[10%] text-yellow-600 text-[1.1vw] font-medium">left click + · right click −</span>}
            {finished && <p className="text-red-500 font-bold animate-pulse text-[2.5vw] mt-[2vh]">Time&apos;s up!</p>}
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-[1.5%] left-1/2 -translate-x-1/2 flex items-center gap-[1.5vw]">
            {teams.length > 0 ? (
              <>
                <select value={player1} onChange={(e) => setPlayer1(e.target.value)} className={`rounded-lg px-[1vw] py-[0.6vh] text-[1.2vw] outline-none cursor-pointer transition-colors ${th.select}`}>
                  {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={swapTeams} title="Swap teams and scores" className={`text-[1.8vw] font-bold leading-none px-[0.3vw] transition-colors ${th.swap}`}>⇄</button>
                <select value={player2} onChange={(e) => setPlayer2(e.target.value)} className={`rounded-lg px-[1vw] py-[0.6vh] text-[1.2vw] outline-none cursor-pointer transition-colors ${th.select}`}>
                  {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </>
            ) : (
              <button onClick={swapTeams} title="Swap teams and scores" className={`text-[1.8vw] font-bold leading-none px-[0.3vw] transition-colors ${th.swap}`}>⇄</button>
            )}
            <div className={`w-px h-[3vh] ${th.divider}`} />
            {!running && (
              <button onClick={() => setEditingTime((e) => !e)}
                className={`px-[2vw] py-[0.8vh] rounded-xl font-bold text-[1.3vw] transition-colors ${editingTime ? "bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-400" : th.btnSecondary}`}>
                {editingTime ? "Done" : "Set Time"}
              </button>
            )}
            {saveError ? (
              <span className="font-semibold text-[1.2vw] text-red-500">{saveError}</span>
            ) : saved ? (
              <span className={`font-semibold text-[1.2vw] ${th.saved}`}>✓ Saved</span>
            ) : (
              <button onClick={saveGame} disabled={saving} className={`px-[2vw] py-[0.8vh] rounded-xl font-bold text-[1.3vw] transition-colors disabled:opacity-40 ${th.btnPrimary}`}>
                {saving ? "Saving..." : "Save Game"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ SETTINGS TAB ══════════════════ */}
      {tab === "settings" && (
        <div className="flex-1 flex gap-[2.5vw] p-[2.5vw] min-h-0">

          {/* Teams panel */}
          <div className={`flex-1 rounded-2xl p-[2vw] flex flex-col gap-[1.5vh] min-h-0 ${th.panel}`}>
            <h2 className={`text-[1.8vw] font-bold shrink-0 ${th.textPrimary}`}>Teams</h2>
            <div className="flex gap-[1vw] shrink-0">
              <input value={newTeam} onChange={(e) => setNewTeam(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTeam()}
                placeholder="Enter team name..."
                className={`flex-1 outline-none rounded-xl px-[1.2vw] py-[1.2vh] text-[1.4vw] transition-colors ${th.input}`} />
              <button onClick={addTeam} className={`px-[2vw] py-[1.2vh] rounded-xl font-bold text-[1.4vw] transition-colors ${th.btnPrimary}`}>Add</button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-[1vh] min-h-0">
              {teams.length === 0 ? (
                <p className={`text-[1.3vw] mt-[1vh] ${th.textMuted}`}>No teams yet — add one above.</p>
              ) : teams.map((t) => (
                <div key={t} className={`flex items-center justify-between rounded-xl px-[1.5vw] py-[1.2vh] ${th.inner}`}>
                  <span className={`text-[1.5vw] font-semibold ${th.textPrimary}`}>{t}</span>
                  <button onClick={() => removeTeam(t)} className={`text-[1.8vw] leading-none font-bold px-[0.5vw] transition-colors ${th.remove}`}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Minutes + Theme */}
          <div className="w-[38vw] flex flex-col gap-[2vw]">

            {/* Minutes panel */}
            <div className={`rounded-2xl p-[2vw] flex flex-col gap-[2vh] ${th.panel}`}>
              <h2 className={`text-[1.8vw] font-bold ${th.textPrimary}`}>Minutes</h2>
              <p className={`text-[1.2vw] ${th.textMuted}`}>Duration for the next game.</p>
              <div className="flex gap-[1.5vw]">
                {PRESETS.map((m) => (
                  <button key={m} onClick={() => selectPreset(m)}
                    className={`flex-1 py-[3vh] rounded-2xl font-black text-[3vw] transition-colors ${selectedMinutes === m ? th.presetOn : th.presetOff}`}>
                    {m}
                    <span className="block text-[1.2vw] font-semibold mt-[0.5vh] opacity-60">min</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme panel */}
            <div className={`rounded-2xl p-[2vw] flex flex-col gap-[2vh] ${th.panel}`}>
              <h2 className={`text-[1.8vw] font-bold ${th.textPrimary}`}>Theme</h2>
              <div className="flex gap-[1.5vw]">
                {([
                  { key: "dark",  label: "Dark",   sub: "Black / White" },
                  { key: "light", label: "Light",  sub: "White / Black" },
                  { key: "color", label: "Color",  sub: "Blue accents"  },
                ] as const).map(({ key, label, sub }) => (
                  <button key={key} onClick={() => changeTheme(key)}
                    className={`flex-1 py-[2vh] rounded-2xl font-bold text-[1.4vw] transition-colors flex flex-col items-center gap-[0.5vh] ${theme === key ? th.presetOn : th.presetOff}`}>
                    {label}
                    <span className="text-[1vw] font-normal opacity-60">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RESULTS TAB ══════════════════ */}
      {tab === "results" && (() => {
        const standMap = new Map(standings.map(s => [s.team, s]));
        // Standings list: sorted by points, then goal diff, then goals for
        const rankedTeams = [...teams].sort((a, b) => {
          const sa = standMap.get(a), sb = standMap.get(b);
          const pa = sa?.points ?? 0, pb = sb?.points ?? 0;
          if (pb !== pa) return pb - pa;
          const da = (sa?.gf ?? 0) - (sa?.ga ?? 0), db = (sb?.gf ?? 0) - (sb?.ga ?? 0);
          if (db !== da) return db - da;
          return (sb?.gf ?? 0) - (sa?.gf ?? 0);
        });
        // Cross-reference table: alphabetical
        const alphaTeams = [...teams].sort((a, b) => a.localeCompare(b));
        return (
        <div className="flex-1 flex flex-col p-[2.5vw] gap-[2vh] min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <h2 className={`text-[1.8vw] font-bold ${th.textPrimary}`}>Results</h2>
            <button onClick={fetchGames} className={`text-[1.1vw] transition-colors px-[1vw] py-[0.5vh] rounded-lg ${th.btnSecondary}`}>↻ Refresh</button>
          </div>

          {fetchError && <p className="text-[1.2vw] text-red-500 shrink-0">{fetchError}</p>}
          {teams.length === 0 ? (
            <p className={`text-[1.3vw] ${th.textMuted}`}>No teams created yet. Add teams in Settings.</p>
          ) : (
            <>
              {/* ── Team standings list (centered, no borders, big text) ── */}
              <div className="shrink-0 flex justify-center">
                <div className="w-fit">
                  <div className={`flex items-center py-[0.4vh] text-[1.4vw] ${th.textMuted}`}>
                    <span className="w-[20vw]">Team</span>
                    <span className="w-[5vw] text-center">Points</span>
                    <span className="w-[6vw] text-center">Score</span>
                  </div>
                  {rankedTeams.map((team) => {
                    const st = standMap.get(team);
                    return (
                      <div key={team} className={`flex items-center py-[0.4vh] text-[1.8vw] ${th.cellText}`}>
                        <span className="w-[20vw] font-semibold">{team}</span>
                        <span className="w-[5vw] text-center font-black">{st?.points ?? 0}</span>
                        <span className={`w-[6vw] text-center ${th.textSec}`}>{st ? `${st.gf}:${st.ga}` : "0:0"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Cross-reference matrix (centered, scrollable) ── */}
              <div className="flex-1 overflow-auto min-h-0 flex justify-center">
                {loadingGames ? (
                  <p className={`text-[1.3vw] ${th.textMuted}`}>Loading results...</p>
                ) : (
                <table className={`border-collapse text-[1.1vw] ${th.cellText} h-fit`}>
                  <thead>
                    <tr>
                      <th className={`border ${th.cellBorder} px-[0.6vw] py-[0.5vh] text-left font-bold`}></th>
                      {alphaTeams.map((t, i) => (
                        <th key={i} className={`border ${th.cellBorder} px-[0.6vw] py-[0.5vh] text-center font-bold min-w-[3.5vw]`}>{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alphaTeams.map((team, ri) => (
                      <tr key={team}>
                        <td className={`border ${th.cellBorder} px-[0.6vw] py-[0.5vh] text-left font-semibold whitespace-nowrap`}>{team}</td>
                        {alphaTeams.map((opp, ci) => {
                          if (ri === ci) return <td key={ci} className={`border ${th.cellBorder} ${th.cellDiag}`} />;
                          const result = getMatchResult(uniqueGames, team, opp);
                          return (
                            <td key={ci} className={`border ${th.cellBorder} px-[0.5vw] py-[0.5vh] text-center whitespace-nowrap ${result ? "" : th.cellEmpty}`}>
                              {result ?? ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </>
          )}
        </div>
        );
      })()}

      {/* ══════════════════ TAB BAR ══════════════════ */}
      <div className={`flex shrink-0 ${th.tabBar}`}>
        {(["game", "settings", "results"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-[1.2vh] font-semibold text-[1.3vw] capitalize transition-colors ${tab === t ? th.tabOn : th.tabOff}`}>
            {t}
          </button>
        ))}
      </div>

    </main>
  );
}
