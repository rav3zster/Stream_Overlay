# Performance Audit – VibeOverlay Studio

This document reviews rendering bottlenecks, state management inefficiencies, resource overheads, and database write patterns within VibeOverlay Studio.

---

## 1. Multi-Widget Canvas Re-Renders on Drag
* **Problem**: When a user drags a widget inside [SceneEditor.tsx](file:///d:/Rave/Overlay/src/features/editor/SceneEditor.tsx), the `mousemove` event triggers `updateWidgets` in the Zustand store. This updates the global coordinates (`x`, `y`) on every frame, forcing the entire `SceneEditor` canvas, all child widgets, outline wrappers, and sidebars to re-render 60+ times per second.
* **Why it matters**: On complex scenes containing 15+ elements (images, chat boxes, Vtuber avatars), this causes noticeable stuttering, cursor lag, and frame drops.
* **Recommended solution**: Decouple dragging coordinates from the React render lifecycle. During the drag gesture, update the DOM elements' positions directly using native CSS `style.transform` properties. Commit the final position back to the Zustand store/database only once on `mouseup`.
* **Estimated implementation complexity**: High (4 hours)
* **Priority**: **Critical**

---

## 2. Excessive Database Writes During Resize/Drag Gestures
* **Problem**: The db synchronization syncs coordinates shifts to Supabase. If these are saved in real-time on every mouse move, the client floods Supabase with REST/Realtime database write transactions (often 100+ requests per second).
* **Why it matters**: This leads to rapid API rate-limiting, database performance degradation, high server costs, and potential data-sync corruption.
* **Recommended solution**: Debounce Supabase database writes. Alternatively, buffer placement updates and sync them to Supabase only on `mouseup` or gesture end.
* **Estimated implementation complexity**: Medium (2 hours)
* **Priority**: **Critical**

---

## 3. Monolithic Component Re-evaluations
* **Problem**: [Dashboard.tsx](file:///d:/Rave/Overlay/src/features/admin/Dashboard.tsx) is a large monolithic component (1200+ lines) containing the states for assets, schedule items, goal inputs, chat simulators, AI prompts, and stream preferences. A small local text update inside a chat box re-runs the entire render function of the dashboard.
* **Why it matters**: This leads to layout lag, inputs losing focus, and unnecessary CPU load.
* **Recommended solution**: Refactor the dashboard into discrete, isolated React components. For example, export `StreamSettings`, `AssetManager`, `GoalEditor`, and `AIChatCompanion` into separate sub-features.
* **Estimated implementation complexity**: High (5-6 hours)
* **Priority**: **High**

---

## 4. Zustand Selection Mapping Subscriptions
* **Problem**: Several panels subscribe to massive store slices, e.g. `const widgets = useOverlayStore(s => s.sceneWidgets[activeScene] || [])` or `useOverlayStore(s => s)`.
* **Why it matters**: Any change to *any* widget or setting triggers re-renders across all active components.
* **Recommended solution**: Implement precise selectors when subscribing. E.g., components should only listen to specific properties (e.g. `useOverlayStore(s => s.selectedWidgetId)`) rather than referencing state structures globally.
* **Estimated implementation complexity**: Medium (3 hours)
* **Priority**: **High**

---

## 5. Potential Memory Leaks in Particle Background Animations
* **Problem**: The OBS Overlay's particle simulator hooks onto `requestAnimationFrame`. If the theme or scene switches rapidly, old loops may continue running if cleanup hooks aren't fully absolute.
* **Why it matters**: Can slowly cause page lag, crashing the OBS browser source over extended stream broadcasts.
* **Recommended solution**: Ensure the unmount hook in `OBSOverlay.tsx` explicitly invalidates the canvas loop handle, and cancel any active drawing frame references on cleanup.
* **Estimated implementation complexity**: Low (1 hour)
* **Priority**: **High**
