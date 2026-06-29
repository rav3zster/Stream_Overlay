import React, { useState } from 'react';
import { useLiveStore, type ThemeType } from '../store/liveStore';
import { Check } from 'lucide-react';

interface ThemeDef {
  id: ThemeType;
  name: string;
  description: string;
  category: string;
  colors: [string, string, string];
  accent: string;
  tags: string[];
}

const THEMES: ThemeDef[] = [
  { id: 'cyber-synth', name: 'Cyber Synth', description: 'Neon cyberpunk with electric magenta & cyan', category: 'Dark', colors: ['#07050f', '#ff4dff', '#5cffe2'], accent: '#a855f7', tags: ['neon', 'dark', 'cyber'] },
  { id: 'synthwave', name: 'Synthwave', description: '80s retro synthwave aesthetic', category: 'Dark', colors: ['#0d0221', '#fe53bb', '#09fbd3'], accent: '#fe53bb', tags: ['retro', 'neon', '80s'] },
  { id: 'glassmorphism', name: 'Glassmorphism', description: 'Frosted glass panels on gradient blobs', category: 'Premium', colors: ['#1a1035', '#a855f7', '#ec4899'], accent: '#c084fc', tags: ['glass', 'blur', 'modern'] },
  { id: 'tokyo-night', name: 'Tokyo Night', description: 'Deep navy with warm city accent lights', category: 'Dark', colors: ['#1a1b26', '#7aa2f7', '#bb9af7'], accent: '#7aa2f7', tags: ['dark', 'blue', 'tokyo'] },
  { id: 'minimal-dark', name: 'Minimal Dark', description: 'Clean, no-noise dark mode aesthetic', category: 'Minimal', colors: ['#111111', '#888888', '#ffffff'], accent: '#888888', tags: ['minimal', 'dark', 'pro'] },
  { id: 'modern-white', name: 'Modern White', description: 'Clean light mode for broadcast settings', category: 'Minimal', colors: ['#f8f8f8', '#1a1a1a', '#6366f1'], accent: '#6366f1', tags: ['light', 'minimal', 'modern'] },
  { id: 'luxury-gold', name: 'Luxury Gold', description: 'Premium gold & dark for high-end streams', category: 'Premium', colors: ['#0a0806', '#c9a227', '#f5e7b2'], accent: '#c9a227', tags: ['luxury', 'gold', 'premium'] },
  { id: 'lo-fi-cafe', name: 'Lo-Fi Café', description: 'Warm beige and amber tones for cozy streams', category: 'Cozy', colors: ['#1a0e05', '#c8783c', '#f5e6d0'], accent: '#c8783c', tags: ['cozy', 'warm', 'lofi'] },
  { id: 'lo-fi-bedroom', name: 'Lo-Fi Bedroom', description: 'Late night bedroom study aesthetic', category: 'Cozy', colors: ['#0e0e1a', '#6b7cff', '#c9b8ff'], accent: '#6b7cff', tags: ['cozy', 'lofi', 'blue'] },
  { id: 'anime-sakura', name: 'Anime Sakura', description: 'Cherry blossom pink VTuber palette', category: 'Anime', colors: ['#1a0014', '#ff80b5', '#ffd6e7'], accent: '#ff80b5', tags: ['anime', 'pink', 'vtuber'] },
  { id: 'anime-room', name: 'Anime Room', description: 'Cozy anime bedroom window light', category: 'Anime', colors: ['#0d1117', '#58a6ff', '#7ee787'], accent: '#58a6ff', tags: ['anime', 'cozy', 'blue'] },
  { id: 'pastel-planets', name: 'Pastel Planets', description: 'Dreamy cosmic pastel space palette', category: 'Anime', colors: ['#1c1428', '#e8aeff', '#ffd6a5'], accent: '#e8aeff', tags: ['pastel', 'space', 'cute'] },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', description: 'High contrast yellow & hot pink neon city', category: 'Dark', colors: ['#030012', '#f7e82f', '#ff0080'], accent: '#f7e82f', tags: ['cyberpunk', 'yellow', 'neon'] },
  { id: 'esports-blue', name: 'Esports Blue', description: 'Competitive dark blue esports HUD', category: 'Gaming', colors: ['#020712', '#1a56db', '#0ea5e9'], accent: '#1a56db', tags: ['esports', 'blue', 'gaming'] },
  { id: 'cyber-hud', name: 'Cyber HUD', description: 'Military green tactical display', category: 'Gaming', colors: ['#000e00', '#00ff41', '#00b300'], accent: '#00ff41', tags: ['green', 'hud', 'tactical'] },
  { id: 'mclaren', name: 'McLaren', description: 'Papaya orange racing inspired', category: 'Racing', colors: ['#0f0f0f', '#ff6600', '#00a19c'], accent: '#ff6600', tags: ['racing', 'orange', 'mclaren'] },
  { id: 'porsche-gulf', name: 'Porsche Gulf', description: 'Iconic Gulf racing blue & orange', category: 'Racing', colors: ['#1a3a6e', '#f5831f', '#87ceeb'], accent: '#f5831f', tags: ['racing', 'gulf', 'blue'] },
  { id: 'ferrari', name: 'Ferrari Red', description: 'Prancing horse signature red', category: 'Racing', colors: ['#1a0000', '#ce2029', '#ffcc00'], accent: '#ce2029', tags: ['racing', 'red', 'ferrari'] },
];

const THEME_CATEGORIES = ['All', 'Dark', 'Minimal', 'Premium', 'Cozy', 'Anime', 'Gaming', 'Racing'];

const ThemePreview: React.FC<{ theme: ThemeDef; isActive: boolean }> = ({ theme, isActive }) => (
  <div
    className="theme-preview"
    style={{
      background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]}22 60%, ${theme.colors[2]}11 100%)`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Mini overlay mockup */}
    <div style={{ position: 'absolute', inset: 0, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ height: 6, width: '55%', borderRadius: 3, background: theme.accent + '80' }} />
      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.accent}30` }} />
        <div style={{ width: '35%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.accent}25` }} />
      </div>
      <div style={{ height: 5, borderRadius: 3, background: theme.accent + '60' }} />
    </div>
    {isActive && (
      <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={10} color="white" />
      </div>
    )}
  </div>
);

export const ThemesPage: React.FC = () => {
  const { theme: activeTheme, setTheme } = useLiveStore();
  const [category, setCategory] = useState('All');

  const filtered = THEMES.filter(t => category === 'All' || t.category === category);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="top-toolbar">
        <span style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 16, fontWeight: 700 }}>Themes</span>
        <div className="toolbar-spacer" />
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Active: <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{activeTheme}</span></span>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, overflowX: 'auto' }}>
        {THEME_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`widget-category-btn${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div className="themes-grid">
          {filtered.map(theme => {
            const isActive = activeTheme === theme.id;
            return (
              <div
                key={theme.id}
                className={`theme-card${isActive ? ' active' : ''}`}
                onClick={() => setTheme(theme.id)}
              >
                <ThemePreview theme={theme} isActive={isActive} />
                <div className="theme-label" style={{ background: 'var(--color-surface-2)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{theme.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{theme.description}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
                    {theme.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: theme.accent + '20', border: `1px solid ${theme.accent}40`, color: theme.accent }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
