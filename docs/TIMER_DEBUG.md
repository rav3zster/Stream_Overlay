# Timer Debug – VibeOverlay Studio

---

## Timer Architecture

The countdown timer has two layers:

### Layer 1: Tick Engine (Local, Per-Tab)
- `startTimerEngine()` is called once from `App.tsx` on boot.
- It runs `setInterval(() => tickTimer(), 1000)` — decrementing `timer.seconds` in Zustand every second.
- This runs **independently in each browser tab/window**. The admin tab and the OBS tab each run their own ticker.
- This means both tabs count down in sync without any DB overhead.

### Layer 2: Control Actions (Admin → Supabase → OBS)
When the admin changes the timer (reset, add time, pause, resume), the change must propagate to OBS. This now goes through Supabase:

```
Admin clicks "Reset Timer 8:30"
        │
        ▼
resetTimer(510) called in overlayStore.ts
        │
        ├── set({ timer: { seconds: 510, isRunning: true, isPaused: false } })  [local]
        │
        └── updateDbTimer(projectId, timer) called in dbSync.ts
                │
                ▼
        settings table UPDATE: timer_seconds=510, timer_is_running=true, timer_is_paused=false
                │
                ▼
        Supabase Realtime broadcasts postgres_changes event
                │
                ▼
        OBS tab App.tsx handler fires:
        useOverlayStore.setState({ timer: { seconds: 510, isRunning: true, isPaused: false } })
                │
                ▼
        OBS timer display immediately shows 8:30
        OBS tick engine continues from 510
```

---

## Timer Columns Added to `settings`

These columns were added in `supabase_migration_v2.sql`:

| Column | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `timer_seconds` | `integer` | `600` | Current countdown value |
| `timer_is_running` | `boolean` | `true` | Whether timer is actively counting |
| `timer_is_paused` | `boolean` | `false` | Whether timer was manually paused |

---

## Before/After Comparison

### Before Fix — resetTimer(510)

1. Admin: `resetTimer(510)` → Zustand set locally ✓
2. Admin: `broadcastState({ timer })` → **no-op** ✗  
3. DB: **No write** ✗  
4. Realtime: **No event** ✗  
5. OBS: **Timer unchanged — still showing whatever value it had on boot** ✗

### After Fix — resetTimer(510)

1. Admin: `resetTimer(510)` → Zustand set locally ✓
2. Admin: `updateDbTimer(projectId, timer)` → DB write to `settings` ✓
3. DB: `timer_seconds=510` persisted ✓
4. Realtime: `postgres_changes` event fires on `settings` ✓
5. OBS: Handler reads `timer_seconds=510` → `setState({ timer })` ✓
6. OBS: Display immediately updates to `8:30` ✓

---

## Timer Actions Verified

| Action | DB Write | OBS Syncs |
| :--- | :---: | :---: |
| `resetTimer(N)` — set to specific value | ✓ `updateDbTimer` | ✓ |
| `addTime(300)` — add 5 minutes | ✓ `updateDbTimer` | ✓ |
| `pauseTimer()` | ✓ `timer_is_paused=true` | ✓ |
| `resumeTimer()` | ✓ `timer_is_running=true` | ✓ |
| `tickTimer()` — per-second local tick | Intentionally local only | n/a |
