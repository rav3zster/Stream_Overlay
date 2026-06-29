import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { DraftWidget } from '../store/editorStore';

interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  colors: string[];
  widgetCount: number;
  widgets: DraftWidget[];
}

const PRESET_CATEGORIES = ['All', 'Minimal', 'Cyber', 'Gaming', 'VTuber', 'Cozy', 'Esports', 'Podcast'];

const PRESETS: Preset[] = [
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean dark overlay, essentials only',
    category: 'Minimal',
    tags: ['dark', 'clean', 'pro'],
    colors: ['#0e0b1e', '#a855f7', '#5cffe2'],
    widgetCount: 3,
    widgets: [],
  },
  {
    id: 'cyber-synth',
    name: 'Cyber Synth',
    description: 'Neon cyberpunk aesthetic with glowing elements',
    category: 'Cyber',
    tags: ['neon', 'cyber', 'glow'],
    colors: ['#0a0014', '#ff4dff', '#00f0ff'],
    widgetCount: 6,
    widgets: [],
  },
  {
    id: 'valorant-fps',
    name: 'Valorant FPS',
    description: 'Tactical shooter overlay with HUD elements',
    category: 'Gaming',
    tags: ['fps', 'gaming', 'esports'],
    colors: ['#111', '#ff4655', '#ffffff'],
    widgetCount: 5,
    widgets: [],
  },
  {
    id: 'just-chatting',
    name: 'Just Chatting',
    description: 'Clean layout with prominent chat and cam frame',
    category: 'Cozy',
    tags: ['irl', 'chat', 'cam'],
    colors: ['#1a1a2e', '#16213e', '#a855f7'],
    widgetCount: 4,
    widgets: [],
  },
  {
    id: 'vtuber-cozy',
    name: 'VTuber Cozy',
    description: 'Soft pastel room aesthetic for VTubers',
    category: 'VTuber',
    tags: ['anime', 'cozy', 'pastel'],
    colors: ['#f8d7e3', '#a8c8e8', '#c8a8e8'],
    widgetCount: 5,
    widgets: [],
  },
  {
    id: 'esports-blue',
    name: 'Esports Blue',
    description: 'Competitive dark blue esports HUD layout',
    category: 'Esports',
    tags: ['dark', 'blue', 'esports'],
    colors: ['#020712', '#1a56db', '#0ea5e9'],
    widgetCount: 7,
    widgets: [],
  },
  {
    id: 'podcast-pro',
    name: 'Podcast Pro',
    description: 'Clean minimal layout for podcast and IRL',
    category: 'Podcast',
    tags: ['podcast', 'minimal', 'irl'],
    colors: ['#18181b', '#a1a1aa', '#ffffff'],
    widgetCount: 3,
    widgets: [],
  },
  {
    id: 'minecraft-cozy',
    name: 'Cozy Minecraft',
    description: 'Warm, pixelated feel for survival/creative',
    category: 'Cozy',
    tags: ['minecraft', 'cozy', 'warm'],
    colors: ['#3d1c02', '#8b4513', '#5cffe2'],
    widgetCount: 4,
    widgets: [],
  },
  {
    id: 'neon-racing',
    name: 'Neon Racing',
    description: 'High speed overlay with racing HUD',
    category: 'Gaming',
    tags: ['racing', 'neon', 'speed'],
    colors: ['#05050f', '#ff6600', '#ffcc00'],
    widgetCount: 5,
    widgets: [],
  },
  {
    id: 'anime-sakura',
    name: 'Anime Sakura',
    description: 'Soft pink cherry blossom anime aesthetic',
    category: 'VTuber',
    tags: ['anime', 'sakura', 'pink'],
    colors: ['#1a0014', '#ff80b5', '#ffd6e7'],
    widgetCount: 5,
    widgets: [],
  },
  {
    id: 'horror-darkside',
    name: 'Horror Dark Side',
    description: 'Dark and creepy overlay for horror games',
    category: 'Gaming',
    tags: ['horror', 'dark', 'red'],
    colors: ['#050505', '#8b0000', '#300000'],
    widgetCount: 4,
    widgets: [],
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium gold and dark aesthetic',
    category: 'Minimal',
    tags: ['luxury', 'gold', 'dark'],
    colors: ['#0a0806', '#c9a227', '#f5e7b2'],
    widgetCount: 4,
    widgets: [],
  },
];

// ── Gradient preview for preset cards
const PresetPreview: React.FC<{ colors: string[] }> = ({ colors }) => (
  <div
    className="preset-preview"
    style={{
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1] ?? colors[0]} 60%, ${colors[2] ?? colors[1] ?? colors[0]} 100%)`,
    }}
  >
    {/* Mini widget mockups */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 12, gap: 6 }}>
      <div style={{ height: 8, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
      <div style={{ height: 6, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ flex: 1 }} />
      <div style={{ height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: `1px solid ${colors[1] ? colors[1] + '40' : 'rgba(255,255,255,0.1)'}` }} />
    </div>
  </div>
);

export const PresetsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { editingSceneId, addWidget } = useEditorStore();

  const filtered = PRESETS.filter(p =>
    selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleUsePreset = (preset: Preset) => {
    if (!editingSceneId) return;
    if (!confirm(`Apply "${preset.name}" preset to the current scene? This will add ${preset.widgetCount} elements.`)) return;
    preset.widgets.forEach(w => addWidget(w));
    alert(`Preset "${preset.name}" imported! ${preset.widgetCount} elements added to your scene.`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="top-toolbar">
        <span style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 16, fontWeight: 700 }}>Preset Layouts</span>
        <div className="toolbar-spacer" />
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{filtered.length} presets</span>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, overflowX: 'auto' }}>
        {PRESET_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`widget-category-btn${selectedCategory === cat ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div className="presets-grid">
          {filtered.map(preset => (
            <div key={preset.id} className="preset-card">
              <PresetPreview colors={preset.colors} />
              <div className="preset-body">
                <div className="preset-name">{preset.name}</div>
                <div className="preset-desc">{preset.description}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {preset.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: 'var(--color-text-2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 10, fontSize: 12 }}
                  onClick={() => handleUsePreset(preset)}
                >
                  Use Preset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
