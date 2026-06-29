# Coordinate System Analysis – VibeOverlay Studio

This document provides a detailed breakdown of the coordinate system architecture in VibeOverlay Studio 2.0. It defines the relationships between the physical screen space, the virtual editor canvas, the zoom/pan state, and the OBS renderer, along with the mathematical transforms used to bridge them.

---

## 1. Coordinate Space Definitions

The application manages visual placements across three distinct coordinate spaces:

| Coordinate Space | Reference Frame | Dimensions | Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Screen Space** | Viewport Window | Variable | `px` | Raw browser pixels relative to top-left of screen. Used by raw pointer events (`clientX`, `clientY`). |
| **Virtual Stage Space** | 16:9 Canvas Stage | `1920 × 1080` | `px` (Virtual) | Native coordinates of the design. All database entries are persisted in this space. |
| **OBS Canvas Space** | OBS Browser Source | Variable (e.g., 1080p, 4k) | `px` (Physical) | Output viewport for stream renderers. Automatically scales from the 1920x1080 virtual layout. |

---

## 2. Mathematical Transformations

### A. Zoom and Pan Scaling
The editor canvas wrapper is translated in screen space by pan offsets, and the stage is scaled from the top-left origin by the zoom factor.

* **Pan Transform** (applied via CSS `translate` on the wrapper):
  $$\text{CSS Translation} = \text{translate}(P_x \text{ px}, P_y \text{ px})$$
* **Zoom Transform** (applied via CSS `scale` on the stage):
  $$\text{CSS Scale} = \text{scale}(Z)$$

Where $P_x, P_y$ represent the horizontal and vertical panning offsets, and $Z$ represents the zoom multiplier (e.g., `0.75` for $75\%$).

---

### B. Pointer Coordinate Translation (Screen to Stage)
To handle interactions like clicks, drags, and lasso box selections, mouse events in screen space must be projected onto the virtual $1920 \times 1080$ stage coordinate system. 

The translation function maps a viewport cursor coordinate $(S_x, S_y)$ to a virtual stage coordinate $(C_x, C_y)$ using the bounding client rect of the stage:

$$C_x = \frac{S_x - R_{\text{left}}}{Z}$$

$$C_y = \frac{S_y - R_{\text{top}}}{Z}$$

Where:
* $S_x, S_y$ are the screen mouse pointer coordinates (`e.clientX`, `e.clientY`).
* $R_{\text{left}}, R_{\text{top}}$ are the viewport coordinates of the stage boundary's top-left corner (`stage.getBoundingClientRect()`).
* $Z$ is the current canvas zoom level.

This formula ensures that regardless of the current zoom level or pan offset, clicking on the canvas translates to the exact virtual pixel coordinates of the overlay layout.

---

## 3. Legacy Percentage-to-Pixel Normalization

### The Issue
Legacy database schemas stored widget boundaries as raw percentages relative to the screen width and height (e.g., `width: 25.5` representing $25.5\%$). The new canvas editor operates exclusively in absolute pixel dimensions on a virtual $1920 \times 1080$ screen to prevent layout shifts.

### The Math
During project session initialization (`sessionStore.ts`), coordinates are analyzed. If loaded placements exhibit width and height values $\le 100$, they are classified as legacy percentages and mapped to absolute pixels:

$$X_{\text{pixel}} = \text{round}\left( \frac{X_{\text{db}}}{100} \times 1920 \right)$$

$$Y_{\text{pixel}} = \text{round}\left( \frac{Y_{\text{db}}}{100} \times 1080 \right)$$

$$W_{\text{pixel}} = \text{round}\left( \frac{W_{\text{db}}}{100} \times 1920 \right)$$

$$H_{\text{pixel}} = \text{round}\left( \frac{H_{\text{db}}}{100} \times 1080 \right)$$

This conversion is performed strictly once during load time, and the layout is subsequently saved and mutated in stable virtual absolute pixels, safeguarding coordinate precision.

---

## 4. OBS Render Scale Transformation

When rendering inside OBS Studio as a Browser Source (`OBSOverlay.tsx`), the canvas must conform to whatever resolution the streamer configures the browser source source window to (e.g., `1280x720`, `1920x1080`, or custom). 

To guarantee pixel-perfect layout replication without rounding errors:
1. The overlay container renders at a fixed virtual size of $1920 \times 1080$ pixels.
2. A window resize listener automatically calculates scale factors:
   $$S_w = \frac{\text{window.innerWidth}}{1920}$$
   $$S_h = \frac{\text{window.innerHeight}}{1080}$$
3. The container scales itself using CSS `transform: scale(Sw, Sh)` relative to `top left`.

This approach ensures zero component wrapping shifts, and matches the OBS layout exactly with the designer's canvas.
