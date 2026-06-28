# Theme Debug – VibeOverlay Studio

---

## Theme Change Data Flow

```
Admin clicks theme card (e.g. "Tokyo Night")
        │
        ▼
setTheme('tokyo-night') in overlayStore.ts
        │
        ├── set({ theme: 'tokyo-night' })               [local Zustand]
        ├── getThemeLayoutPreset(theme, scene) called   [applies layout presets]
        ├── replaceDbSceneWidgets(projectId, ...)       [syncs layout to DB]
        │
        └── updateDbSettings(projectId, settings, scene, theme)
                │
                ▼
        settings table UPDATE: theme='tokyo-night'
                │
                ▼
        Supabase Realtime → postgres_changes on 'settings'
                │
                ▼
        OBS App.tsx handler: useOverlayStore.setState({ theme: 'tokyo-night' })
                │
                ▼
        OBSOverlay: className={`theme-${theme} ...`} becomes `theme-tokyo-night`
                │
                ▼
        CSS variables cascade: --accent-primary, --font-display, etc. switch
                │
                ▼
        WidgetRenderer reads theme profile → applies new box-shadows, border colors, gradients
                │
                ▼
        Canvas particle effect re-renders with new theme particle style
```

---

## CSS Variable Cascade

The theme class is applied to the root `#overlay-canvas` container:

```tsx
<div
  id="overlay-canvas"
  className={`theme-${theme} w-full h-screen relative overflow-hidden`}
>
```

Each theme class in `src/index.css` defines CSS custom properties:

```css
.theme-tokyo-night {
  --accent-primary: #FF4DFF;
  --accent-secondary: #5CFFE2;
  --bg-primary: #0D0D1A;
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Share Tech Mono', monospace;
  /* ... */
}
```

All widgets inherit these variables via `var(--accent-primary)` etc. in their rendered styles.

---

## Theme Switching: What Was Verified

| Step | Component | Verified |
| :--- | :--- | :---: |
| Theme card click | Dashboard `ThemeSelector` | ✓ |
| `setTheme()` called | `overlayStore.ts` | ✓ |
| Local Zustand updates | OBSOverlay re-renders | ✓ |
| `updateDbSettings` called with new theme | `dbSync.ts` | ✓ |
| `settings.theme` column updated in Supabase | Database | ✓ |
| Realtime event fires (requires publication membership) | Supabase | ✓ (post-migration) |
| OBS tab receives event | `App.tsx` subscriber | ✓ |
| OBS `theme` state updates | Zustand | ✓ |
| `OBSOverlay` root div class changes | DOM | ✓ |
| CSS variables cascade to new theme | Style Inspector | ✓ |
| Widget borders/colors/fonts change | Visual | ✓ |
| Canvas particle effects change | Canvas animation | ✓ |

---

## Theme Layout Presets

When a theme is switched, `getThemeLayoutPreset(theme, scene)` from `src/lib/themes.ts` returns a list of widget layout configs specific to that theme. These are:

- Merged onto existing widgets of the same type (preserving content)
- Added as new widgets if no match exists
- Synced to Supabase via `replaceDbSceneWidgets`
- Broadcast to OBS via the `scene_widgets` realtime subscription

This means theme-specific layouts (e.g. Tokyo Night uses Orbitron fonts, neon borders) apply immediately on both Admin and OBS.

---

## Root Cause: Why Themes Didn't Update OBS Before

The theme was written to the DB correctly via `updateDbSettings`, but the `settings` table was **not a member of the `supabase_realtime` publication**. This meant Postgres never emitted a broadcast event, and the OBS tab never received the `postgres_changes` notification.

**Fix**: `supabase_migration_v2.sql` adds `settings` to the publication via the idempotent PL/pgSQL loop:
```sql
execute format('alter publication supabase_realtime add table %I', t_name);
```
