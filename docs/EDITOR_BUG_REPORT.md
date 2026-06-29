# Editor Stabilization Bug Report

This document records the core bugs identified during the Editor Stabilization Phase, their root causes, files affected, fixes applied, and verification steps.

---

## 1. Widget Position Jumping and Jittering During Drag/Resize/Rotate

* **Problem**: When a user drags, resizes, or rotates a widget on the canvas, the widget instantly flies away to unexpected coordinates or jitters violently on screen.
* **Root Cause**: In React Moveable, dragging and resizing offsets are calculated relative to the start position of the current interaction. In our previous event handlers:
  * On drag, we added the translate delta directly to the live coordinate: `widget.x + beforeTranslate[0]`.
  * Because Zustand state mutations trigger immediate component re-renders, the next animation frame calculated a new offset relative to the *already updated* position, creating an exponential position drift.
* **Affected Files**:
  * [EditorCanvas.tsx](file:///d:/Rave/Overlay/src/editor/canvas/EditorCanvas.tsx)
* **Fix Applied**:
  * Seeded initial coordinates on interaction start using Moveable's `onDragStart`, `onResizeStart`, and `onRotateStart` event hooks.
  * Used `dragStart.set([widget.x, widget.y])` so Moveable computes translations cumulatively relative to the stable coordinate at start-of-drag.
  * In the drag/resize events, we set the coordinate directly to the absolute value returned by the transform matrix instead of adding delta to store values.
* **Verification Steps**:
  * Verified widget dragging follows the mouse precisely, maintaining a 1:1 anchor without jumping.
  * Verified resizing works correctly from all 8 directions.

---

## 2. Percentage vs. Absolute Pixel Coordinate Mismatch

* **Problem**: Database placements loaded from Supabase rendered at tiny values (like `left: 29px`) or jumped to completely incorrect areas of the canvas.
* **Root Cause**: The legacy database tables stored placements using double-precision values representable as percentages (e.g., `width: 41.6%` on screen). However, the new canvas engine operates on absolute pixel coordinates targeting a virtual `1920x1080` canvas stage.
* **Affected Files**:
  * [sessionStore.ts](file:///d:/Rave/Overlay/src/store/sessionStore.ts)
  * [WidgetRenderer.tsx](file:///d:/Rave/Overlay/src/widgets/WidgetRenderer.tsx)
* **Fix Applied**:
  * Implemented a legacy normalizer in `sessionStore.ts` during project boot. If loaded widget dimensions are `width <= 100` and `height <= 100`, they are classified as legacy percentages and mapped to absolute pixels:
    $$\text{x\_pixel} = \frac{\text{db\_x}}{100} \times 1920$$
  * Updated `WidgetRenderer.tsx` container styles to position and size utilizing pixel values (`px`) rather than percentage values (`%`).
  * Updated typography styles to render `font-size` in `px` instead of `vw`, ensuring font sizes do not jitter or resize on panel expansion.
* **Verification Steps**:
  * Legacy overlays now boot correctly, scaling legibly to fit the 1920x1080 bounds.
  * Changes saved using `saveScene` are pushed to database in stable absolute pixels.

---

## 3. Discrepancies Between Canvas Editor and OBS Preview

* **Problem**: The canvas editor rendered simple placeholder icons (`⏱`, `💬`, `🎵`) for widgets, while OBS rendered actual content, leading to a disconnected design experience.
* **Root Cause**: The canvas was wired to `WidgetPlaceholder` instead of referencing the actual `WidgetRenderer` widget components.
* **Affected Files**:
  * [EditorCanvas.tsx](file:///d:/Rave/Overlay/src/editor/canvas/EditorCanvas.tsx)
  * [OBSOverlay.tsx](file:///d:/Rave/Overlay/src/features/overlay/OBSOverlay.tsx)
  * [index.css](file:///d:/Rave/Overlay/src/index.css)
* **Fix Applied**:
  * Replaced `WidgetPlaceholder` inside `CanvasWidget` with `<WidgetRenderer widget={widget} isEditor={true} />`.
  * Added CSS overrides to `index.css` forcing the nested widget container of `WidgetRenderer` to fit inside the moveable boundary box (`left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; transform: none !important; position: relative !important;`).
  * Wired `OBSOverlay.tsx` to use the same `WidgetRenderer` component, unifying renderers.
* **Verification Steps**:
  * Clocks, countdown timers, and chat boxes now display real previews on the canvas.
  * Preview matches OBS exactly.

---

## 4. Inconsistent Layer Selection and Missing Multi-Select

* **Problem**: Clicking empty canvas background failed to clear selection, and selecting multiple widgets simultaneously was not supported.
* **Root Cause**: Rubber-band selection was not implemented on the empty canvas space.
* **Affected Files**:
  * [EditorCanvas.tsx](file:///d:/Rave/Overlay/src/editor/canvas/EditorCanvas.tsx)
  * [index.css](file:///d:/Rave/Overlay/src/index.css)
* **Fix Applied**:
  * Added mouse position translation from screen pixels to unscaled canvas pixels using stage bounding client rect: `(clientX - rect.left) / zoom`.
  * Built rubber-band select box on canvas background. Mouse dragging creates a selection rectangle and multi-selects all intersecting widgets on mouseUp.
* **Verification Steps**:
  * Clicking canvas background clears selection.
  * Drag-to-select lasso boxes select widgets inside bounds correctly.
