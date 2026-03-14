"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getSupabase,
  Game,
  Room,
  CurrentMatch,
  PlayoffMatch,
  createRoom,
  joinRoom,
  updateRoomTeams,
  updateRoomDuration,
  updateRoomName,
  updateRoomGroupSettings,
  updateRoomPlayoffs,
  updateCurrentMatch,
  fetchRoom,
  touchRoom,
  fetchRoomGames,
  fetchAllRooms,
} from "@/lib/supabase";

const PRESETS = [5, 6, 7];
const STORAGE_PIN_KEY = "sport-room-pin";

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
    hint:        "text-zinc-600",
    saved:       "text-zinc-300",
    cellDiag:    "bg-zinc-800",
    cellEmpty:   "bg-zinc-900",
    cellBorder:  "border-zinc-700",
    cellText:    "text-white",
    gate:        "bg-black",
    gateBorder:  "border-zinc-800",
    gateText:    "text-zinc-400",
    listItem:    "bg-zinc-950 border border-zinc-800 hover:border-zinc-600",
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
    hint:        "text-zinc-400",
    saved:       "text-zinc-700",
    cellDiag:    "bg-zinc-300",
    cellEmpty:   "bg-zinc-50",
    cellBorder:  "border-zinc-300",
    cellText:    "text-black",
    gate:        "bg-white",
    gateBorder:  "border-zinc-300",
    gateText:    "text-zinc-500",
    listItem:    "bg-zinc-50 border border-zinc-200 hover:border-zinc-400",
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
    hint:        "text-gray-600",
    saved:       "text-green-400",
    cellDiag:    "bg-gray-800",
    cellEmpty:   "bg-gray-900",
    cellBorder:  "border-gray-700",
    cellText:    "text-white",
    gate:        "bg-gray-950",
    gateBorder:  "border-gray-800",
    gateText:    "text-gray-500",
    listItem:    "bg-gray-900 border border-gray-800 hover:border-gray-600",
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
    if (!seen.has(key)) seen.set(key, g);
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

// ── Live match display for viewers ───────────────────────────────────────────
function LiveMatch({ match, th }: { match: CurrentMatch; th: typeof T[ThemeKey] }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!match.running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [match.running]);

  let secsLeft = match.seconds_left;
  if (match.running && match.updated_at) {
    const elapsed = Math.floor((now - new Date(match.updated_at).getTime()) / 1000);
    secsLeft = Math.max(0, match.seconds_left - elapsed);
  }
  const mm = String(Math.floor(secsLeft / 60)).padStart(2, "0");
  const ss = String(secsLeft % 60).padStart(2, "0");

  return (
    <div className={`shrink-0 rounded-xl p-[1.5vw] flex items-center justify-center gap-[3vw] ${th.panel}`}>
      <div className="flex flex-col items-center">
        <span className={`text-[1.4vw] font-bold ${th.textPrimary}`}>{match.player1}</span>
        <span className={`text-[3vw] font-black tabular-nums ${th.textPrimary}`}>{match.score1}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className={`text-[1vw] font-bold ${th.textMuted}`}>{match.half === 1 ? "1st" : "2nd"}</span>
        <span className={`text-[2.5vw] font-mono font-black tabular-nums ${match.finished ? "text-red-500" : match.running ? th.textPrimary : th.textMuted}`}>
          {mm}:{ss}
        </span>
        {match.finished && <span className="text-red-500 font-bold text-[1vw] animate-pulse">Time&apos;s up!</span>}
      </div>
      <div className="flex flex-col items-center">
        <span className={`text-[1.4vw] font-bold ${th.textPrimary}`}>{match.player2}</span>
        <span className={`text-[3vw] font-black tabular-nums ${th.textPrimary}`}>{match.score2}</span>
      </div>
    </div>
  );
}

// ── Group standings + matrix block ───────────────────────────────────────────
function EditableCell({ team, opp, result, th, onSave }: {
  team: string; opp: string; result: string | null;
  th: typeof T[ThemeKey];
  onSave?: (teamA: string, teamB: string, scoreA: number, scoreB: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(result ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(result ?? ""); }, [result]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = async () => {
    setEditing(false);
    const trimmed = value.trim();
    if (!trimmed) return;
    const m = trimmed.match(/^(\d+)\s*[:;\-]\s*(\d+)$/);
    if (!m) { setValue(result ?? ""); return; }
    const s1 = parseInt(m[1]), s2 = parseInt(m[2]);
    if (onSave) await onSave(team, opp, s1, s2);
  };

  if (!onSave) {
    return (
      <td className={`border ${th.cellBorder} px-[0.5vw] py-[0.5vh] text-center whitespace-nowrap ${result ? "" : th.cellEmpty}`}>
        {result ?? ""}
      </td>
    );
  }

  return (
    <td
      className={`border ${th.cellBorder} px-[0.5vw] py-[0.5vh] text-center whitespace-nowrap cursor-pointer ${result ? "" : th.cellEmpty}`}
      onClick={() => { if (!editing) setEditing(true); }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setValue(result ?? ""); } }}
          className={`w-[3.5vw] text-center text-[1.1vw] outline-none bg-transparent border-b-2 ${th.cellText}`}
          placeholder="0:0"
        />
      ) : (
        result ?? ""
      )}
    </td>
  );
}

function GroupBlock({ label, teams, games, th, loadingGames, onSaveResult }: {
  label?: string;
  teams: string[];
  games: Game[];
  th: typeof T[ThemeKey];
  loadingGames: boolean;
  onSaveResult?: (teamA: string, teamB: string, scoreA: number, scoreB: number) => Promise<void>;
}) {
  const uniqueGames = dedupeGames(games).filter(g => teams.includes(g.player1_name) && teams.includes(g.player2_name));
  const standings = computeStandings(uniqueGames);
  const standMap = new Map(standings.map(s => [s.team, s]));
  const rankedTeams = [...teams].sort((a, b) => {
    const sa = standMap.get(a), sb = standMap.get(b);
    const pa = sa?.points ?? 0, pb = sb?.points ?? 0;
    if (pb !== pa) return pb - pa;
    const da = (sa?.gf ?? 0) - (sa?.ga ?? 0), db = (sb?.gf ?? 0) - (sb?.ga ?? 0);
    if (db !== da) return db - da;
    return (sb?.gf ?? 0) - (sa?.gf ?? 0);
  });
  const alphaTeams = [...teams].sort((a, b) => a.localeCompare(b));

  const content = (
    <div className="inline-flex flex-col gap-[1.5vh] w-full sm:w-auto">
      <div className="w-full sm:w-fit">
        <div className={`flex items-center py-[0.4vh] text-[3vw] sm:text-[1.4vw] ${th.textMuted}`}>
          <span className="w-[6vw] sm:w-[2.5vw] text-center">#</span>
          <span className="w-[34vw] sm:w-[17.5vw]">Team</span>
          <span className="w-[12vw] sm:w-[5vw] text-center">Points</span>
          <span className="w-[14vw] sm:w-[6vw] text-center">Score</span>
        </div>
        {rankedTeams.map((team, idx) => {
          const st = standMap.get(team);
          return (
            <div key={team} className={`flex items-center py-[0.4vh] text-[3.5vw] sm:text-[1.8vw] ${th.cellText}`}>
              <span className={`w-[6vw] sm:w-[2.5vw] text-center font-bold ${th.textMuted}`}>{idx + 1}.</span>
              <span className="w-[34vw] sm:w-[17.5vw] font-semibold">{team}</span>
              <span className="w-[12vw] sm:w-[5vw] text-center font-black">{st?.points ?? 0}</span>
              <span className={`w-[14vw] sm:w-[6vw] text-center ${th.textSec}`}>{st ? `${st.gf}:${st.ga}` : "0:0"}</span>
            </div>
          );
        })}
      </div>

      <div>
        {loadingGames ? (
          <p className={`text-[3vw] sm:text-[1.3vw] ${th.textMuted}`}>Loading results...</p>
        ) : (
        <table className={`border-collapse text-[2.5vw] sm:text-[1.1vw] ${th.cellText} h-fit`}>
          <thead>
            <tr>
              <th className={`border ${th.cellBorder} px-[1.5vw] sm:px-[0.6vw] py-[0.5vh] text-left font-bold`}></th>
              {alphaTeams.map((t, i) => (
                <th key={i} className={`border ${th.cellBorder} px-[1.5vw] sm:px-[0.6vw] py-[0.5vh] text-center font-bold min-w-[8vw] sm:min-w-[3.5vw]`}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alphaTeams.map((team, ri) => (
              <tr key={team}>
                <td className={`border ${th.cellBorder} px-[1.5vw] sm:px-[0.6vw] py-[0.5vh] text-left font-semibold whitespace-nowrap`}>{team}</td>
                {alphaTeams.map((opp, ci) => {
                  if (ri === ci) return <td key={ci} className={`border ${th.cellBorder} ${th.cellDiag}`} />;
                  const result = getMatchResult(uniqueGames, team, opp);
                  return (
                    <EditableCell key={ci} team={team} opp={opp} result={result} th={th} onSave={onSaveResult} />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );

  if (label) {
    return (
      <div className={`rounded-xl p-[3vw] sm:p-[1.5vw] ${th.panel}`}>
        <h3 className={`text-[4vw] sm:text-[1.5vw] font-bold mb-[1vh] ${th.textPrimary}`}>{label}</h3>
        <div className="flex justify-center">{content}</div>
      </div>
    );
  }

  return <div className="flex justify-center">{content}</div>;
}

// ── Playoff match card ────────────────────────────────────────────────────────
function PlayoffCard({ match, teams, th, onUpdate, onRemove }: {
  match: PlayoffMatch;
  teams: string[];
  th: typeof T[ThemeKey];
  onUpdate?: (m: PlayoffMatch) => void;
  onRemove?: () => void;
}) {
  const readOnly = !onUpdate;
  return (
    <div className={`rounded-xl p-[3vw] sm:p-[1.5vw] ${th.panel}`}>
      <div className="flex items-center justify-between mb-[1vh]">
        {readOnly ? (
          <h3 className={`text-[4vw] sm:text-[1.5vw] font-bold ${th.textPrimary}`}>{match.name}</h3>
        ) : (
          <input value={match.name}
            onChange={(e) => onUpdate!({ ...match, name: e.target.value })}
            className={`text-[4vw] sm:text-[1.5vw] font-bold bg-transparent outline-none border-b border-transparent focus:border-current w-full mr-[2vw] ${th.textPrimary}`}
            placeholder="Match name" />
        )}
        {onRemove && (
          <button onClick={onRemove}
            className="text-red-500 hover:text-red-400 text-[3vw] sm:text-[1.1vw] shrink-0 transition-colors">✕</button>
        )}
      </div>
      <div className="flex items-center gap-[2vw] sm:gap-[1vw] justify-center">
        {readOnly ? (
          <span className={`text-[3.5vw] sm:text-[1.4vw] font-semibold w-[30vw] sm:w-[12vw] ${th.cellText}`}>{match.team1 || "—"}</span>
        ) : (
          <select value={match.team1} onChange={(e) => onUpdate!({ ...match, team1: e.target.value })}
            className={`text-[3vw] sm:text-[1.2vw] rounded-lg px-[1.5vw] sm:px-[0.6vw] py-[0.5vh] w-[30vw] sm:w-[12vw] ${th.select}`}>
            <option value="">Select team</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        {readOnly ? (
          <span className={`text-[4vw] sm:text-[1.6vw] font-black tabular-nums ${th.cellText}`}>
            {match.score1 != null && match.score2 != null ? `${match.score1} : ${match.score2}` : "– : –"}
          </span>
        ) : (
          <div className="flex items-center gap-[1vw] sm:gap-[0.4vw]">
            <input type="number" min={0} value={match.score1 ?? ""} placeholder="–"
              onChange={(e) => onUpdate!({ ...match, score1: e.target.value === "" ? null : Number(e.target.value) })}
              className={`w-[10vw] sm:w-[3vw] text-center text-[3.5vw] sm:text-[1.4vw] font-bold rounded-lg py-[0.3vh] ${th.input}`} />
            <span className={`text-[3.5vw] sm:text-[1.4vw] font-bold ${th.textMuted}`}>:</span>
            <input type="number" min={0} value={match.score2 ?? ""} placeholder="–"
              onChange={(e) => onUpdate!({ ...match, score2: e.target.value === "" ? null : Number(e.target.value) })}
              className={`w-[10vw] sm:w-[3vw] text-center text-[3.5vw] sm:text-[1.4vw] font-bold rounded-lg py-[0.3vh] ${th.input}`} />
          </div>
        )}
        {readOnly ? (
          <span className={`text-[3.5vw] sm:text-[1.4vw] font-semibold w-[30vw] sm:w-[12vw] text-right ${th.cellText}`}>{match.team2 || "—"}</span>
        ) : (
          <select value={match.team2} onChange={(e) => onUpdate!({ ...match, team2: e.target.value })}
            className={`text-[3vw] sm:text-[1.2vw] rounded-lg px-[1.5vw] sm:px-[0.6vw] py-[0.5vh] w-[30vw] sm:w-[12vw] ${th.select}`}>
            <option value="">Select team</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

// ── Results view (shared between main app and read-only view) ────────────────
function ResultsView({ teams, games, th, fetchGames, loadingGames, fetchError, twoGroups, teamGroups, currentMatch, onSaveResult, playoffs, onPlayoffsUpdate }: {
  teams: string[];
  games: Game[];
  th: typeof T[ThemeKey];
  fetchGames?: () => void;
  loadingGames: boolean;
  fetchError: string;
  twoGroups?: boolean;
  teamGroups?: Record<string, string>;
  currentMatch?: CurrentMatch | null;
  onSaveResult?: (teamA: string, teamB: string, scoreA: number, scoreB: number) => Promise<void>;
  playoffs?: PlayoffMatch[] | null;
  onPlayoffsUpdate?: (p: PlayoffMatch[]) => void;
}) {
  const groupA = twoGroups ? teams.filter(t => (teamGroups?.[t] ?? "A") === "A") : [];
  const groupB = twoGroups ? teams.filter(t => teamGroups?.[t] === "B") : [];

  const addMatch = () => {
    if (!onPlayoffsUpdate) return;
    const newMatch: PlayoffMatch = { id: crypto.randomUUID(), name: "Match", team1: "", team2: "", score1: null, score2: null };
    onPlayoffsUpdate([...(playoffs ?? []), newMatch]);
  };

  const updateMatch = (id: string, updated: PlayoffMatch) => {
    if (!onPlayoffsUpdate || !playoffs) return;
    onPlayoffsUpdate(playoffs.map(m => m.id === id ? updated : m));
  };

  const removeMatch = (id: string) => {
    if (!onPlayoffsUpdate || !playoffs) return;
    const next = playoffs.filter(m => m.id !== id);
    onPlayoffsUpdate(next.length > 0 ? next : []);
  };

  return (
    <div className="flex-1 flex flex-col p-[3vw] sm:p-[2.5vw] gap-[2vh] min-h-0 overflow-auto">
      <div className="flex items-center justify-between shrink-0">
        <h2 className={`text-[5vw] sm:text-[1.8vw] font-bold ${th.textPrimary}`}>Results</h2>
        {fetchGames && (
          <button onClick={fetchGames} className={`text-[3vw] sm:text-[1.1vw] transition-colors px-[3vw] sm:px-[1vw] py-[0.5vh] rounded-lg ${th.btnSecondary}`}>↻ Refresh</button>
        )}
      </div>

      {currentMatch && currentMatch.player1 && (
        <LiveMatch match={currentMatch} th={th} />
      )}

      {fetchError && <p className="text-[1.2vw] text-red-500 shrink-0">{fetchError}</p>}
      {teams.length === 0 ? (
        <p className={`text-[1.3vw] ${th.textMuted}`}>No teams created yet.</p>
      ) : twoGroups ? (
        <>
          {groupA.length > 0 && (
            <GroupBlock label="Group A" teams={groupA} games={games} th={th} loadingGames={loadingGames} onSaveResult={onSaveResult} />
          )}
          {groupB.length > 0 && (
            <GroupBlock label="Group B" teams={groupB} games={games} th={th} loadingGames={loadingGames} onSaveResult={onSaveResult} />
          )}
          {groupA.length === 0 && groupB.length === 0 && (
            <p className={`text-[1.3vw] ${th.textMuted}`}>No teams assigned to groups yet.</p>
          )}
        </>
      ) : (
        <GroupBlock teams={teams} games={games} th={th} loadingGames={loadingGames} onSaveResult={onSaveResult} />
      )}

      {/* Custom match cards */}
      {playoffs && playoffs.length > 0 && playoffs.map(match => (
        <PlayoffCard key={match.id} match={match} teams={teams} th={th}
          onUpdate={onPlayoffsUpdate ? (m) => updateMatch(match.id, m) : undefined}
          onRemove={onPlayoffsUpdate ? () => removeMatch(match.id) : undefined} />
      ))}

      {onPlayoffsUpdate && (
        <button onClick={addMatch}
          className={`text-[3.5vw] sm:text-[1.2vw] px-[3vw] sm:px-[1.5vw] py-[1vh] rounded-xl font-bold transition-colors self-start ${th.btnSecondary}`}>
          + Add Match
        </button>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GamePage() {
  const [theme, setTheme] = useState<ThemeKey>("dark");

  // Room state
  const [room, setRoom] = useState<Room | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [twoGroups, setTwoGroups] = useState(false);
  const [teamGroups, setTeamGroups] = useState<Record<string, string>>({});
  const [playoffs, setPlayoffs] = useState<PlayoffMatch[] | null>(null);

  // Gate screen: public tournament list + read-only view
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [viewGames, setViewGames] = useState<Game[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Game state
  const [teams, setTeams] = useState<string[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(7);
  const [secondsLeft, setSecondsLeft] = useState(7 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [tab, setTab] = useState<"game" | "settings" | "results">("game");
  const [half, setHalf] = useState<1 | 2>(1);
  const [editingTime, setEditingTime] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [fetchError, setFetchError] = useState("");

  // ── Load theme + check for saved room PIN on mount ──
  useEffect(() => {
    const storedTheme = localStorage.getItem("sport-theme") as ThemeKey | null;
    if (storedTheme && T[storedTheme]) setTheme(storedTheme);

    const savedPin = localStorage.getItem(STORAGE_PIN_KEY);
    if (savedPin) {
      joinRoom(savedPin).then((r) => {
        if (r) {
          setRoom(r);
          setTeams(r.teams);
          setTournamentName(r.name);
          setTwoGroups(r.two_groups);
          setTeamGroups(r.team_groups ?? {});
          setPlayoffs(r.playoffs ?? null);
          setSelectedMinutes(r.duration_minutes);
          setSecondsLeft(r.duration_minutes * 60);
          if (r.teams.length > 0) { setPlayer1(r.teams[0]); if (r.teams.length > 1) setPlayer2(r.teams[1]); }
          // Clear stale live match on page load (no match is active after refresh)
          updateCurrentMatch(r.id, null).catch(() => {});
        } else {
          localStorage.removeItem(STORAGE_PIN_KEY);
        }
        setCheckingStorage(false);
      }).catch(() => {
        localStorage.removeItem(STORAGE_PIN_KEY);
        setCheckingStorage(false);
      });
    } else {
      setCheckingStorage(false);
    }
  }, []);

  // ── Fetch public tournament list when on gate screen ──
  const loadTournaments = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const rooms = await fetchAllRooms();
      setAllRooms(rooms);
    } catch { setAllRooms([]); }
    setLoadingRooms(false);
  }, []);

  useEffect(() => {
    if (!room && !checkingStorage) loadTournaments();
  }, [room, checkingStorage, loadTournaments]);

  const changeTheme = (t: ThemeKey) => {
    setTheme(t);
    localStorage.setItem("sport-theme", t);
  };

  // ── Room actions ──
  const handleCreateRoom = async () => {
    setRoomLoading(true); setRoomError("");
    try {
      const r = await createRoom();
      localStorage.setItem(STORAGE_PIN_KEY, r.pin);
      setRoom(r);
      setTeams(r.teams);
      setTournamentName(r.name);
      setTwoGroups(r.two_groups);
      setTeamGroups(r.team_groups ?? {});
      setPlayoffs(r.playoffs ?? null);
      setSelectedMinutes(r.duration_minutes);
      setSecondsLeft(r.duration_minutes * 60);
    } catch (e) {
      setRoomError(e instanceof Error ? e.message : "Failed to create room");
    }
    setRoomLoading(false);
  };

  const handleJoinRoom = async () => {
    const pin = pinInput.trim();
    if (!pin) return;
    setRoomLoading(true); setRoomError("");
    try {
      const r = await joinRoom(pin);
      if (!r) { setRoomError("Room not found"); setRoomLoading(false); return; }
      localStorage.setItem(STORAGE_PIN_KEY, r.pin);
      setRoom(r);
      setTeams(r.teams);
      setTournamentName(r.name);
      setTwoGroups(r.two_groups);
      setTeamGroups(r.team_groups ?? {});
      setPlayoffs(r.playoffs ?? null);
      setSelectedMinutes(r.duration_minutes);
      setSecondsLeft(r.duration_minutes * 60);
      if (r.teams.length > 0) { setPlayer1(r.teams[0]); if (r.teams.length > 1) setPlayer2(r.teams[1]); }
    } catch (e) {
      setRoomError(e instanceof Error ? e.message : "Failed to join room");
    }
    setRoomLoading(false);
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem(STORAGE_PIN_KEY);
    setRoom(null);
    setPinInput("");
    setTeams([]);
    setPlayer1(""); setPlayer2("");
    setScore1(0); setScore2(0);
    setGames([]);
    setTab("game");
    setShowPin(false);
    setTournamentName("");
    setTwoGroups(false);
    setTeamGroups({});
    setPlayoffs(null);
  };

  // ── View a tournament read-only ──
  const handleViewTournament = async (r: Room) => {
    setViewingRoom(r);
    setViewLoading(true);
    try {
      const data = await fetchRoomGames(r.id);
      setViewGames(data);
    } catch { setViewGames([]); }
    setViewLoading(false);
  };

  // ── Fetch games scoped to room ──
  const fetchGames = useCallback(async () => {
    if (!room) return;
    setLoadingGames(true); setFetchError("");
    try {
      const data = await fetchRoomGames(room.id);
      setGames(data);
    } catch { setGames([]); setFetchError("Connection failed"); } finally { setLoadingGames(false); }
  }, [room]);

  useEffect(() => { if (tab === "results" && room) fetchGames(); }, [tab, fetchGames, room]);

  // ── Teams: persist to Supabase room ──
  const persistTeams = useCallback((list: string[]) => {
    setTeams(list);
    if (room) updateRoomTeams(room.id, list).catch(() => {});
  }, [room]);

  const addTeam = () => {
    const n = newTeam.trim(); if (!n || teams.includes(n)) return;
    const updated = [...teams, n]; persistTeams(updated); setNewTeam("");
    if (updated.length === 1) setPlayer1(n);
    if (updated.length === 2) setPlayer2(n);
    if (twoGroups) persistGroupSettings(twoGroups, { ...teamGroups, [n]: "A" });
  };
  const removeTeam = (n: string) => persistTeams(teams.filter((t) => t !== n));

  // ── Tournament name ──
  const saveTournamentName = () => {
    if (room) updateRoomName(room.id, tournamentName.trim()).catch(() => {});
  };

  // ── Group settings ──
  const persistGroupSettings = (tg: boolean, groups: Record<string, string>) => {
    setTwoGroups(tg);
    setTeamGroups(groups);
    if (room) updateRoomGroupSettings(room.id, tg, groups).catch(() => {});
  };
  const toggleTeamGroup = (teamName: string) => {
    const current = teamGroups[teamName] ?? "A";
    const next = current === "A" ? "B" : "A";
    persistGroupSettings(twoGroups, { ...teamGroups, [teamName]: next });
  };

  // ── Push live match state to Supabase ──
  const pushMatchState = useCallback((overrides?: Partial<{ p1: string; p2: string; s1: number; s2: number; h: number; r: boolean; f: boolean; sl: number }>) => {
    if (!room) return;
    const match: CurrentMatch = {
      player1: overrides?.p1 ?? player1,
      player2: overrides?.p2 ?? player2,
      score1: overrides?.s1 ?? score1,
      score2: overrides?.s2 ?? score2,
      half: overrides?.h ?? half,
      running: overrides?.r ?? running,
      finished: overrides?.f ?? finished,
      total_seconds: selectedMinutes * 60,
      seconds_left: overrides?.sl ?? secondsLeft,
      updated_at: new Date().toISOString(),
    };
    updateCurrentMatch(room.id, match).catch((err) => console.error("pushMatchState error:", err));
  }, [room, player1, player2, score1, score2, half, running, finished, selectedMinutes, secondsLeft]);

  // ── Timer ──
  const playFoghorn = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      // Deep foghorn: layered low-frequency oscillators with slow fade
      const freqs = [80, 120, 160];
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.85, now + 3);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.setValueAtTime(0.6, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3);
      });
      // Second blast after a short gap
      setTimeout(() => {
        try {
          const now2 = ctx.currentTime;
          freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, now2);
            osc.frequency.linearRampToValueAtTime(freq * 0.85, now2 + 3.5);
            gain.gain.setValueAtTime(0.7, now2);
            gain.gain.setValueAtTime(0.7, now2 + 2);
            gain.gain.exponentialRampToValueAtTime(0.01, now2 + 3.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now2);
            osc.stop(now2 + 3.5);
          });
        } catch {}
      }, 3500);
    } catch {}
  }, []);

  const clearTimer = () => { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; };
  const finishRef = useRef<() => void>(() => {});
  finishRef.current = () => {
    clearTimer(); setRunning(false); setFinished(true);
    playFoghorn();
    pushMatchState({ r: false, f: true, sl: 0 });
  };
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) { finishRef.current(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectPreset = (m: number) => {
    clearTimer(); setRunning(false); setFinished(false); setEditingTime(false);
    setSelectedMinutes(m); setSecondsLeft(m * 60);
    if (room) updateRoomDuration(room.id, m).catch(() => {});
  };
  const resetGame = () => { clearTimer(); setRunning(false); setFinished(false); setScore1(0); setScore2(0); setSecondsLeft(selectedMinutes * 60); setHalf(1); if (room) updateCurrentMatch(room.id, null).catch(() => {}); };
  const teamsReady = teams.length > 0 && teams.includes(player1) && teams.includes(player2) && player1 !== player2;
  const handleTimerClick = () => {
    if (editingTime || finished || !teamsReady) return;
    setRunning((r) => {
      const next = !r;
      setTimeout(() => pushMatchState({ r: next }), 0);
      return next;
    });
  };
  const swapTeams = () => {
    const wasFinished = finished; const p1 = player1, s1 = score1, s2 = score2;
    if (wasFinished) { clearTimer(); setRunning(false); setFinished(false); setSecondsLeft(selectedMinutes * 60); if (half === 1) setHalf(2); }
    setPlayer1(player2); setPlayer2(p1); if (!wasFinished) { setScore1(s2); setScore2(s1); }
    setTimeout(() => pushMatchState({
      p1: player2, p2: p1,
      s1: wasFinished ? 0 : s2, s2: wasFinished ? 0 : s1,
      r: false, f: false,
      sl: wasFinished ? selectedMinutes * 60 : secondsLeft,
      h: wasFinished && half === 1 ? 2 : half,
    }), 0);
  };
  const handleScoreClick = (which: 1 | 2, e: React.MouseEvent) => {
    e.preventDefault();
    const setter = which === 1 ? setScore1 : setScore2;
    setter((prev) => {
      const next = e.type === "contextmenu" ? Math.max(0, prev - 1) : prev + 1;
      // Push after state update via setTimeout
      setTimeout(() => pushMatchState(which === 1 ? { s1: next } : { s2: next }), 0);
      return next;
    });
  };
  const handleTimeSegmentClick = (seg: "min" | "tens" | "ones", e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const inc = e.type !== "contextmenu";
    const m = Math.floor(secondsLeft / 60), ts = Math.floor((secondsLeft % 60) / 10), os = secondsLeft % 10;
    if (seg === "min")  setSecondsLeft(Math.max(0, Math.min(99, m + (inc ? 1 : -1))) * 60 + ts * 10 + os);
    if (seg === "tens") setSecondsLeft(m * 60 + ((ts + (inc ? 1 : 5)) % 6) * 10 + os);
    if (seg === "ones") setSecondsLeft(m * 60 + ts * 10 + (os + (inc ? 1 : 9)) % 10);
  };

  // ── Save game scoped to room ──
  const saveResult = useCallback(async (teamA: string, teamB: string, scoreA: number, scoreB: number) => {
    if (!room) return;
    try {
      const sb = getSupabase();
      await sb.from("games").delete().eq("room_id", room.id).eq("player1_name", teamA).eq("player2_name", teamB);
      await sb.from("games").delete().eq("room_id", room.id).eq("player1_name", teamB).eq("player2_name", teamA);
      const { error } = await sb.from("games").insert({
        player1_name: teamA, player2_name: teamB,
        player1_score: scoreA, player2_score: scoreB,
        duration_minutes: selectedMinutes, room_id: room.id,
      });
      if (error) throw error;
      touchRoom(room.id).catch(() => {});
      await fetchGames();
    } catch { /* silently fail */ }
  }, [room, selectedMinutes, fetchGames]);

  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const tenSecs = Math.floor(secs / 10), oneSecs = secs % 10;
  const th = T[theme];
  const timerColor = finished ? "#ef4444" : editingTime ? "#eab308" : running ? th.timerRun : th.timerIdle;

  // ── Poll read-only view for live updates ──
  useEffect(() => {
    if (!viewingRoom || room) return;
    const poll = async () => {
      const updated = await fetchRoom(viewingRoom.id);
      if (updated) {
        setViewingRoom(updated);
        const games = await fetchRoomGames(updated.id);
        setViewGames(games);
      }
    };
    poll(); // immediate first fetch
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [viewingRoom?.id, room]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading splash while checking localStorage ──
  if (checkingStorage) {
    return <main className={`h-screen w-screen flex items-center justify-center ${th.main}`} />;
  }

  // ── Read-only tournament view ──
  if (viewingRoom && !room) {
    return (
      <main className={`h-screen w-screen overflow-hidden select-none flex flex-col ${th.main}`}>
        <div className="flex items-center gap-4 px-[2.5vw] pt-[2vw] shrink-0">
          <button onClick={() => { setViewingRoom(null); setViewGames([]); }}
            className={`text-[1.3vw] transition-colors px-[1.5vw] py-[0.8vh] rounded-xl ${th.btnSecondary}`}>
            ← Back
          </button>
          <h1 className={`text-[2vw] font-bold ${th.textPrimary}`}>{viewingRoom.name || "Unnamed Tournament"}</h1>
        </div>
        <ResultsView
          teams={viewingRoom.teams}
          games={viewGames}
          th={th}
          loadingGames={viewLoading}
          fetchError=""
          twoGroups={viewingRoom.two_groups}
          teamGroups={viewingRoom.team_groups}
          currentMatch={viewingRoom.current_match}
          playoffs={viewingRoom.playoffs}
        />
      </main>
    );
  }

  // ── Room gate screen ──
  if (!room) {
    return (
      <main className={`h-screen w-screen flex flex-col items-center select-none overflow-auto ${th.gate} ${th.cellText}`}>
        <div className="flex flex-col items-center gap-8 w-[90vw] max-w-sm pt-[8vh]">
          <h1 className="font-black tracking-tight" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>
            Sport Timer
          </h1>

          <button onClick={handleCreateRoom} disabled={roomLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-40 ${th.btnPrimary}`}>
            {roomLoading ? "Creating..." : "Create Tournament"}
          </button>

          <div className="flex items-center gap-3 w-full">
            <div className={`flex-1 h-px ${th.divider}`} />
            <span className={`text-sm ${th.gateText}`}>or join with code</span>
            <div className={`flex-1 h-px ${th.divider}`} />
          </div>

          <div className="flex gap-3 w-full">
            <input
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              placeholder="Room code"
              maxLength={6}
              className={`flex-1 outline-none rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.3em] transition-colors ${th.input}`}
            />
            <button onClick={handleJoinRoom} disabled={roomLoading || pinInput.length < 4}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-colors disabled:opacity-40 ${th.btnPrimary}`}>
              Join
            </button>
          </div>

          {roomError && <p className="text-red-500 text-sm font-medium">{roomError}</p>}
        </div>

        {/* Public tournament list */}
        <div className="w-[90vw] max-w-lg mt-10 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex-1 h-px ${th.divider}`} />
            <span className={`text-sm font-semibold ${th.gateText}`}>Tournaments</span>
            <div className={`flex-1 h-px ${th.divider}`} />
          </div>
          {loadingRooms ? (
            <p className={`text-sm text-center ${th.gateText}`}>Loading...</p>
          ) : allRooms.length === 0 ? (
            <p className={`text-sm text-center ${th.gateText}`}>No tournaments yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {allRooms.map((r) => (
                <button key={r.id} onClick={() => handleViewTournament(r)}
                  className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${th.listItem}`}>
                  <span className="font-semibold">{r.name}</span>
                  <span className={`ml-2 text-sm ${th.gateText}`}>{r.teams.length} teams</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Main app (room active) ──
  return (
    <main className={`h-screen w-screen overflow-hidden select-none flex flex-col ${th.main}`}>

      {/* ══════════════════ GAME TAB ══════════════════ */}
      {tab === "game" && (
        <div className="flex-1 relative overflow-hidden">

          {/* Team 1 — top-left */}
          <div className="absolute top-[4%] left-[4%] flex flex-col gap-[1vh]">
            <span className={`font-bold text-[3.5vw] max-w-[22vw] truncate ${th.textPrimary}`}>{player1}</span>
            <div className={`w-[18vw] h-[34vh] rounded-xl flex items-center justify-center cursor-pointer transition-colors ${th.scoreBox}`}
              onClick={(e) => handleScoreClick(1, e)} onContextMenu={(e) => handleScoreClick(1, e)}
              title="Left click +1 · Right click −1">
              <span className={`font-black tabular-nums leading-none text-[15vw] ${th.textPrimary}`}>{score1}</span>
            </div>
          </div>

          {/* Team 2 — top-right */}
          <div className="absolute top-[4%] right-[4%] flex flex-col gap-[1vh] items-end">
            <span className={`font-bold text-[3.5vw] max-w-[22vw] truncate text-right ${th.textPrimary}`}>{player2}</span>
            <div className={`w-[18vw] h-[34vh] rounded-xl flex items-center justify-center cursor-pointer transition-colors ${th.scoreBox}`}
              onClick={(e) => handleScoreClick(2, e)} onContextMenu={(e) => handleScoreClick(2, e)}
              title="Left click +1 · Right click −1">
              <span className={`font-black tabular-nums leading-none text-[15vw] ${th.textPrimary}`}>{score2}</span>
            </div>
          </div>

          {/* Half indicator */}
          <div className="absolute flex justify-center" style={{ left: "24%", right: "24%", top: "22%" }}>
            <span className={`text-[3vw] font-bold ${th.textMuted}`}>{half === 1 ? "1st" : "2nd"}</span>
          </div>

          {/* Timer */}
          <div onClick={handleTimerClick}
            className={`absolute rounded-xl flex flex-col items-center justify-center ${th.timerBox}`}
            style={{ left: "24%", right: "24%", top: "35%", bottom: "11%", cursor: editingTime || finished ? "default" : "pointer" }}>

            {editingTime ? (
              <div className="flex items-baseline font-mono font-black tabular-nums leading-none" style={{ fontSize: "clamp(3rem, 15vw, 18rem)" }}>
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
              <span className="font-mono font-black tabular-nums leading-none" style={{ fontSize: "clamp(3rem, 15vw, 18rem)", color: timerColor }}>
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
          <div className="absolute bottom-[1.5%] left-1/2 -translate-x-1/2 flex flex-nowrap items-center gap-[1.5vw]">
            {teams.length > 0 ? (
              <>
                <select value={player1} onChange={(e) => { setPlayer1(e.target.value); setTimeout(() => pushMatchState({ p1: e.target.value }), 0); }} className={`rounded-lg px-[1vw] py-[0.6vh] text-[1.2vw] outline-none cursor-pointer transition-colors ${th.select}`}>
                  {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={swapTeams} title="Swap teams and scores" className={`text-[1.8vw] font-bold leading-none px-[0.3vw] transition-colors ${th.swap}`}>⇄</button>
                <select value={player2} onChange={(e) => { setPlayer2(e.target.value); setTimeout(() => pushMatchState({ p2: e.target.value }), 0); }} className={`rounded-lg px-[1vw] py-[0.6vh] text-[1.2vw] outline-none cursor-pointer transition-colors ${th.select}`}>
                  {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </>
            ) : (
              <button onClick={swapTeams} title="Swap teams and scores" className={`text-[1.8vw] font-bold leading-none px-[0.3vw] transition-colors ${th.swap}`}>⇄</button>
            )}
            <div className={`w-px h-[3vh] ${th.divider}`} />
            {!running && (
              <button onClick={() => setEditingTime((e) => !e)}
                className={`px-[1.5vw] py-[0.8vh] rounded-xl font-bold text-[1.3vw] transition-colors whitespace-nowrap ${editingTime ? "bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-400" : th.btnSecondary}`}>
                {editingTime ? "Done" : "Set Time"}
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
            <div className="flex items-center justify-between shrink-0">
              <h2 className={`text-[1.8vw] font-bold ${th.textPrimary}`}>Teams</h2>
              <button onClick={() => persistGroupSettings(!twoGroups, teamGroups)}
                className={`px-[1.2vw] py-[0.5vh] rounded-xl font-bold text-[1.1vw] transition-colors ${twoGroups ? th.presetOn : th.presetOff}`}>
                Two Groups
              </button>
            </div>
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
                  <div className="flex items-center gap-[1vw]">
                    <span className={`text-[1.5vw] font-semibold ${th.textPrimary}`}>{t}</span>
                    {twoGroups && (
                      <button onClick={() => toggleTeamGroup(t)}
                        className={`px-[0.8vw] py-[0.2vh] rounded-lg font-bold text-[1.1vw] transition-colors ${(teamGroups[t] ?? "A") === "A" ? th.presetOn : "bg-blue-600 text-white border border-blue-600"}`}>
                        {teamGroups[t] ?? "A"}
                      </button>
                    )}
                  </div>
                  <button onClick={() => removeTeam(t)} className={`text-[1.8vw] leading-none font-bold px-[0.5vw] transition-colors ${th.remove}`}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="w-[38vw] flex flex-col gap-[1.2vw] min-h-0">

            {/* Minutes panel */}
            <div className={`rounded-2xl p-[1.5vw] flex flex-col gap-[1vh] ${th.panel}`}>
              <h2 className={`text-[1.5vw] font-bold ${th.textPrimary}`}>Minutes</h2>
              <div className="flex gap-[1vw]">
                {PRESETS.map((m) => (
                  <button key={m} onClick={() => selectPreset(m)}
                    className={`flex-1 py-[2vh] rounded-2xl font-black text-[2.5vw] transition-colors ${selectedMinutes === m ? th.presetOn : th.presetOff}`}>
                    {m}
                    <span className="block text-[1vw] font-semibold opacity-60">min</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme panel */}
            <div className={`rounded-2xl p-[1.5vw] flex flex-col gap-[1vh] ${th.panel}`}>
              <h2 className={`text-[1.5vw] font-bold ${th.textPrimary}`}>Theme</h2>
              <div className="flex gap-[1vw]">
                {([
                  { key: "dark",  label: "Dark",   sub: "Black / White" },
                  { key: "light", label: "Light",  sub: "White / Black" },
                  { key: "color", label: "Color",  sub: "Blue accents"  },
                ] as const).map(({ key, label, sub }) => (
                  <button key={key} onClick={() => changeTheme(key)}
                    className={`flex-1 py-[1.5vh] rounded-2xl font-bold text-[1.3vw] transition-colors flex flex-col items-center gap-[0.3vh] ${theme === key ? th.presetOn : th.presetOff}`}>
                    {label}
                    <span className="text-[0.9vw] font-normal opacity-60">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room panel */}
            <div className={`rounded-2xl p-[1.5vw] flex flex-col gap-[1vh] ${th.panel}`}>
              <h2 className={`text-[1.5vw] font-bold ${th.textPrimary}`}>Room</h2>
              <div className="flex gap-[1vw]">
                <input
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  onBlur={saveTournamentName}
                  onKeyDown={(e) => { if (e.key === "Enter") { saveTournamentName(); (e.target as HTMLInputElement).blur(); } }}
                  placeholder="Tournament name..."
                  className={`flex-1 outline-none rounded-xl px-[1.2vw] py-[0.8vh] text-[1.3vw] transition-colors ${th.input}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[1.3vw] flex items-center gap-[0.5vw] ${th.textSec}`}>
                  Code:
                  <span className="font-mono font-bold tracking-widest">{showPin ? room.pin : "••••••"}</span>
                  <button onClick={() => setShowPin((s) => !s)}
                    className={`text-[1.1vw] leading-none transition-colors px-[0.3vw] ${th.btnSecondary} rounded-md`}
                    title={showPin ? "Hide PIN" : "Show PIN"}>
                    {showPin ? "Hide" : "Show"}
                  </button>
                </span>
                <button onClick={handleLeaveRoom}
                  className="px-[1.5vw] py-[0.8vh] rounded-xl font-bold text-[1.2vw] transition-colors text-red-500 border border-red-500/30 hover:bg-red-500/10">
                  Leave Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RESULTS TAB ══════════════════ */}
      {tab === "results" && (
        <ResultsView
          teams={teams}
          games={games}
          th={th}
          fetchGames={fetchGames}
          loadingGames={loadingGames}
          fetchError={fetchError}
          twoGroups={twoGroups}
          teamGroups={teamGroups}
          onSaveResult={saveResult}
          playoffs={playoffs}
          onPlayoffsUpdate={(p) => {
            setPlayoffs(p);
            if (room) updateRoomPlayoffs(room.id, p).catch(() => {});
          }}
        />
      )}

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
