# Premium Polish Checklist – VibeOverlay Studio

This checklist outlines the visual refinements, micro-interactions, and interface polishes required to elevate VibeOverlay Studio to the standard of Canva, Figma, and Adobe Express.

---

## 1. Canvas Interactions & Selection Polish
* [ ] **Animated Bounding Outlines**: Make active selection borders animated (e.g., a dashed border with a slow linear scroll effect, commonly referred to as "marching ants").
* [ ] **Hover Outlines**: Draw a thin, solid cyan border (opacity 0.4) around unselected widgets when the cursor hovers over them to indicate clickability.
* [ ] **Alt + Drag Duplication**: Support pressing the `Alt` key while dragging an element to immediately clone it on the canvas.
* [ ] **Nudge Acceleration**: Ensure that pressing `Shift + Arrow Keys` nudges elements by exactly 10% (or 10px) instead of 5px, and standard arrow keys nudge by 1px for high-precision alignments.
* [ ] **Middle Mouse Panning & Space Drag**: Improve canvas navigation by letting users hold `Space` and drag the mouse, or press the scroll wheel to pan the workspace.

---

## 2. Editor Toolbar & Context Menus
* [ ] **Floating Right-Click Menu**: Implement a styled context menu containing:
  * Duplicate (`Ctrl+D`)
  * Group (`Ctrl+G`)
  * Ungroup (`Ctrl+Shift+G`)
  * Lock / Unlock (`Ctrl+L`)
  * Hide / Show
  * Delete (`Delete`)
* [ ] **Auto-Save Sync Status Indicator**: Place a cloud icon in the header bar showing:
  * 🔄 *Saving...* (Synchronizing with Supabase)
  * ✅ *Saved to Cloud* (Idle)
* [ ] **Alignment & Distribution Toolbar Tooltips**: Add descriptive hover states showing keyboard shortcuts.

---

## 3. Custom Assets Catalog
* [ ] **Direct Canvas Drag-and-Drop Dropzone**: Let designers drag graphic assets from their file manager directly onto the canvas, placing them at the drop location coordinates.
* [ ] **Asset Playback Trim Sliders**: Add start/end trimming sliders for custom MP4 videos and loop playback checkboxes.
* [ ] **Dynamic Custom Fonts (@font-face)**: Inject dynamic stylesheet descriptors to load uploaded `.ttf` or `.woff` fonts onto the canvas editor and the OBS overlay.

---

## 4. Unified Design System Themes
Audit every theme to ensure they change the entire visual language:
* [ ] **Cyber Synth**: Beveled borders, glowing neon shadows, Orbitron typography, and flashing grid scanlines.
* [ ] **Neumorphic**: Soft, extruded drop shadows and inset light reflections mimicking 3D plastic components.
* [ ] **Glassmorphism**: High frosted-glass backdrop-blur filters, white border outlines, and floating color blobs.
* [ ] **Cozy / Lo-fi**: Thick rounded borders, handwriting/cozy serif fonts, and warm ambient light filters.
* [ ] **McLaren / Porsche Gulf / Mercedes**: Sleek italicized font faces, racing carbon grids, and sharp angled headers.
