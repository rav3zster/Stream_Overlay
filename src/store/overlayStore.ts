import { create } from 'zustand';
import { useEditorStore, type DraftWidget } from './editorStore';
import { useLiveStore, type ThemeType } from './liveStore';

// ─── Re-export types for backward compatibility ──────────────────────────────

export type Widget = DraftWidget;
export type SceneType = 'starting-soon' | 'main-stream' | 'chat-session' | 'brb' | 'ending-stream';
export type { ThemeType };

export interface OverlaySettings {
  streamTitle: string;
  streamerName: string;
  activeGame: string;
  tickerText: string;
  socials: {
    twitch: string;
    twitter: string;
    youtube: string;
    discord: string;
  };
  avatarPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  chatSize: 'small' | 'medium' | 'large';
  borderRadius: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  overlayOpacity: number;
  particleDensity: 'low' | 'medium' | 'high';
  tickerSpeed: 'slow' | 'normal' | 'fast';
  disableAnimations: boolean;
  activeAnimationPack: string;
}

export interface GoalState {
  current: number;
  target: number;
}

export interface OverlayTimer {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

// ─── Compatibility store hook ──────────────────────────────────────────────────
// Maps the new modular stores (editorStore, liveStore) back to the old interface
// so that all existing widget renderers and sync scripts continue to work cleanly.

export const useOverlayStore = Object.assign(
  (selector: (state: any) => any) => {
    // We create a combined state object on the fly for selectors
    const editor = useEditorStore();
    const live = useLiveStore();

    const combinedState = {
      // Live state
      theme: live.theme,
      currentScene: live.liveSceneName,
      timer: live.timer,
      projectId: live.projectId,
      loading: false,

      // Settings (can be customized or read from live/project)
      settings: {
        streamTitle: 'Indie Game Night!',
        streamerName: 'Rave_VT',
        activeGame: 'Hollow Knight',
        tickerText: 'Welcome to the stream! Type !help in chat to interact.',
        socials: {
          twitch: 'rave_vt',
          twitter: 'rave_vt',
          youtube: 'rave_vt',
          discord: 'discord.gg/rave',
        },
        avatarPosition: 'bottom-right' as const,
        chatSize: 'medium' as const,
        borderRadius: 8,
        animationSpeed: 'normal' as const,
        overlayOpacity: 85,
        particleDensity: 'medium' as const,
        tickerSpeed: 'normal' as const,
        disableAnimations: false,
        activeAnimationPack: 'float',
      },

      // Goals & Stats (mocked or loaded from db)
      subGoal: { current: 42, target: 100 },
      donationGoal: { current: 150, target: 500 },
      followerGoal: { current: 780, target: 1000 },
      viewerCount: 152,
      showTicker: true,
      showAvatar: true,
      showChat: true,
      music: {
        isPlaying: true,
        title: 'Vibe Beats Lofi',
        artist: 'Lofi Girl',
        album: 'Morning Coffee',
        progress: 45,
        duration: 180,
      },
      latestFollower: 'Yukari_Chan',
      latestSubscriber: 'GamerDave',
      latestDonation: 'Aria - $20.00',

      chatMessages: [
        { id: '1', username: 'ArcadeElara', message_text: 'Hype hype hype!!!', platform: 'twitch', timestamp: new Date() },
        { id: '2', username: 'Kitsune_v', message_text: 'vibing to the beats 🎵', platform: 'twitch', timestamp: new Date() },
        { id: '3', username: 'ZenLofi', message_text: 'is this hollow knight first playthrough?', platform: 'twitch', timestamp: new Date() },
      ],
      activeAlert: null,
      dismissAlert: () => {},
    };

    return selector(combinedState);
  },
  {
    // Expose getState for direct calls
    getState: () => {
      const editor = useEditorStore.getState();
      const live = useLiveStore.getState();

      return {
        theme: live.theme,
        currentScene: live.liveSceneName,
        timer: live.timer,
        projectId: live.projectId,
        settings: {
          streamTitle: 'Indie Game Night!',
          streamerName: 'Rave_VT',
          activeGame: 'Hollow Knight',
          tickerText: 'Welcome to the stream!',
          socials: { twitch: '', twitter: '', youtube: '', discord: '' },
          avatarPosition: 'bottom-right' as const,
          chatSize: 'medium' as const,
          borderRadius: 8,
          animationSpeed: 'normal' as const,
          overlayOpacity: 85,
          particleDensity: 'medium' as const,
          tickerSpeed: 'normal' as const,
          disableAnimations: false,
          activeAnimationPack: 'float',
        },
        timer_seconds: live.timer.seconds,
      };
    },
    // Expose setState
    setState: (update: any) => {
      // Apply updates to the appropriate store
      if (typeof update === 'function') {
        // Handle callback-style updates if needed
      } else {
        if (update.theme) useLiveStore.setState({ theme: update.theme });
        if (update.timer) useLiveStore.setState({ timer: update.timer });
      }
    }
  }
);
