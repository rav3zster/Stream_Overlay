# Theme Engine Debug Guide – VibeOverlay Studio

This document clarifies how the unified design engine generates and renders the unique visual languages of the presets available in VibeOverlay Studio.

---

## 1. Visual Language & Shape Profiles

Theme profiles are mapped dynamically in [themes.ts](file:///d:/Rave/Overlay/src/lib/themes.ts) using `getThemeProfile(theme)`. The profiles determine visual parameters, borders, typography, and box shadows in [WidgetRenderer.tsx](file:///d:/Rave/Overlay/src/widgets/WidgetRenderer.tsx).

| Visual Profile | Typographic Scale | Border Style & Outlines | Box Shadows & Glow Filters | Spacing & Spanning | Special Effects |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cyber (Cyber Synth, Tokyo Night)** | Orbitron (Display), Share Tech Mono (Body) | Solid neon border (`#A855F7` / `#FF4DFF`) | Outer neon drops (`0 0 12px var(--accent-primary)`) | Wide pads (8px-12px) | Grid scanline overlays, neon pulse loop animations |
| **Retro (Retro CRT)** | VT323 / Courier (Display), Share Tech Mono | Solid glowing green (`#33ff33`) | Inset cathode-ray line blurs | Raw monospace padding | CRT scanline filter overlay |
| **Cozy (Lo-Fi cafe, Anime Room)** | Comfortaa / Quicksand, Outfit (Body) | Thin rounded borders (`#FBCFE8`) | Soft blurred ambient drops | Large margins, cozy layouts | Polaroids, warm ambient backdrop filters |
| **Minimal (Modern Clean)** | Inter (Sans), Inter (Body) | Hairline borders (`#334155` / `#e2e8f0`) | Flat micro shadows (`0 2px 4px rgba(0,0,0,0.02)`) | High-density grids, low padding | Clean flat solid fills, no glowing text |
| **Glassmorphism** | Outfit (Sans), Outfit (Body) | Translucent white lines (`rgba(255,255,255,0.15)`) | Soft depth drops | Floating layers | High frosted glass blur (`backdrop-filter: blur(16px)`) |
| **Neumorphism** | Inter (Sans), Inter (Body) | Borderless | Extruded light & dark shadow curves | Soft rounded card margins | Double drop-shadow 3D relief effect |
| **Racing (McLaren, Ferrari)** | Space Grotesk / Orbitron | Vector Telemetry SVG borders | Dark drop shadows | Angular beveled cells | Dynamic SVG polygonal brackets, clip paths |
| **Gulf (Porsche Gulf)** | Cinzel Decorative (Serif), Lora | Thick orange outlines (`#ff5800`) | Warm racing banner shadows | Oval structures | Checkered racing flag motifs |
| **Luxury (Luxury Gold)** | Cinzel Decorative, Lora (Serif) | Inset metallic gold borders (`#d4af37`) | High contrast black drops | Tight fit framing | Royal wax seal decorations |
| **Planets (Pastel Planets)** | Space Grotesk, Outfit | Medium light-purple borders | Floating outer glow clouds | Rounded bubbles | Floating vector stars & spaceship details |
| **Cyber HUD** | Orbitron, Share Tech Mono | Sharp cyan outline accents | High blur neon cyan | Corner bracket layouts | Technical crosshairs, HUD scanner lines |

---

## 2. Troubleshooting CSS Theme Injection

If selecting a theme does not alter the appearance of your widgets, verify this chain:
1. **Body / Canvas Theme Class**:
   Inspect the DOM to verify the container element has the target theme class injected:
   ```html
   <div id="overlay-canvas" class="theme-cyber-synth ...">
   ```
2. **CSS Variables Cascade**:
   Confirm that CSS custom properties are resolving correctly. Check your browser style inspector for properties like `var(--accent-primary)` and ensure they resolve to the hex code defined in your theme classes within `src/index.css`.
3. **Advanced Parameters Mapping**:
   For properties like shape masks (`clipPath`) and glass overlays (`backdropFilter`), confirm that the theme profile maps correctly inside [WidgetRenderer.tsx](file:///d:/Rave/Overlay/src/widgets/WidgetRenderer.tsx) and does not get overridden by custom user layout style rules.
