import { type ThemeType, type SceneType, type Widget } from '../store/overlayStore';

export type ThemeProfile =
  | 'cyber'
  | 'retro'
  | 'cozy'
  | 'minimal'
  | 'glass'
  | 'neumorphic'
  | 'racing'
  | 'gulf'
  | 'luxury'
  | 'seasonal'
  | 'blank';

/**
 * Maps a specific theme identifier to its corresponding general design profile.
 */
export const getThemeProfile = (theme: ThemeType): ThemeProfile => {
  switch (theme) {
    case 'cyber-synth':
    case 'neon-tokyo':
    case 'vaporwave':
    case 'galaxy-violet':
      return 'cyber';

    case 'retro-crt':
      return 'retro';

    case 'lo-fi-cafe':
    case 'lo-fi-bedroom':
    case 'anime-bedroom':
    case 'anime-sakura':
    case 'anime-room':
      return 'cozy';

    case 'minimal-white':
    case 'minimal-dark':
    case 'minimal-purple':
    case 'modern-clean':
    case 'modern-white':
    case 'corporate-tech':
      return 'minimal';

    case 'glassmorphism':
      return 'glass';

    case 'neumorphism':
      return 'neumorphic';

    case 'mclaren':
    case 'ferrari':
    case 'red-bull':
    case 'mercedes-amg':
      return 'racing';

    case 'porsche-gulf':
      return 'gulf';

    case 'luxury':
      return 'luxury';

    case 'halloween':
    case 'christmas':
    case 'snow':
      return 'seasonal';

    case 'transparent':
    case 'pure-black':
    case 'pure-white':
    case 'blank-dark':
    case 'blank-light':
    default:
      return 'blank';
  }
};

/**
 * Layout configuration helper that defines starting positions, widths, heights,
 * animations, and style overrides for themes to render handcrafted arrangements.
 */
export const getThemeLayoutPreset = (theme: ThemeType, scene: SceneType): Partial<Widget>[] => {
  const profile = getThemeProfile(theme);

  switch (profile) {
    case 'racing': // F1 dashboard layout
      if (scene === 'main-stream') {
        return [
          {
            id: 'game-main',
            type: 'game-frame',
            label: 'F1 Game Capture Window',
            x: 4, y: 14, w: 92, h: 72,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: true,
            style: { borderRadius: 0, background: 'transparent', borderSize: 3, borderStyle: 'solid', borderColor: 'var(--panel-border)', glowBlur: 0, padding: 0 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'game-frame', settings: { titleBar: true, titleText: 'F1 TELEMETRY CAM' } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Tachometer Timer',
            x: 41, y: 2, w: 18, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 0, background: 'rgba(10, 10, 10, 0.95)', borderSize: 2, borderStyle: 'solid', borderColor: 'var(--accent-primary)', glowBlur: 4, padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'timer', settings: { size: 'compact', customLabel: 'LAP TIMER' } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'RPM Progress Goal',
            x: 4, y: 2, w: 35, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 0, background: 'rgba(10, 10, 10, 0.95)', borderSize: 1, borderStyle: 'solid', borderColor: '#333333', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          },
          {
            id: 'dono-main',
            type: 'dono-goal',
            label: 'KERS Progress Goal',
            x: 61, y: 2, w: 35, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 5, visible: true, locked: false,
            style: { borderRadius: 0, background: 'rgba(10, 10, 10, 0.95)', borderSize: 1, borderStyle: 'solid', borderColor: '#333333', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'dono-goal', settings: { compact: true } }
          },
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Telemetry Driver Radio',
            x: 4, y: 88, w: 45, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 6, visible: true, locked: false,
            style: { borderRadius: 0, background: 'rgba(10, 10, 10, 0.95)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'mini', maxMessages: 3 } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Engine Audio Track',
            x: 51, y: 88, w: 45, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 7, visible: true, locked: false,
            style: { borderRadius: 0, background: 'rgba(10, 10, 10, 0.95)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'gulf': // Spacious, curved shapes
      if (scene === 'main-stream') {
        return [
          {
            id: 'game-main',
            type: 'game-frame',
            label: 'Gulf Classic Cutout',
            x: 8, y: 8, w: 84, h: 68,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: true,
            style: { borderRadius: 24, background: 'transparent', borderSize: 4, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 0 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'game-frame', settings: { titleBar: true, titleText: 'CLASSIC OVERLAY FRAME' } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Gulf Chronograph',
            x: 8, y: 78, w: 25, h: 14,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)', borderSize: 2, borderStyle: 'solid', borderColor: 'var(--accent-secondary)', padding: 4 },
            animation: { type: 'float', duration: 8, delay: 0, loop: true },
            content: { type: 'timer', settings: { size: 'compact' } }
          },
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Cozy Gulf Board',
            x: 36, y: 78, w: 32, h: 14,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)', borderSize: 1, borderStyle: 'solid', borderColor: '#cccccc', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'mini', maxMessages: 2 } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Gulf Dashboard Radio',
            x: 71, y: 78, w: 21, h: 14,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)', borderSize: 1, borderStyle: 'solid', borderColor: '#cccccc', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'cozy': // Warm rounded wood/paper note cards
      if (scene === 'chat-session' || scene === 'main-stream') {
        return [
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Warm Cozy Chat Logs',
            x: 3, y: 4, w: 26, h: 90,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: false,
            style: { borderRadius: 28, background: 'rgba(26, 18, 33, 0.85)', borderSize: 2, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 12 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'large', maxMessages: 10 } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Cozy blackboard clock',
            x: 32, y: 4, w: 32, h: 16,
            rotation: 1, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 20, background: 'rgba(26, 18, 33, 0.9)', borderSize: 2, borderStyle: 'dashed', borderColor: 'var(--accent-secondary)', padding: 8 },
            animation: { type: 'float', duration: 6, delay: 0, loop: true },
            content: { type: 'timer', settings: { size: 'compact' } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Cozy cassette deck',
            x: 67, y: 4, w: 30, h: 16,
            rotation: -1, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 20, background: 'rgba(26, 18, 33, 0.9)', borderSize: 2, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: false } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'Sub Goal slider',
            x: 32, y: 23, w: 32, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 16, background: 'rgba(26, 18, 33, 0.85)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 6 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          },
          {
            id: 'dono-main',
            type: 'dono-goal',
            label: 'Dono Goal slider',
            x: 67, y: 23, w: 30, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 5, visible: true, locked: false,
            style: { borderRadius: 16, background: 'rgba(26, 18, 33, 0.85)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 6 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'dono-goal', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'retro': // Monospace terminal layout
      if (scene === 'chat-session' || scene === 'main-stream') {
        return [
          {
            id: 'chat-main',
            type: 'chat',
            label: 'CLI Terminal Log',
            x: 3, y: 3, w: 45, h: 90,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: false,
            style: { borderRadius: 0, background: '#051405', borderSize: 2, borderStyle: 'solid', borderColor: '#33ff33', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'normal', maxMessages: 8 } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'CLI Command Clock',
            x: 52, y: 3, w: 44, h: 16,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 0, background: '#051405', borderSize: 2, borderStyle: 'solid', borderColor: '#33ff33', padding: 6 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'timer', settings: { size: 'compact', customLabel: 'SYS_TIME' } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'CLI Cassette Player',
            x: 52, y: 22, w: 44, h: 16,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 0, background: '#051405', borderSize: 2, borderStyle: 'solid', borderColor: '#33ff33', padding: 6 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: false } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'CLI Progress Meter',
            x: 52, y: 41, w: 44, h: 10,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 0, background: '#051405', borderSize: 1, borderStyle: 'solid', borderColor: '#33ff33', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'minimal': // Spacious white-space Apple style
      if (scene === 'chat-session' || scene === 'main-stream') {
        return [
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Minimal Clean Chat',
            x: 5, y: 5, w: 30, h: 84,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: false,
            style: { borderRadius: 16, background: 'var(--panel-bg)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 12 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'normal', maxMessages: 8 } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Minimalist Alarm Clock',
            x: 39, y: 5, w: 26, h: 16,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 16, background: 'var(--panel-bg)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'timer', settings: { size: 'compact' } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Clean Audio Player',
            x: 69, y: 5, w: 26, h: 16,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 16, background: 'var(--panel-bg)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: false } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'Slim goal bar',
            x: 39, y: 25, w: 56, h: 8,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 12, background: 'var(--panel-bg)', borderSize: 1, borderStyle: 'solid', borderColor: 'var(--panel-border)', padding: 6 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'glass': // Frosted glass plate designs
      if (scene === 'chat-session' || scene === 'main-stream') {
        return [
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Frosted message streams',
            x: 4, y: 4, w: 32, h: 84,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: false,
            style: { borderRadius: 24, background: 'rgba(255, 255, 255, 0.08)', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', padding: 10 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'normal', maxMessages: 7 } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Frosted countdown plate',
            x: 40, y: 4, w: 26, h: 18,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 24, background: 'rgba(255, 255, 255, 0.08)', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', padding: 8 },
            animation: { type: 'float', duration: 6, delay: 0, loop: true },
            content: { type: 'timer', settings: { size: 'compact' } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Frosted audio plate',
            x: 70, y: 4, w: 26, h: 18,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 24, background: 'rgba(255, 255, 255, 0.08)', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: false } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'Glass goal cylinder',
            x: 40, y: 26, w: 56, h: 9,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 24, background: 'rgba(255, 255, 255, 0.08)', borderSize: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', padding: 6 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'luxury': // Golden Roman display
      if (scene === 'chat-session' || scene === 'main-stream') {
        return [
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Golden Lettering Chat',
            x: 4, y: 4, w: 28, h: 84,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: false,
            style: { borderRadius: 4, background: 'rgba(15, 15, 15, 0.98)', borderSize: 1, borderStyle: 'solid', borderColor: '#d4af37', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'normal', maxMessages: 8 } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Classic Roman countdown',
            x: 35, y: 4, w: 30, h: 18,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 4, background: 'rgba(15, 15, 15, 0.98)', borderSize: 1, borderStyle: 'solid', borderColor: '#d4af37', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'timer', settings: { size: 'compact' } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Luxury golden player',
            x: 68, y: 4, w: 28, h: 18,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 4, background: 'rgba(15, 15, 15, 0.98)', borderSize: 1, borderStyle: 'solid', borderColor: '#d4af37', padding: 8 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: false } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'Golden goal threads',
            x: 35, y: 26, w: 61, h: 8,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 4, background: 'rgba(15, 15, 15, 0.98)', borderSize: 1, borderStyle: 'solid', borderColor: '#d4af37', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          }
        ];
      }
      break;

    case 'cyber': // Glowing futuristic frames
    default:
      if (scene === 'chat-session' || scene === 'main-stream') {
        return [
          {
            id: 'chat-main',
            type: 'chat',
            label: 'Cyberpunk Chat Overlay',
            x: 80, y: 2, w: 18, h: 50,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 3, visible: true, locked: false,
            style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 4, padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'chat', settings: { size: 'medium', maxMessages: 8 } }
          },
          {
            id: 'timer-main',
            type: 'timer',
            label: 'Cyber digital Timer',
            x: 25, y: 4, w: 50, h: 14,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 2, visible: true, locked: false,
            style: { borderRadius: 12, background: 'rgba(14, 8, 26, 0.85)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 8, padding: 6 },
            animation: { type: 'float', duration: 6, delay: 0, loop: true },
            content: { type: 'timer', settings: { size: 'compact' } }
          },
          {
            id: 'music-main',
            type: 'music',
            label: 'Cyber Equalizer player',
            x: 25, y: 22, w: 50, h: 14,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 1, visible: true, locked: false,
            style: { borderRadius: 12, background: 'rgba(14, 8, 26, 0.85)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', glowColor: '#FF4DFF', glowBlur: 4, padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'music', settings: { compact: false } }
          },
          {
            id: 'sub-main',
            type: 'sub-goal',
            label: 'Cyber sub progress',
            x: 25, y: 40, w: 24, h: 8,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 4, visible: true, locked: false,
            style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'sub-goal', settings: { compact: true } }
          },
          {
            id: 'dono-main',
            type: 'dono-goal',
            label: 'Cyber dono progress',
            x: 51, y: 40, w: 24, h: 8,
            rotation: 0, opacity: 100, scale: 1.0, zIndex: 5, visible: true, locked: false,
            style: { borderRadius: 8, background: 'rgba(14, 8, 26, 0.8)', borderSize: 1, borderStyle: 'solid', borderColor: '#A855F7', padding: 4 },
            animation: { type: 'none', duration: 1, delay: 0, loop: false },
            content: { type: 'dono-goal', settings: { compact: true } }
          }
        ];
      }
      break;
  }

  // Fallback layout when no preset is specified for this specific scene type
  return [];
};
