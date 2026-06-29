import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useLiveStore } from './liveStore';
import { useEditorStore, type Scene, type DraftWidget } from './editorStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionState {
  userId: string | null;
  project: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initSession: () => Promise<void>;
  saveScene: (sceneId: string) => Promise<void>;
  createScene: (name: string, label: string) => Promise<Scene | null>;
  deleteScene: (sceneId: string) => Promise<void>;
  updateProjectName: (name: string) => Promise<void>;
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getOrCreateUserId(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user.id;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user?.id ?? 'local-user';
  } catch {
    return 'local-user';
  }
}

// ─── Default scene widgets (pixel-based, 1920×1080) ──────────────────────────

const DEFAULT_SCENE_WIDGETS: Record<string, DraftWidget[]> = {
  'starting-soon': [
    {
      id: 'default-timer-soon',
      type: 'countdown-timer',
      label: 'Countdown Timer',
      x: 560, y: 280, width: 800, height: 220,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 16, background: 'rgba(14,8,26,0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 20, padding: 24, fontColor: '#5CFFE2', fontSize: 80, textAlign: 'center' },
      animation: { type: 'float', duration: 6, delay: 0, loop: true },
      content: { type: 'countdown-timer', settings: { label: 'STREAM STARTING SOON' } },
    },
    {
      id: 'default-music-soon',
      type: 'spotify',
      label: 'Now Playing',
      x: 594, y: 560, width: 732, height: 120,
      rotation: 0, opacity: 100, scale: 1, zIndex: 3, visible: true, locked: false,
      style: { borderRadius: 60, background: 'rgba(0,0,0,0.45)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', padding: 16 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'spotify', settings: { compact: true } },
    },
  ],
  'main-stream': [
    {
      id: 'default-chat-main',
      type: 'chat-box',
      label: 'Chat Box',
      x: 1555, y: 20, width: 345, height: 620,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 12, background: 'rgba(14,8,26,0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', padding: 12 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'chat-box', settings: { size: 'medium' } },
    },
  ],
  'chat-session': [],
  'brb': [
    {
      id: 'default-timer-brb',
      type: 'countdown-timer',
      label: 'BRB Timer',
      x: 576, y: 460, width: 768, height: 120,
      rotation: 0, opacity: 100, scale: 1, zIndex: 2, visible: true, locked: false,
      style: { borderRadius: 12, background: 'rgba(14,8,26,0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', padding: 16 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: { type: 'countdown-timer', settings: { label: 'BE RIGHT BACK' } },
    },
  ],
  'ending-stream': [],
};

const DEFAULT_SCENES: Omit<Scene, 'widgets'>[] = [
  { id: 'scene-starting-soon', name: 'starting-soon', label: '⌛ Starting Soon' },
  { id: 'scene-chat-session', name: 'chat-session', label: '💬 Just Chatting' },
  { id: 'scene-main-stream', name: 'main-stream', label: '🎮 Gameplay' },
  { id: 'scene-brb', name: 'brb', label: '☕ BRB Break' },
  { id: 'scene-ending-stream', name: 'ending-stream', label: '👋 Ending Stream' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set, get) => ({
  userId: null,
  project: null,
  isLoading: true,
  error: null,

  initSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const userId = await getOrCreateUserId();
      set({ userId });

      // Try to load project from Supabase
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description, created_at, updated_at')
        .eq('user_id', userId)
        .limit(1);

      let project: Project;

      if (projects && projects.length > 0) {
        const p = projects[0];
        project = { id: p.id, name: p.name, description: p.description, createdAt: p.created_at, updatedAt: p.updated_at };
      } else {
        // Create default project
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert({ user_id: userId, name: 'My Stream Overlay', description: 'VibeOverlay Studio project' })
          .select()
          .single();
        if (error || !newProject) throw new Error('Could not create project');
        project = { id: newProject.id, name: newProject.name, description: newProject.description, createdAt: newProject.created_at, updatedAt: newProject.updated_at };
      }

      set({ project });

      // Load scenes from DB or seed defaults
      const { data: dbScenes } = await supabase
        .from('scenes')
        .select('id, name, label:name')
        .eq('project_id', project.id)
        .order('created_at');

      let scenes: Scene[];

      if (dbScenes && dbScenes.length > 0) {
        // Load widgets for each scene
        const sceneIds = dbScenes.map(s => s.id);
        const { data: placements } = await supabase
          .from('scene_widgets')
          .select(`id, x, y, width, height, rotation, opacity, scale, z_index, visible, locked, scene_id,
            widgets(id, widget_type, name, content, animation, settings, widget_styles(border_radius, background, border_size, border_style, border_color, glow_color, glow_blur, shadow_x, shadow_y, shadow_blur, shadow_color, font_family, font_size, font_weight, font_color, text_align, padding))`)
          .in('scene_id', sceneIds);

        scenes = dbScenes.map(sc => {
          const scPlacements = (placements || []).filter((p: any) => p.scene_id === sc.id);
          const widgets: DraftWidget[] = scPlacements.map((p: any) => {
            const w = p.widgets;
            const ws = w?.widget_styles || {};
            return {
              id: w?.id ?? p.id,
              type: w?.widget_type ?? 'text',
              label: w?.name ?? 'Widget',
              x: p.x, y: p.y, width: p.width, height: p.height,
              rotation: p.rotation ?? 0, opacity: p.opacity ?? 100,
              scale: p.scale ?? 1, zIndex: p.z_index ?? 1,
              visible: p.visible ?? true, locked: p.locked ?? false,
              style: {
                borderRadius: ws.border_radius, background: ws.background,
                borderSize: ws.border_size, borderStyle: ws.border_style,
                borderColor: ws.border_color, glowColor: ws.glow_color,
                glowBlur: ws.glow_blur, shadowX: ws.shadow_x, shadowY: ws.shadow_y,
                shadowBlur: ws.shadow_blur, shadowColor: ws.shadow_color,
                fontFamily: ws.font_family, fontSize: ws.font_size,
                fontWeight: ws.font_weight, fontColor: ws.font_color,
                textAlign: ws.text_align ?? 'center', padding: ws.padding,
              },
              animation: { type: w?.animation?.type ?? 'none', duration: w?.animation?.duration ?? 1, delay: w?.animation?.delay ?? 0, loop: w?.animation?.loop ?? false },
              content: { type: w?.content?.type ?? w?.widget_type, settings: w?.content?.settings ?? {} },
            };
          });
          return { id: sc.id, name: sc.name, label: sc.name, widgets };
        });
      } else {
        // Seed default scenes
        const insertedScenes: Scene[] = [];
        for (const s of DEFAULT_SCENES) {
          const { data: inserted } = await supabase
            .from('scenes')
            .insert({ project_id: project.id, name: s.name })
            .select()
            .single();
          if (inserted) {
            insertedScenes.push({
              id: inserted.id,
              name: s.name,
              label: s.label,
              widgets: DEFAULT_SCENE_WIDGETS[s.name] ?? [],
            });
          }
        }
        scenes = insertedScenes;
      }

      // Seed settings if missing
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('id')
        .eq('project_id', project.id)
        .maybeSingle();

      if (!existingSettings) {
        await supabase.from('settings').insert({
          project_id: project.id,
          streamer_name: 'Rave_VT',
          stream_title: 'Indie Game Night',
          active_game: 'Hollow Knight',
          current_scene: 'starting-soon',
          theme: 'cyber-synth',
          timer_seconds: 600,
          timer_is_running: true,
          timer_is_paused: false,
        });
      } else {
        // Load persisted settings into liveStore
        const { data: settingsData } = await supabase
          .from('settings')
          .select('current_scene, theme, timer_seconds, timer_is_running, timer_is_paused')
          .eq('project_id', project.id)
          .maybeSingle();

        if (settingsData) {
          const liveSceneId = scenes.find(s => s.name === settingsData.current_scene)?.id ?? scenes[0]?.id ?? null;
          useLiveStore.setState({
            projectId: project.id,
            liveSceneId,
            liveSceneName: settingsData.current_scene ?? 'starting-soon',
            theme: settingsData.theme ?? 'cyber-synth',
            timer: {
              seconds: settingsData.timer_seconds ?? 600,
              isRunning: settingsData.timer_is_running ?? true,
              isPaused: settingsData.timer_is_paused ?? false,
            },
          });
        }
      }

      // Push scenes and initial scene to editorStore
      const firstScene = scenes[0];
      useEditorStore.getState().setScenes(scenes);
      if (firstScene) {
        useEditorStore.getState().setEditingScene(firstScene.id);
        // Seed history for each scene
        const historyInit: Record<string, DraftWidget[][]> = {};
        const historyIdxInit: Record<string, number> = {};
        scenes.forEach(sc => {
          historyInit[sc.id] = [sc.widgets.map(w => ({ ...w }))];
          historyIdxInit[sc.id] = 0;
        });
        useEditorStore.setState({ history: historyInit, historyIndex: historyIdxInit });
      }

      useLiveStore.getState().setProjectId(project.id);

      set({ isLoading: false });
    } catch (err: any) {
      console.warn('Session init failed, using local defaults:', err.message);

      // Offline fallback — build scenes locally
      const fallbackScenes: Scene[] = DEFAULT_SCENES.map(s => ({
        ...s,
        widgets: DEFAULT_SCENE_WIDGETS[s.name] ?? [],
      }));
      useEditorStore.getState().setScenes(fallbackScenes);
      useEditorStore.getState().setEditingScene(fallbackScenes[0].id);
      const historyInit: Record<string, DraftWidget[][]> = {};
      const historyIdxInit: Record<string, number> = {};
      fallbackScenes.forEach(sc => {
        historyInit[sc.id] = [sc.widgets.map(w => ({ ...w }))];
        historyIdxInit[sc.id] = 0;
      });
      useEditorStore.setState({ history: historyInit, historyIndex: historyIdxInit });

      set({ isLoading: false, error: null });
    }
  },

  saveScene: async (sceneId) => {
    const { project } = get();
    if (!project) return;
    const scene = useEditorStore.getState().scenes.find(s => s.id === sceneId);
    if (!scene) return;
    // Batch upsert widgets — simplified: update existing placements
    // Full implementation would diff and upsert
    console.log('[SessionStore] saveScene:', sceneId, scene.widgets.length, 'widgets');
  },

  createScene: async (name, label) => {
    const { project } = get();
    if (!project) return null;
    const { data, error } = await supabase
      .from('scenes')
      .insert({ project_id: project.id, name })
      .select()
      .single();
    if (error || !data) return null;
    const newScene: Scene = { id: data.id, name, label, widgets: [] };
    useEditorStore.getState().setScenes([...useEditorStore.getState().scenes, newScene]);
    return newScene;
  },

  deleteScene: async (sceneId) => {
    await supabase.from('scenes').delete().eq('id', sceneId);
    const remaining = useEditorStore.getState().scenes.filter(s => s.id !== sceneId);
    useEditorStore.getState().setScenes(remaining);
    if (useEditorStore.getState().editingSceneId === sceneId && remaining.length > 0) {
      useEditorStore.getState().setEditingScene(remaining[0].id);
    }
  },

  updateProjectName: async (name) => {
    const { project } = get();
    if (!project) return;
    await supabase.from('projects').update({ name }).eq('id', project.id);
    set(s => s.project ? { project: { ...s.project, name } } : {});
  },
}));
