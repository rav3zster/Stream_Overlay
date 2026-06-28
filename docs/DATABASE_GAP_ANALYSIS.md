# Database Gap Analysis – VibeOverlay Studio

This document analyzes the gaps between VibeOverlay Studio’s active client application state, the JSON configurations manipulated by the designer tools, and the PostgreSQL schema defined in Supabase (`supabase_schema.sql` and `supabase_migration_v2.sql`).

---

## 1. Style Schema Mismatch: Strict Columns vs. JSONB
* **Problem**: [WidgetInspector.tsx](file:///d:/Rave/Overlay/src/features/admin/WidgetInspector.tsx) configures over 30 advanced appearance, layout, and typography properties (e.g. `glassEffect`, `gradient`, `letterSpacing`, `textStrokeColor`, `customCss`, `aspectRatioLock`). However, the `widget_styles` table only contains columns for basic properties (`border_radius`, `background`, `border_size`, `border_color`, etc.).
* **Why it matters**: To circumvent database errors, the frontend currently stores these advanced properties inside the `widgets.content.settings` JSONB payload. This creates data duplication and schema fragmentation: basic properties live in relational columns of `widget_styles`, while advanced properties are forced into the widget JSONB structure.
* **Recommended solution**: Add an `advanced_styles jsonb` column to the `widget_styles` table to capture all new visual settings in a single unified container, or expand the columns to fully support the design engine.
* **Estimated implementation complexity**: Medium (2 hours)
* **Priority**: **High**

---

## 2. Widget Group Folder Names Kept in LocalStorage Only
* **Problem**: Although `supabase_migration_v2.sql` defines the `widget_groups` table to map nested folders in the Layers Panel, the frontend in [LayerPanel.tsx](file:///d:/Rave/Overlay/src/features/admin/LayerPanel.tsx) relies on `localStorage` to save custom folder names:
  ```typescript
  const [groupNames, setGroupNames] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('vibe_group_names');
    return saved ? JSON.parse(saved) : {};
  });
  ```
* **Why it matters**: Folder names and structural groupings do not persist across computers. If a streamer edits their overlay layout on their gaming PC and opens the dashboard on a laptop, all custom folder titles revert to default names.
* **Recommended solution**: Wire the `LayerPanel` groups directly to the `widget_groups` table. Hydrate group names in `fetchProjectData` and insert/update rows when folders are renamed or created.
* **Estimated implementation complexity**: Medium (3 hours)
* **Priority**: **High**

---

## 3. Lack of Saved Widget Template Presets Schema
* **Problem**: The dashboard permits saving customized widgets as templates:
  ```typescript
  saveTemplate: (name) => { ... }
  ```
  However, these presets are currently saved in a temporary local React state and do not hook into the `templates` and `template_widgets` tables in Supabase.
* **Why it matters**: Users lose their custom widget templates upon browser logout or cookie deletion.
* **Recommended solution**: Implement save/load functions inside [dbSync.ts](file:///d:/Rave/Overlay/src/lib/dbSync.ts) that map to the `templates` and `template_widgets` tables in Supabase.
* **Estimated implementation complexity**: Medium (2.5 hours)
* **Priority**: **Medium**

---

## 4. No Storage Mapping for Custom User Fonts
* **Problem**: The uploader allows uploading font files (`.ttf`, `.woff`, `.woff2`) to Supabase Storage, but there is no relational mapping or registry in the database to load these files via CSS `@font-face` automatically on the OBS overlay screen.
* **Why it matters**: Uploaded fonts are useless if the editor canvas and the OBS browser source do not register and apply them dynamically to text layers.
* **Recommended solution**: Create a `project_fonts` table to register uploaded storage paths. Inject a dynamic stylesheet with `@font-face` rules on both the Editor and OBS canvas frames during initialization.
* **Estimated implementation complexity**: High (4 hours)
* **Priority**: **High**
