# Realtime Sync Trace – VibeOverlay Studio

Verified execution path from Admin UI change → OBS re-render.

---

## Architecture Diagram

```
Admin Dashboard (localhost:5173/)
        │
        ▼  React event fires (e.g. theme card click, timer reset)
Zustand Action (setTheme / resetTimer / updateSettings / updateGoal)
        │
        ▼  Zustand state mutated locally
updateDbSettings / updateDbTimer / updateDbGoal called in dbSync.ts
        │
        ▼  Supabase REST API: table UPDATE
settings / goals / widgets / scene_widgets row changed
        │
        ▼  PostgreSQL WAL replication (requires supabase_realtime publication membership)
Supabase Realtime Broadcast Event
        │
        ▼  OBS tab (localhost:5173/obs) receives postgres_changes event
App.tsx channel subscriber (.on 'postgres_changes' ...)
        │
        ▼  useOverlayStore.setState({ theme, timer, settings, ... })
Zustand store updated in OBS tab
        │
        ▼  React re-renders OBSOverlay, WidgetRenderer, TimerWidget, etc.
Visible change on screen in OBS browser source
```

---

## Chain Verification Table

| Step | Element | Status Before Fix | Status After Fix |
| :--- | :--- | :---: | :---: |
| 1 | Admin UI button/slider responds to click | ✓ | ✓ |
| 2 | Zustand action called | ✓ | ✓ |
| 3 | Local store updates | ✓ | ✓ |
| 4 | `settings` table `UPDATE` fires | ✓ (settings) / ✗ (timer) | ✓ |
| 5 | `goals` table `UPDATE` fires | ✓ | ✓ |
| 6 | `scene_widgets` `UPDATE` fires | ✓ | ✓ |
| 7 | `supabase_realtime` publication includes the table | ✗ (not added) | ✓ (migration v2) |
| 8 | OBS tab receives postgres_changes event | ✓ (if step 7 passes) | ✓ |
| 9 | Payload contains `timer_seconds` / `timer_is_running` | ✗ (column didn't exist) | ✓ |
| 10 | OBS Zustand store updated with timer | ✗ (not in handler) | ✓ |
| 11 | OBS components re-render | ✓ | ✓ |
| 12 | OBS visual changes immediately | ✗ | ✓ |

---

## Critical Failures Found

### Failure 1: Timer Was Not Persisted to Supabase

**Expected**: `resetTimer(8*60)` writes new seconds to the DB so OBS receives it.  
**Actual**: `resetTimer` called `broadcastState()` which was a no-op stub body (`{}`). Timer never wrote to DB. OBS never received the change.

**Fix**: All four timer mutators (`addTime`, `pauseTimer`, `resumeTimer`, `resetTimer`) now call `updateDbTimer(projectId, timer)` after mutating local state.

### Failure 2: `broadcastState` Was a No-op

**Expected**: `broadcastState({ timer })` sends a sync message to other tabs.  
**Actual**: The function body was empty — nothing was sent.

**Fix**: Timer actions now call `updateDbTimer` directly instead of relying on `broadcastState`. Theme/settings changes already called `updateDbSettings` correctly.

### Failure 3: `settings` Table Missing `timer_seconds` Column

**Expected**: Timer state can be stored in `settings` and broadcast via realtime.  
**Actual**: Columns `timer_seconds`, `timer_is_running`, `timer_is_paused` did not exist.

**Fix**: `supabase_migration_v2.sql` now adds these columns with `ADD COLUMN IF NOT EXISTS` guards.

### Failure 4: `supabase_realtime` Publication Missing Core Tables

**Expected**: Settings row changes broadcast to OBS tab.  
**Actual**: `settings`, `goals`, `widgets`, `scene_widgets`, `scenes` were not in the `supabase_realtime` publication. Events were never emitted.

**Fix**: Migration v2 adds all tables to the publication using a catalog-safe PL/pgSQL loop.

### Failure 5: Realtime Handler Ignored Timer Fields

**Expected**: When OBS tab receives a `settings` change event, it reads timer columns.  
**Actual**: The `postgres_changes` handler in `App.tsx` only read `theme`, `current_scene`, and `settings.*`. Timer fields were completely ignored even if they arrived.

**Fix**: The handler now reads `timer_seconds`, `timer_is_running`, `timer_is_paused` from `payload.new` and calls `useOverlayStore.setState({ timer: timerUpdate })`.

### Failure 6: OBS Tab Did Not Load Timer on Mount

**Expected**: OBS tab boots with correct timer value from DB.  
**Actual**: `fetchProjectData` returned `DbProjectData` without a `timer` field. `initializeDbSession` didn't hydrate `timer` from DB.

**Fix**: `DbProjectData` interface now includes `timer: OverlayTimer`. `fetchProjectData` reads `timer_seconds/is_running/is_paused` from the settings row and returns them. `initializeDbSession` now sets `timer: data.timer` on boot.
