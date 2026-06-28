# UX Audit – VibeOverlay Studio

This document contains a comprehensive analysis of the user experience (UX) gaps in VibeOverlay Studio. To make this application feel like a professional design suite (e.g., Canva or Figma), we must critique the interface from the perspective of design workflows.

---

## 1. Missing Canvas Context Menu
* **Problem**: Right-clicking on the Scene Editor canvas or individual widgets opens the browser's default context menu rather than designer tools (Copy, Paste, Duplicate, Lock, Hide, Group, Bring to Front, Send to Back).
* **Why it matters**: Designers expect swift workflows. Forcing users to target a tiny floating toolbar or open the sidebar to execute basic operations creates unnecessary friction and feels cheap.
* **Recommended solution**: Implement a custom floating React context menu. Intercept `onContextMenu` in the editor workspace, detect the active target, and offer quick layer/order operations.
* **Estimated implementation complexity**: Medium (2-3 hours)
* **Priority**: **High**

---

## 2. Lack of Direct Canvas Drag-and-Drop Uploader
* **Problem**: Files can only be uploaded by opening the "Assets" tab and clicking the dotted upload button. Dragging a file directly onto the canvas does nothing.
* **Why it matters**: A core paradigm in Canva and Figma is dragging a PNG/GIF/SVG/MP4 from your desktop directly onto the canvas and having it instantly place at the drop coordinate.
* **Recommended solution**: Bind drag-and-drop listener utilities to the `SceneEditor` canvas wrapper. Detect drop events, initiate a file upload to Supabase Storage, and immediately place a corresponding media widget at the drop coordinates.
* **Estimated implementation complexity**: Medium (3-4 hours)
* **Priority**: **High**

---

## 3. Absence of Auto-Save & Sync Status Indicators
* **Problem**: When widgets are dragged, text is edited, or themes are applied, the application auto-saves changes to Supabase in the background, but there is no visual indicator.
* **Why it matters**: Designers get anxious about data loss. Without a "Saving changes..." or "All changes saved to cloud" cloud icon/status indicator, users feel insecure about closed tabs.
* **Recommended solution**: Add a small status indicator in the top navbar (next to the stream title) that transitions between states: "Saving..." (pulsing amber/cyan) and "Saved" (steady green checkmark).
* **Estimated implementation complexity**: Low (1 hour)
* **Priority**: **Medium**

---

## 4. No Interactive Undo/Redo State History List
* **Problem**: Users can undo and redo with keyboard shortcuts or toolbar buttons, but they have no visibility into what they are undoing or how many history states remain.
* **Why it matters**: Large layout edits can be catastrophic. Designers need to see a historical list of recent operations (e.g., "Moved vtuber box", "Changed border stroke", "Grouped alerts") to revert confidently.
* **Recommended solution**: Provide a small collapsible "History" panel or tooltip showing the stack of previous actions.
* **Estimated implementation complexity**: Medium (2 hours)
* **Priority**: **Low**

---

## 5. Inconsistent Tooltip and Shortcut Guides
* **Problem**: Interactive icons (alignment vectors, lock, visibility, layering, grid toggle) lack tooltips. Hovering over them does not reveal what they do or their keyboard shortcut mappings (e.g., `Ctrl+Z`, `Ctrl+D`).
* **Why it matters**: It increases cognitive load and slows down user onboarding.
* **Recommended solution**: Wrap toolbar and layer buttons in a reusable custom `<Tooltip content="..." hotkey="..." />` component.
* **Estimated implementation complexity**: Low (1.5 hours)
* **Priority**: **Medium**

---

## 6. Lack of Quick Scene Renaming and Duplication
* **Problem**: Scenes are treated as static categories in the sidebar. Users cannot easily duplicate an entire scene layout to test variations, nor can they create or rename custom scenes easily.
* **Why it matters**: Streamers want custom layouts for specific games or holiday themes (e.g., "Gameplay - Valorant" vs "Gameplay - Hollow Knight").
* **Recommended solution**: Add duplicate, delete, and rename button triggers directly onto the sidebar Scene controller items.
* **Estimated implementation complexity**: Medium (2 hours)
* **Priority**: **High**
