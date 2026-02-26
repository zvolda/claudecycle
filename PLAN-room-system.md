# Room System with PINs

## Context
The app currently shares all game data globally in one Supabase `games` table. Multiple users worldwide would see/overwrite each other's data. We need isolated "rooms" so each tournament/group has its own teams, games, and results, identified by a short PIN for easy sharing.

## Supabase Schema Changes

**1. Create `rooms` table** (run in Supabase SQL editor):
```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin TEXT NOT NULL UNIQUE,
  teams TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**2. Add `room_id` to `games` table:**
```sql
ALTER TABLE games ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE CASCADE;
```

**3. Auto-expire rooms after 14 days** (pg_cron):
```sql
SELECT cron.schedule('expire-old-rooms', '0 3 * * *',
  $$DELETE FROM rooms WHERE last_active_at < now() - INTERVAL '14 days'$$);
```

**4. Clean up existing orphaned games:**
```sql
DELETE FROM games WHERE room_id IS NULL;
```

## Code Changes

### `lib/supabase.ts`
- Add `Room` type (id, pin, teams, duration_minutes, last_active_at, created_at)
- Add `room_id: string` to `Game` type
- Add helper functions: `createRoom()`, `joinRoom(pin)`, `updateRoomTeams(roomId, teams)`, `updateRoomDuration(roomId, minutes)`, `touchRoom(roomId)`, `fetchRoomGames(roomId)`
- `createRoom` generates random 4-digit PIN (1000-9999), retries on collision

### `app/page.tsx`
- **Room gate screen**: When no room is active, show a centered screen with "Create New Room" button and PIN input field + "Join" button. Uses existing theme system.
- **New state**: `room`, `pinInput`, `roomLoading`, `roomError`, `checkingStorage`
- **On mount**: Check localStorage for `"sport-room-pin"` — auto-rejoin if found, load teams/duration from room
- **Teams**: Move from localStorage to Supabase room (`rooms.teams` column). `persistTeams` writes to Supabase instead of localStorage.
- **Duration**: `selectPreset` also calls `updateRoomDuration`
- **All game queries**: Scoped by `room.id` — fetchGames, saveGame (insert + delete)
- **Save game**: Adds `room_id` to insert, calls `touchRoom` on success
- **PIN display**: Show room PIN in the UI (e.g. top area or tab bar)
- **Leave Room**: Button in settings tab — clears localStorage PIN, resets to gate screen
- **Theme**: Stays in localStorage (per-device, not per-room)

### `app/history/page.tsx`
- Delete this file and remove the "History" link from page.tsx (global history no longer makes sense with rooms)

## User Flow
1. First visit → room gate screen (Create / Join)
2. Create → generates PIN, shows it, enters app
3. Join → enter PIN, loads room data (teams, games, duration)
4. Refresh → auto-rejoins via localStorage PIN
5. Multiple devices → same PIN = same shared data
6. Leave Room → returns to gate screen
7. 14 days no activity → room auto-deleted with all its games

## Verification
- Create a room, note PIN
- Add teams, save a game, check results tab
- Open in incognito/another browser, join with same PIN — should see same teams and games
- Refresh page — should auto-rejoin without showing gate
- Click Leave Room — should return to gate screen
- Build passes: `npx next build`
- Push to GitHub, verify Vercel deployment works
