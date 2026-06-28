# Realtime Synchronization Debug Guide – VibeOverlay Studio

This document explains the technical layout of the VibeOverlay Studio Supabase Realtime synchronization layer, identifying how changes propagate from the Admin Dashboard to the OBS overlay and other client sessions.

---

## 1. Synchronization Architecture

VibeOverlay Studio utilizes a hybrid replication strategy:
* **PostgreSQL Replication (Write/Sync)**: Standard actions (moving layout, renaming layers, updating settings) execute SQL queries directly against Supabase. Supabase then publishes these data transactions to the realtime channel.
* **Client Channels (Subscribe/Render)**: Both the Editor Canvas and the OBS browser source subscribe to a shared channel matching the project ID: `project-sync:${projectId}`.

```
[Dashboard Admin Edit]
        │
        ▼ (Zustand state write)
[Database Write (fetch / update / insert)]
        │
        ▼
   [Supabase PG Replication]
        │
        ▼ (Postgres Change Event Broadcasts)
[Realtime Listener Channel]
        │
        ├─► [Editor Viewport: Renders Canvas changes]
        └─► [OBS Overlay Viewport: Renders graphic feeds]
```

---

## 2. Channel Event Payload Structures

### Settings Changes Listener
Triggered when the user modifies streamer parameters (e.g. streaming title, active game, social tags, theme swaps).
* **Table**: `settings`
* **Filter**: `project_id=eq.${projectId}`
* **Payload**:
  ```json
  {
    "theme": "cyber-synth",
    "current_scene": "main-stream",
    "stream_title": "Indie Game Night!",
    "streamer_name": "Rave_VT",
    "active_game": "Hollow Knight",
    "ticker_text": "Live in 10 minutes!",
    "border_radius": 8,
    "animation_speed": "normal",
    "overlay_opacity": 85,
    "particle_density": "medium",
    "ticker_speed": "normal",
    "socials": {
      "twitch": "Rave_VT",
      "twitter": "Rave_VT",
      "youtube": "Rave_VT",
      "discord": "Rave_VT",
      "avatarPosition": "bottom-right",
      "chatSize": "medium",
      "disableAnimations": false,
      "activeAnimationPack": "float"
    }
  }
  ```

### Widget Placement & Layout Changes Listener
Triggered on element creation, deletion, dragging, resizing, or custom styling modifications.
* **Tables**: `widgets`, `scene_widgets`
* **Payload Handling**: Re-hydrates state by querying current scene configurations:
  ```typescript
  const userId = await getSessionUserId();
  const data = await fetchProjectData(userId);
  if (data) {
    useOverlayStore.setState({ sceneWidgets: data.sceneWidgets });
  }
  ```

---

## 3. Realtime Channel Verification Console Logs

When troubleshooting realtime connections in the browser console, use these diagnostic logs:

```javascript
// 1. Check if the Supabase channel joins successfully:
const channel = supabase.channel('project-sync:test-id');
channel
  .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (p) => console.log('Settings changed:', p))
  .subscribe((status) => {
    console.log('Channel subscription status:', status); // Should be "SUBSCRIBED"
  });

// 2. Check active channel subscriptions:
console.log('Active Supabase channels:', supabase.getChannels());
```
