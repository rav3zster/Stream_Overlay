# Root Cause Analysis – VibeOverlay Studio

This document maps out the critical bugs discovered in VibeOverlay Studio's sync engine, database schema, design editor, and asset placement system.

---

## Bug 1: Realtime Synchronization Failure
* **Feature**: Realtime canvas layout and settings propagation.
* **Expected Behaviour**: Modifying elements, switching scenes, or altering counter values updates OBS and other open tabs instantly.
* **Actual Behaviour**: Changes made in the dashboard do not sync to the OBS overlay page unless OBS is refreshed.
* **Root Cause**: The core tables (`settings`, `goals`, `widgets`, `scene_widgets`, `scenes`) were never added to the `supabase_realtime` publication in the database. Supabase failed to publish postgres write events to the client realtime channel.
* **Files involved**: [supabase_migration_v2.sql](file:///d:/Rave/Overlay/supabase_migration_v2.sql)
* **Database tables involved**: `settings`, `goals`, `widgets`, `scene_widgets`, `scenes`
* **Fix applied**: Added database migration statements to register all 5 core tables inside the `supabase_realtime` publication channel.
* **Verification performed**: Verified compilation; verified migration SQL syntax.

---

## Bug 2: Theme Switching Realtime Sync Break
* **Feature**: Swapping visual presets.
* **Expected Behaviour**: Clicking a theme preset in the designer updates the Z-index structures and CSS custom variables on the OBS overlay screen immediately.
* **Actual Behaviour**: Themes apply locally but the OBS overlay remains on the previous theme layout.
* **Root Cause**: Dependent on Bug 1. Because the `settings` table changes were not broadcasted by Supabase, the OBS client subscription handler inside [App.tsx](file:///d:/Rave/Overlay/src/App.tsx) never fired when the theme updated.
* **Files involved**: [supabase_migration_v2.sql](file:///d:/Rave/Overlay/supabase_migration_v2.sql), [App.tsx](file:///d:/Rave/Overlay/src/App.tsx)
* **Database tables involved**: `settings`
* **Fix applied**: Enabled realtime replication on the `settings` table, allowing the channel callback in OBS to receive and apply new theme classes.
* **Verification performed**: Checked build stability.

---

## Bug 3: Settings Overwritten with Null Values
* **Feature**: Syncing scenes, themes, and basic settings.
* **Expected Behaviour**: Moving scenes or switching themes leaves streamer profile configurations (socials handles, avatar settings, animation speeds) untouched.
* **Actual Behaviour**: Changing a scene or theme completely resets the streamer's socials cards, active animation packs, and chat sizing settings to null or empty states in the database.
* **Root Cause**: The `updateDbSettings` helper constructed the `socials` JSONB update payload directly from the `fields` argument. Since scene/theme swaps only pass `{}` as fields, the socials nested attributes evaluated to `undefined`, overwriting existing DB settings with nulls.
* **Files involved**: [dbSync.ts](file:///d:/Rave/Overlay/src/lib/dbSync.ts), [overlayStore.ts](file:///d:/Rave/Overlay/src/store/overlayStore.ts)
* **Database tables involved**: `settings`
* **Fix applied**: Modified settings callers in the store to pass the full current settings state. Rewrote `updateDbSettings` to ensure it merges properties instead of generating undefined properties.
* **Verification performed**: Build builds with 0 errors.

---

## Bug 4: Editor Canvas Custom Layout Sync
* **Feature**: Syncing inspector adjustments (opacity, text stroke, gradients, glow shadows, etc.).
* **Expected Behaviour**: Modifying sliders in the Widget Inspector writes values to Supabase instantly.
* **Actual Behaviour**: Sliders update locally, but the modifications are lost on page refresh unless the user also drags/resizes a widget on the canvas.
* **Root Cause**: `updateWidget` and `updateWidgets` in Zustand only modified local state and never triggered any Supabase writing operations. Positions only saved on canvas drags because the release triggered `pushHistoryState()`.
* **Files involved**: [overlayStore.ts](file:///d:/Rave/Overlay/src/store/overlayStore.ts), [SceneEditor.tsx](file:///d:/Rave/Overlay/src/features/editor/SceneEditor.tsx)
* **Database tables involved**: `scene_widgets`, `widgets`, `widget_styles`
* **Fix applied**: Configured a `skipDbSync` flag in the update actions. Actions now update Supabase immediately by default. Added `true` to `skipDbSync` during canvas drag/resize movements to prevent query flooding, relying on the final history push on `mouseup` to save position coordinates.
* **Verification performed**: Compilation validation.

---

## Bug 5: Advanced Inspector Styles Rendering Gap
* **Feature**: Design engine typography and shape mask rendering.
* **Expected Behaviour**: Designer choices (gradients, glassmorphism, letter spacing, text shadows, shape masks, custom CSS rules) render correctly.
* **Actual Behaviour**: Custom settings are saved in Zustand, but the widget rendering box ignores them.
* **Root Cause**: [WidgetRenderer.tsx](file:///d:/Rave/Overlay/src/widgets/WidgetRenderer.tsx) only mapped basic relational CSS attributes (like `borderRadius`, `background`) and completely lacked mapping code for the advanced properties saved in the `content.settings` JSONB payload.
* **Files involved**: [WidgetRenderer.tsx](file:///d:/Rave/Overlay/src/widgets/WidgetRenderer.tsx)
* **Database tables involved**: `widgets` (settings JSONB)
* **Fix applied**: Programmed CSS property maps for custom gradients, glassmorphism filters, blend modes, shape clips, letter-spacing, text stroke, text shadows, and text gradients. Injected a dynamic `<style>` block matching the container's DOM ID to support raw custom CSS.
* **Verification performed**: Production compilation test.

---

## Bug 6: Group Layer Saving Failure
* **Feature**: Grouping layer folders.
* **Expected Behaviour**: Grouping widgets preserves their folder structure.
* **Actual Behaviour**: Changing groups triggers background database errors and hierarchy collapses on refresh.
* **Root Cause**: The database schema defined `scene_widgets.parent_id` as a UUID column referencing `scene_widgets.id` (self-referential). But the frontend uses custom strings (e.g. `"group-1729..."`), causing PostgreSQL foreign key validation failures.
* **Files involved**: [supabase_migration_v2.sql](file:///d:/Rave/Overlay/supabase_migration_v2.sql)
* **Database tables involved**: `scene_widgets`
* **Fix applied**: Appended SQL commands to drop the self-referential UUID foreign key constraint on `scene_widgets(parent_id)` and altered the column type to `text` to match the virtual string groupings.
* **Verification performed**: Build verification.

---

## Bug 7: Asset Placement Sync Failure
* **Feature**: Catalog resource placement.
* **Expected Behaviour**: Placing an uploaded image/video inserts it into the layout and saves it.
* **Actual Behaviour**: Placed elements disappear when the browser is refreshed.
* **Root Cause**: The local `addMediaWidget` function in [Dashboard.tsx](file:///d:/Rave/Overlay/src/features/admin/Dashboard.tsx) pushed state directly but never called `addDbWidget` to create rows in the `widgets` and `scene_widgets` tables. The batch sync update was a no-op because the keys did not exist in the database.
* **Files involved**: [Dashboard.tsx](file:///d:/Rave/Overlay/src/features/admin/Dashboard.tsx), [overlayStore.ts](file:///d:/Rave/Overlay/src/store/overlayStore.ts)
* **Database tables involved**: `widgets`, `scene_widgets`, `widget_styles`
* **Fix applied**: Created a store action `addMediaWidget` that correctly calls `addDbWidget` to insert entries into Supabase, and updated Dashboard to trigger this action.
* **Verification performed**: Checked compilation.
