# OBS Sync Debug – VibeOverlay Studio

---

## How OBS Reads State

The `/obs` route renders `OBSOverlay.tsx`. It has **no** local realtime subscription — it relies entirely on:

1. `initializeDbSession()` — called from `App.tsx` on mount, loads full project state from Supabase into Zustand.
2. The `postgres_changes` subscription in `App.tsx` — which runs in **every tab** that renders the app (both the admin tab at `/` and the OBS tab at `/obs`).

This design is correct. Both tabs run the same `App.tsx`, maintain independent Zustand stores in their separate JS contexts, and both independently subscribe to the same Supabase realtime channel.

---

## What OBS Was Actually Doing (Before Fix)

| Property | Source Before Fix | Correct Source |
| :--- | :--- | :--- |
| Theme | ✓ Supabase realtime (settings row) | Supabase realtime |
| Current scene | ✓ Supabase realtime (settings row) | Supabase realtime |
| Stream title | ✓ Supabase realtime (settings row) | Supabase realtime |
| Widget layout | ✓ Supabase realtime (scene_widgets) | Supabase realtime |
| Goals | ✓ Supabase realtime (goals) | Supabase realtime |
| **Timer seconds** | ✗ Stale local value from boot — never updated | Supabase realtime |
| **Timer running** | ✗ Stale local value | Supabase realtime |
| **Timer paused** | ✗ Stale local value | Supabase realtime |

---

## OBS Source Configuration

Add the OBS Browser Source with:
- **URL**: `http://localhost:5173/obs` (dev) or your deployed URL + `/obs`
- **Width**: 1920 — **Height**: 1080
- **Custom CSS**: leave blank (transparent background is set in app CSS)
- **Refresh browser when scene becomes active**: ✓ Enabled

---

## Verified Sync Properties After Fix

| Admin Change | DB Write | Realtime Event | OBS Updates |
| :--- | :---: | :---: | :---: |
| Theme switch | `settings.theme` | ✓ `postgres_changes` on `settings` | ✓ Immediate |
| Scene switch | `settings.current_scene` | ✓ | ✓ Immediate |
| Stream title edit | `settings.stream_title` | ✓ | ✓ Immediate |
| Timer reset (e.g. 8:30) | `settings.timer_seconds` | ✓ (new column) | ✓ Immediate |
| Timer pause | `settings.timer_is_running / is_paused` | ✓ | ✓ Immediate |
| Timer +5 min | `settings.timer_seconds` | ✓ | ✓ Immediate |
| Goal update | `goals.current_value / target_value` | ✓ `postgres_changes` on `goals` | ✓ Immediate |
| Widget move/resize | `scene_widgets` row | ✓ | ✓ Immediate |
| Widget style change | `widget_styles` + `widgets` | ✓ triggers `widgets` event | ✓ Immediate |
| Widget visibility | `scene_widgets.visible` | ✓ | ✓ Immediate |
| Opacity | `scene_widgets.opacity` | ✓ | ✓ Immediate |

---

## Remaining Limitation: Timer Ticking

The timer **ticks** (countdown every second) run via `startTimerEngine()` in `App.tsx` — a `setInterval` that calls `tickTimer()` locally every second. This is intentionally **local-only** (not persisted per-tick to avoid 1 DB write/sec). The OBS tab runs its own `startTimerEngine()` from its own `App.tsx` boot, so both tabs tick independently in sync. The timer **value** is only synced when the admin explicitly changes it (reset, add time, pause, resume).
