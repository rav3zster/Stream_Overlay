import { supabase } from './supabase';
import { type Widget, type SceneType, type ThemeType, type OverlaySettings, type GoalState, type OverlayTimer } from '../store/overlayStore';

export async function getSessionUserId(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user.id;
    }
    
    // Attempt anonymous sign in
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn('Anonymous sign-in failed, using mock user ID:', error.message);
      return '00000000-0000-0000-0000-000000000000';
    }
    return data.user?.id || '00000000-0000-0000-0000-000000000000';
  } catch (err) {
    console.error('Auth error, fallback to mock ID:', err);
    return '00000000-0000-0000-0000-000000000000';
  }
}

export interface DbProjectData {
  projectId: string;
  theme: ThemeType;
  currentScene: SceneType;
  timer: OverlayTimer;
  settings: OverlaySettings;
  subGoal: GoalState;
  donationGoal: GoalState;
  followerGoal: GoalState;
  sceneWidgets: Record<SceneType, Widget[]>;
  schedule: Array<{
    id: string;
    time: string;
    scene: SceneType;
    label: string;
    isActive: boolean;
  }>;
}

// Hydrate state from Supabase
export async function fetchProjectData(userId: string): Promise<DbProjectData | null> {
  try {
    // 1. Get user project
    let { data: projects, error: projErr } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', userId)
      .limit(1);

    if (projErr || !projects || projects.length === 0) {
      return null;
    }

    const project = projects[0];
    const projectId = project.id;

    // 2. Get settings
    let { data: settingsData, error: setErr } = await supabase
      .from('settings')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (setErr || !settingsData) return null;

    // 3. Get goals
    let { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('project_id', projectId);

    const subGoal = { current: 0, target: 100 };
    const donationGoal = { current: 0, target: 500 };
    const followerGoal = { current: 0, target: 1000 };

    goalsData?.forEach(g => {
      if (g.goal_type === 'sub') {
        subGoal.current = g.current_value;
        subGoal.target = g.target_value;
      } else if (g.goal_type === 'donation') {
        donationGoal.current = g.current_value;
        donationGoal.target = g.target_value;
      } else if (g.goal_type === 'follower') {
        followerGoal.current = g.current_value;
        followerGoal.target = g.target_value;
      }
    });

    // 4. Get scenes
    let { data: scenesData } = await supabase
      .from('scenes')
      .select('*')
      .eq('project_id', projectId);

    const scenesMap: Record<string, string> = {}; // db scene ID -> scene name ('main-stream', etc.)
    const reverseScenesMap: Record<string, string> = {}; // scene name -> db scene ID
    scenesData?.forEach(s => {
      scenesMap[s.id] = s.name;
      reverseScenesMap[s.name] = s.id;
    });

    // 5. Get widgets layout for all scenes
    const sceneWidgets: Record<SceneType, Widget[]> = {
      'starting-soon': [],
      'main-stream': [],
      'chat-session': [],
      'brb': [],
      'ending-stream': []
    };

    if (scenesData && scenesData.length > 0) {
      const sceneIds = scenesData.map(s => s.id);
      
      const { data: placements } = await supabase
        .from('scene_widgets')
        .select(`
          id,
          x,
          y,
          width,
          height,
          rotation,
          opacity,
          scale,
          z_index,
          visible,
          locked,
          parent_id,
          scene_id,
          widget_id,
          widgets (
            id,
            widget_type,
            name,
            settings,
            content,
            animation,
            style_id,
            widget_styles (
              border_radius,
              background,
              border_size,
              border_style,
              border_color,
              glow_color,
              glow_blur,
              shadow_x,
              shadow_y,
              shadow_blur,
              shadow_color,
              font_family,
              font_size,
              font_weight,
              font_color,
              text_align,
              padding
            )
          )
        `)
        .in('scene_id', sceneIds);

      placements?.forEach((p: any) => {
        const sceneName = scenesMap[p.scene_id] as SceneType;
        const w = p.widgets;
        if (!sceneName || !w) return;

        const wStyle = w.widget_styles || {};

        const widget: Widget = {
          id: w.id,
          type: w.widget_type,
          label: w.name,
          parentId: p.parent_id || undefined,
          x: p.x,
          y: p.y,
          w: p.width,
          h: p.height,
          rotation: p.rotation,
          opacity: p.opacity,
          scale: p.scale,
          zIndex: p.z_index,
          visible: p.visible,
          locked: p.locked,
          style: {
            borderRadius: wStyle.border_radius,
            background: wStyle.background,
            borderSize: wStyle.border_size,
            borderStyle: wStyle.border_style,
            borderColor: wStyle.border_color,
            glowColor: wStyle.glow_color || undefined,
            glowBlur: wStyle.glow_blur,
            shadowX: wStyle.shadow_x,
            shadowY: wStyle.shadow_y,
            shadowBlur: wStyle.shadow_blur,
            shadowColor: wStyle.shadow_color,
            fontFamily: wStyle.font_family || undefined,
            fontSize: wStyle.font_size || undefined,
            fontWeight: wStyle.font_weight || undefined,
            fontColor: wStyle.font_color || undefined,
            textAlign: wStyle.text_align || 'center',
            padding: wStyle.padding
          },
          animation: {
            type: w.animation?.type || 'none',
            duration: w.animation?.duration || 1,
            delay: w.animation?.delay || 0,
            loop: w.animation?.loop !== undefined ? w.animation.loop : false
          },
          content: {
            type: w.content?.type || w.widget_type,
            settings: w.content?.settings || {}
          }
        };

        sceneWidgets[sceneName].push(widget);
      });
    }

    // 6. Get scheduler
    let { data: schedulerData } = await supabase
      .from('scheduler')
      .select('*')
      .eq('project_id', projectId);

    const schedule = (schedulerData || []).map(s => ({
      id: s.id,
      time: s.trigger_time.slice(0, 5),
      scene: s.payload?.scene as SceneType || 'main-stream',
      label: s.payload?.label || 'Scheduled transition',
      isActive: s.is_active
    }));

    return {
      projectId,
      theme: (settingsData.theme as ThemeType) || 'cyber-synth',
      currentScene: (settingsData.current_scene as SceneType) || 'starting-soon',
      timer: {
        seconds: settingsData.timer_seconds ?? 600,
        isRunning: settingsData.timer_is_running ?? true,
        isPaused: settingsData.timer_is_paused ?? false,
      },
      settings: {
        streamTitle: settingsData.stream_title,
        streamerName: settingsData.streamer_name,
        activeGame: settingsData.active_game,
        tickerText: settingsData.ticker_text || '',
        socials: {
          twitch: settingsData.socials?.twitch || '',
          twitter: settingsData.socials?.twitter || '',
          youtube: settingsData.socials?.youtube || '',
          discord: settingsData.socials?.discord || '',
        },
        avatarPosition: settingsData.socials?.avatarPosition || 'bottom-right',
        chatSize: settingsData.socials?.chatSize || 'medium',
        borderRadius: settingsData.border_radius,
        animationSpeed: (settingsData.animation_speed as any) || 'normal',
        overlayOpacity: settingsData.overlay_opacity,
        particleDensity: (settingsData.particle_density as any) || 'medium',
        tickerSpeed: (settingsData.ticker_speed as any) || 'normal',
        disableAnimations: settingsData.socials?.disableAnimations || false,
        activeAnimationPack: settingsData.socials?.activeAnimationPack || 'float',
      },
      subGoal,
      donationGoal,
      followerGoal,
      sceneWidgets,
      schedule
    };
  } catch (err) {
    console.error('Failed to fetch project data from Supabase:', err);
    return null;
  }
}

// Initialize project with defaults in database
export async function initializeDefaultProject(userId: string, defaultState: any): Promise<DbProjectData> {
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({ user_id: userId, name: 'Default Overlay Project', description: 'Real-time cyberpunk stream overlay.' })
    .select()
    .single();

  if (projErr || !project) {
    throw new Error('Failed to create default project in Supabase: ' + projErr?.message);
  }

  const projectId = project.id;

  // Insert settings
  const { error: setErr } = await supabase
    .from('settings')
    .insert({
      project_id: projectId,
      streamer_name: defaultState.settings.streamerName,
      stream_title: defaultState.settings.streamTitle,
      active_game: defaultState.settings.activeGame,
      ticker_text: defaultState.settings.tickerText,
      border_radius: defaultState.settings.borderRadius,
      animation_speed: defaultState.settings.animationSpeed,
      overlay_opacity: defaultState.settings.overlayOpacity,
      particle_density: defaultState.settings.particleDensity,
      ticker_speed: defaultState.settings.tickerSpeed,
      current_scene: defaultState.currentScene,
      theme: defaultState.theme,
      socials: {
        ...defaultState.settings.socials,
        avatarPosition: defaultState.settings.avatarPosition,
        chatSize: defaultState.settings.chatSize,
        disableAnimations: defaultState.settings.disableAnimations,
        activeAnimationPack: defaultState.settings.activeAnimationPack
      }
    });

  if (setErr) console.error('Failed to insert default settings:', setErr);

  // Insert goals
  await supabase.from('goals').insert([
    { project_id: projectId, goal_type: 'sub', title: 'Subscriber Goal', current_value: defaultState.subGoal.current, target_value: defaultState.subGoal.target },
    { project_id: projectId, goal_type: 'donation', title: 'Donation Goal', current_value: defaultState.donationGoal.current, target_value: defaultState.donationGoal.target },
    { project_id: projectId, goal_type: 'follower', title: 'Follower Goal', current_value: defaultState.followerGoal.current, target_value: defaultState.followerGoal.target }
  ]);

  // Insert scenes & get IDs
  const scenesToInsert = [
    { project_id: projectId, name: 'starting-soon', label: 'Starting Soon' },
    { project_id: projectId, name: 'main-stream', label: 'Gameplay' },
    { project_id: projectId, name: 'chat-session', label: 'Just Chatting' },
    { project_id: projectId, name: 'brb', label: 'BRB' },
    { project_id: projectId, name: 'ending-stream', label: 'Ending Stream' }
  ];

  const { data: scenesData, error: sceneErr } = await supabase
    .from('scenes')
    .insert(scenesToInsert)
    .select();

  if (sceneErr || !scenesData) {
    throw new Error('Failed to insert default scenes: ' + sceneErr?.message);
  }

  const scenesMap: Record<string, string> = {};
  scenesData.forEach(s => {
    scenesMap[s.name] = s.id;
  });

  // Insert schedule
  const schToInsert = defaultState.schedule.map((s: any) => ({
    project_id: projectId,
    trigger_time: `${s.time}:00`,
    action_type: 'switch_scene',
    is_active: s.isActive,
    payload: { scene: s.scene, label: s.label }
  }));
  await supabase.from('scheduler').insert(schToInsert);

  // Populate default widgets and styles
  const defaultWidgets = defaultState.sceneWidgets;
  
  for (const sceneName of Object.keys(defaultWidgets) as SceneType[]) {
    const sceneId = scenesMap[sceneName];
    const widgetsList = defaultWidgets[sceneName] as Widget[];

    for (const w of widgetsList) {
      // 1. Insert style
      const { data: styleData } = await supabase
        .from('widget_styles')
        .insert({
          project_id: projectId,
          name: `${w.label} Style`,
          border_radius: w.style?.borderRadius ?? 8,
          background: w.style?.background || 'rgba(14, 8, 26, 0.8)',
          border_size: w.style?.borderSize ?? 1,
          border_style: w.style?.borderStyle || 'solid',
          border_color: w.style?.borderColor || '#A855F7',
          glow_color: w.style?.glowColor || null,
          glow_blur: w.style?.glowBlur ?? 0,
          shadow_x: w.style?.shadowX ?? 0,
          shadow_y: w.style?.shadowY ?? 4,
          shadow_blur: w.style?.shadowBlur ?? 10,
          shadow_color: w.style?.shadowColor || 'rgba(0,0,0,0.5)',
          font_family: w.style?.fontFamily || null,
          font_size: w.style?.fontSize || null,
          font_weight: w.style?.fontWeight || null,
          font_color: w.style?.fontColor || null,
          text_align: w.style?.textAlign || 'center',
          padding: w.style?.padding ?? 4
        })
        .select()
        .single();

      const styleId = styleData?.id || null;

      // 2. Insert widget
      const { data: widgetData } = await supabase
        .from('widgets')
        .insert({
          id: w.id, // Keep stable UUID if possible or generate new one
          project_id: projectId,
          style_id: styleId,
          widget_type: w.type,
          name: w.label,
          settings: w.content?.settings || {},
          content: w.content || {},
          animation: w.animation || {}
        })
        .select()
        .single();

      if (!widgetData) continue;

      // 3. Insert placement junction
      await supabase
        .from('scene_widgets')
        .insert({
          scene_id: sceneId,
          widget_id: w.id,
          x: w.x,
          y: w.y,
          width: w.w,
          height: w.h,
          rotation: w.rotation,
          opacity: w.opacity,
          scale: w.scale,
          z_index: w.zIndex,
          visible: w.visible,
          locked: w.locked,
          parent_id: null
        });
    }
  }

  return fetchProjectData(userId) as Promise<DbProjectData>;
}

// ─── CRUD updates to Supabase ──────────────────────────────────────────────

export async function updateDbSettings(projectId: string, fields: OverlaySettings, currentScene: SceneType, theme: ThemeType) {
  try {
    const payload: any = {
      streamer_name: fields.streamerName,
      stream_title: fields.streamTitle,
      active_game: fields.activeGame,
      ticker_text: fields.tickerText,
      border_radius: fields.borderRadius,
      animation_speed: fields.animationSpeed,
      overlay_opacity: fields.overlayOpacity,
      particle_density: fields.particleDensity,
      ticker_speed: fields.tickerSpeed,
      current_scene: currentScene,
      theme: theme,
      socials: {
        twitch: fields.socials?.twitch || '',
        twitter: fields.socials?.twitter || '',
        youtube: fields.socials?.youtube || '',
        discord: fields.socials?.discord || '',
        avatarPosition: fields.avatarPosition || 'bottom-right',
        chatSize: fields.chatSize || 'medium',
        disableAnimations: fields.disableAnimations || false,
        activeAnimationPack: fields.activeAnimationPack || 'float'
      }
    };

    await supabase
      .from('settings')
      .update(payload)
      .eq('project_id', projectId);
  } catch (err) {
    console.error('Error updating settings in DB:', err);
  }
}

// Write timer state to DB so OBS receives it via realtime subscription on settings table
export async function updateDbTimer(projectId: string, timer: OverlayTimer) {
  try {
    await supabase
      .from('settings')
      .update({
        timer_seconds: timer.seconds,
        timer_is_running: timer.isRunning,
        timer_is_paused: timer.isPaused,
      })
      .eq('project_id', projectId);
  } catch (err) {
    console.error('Error updating timer in DB:', err);
  }
}

export async function updateDbGoal(projectId: string, type: 'sub' | 'donation' | 'follower', current: number, target: number) {
  try {
    await supabase
      .from('goals')
      .update({ current_value: current, target_value: target })
      .eq('project_id', projectId)
      .eq('goal_type', type);
  } catch (err) {
    console.error(`Error updating ${type} goal in DB:`, err);
  }
}

export async function addDbWidget(projectId: string, sceneName: SceneType, widget: Widget) {
  try {
    // 1. Get scene ID
    const { data: scenes } = await supabase
      .from('scenes')
      .select('id')
      .eq('project_id', projectId)
      .eq('name', sceneName)
      .limit(1);
    
    if (!scenes || scenes.length === 0) return;
    const sceneId = scenes[0].id;

    // 2. Insert style
    const { data: styleData } = await supabase
      .from('widget_styles')
      .insert({
        project_id: projectId,
        name: `${widget.label} Style`,
        border_radius: widget.style?.borderRadius ?? 8,
        background: widget.style?.background || 'rgba(14, 8, 26, 0.8)',
        border_size: widget.style?.borderSize ?? 1,
        border_style: widget.style?.borderStyle || 'solid',
        border_color: widget.style?.borderColor || '#A855F7',
        glow_blur: widget.style?.glowBlur ?? 0,
        padding: widget.style?.padding ?? 4
      })
      .select()
      .single();

    const styleId = styleData?.id || null;

    // 3. Insert widget
    await supabase
      .from('widgets')
      .insert({
        id: widget.id,
        project_id: projectId,
        style_id: styleId,
        widget_type: widget.type,
        name: widget.label,
        settings: widget.content?.settings || {},
        content: widget.content || {},
        animation: widget.animation || {}
      });

    // 4. Insert junction placement
    await supabase
      .from('scene_widgets')
      .insert({
        scene_id: sceneId,
        widget_id: widget.id,
        x: widget.x,
        y: widget.y,
        width: widget.w,
        height: widget.h,
        rotation: widget.rotation,
        opacity: widget.opacity,
        scale: widget.scale,
        z_index: widget.zIndex,
        visible: widget.visible,
        locked: widget.locked
      });
  } catch (err) {
    console.error('Error adding widget in DB:', err);
  }
}

export async function deleteDbWidget(widgetId: string) {
  try {
    // Cascades into scene_widgets, but let's delete styles manually if desired.
    // To keep DB clean, delete style linked to this widget
    const { data: w } = await supabase
      .from('widgets')
      .select('style_id')
      .eq('id', widgetId)
      .maybeSingle();

    await supabase.from('widgets').delete().eq('id', widgetId);

    if (w?.style_id) {
      await supabase.from('widget_styles').delete().eq('id', w.style_id);
    }
  } catch (err) {
    console.error('Error deleting widget in DB:', err);
  }
}

export async function updateDbWidgetPlacementBatch(updates: Array<{ id: string; fields: Partial<Widget> }>) {
  try {
    for (const update of updates) {
      const placementFields: any = {};
      const widgetFields: any = {};
      const styleFields: any = {};

      const localKeys = ['x', 'y', 'w', 'h', 'rotation', 'opacity', 'scale', 'zIndex', 'visible', 'locked', 'parentId'];
      const styleKeys = ['borderRadius', 'background', 'borderSize', 'borderStyle', 'borderColor', 'glowColor', 'glowBlur', 'shadowX', 'shadowY', 'shadowBlur', 'shadowColor', 'fontFamily', 'fontSize', 'fontWeight', 'fontColor', 'textAlign', 'padding'];

      Object.entries(update.fields).forEach(([key, val]) => {
        if (localKeys.includes(key)) {
          const dbKey = key === 'w' ? 'width' : key === 'h' ? 'height' : key === 'zIndex' ? 'z_index' : key === 'parentId' ? 'parent_id' : key;
          placementFields[dbKey] = val;
        } else if (key === 'style') {
          Object.entries(val || {}).forEach(([sk, sv]) => {
            const dbSk = sk.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            styleFields[dbSk] = sv;
          });
        } else if (key === 'animation') {
          widgetFields.animation = val;
        } else if (key === 'content') {
          widgetFields.content = val;
          widgetFields.settings = (val as any)?.settings;
        } else if (key === 'label') {
          widgetFields.name = val;
        }
      });

      if (Object.keys(placementFields).length > 0) {
        await supabase
          .from('scene_widgets')
          .update(placementFields)
          .eq('widget_id', update.id);
      }

      if (Object.keys(widgetFields).length > 0) {
        await supabase
          .from('widgets')
          .update(widgetFields)
          .eq('id', update.id);
      }

      if (Object.keys(styleFields).length > 0) {
        // Fetch style_id first
        const { data: w } = await supabase
          .from('widgets')
          .select('style_id')
          .eq('id', update.id)
          .maybeSingle();

        if (w?.style_id) {
          await supabase
            .from('widget_styles')
            .update(styleFields)
            .eq('id', w.style_id);
        }
      }
    }
  } catch (err) {
    console.error('Error batch updating widgets in DB:', err);
  }
}

export async function addDbScheduleEvent(projectId: string, time: string, scene: SceneType, label: string) {
  try {
    const { data } = await supabase
      .from('scheduler')
      .insert({
        project_id: projectId,
        trigger_time: `${time}:00`,
        action_type: 'switch_scene',
        is_active: true,
        payload: { scene, label }
      })
      .select()
      .single();
    return data?.id;
  } catch (err) {
    console.error('Error adding schedule event in DB:', err);
    return null;
  }
}

export async function deleteDbScheduleEvent(eventId: string) {
  try {
    await supabase.from('scheduler').delete().eq('id', eventId);
  } catch (err) {
    console.error('Error deleting schedule event in DB:', err);
  }
}

export async function replaceDbSceneWidgets(projectId: string, sceneName: SceneType, widgets: Widget[]) {
  try {
    // 1. Get scene ID
    const { data: scenes } = await supabase
      .from('scenes')
      .select('id')
      .eq('project_id', projectId)
      .eq('name', sceneName)
      .limit(1);
    
    if (!scenes || scenes.length === 0) return;
    const sceneId = scenes[0].id;

    // 2. Fetch current widgets placed in this scene to delete them
    const { data: placements } = await supabase
      .from('scene_widgets')
      .select('widget_id')
      .eq('scene_id', sceneId);

    const oldWidgetIds = placements?.map(p => p.widget_id) || [];

    if (oldWidgetIds.length > 0) {
      await supabase.from('widgets').delete().in('id', oldWidgetIds);
      await supabase.from('widget_styles').delete().eq('project_id', projectId).eq('name', `${sceneName} preset`);
    }

    // 3. Insert new widgets and style placements
    for (const w of widgets) {
      const { data: styleData } = await supabase
        .from('widget_styles')
        .insert({
          project_id: projectId,
          name: `${sceneName} preset`,
          border_radius: w.style?.borderRadius ?? 8,
          background: w.style?.background || 'rgba(14, 8, 26, 0.8)',
          border_size: w.style?.borderSize ?? 1,
          border_style: w.style?.borderStyle || 'solid',
          border_color: w.style?.borderColor || '#A855F7',
          glow_blur: w.style?.glowBlur ?? 0,
          padding: w.style?.padding ?? 4
        })
        .select()
        .single();

      const styleId = styleData?.id || null;

      await supabase
        .from('widgets')
        .insert({
          id: w.id,
          project_id: projectId,
          style_id: styleId,
          widget_type: w.type,
          name: w.label,
          settings: w.content?.settings || {},
          content: w.content || {},
          animation: w.animation || {}
        });

      await supabase
        .from('scene_widgets')
        .insert({
          scene_id: sceneId,
          widget_id: w.id,
          x: w.x,
          y: w.y,
          width: w.w,
          height: w.h,
          rotation: w.rotation,
          opacity: w.opacity,
          scale: w.scale,
          z_index: w.zIndex,
          visible: w.visible,
          locked: w.locked
        });
    }
  } catch (err) {
    console.error('Error replacing scene widgets in DB:', err);
  }
}
