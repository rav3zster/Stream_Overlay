import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Move, Palette, Type, Zap, Settings } from 'lucide-react';
import { useEditorStore, type DraftWidget, type AnimationType } from '../../store/editorStore';

// ─── Collapsible section ─────────────────────────────────────────────────────

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title, icon, children, defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="inspector-section">
      <div className="inspector-section-header" onClick={() => setOpen(v => !v)}>
        {icon}
        <span style={{ marginLeft: 6 }}>{title}</span>
        <span style={{ marginLeft: 'auto' }}>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </div>
      {open && <div className="inspector-section-body">{children}</div>}
    </div>
  );
};

// ─── Field row ────────────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 72, flexShrink: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ─── Number input ─────────────────────────────────────────────────────────────
const NumInput: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }> = ({
  value, onChange, min, max, step = 1, suffix,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <input
      type="number" className="input input-mono"
      value={Math.round(value)} onChange={e => onChange(parseFloat(e.target.value))}
      min={min} max={max} step={step}
      style={{ flex: 1, textAlign: 'right', padding: '4px 6px' }}
    />
    {suffix && <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>{suffix}</span>}
  </div>
);

// ─── Transform Section ────────────────────────────────────────────────────────
const TransformSection: React.FC<{ widget: DraftWidget; update: (u: Partial<DraftWidget>) => void }> = ({ widget, update }) => (
  <Section title="Transform" icon={<Move size={12} />}>
    {/* Position */}
    <div>
      <div className="input-group-label" style={{ marginBottom: 6 }}>Position</div>
      <div className="input-row">
        <div className="input-with-label">
          <NumInput value={widget.x} onChange={v => update({ x: Math.round(v) })} />
          <span className="input-sub-label">X</span>
        </div>
        <div className="input-with-label">
          <NumInput value={widget.y} onChange={v => update({ y: Math.round(v) })} />
          <span className="input-sub-label">Y</span>
        </div>
      </div>
    </div>
    {/* Size */}
    <div>
      <div className="input-group-label" style={{ marginBottom: 6 }}>Size</div>
      <div className="input-row">
        <div className="input-with-label">
          <NumInput value={widget.width} onChange={v => update({ width: Math.max(4, Math.round(v)) })} min={4} />
          <span className="input-sub-label">W</span>
        </div>
        <div className="input-with-label">
          <NumInput value={widget.height} onChange={v => update({ height: Math.max(4, Math.round(v)) })} min={4} />
          <span className="input-sub-label">H</span>
        </div>
      </div>
    </div>
    <Row label="Rotation">
      <NumInput value={widget.rotation} onChange={v => update({ rotation: v })} min={-360} max={360} suffix="°" />
    </Row>
    <Row label="Opacity">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="range" className="slider" min={0} max={100} value={widget.opacity}
          onChange={e => update({ opacity: parseInt(e.target.value) })} style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 32, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{widget.opacity}%</span>
      </div>
    </Row>
  </Section>
);

// ─── Appearance Section ───────────────────────────────────────────────────────
const AppearanceSection: React.FC<{ widget: DraftWidget; update: (u: Partial<DraftWidget>) => void }> = ({ widget, update }) => {
  const s = widget.style;
  const updateStyle = (partial: Partial<typeof s>) => update({ style: { ...s, ...partial } });

  return (
    <Section title="Appearance" icon={<Palette size={12} />} defaultOpen={false}>
      <Row label="BG Color">
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="color" value={s.background?.replace(/rgba?\([^)]+\)/, '#4a2080') ?? '#000000'}
            onChange={e => updateStyle({ background: e.target.value })}
            style={{ width: 28, height: 28, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
          <input className="input" value={s.background ?? ''} onChange={e => updateStyle({ background: e.target.value })}
            placeholder="rgba(0,0,0,0.8) or #hex" style={{ flex: 1 }} />
        </div>
      </Row>
      <Row label="Radius">
        <NumInput value={s.borderRadius ?? 8} onChange={v => updateStyle({ borderRadius: Math.max(0, v) })} min={0} suffix="px" />
      </Row>
      <Row label="Border">
        <div style={{ display: 'flex', gap: 4 }}>
          <NumInput value={s.borderSize ?? 1} onChange={v => updateStyle({ borderSize: Math.max(0, v) })} min={0} suffix="px" />
          <input type="color" value={s.borderColor ?? '#a855f7'}
            onChange={e => updateStyle({ borderColor: e.target.value })}
            style={{ width: 28, height: 28, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer' }} />
          <select className="select" value={s.borderStyle ?? 'solid'} onChange={e => updateStyle({ borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none' })} style={{ flex: 1, fontSize: 11 }}>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>
      </Row>
      <Row label="Glow">
        <div style={{ display: 'flex', gap: 4 }}>
          <input type="color" value={s.glowColor ?? '#a855f7'}
            onChange={e => updateStyle({ glowColor: e.target.value })}
            style={{ width: 28, height: 28, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer' }} />
          <NumInput value={s.glowBlur ?? 0} onChange={v => updateStyle({ glowBlur: Math.max(0, v) })} min={0} max={100} suffix="px" />
        </div>
      </Row>
      <Row label="Shadow X">
        <NumInput value={s.shadowX ?? 0} onChange={v => updateStyle({ shadowX: v })} />
      </Row>
      <Row label="Shadow Y">
        <NumInput value={s.shadowY ?? 4} onChange={v => updateStyle({ shadowY: v })} />
      </Row>
      <Row label="Shadow Blur">
        <NumInput value={s.shadowBlur ?? 8} onChange={v => updateStyle({ shadowBlur: Math.max(0, v) })} min={0} suffix="px" />
      </Row>
    </Section>
  );
};

// ─── Typography Section ───────────────────────────────────────────────────────
const TEXT_TYPES = ['text', 'animated-text', 'scrolling-text', 'typing-text', 'countdown-timer', 'clock', 'viewer-count', 'latest-follower', 'latest-subscriber', 'latest-donation', 'social-links', 'goal-counter', 'badge'];

const TypographySection: React.FC<{ widget: DraftWidget; update: (u: Partial<DraftWidget>) => void }> = ({ widget, update }) => {
  const s = widget.style;
  const updateStyle = (partial: Partial<typeof s>) => update({ style: { ...s, ...partial } });

  if (!TEXT_TYPES.includes(widget.type)) return null;

  return (
    <Section title="Typography" icon={<Type size={12} />} defaultOpen={false}>
      <Row label="Font">
        <select className="select" value={s.fontFamily ?? 'Inter'} onChange={e => updateStyle({ fontFamily: e.target.value })}>
          <option value="Inter">Inter</option>
          <option value="Space Grotesk">Space Grotesk</option>
          <option value="JetBrains Mono">JetBrains Mono</option>
          <option value="Orbitron">Orbitron</option>
          <option value="Rajdhani">Rajdhani</option>
          <option value="Exo 2">Exo 2</option>
          <option value="Bebas Neue">Bebas Neue</option>
          <option value="Roboto">Roboto</option>
          <option value="Poppins">Poppins</option>
          <option value="Nunito">Nunito</option>
        </select>
      </Row>
      <Row label="Size">
        <NumInput value={s.fontSize ?? 16} onChange={v => updateStyle({ fontSize: Math.max(4, v) })} min={4} suffix="px" />
      </Row>
      <Row label="Weight">
        <select className="select" value={s.fontWeight ?? '600'} onChange={e => updateStyle({ fontWeight: e.target.value })}>
          <option value="300">Light (300)</option>
          <option value="400">Regular (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semibold (600)</option>
          <option value="700">Bold (700)</option>
          <option value="800">Extrabold (800)</option>
          <option value="900">Black (900)</option>
        </select>
      </Row>
      <Row label="Color">
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="color" value={s.fontColor ?? '#ffffff'}
            onChange={e => updateStyle({ fontColor: e.target.value })}
            style={{ width: 28, height: 28, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer' }} />
          <input className="input" value={s.fontColor ?? '#ffffff'} onChange={e => updateStyle({ fontColor: e.target.value })} />
        </div>
      </Row>
      <Row label="Align">
        <div style={{ display: 'flex', gap: 4 }}>
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} className={`btn-icon${s.textAlign === a ? ' active' : ''}`}
              style={{ flex: 1 }} onClick={() => updateStyle({ textAlign: a })}>
              {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Spacing">
        <NumInput value={s.letterSpacing ?? 0} onChange={v => updateStyle({ letterSpacing: v })} step={0.5} suffix="px" />
      </Row>
    </Section>
  );
};

// ─── Animation Section ────────────────────────────────────────────────────────
const ANIMATION_TYPES: AnimationType[] = ['none', 'fade', 'scale', 'slide-up', 'slide-left', 'bounce', 'glow', 'pulse', 'float', 'shake', 'spin'];

const AnimationSection: React.FC<{ widget: DraftWidget; update: (u: Partial<DraftWidget>) => void }> = ({ widget, update }) => {
  const anim = widget.animation;
  const updateAnim = (partial: Partial<typeof anim>) => update({ animation: { ...anim, ...partial } });

  return (
    <Section title="Animation" icon={<Zap size={12} />} defaultOpen={false}>
      <Row label="Type">
        <select className="select" value={anim.type} onChange={e => updateAnim({ type: e.target.value as AnimationType })}>
          {ANIMATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Row>
      <Row label="Duration">
        <NumInput value={anim.duration} onChange={v => updateAnim({ duration: Math.max(0.1, v) })} min={0.1} step={0.1} suffix="s" />
      </Row>
      <Row label="Delay">
        <NumInput value={anim.delay} onChange={v => updateAnim({ delay: Math.max(0, v) })} min={0} step={0.1} suffix="s" />
      </Row>
      <Row label="Loop">
        <label className="toggle">
          <input type="checkbox" checked={anim.loop} onChange={e => updateAnim({ loop: e.target.checked })} />
          <span className="toggle-track" />
        </label>
      </Row>
    </Section>
  );
};

// ─── Content Section ──────────────────────────────────────────────────────────
const ContentSection: React.FC<{ widget: DraftWidget; update: (u: Partial<DraftWidget>) => void }> = ({ widget, update }) => {
  const content = widget.content;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateContent = (settings: Record<string, any>) => update({ content: { ...content, settings: { ...content.settings, ...settings } } });

  const cType = widget.content?.type || widget.type;

  // 1. Countdown Timer Widget
  if (cType === 'countdown-timer' || cType === 'timer') {
    return (
      <Section title="Timer Content" icon={<Settings size={12} />} defaultOpen>
        <Row label="Label">
          <input className="input" value={content.settings.label ?? 'STARTING IN'} onChange={e => updateContent({ label: e.target.value })} placeholder="STARTING IN" />
        </Row>
        <Row label="Duration">
          <NumInput value={content.settings.duration ?? 600} onChange={v => updateContent({ duration: Math.max(0, v) })} min={0} suffix="s" />
        </Row>
        <Row label="Show hrs">
          <label className="toggle">
            <input type="checkbox" checked={content.settings.showHours ?? false} onChange={e => updateContent({ showHours: e.target.checked })} />
            <span className="toggle-track" />
          </label>
        </Row>
      </Section>
    );
  }

  // 2. Text, Scroll text & Scrolling Ticker Widgets
  if (['text', 'animated-text', 'typing-text', 'scrolling-text', 'ticker'].includes(cType)) {
    const isScrolling = cType === 'scrolling-text' || cType === 'ticker';
    return (
      <Section title="Text Content" icon={<Settings size={12} />} defaultOpen>
        <Row label="Text Content">
          <textarea
            className="input"
            value={content.settings.text ?? ''}
            onChange={e => updateContent({ text: e.target.value })}
            placeholder="Enter text payload..."
            rows={3}
            style={{ resize: 'vertical', fontSize: 11 }}
          />
        </Row>
        {isScrolling && (
          <>
            <Row label="Scroll Speed">
              <select className="select" value={content.settings.scrollSpeed ?? 'medium'} onChange={e => updateContent({ scrollSpeed: e.target.value })}>
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </Row>
            <Row label="Direction">
              <select className="select" value={content.settings.scrollDir ?? 'left'} onChange={e => updateContent({ scrollDir: e.target.value })}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </Row>
          </>
        )}
      </Section>
    );
  }

  // 3. Goal Counter Widget ("counting features")
  if (['goal-counter', 'dono-goal', 'sub-goal', 'follower-goal', 'goals'].includes(cType)) {
    const current = content.settings.currentValue ?? 0;
    const target = content.settings.targetValue ?? 100;
    const label = content.settings.goalLabel ?? 'Follower Goal';

    return (
      <Section title="Goal Counter Settings" icon={<Settings size={12} />} defaultOpen>
        <Row label="Goal Name">
          <input className="input" value={label} onChange={e => updateContent({ goalLabel: e.target.value })} />
        </Row>
        <Row label="Target">
          <NumInput value={target} onChange={v => updateContent({ targetValue: Math.max(1, v) })} min={1} />
        </Row>
        <Row label="Current">
          <NumInput value={current} onChange={v => updateContent({ currentValue: v })} />
        </Row>
        {/* Counting increments features */}
        <Row label="Counting">
          <div style={{ display: 'flex', gap: 4, width: '100%' }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0 }} onClick={() => updateContent({ currentValue: current - 10 })}>-10</button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0 }} onClick={() => updateContent({ currentValue: current - 1 })}>-1</button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0 }} onClick={() => updateContent({ currentValue: current + 1 })}>+1</button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: 9, height: 22, padding: 0 }} onClick={() => updateContent({ currentValue: current + 10 })}>+10</button>
          </div>
        </Row>
      </Section>
    );
  }

  // 4. Music Player & Spotify ("Spotify API mock connection")
  if (['spotify', 'music', 'now-playing-text'].includes(cType)) {
    const isConnected = content.settings.connected ?? false;
    const track = content.settings.trackTitle ?? 'Chill Synthwave Mix';
    const artist = content.settings.artistName ?? 'VibeOverlay DJ';

    return (
      <Section title="Spotify Settings" icon={<Settings size={12} />} defaultOpen>
        <Row label="Status">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: isConnected ? 'var(--color-success)' : '#ef4444',
              fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase'
            }}>
              {isConnected ? 'Connected 🟢' : 'Disconnected 🔴'}
            </span>
          </div>
        </Row>
        {!isConnected ? (
          <button
            className="btn btn-primary"
            style={{ width: '100%', height: 26, fontSize: 9, marginTop: 4 }}
            onClick={() => {
              alert('Redirecting to Spotify login integration...\nAccount Rave_VT connected successfully!');
              updateContent({ connected: true });
            }}
          >
            Connect Spotify Account
          </button>
        ) : (
          <>
            <Row label="Track">
              <input className="input" value={track} onChange={e => updateContent({ trackTitle: e.target.value })} />
            </Row>
            <Row label="Artist">
              <input className="input" value={artist} onChange={e => updateContent({ artistName: e.target.value })} />
            </Row>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', height: 22, fontSize: 9, marginTop: 4 }}
              onClick={() => updateContent({ connected: false })}
            >
              Disconnect Spotify
            </button>
          </>
        )}
      </Section>
    );
  }

  // 5. Chat Box Widget
  if (cType === 'chat-box' || cType === 'chat') {
    return (
      <Section title="Chat Settings" icon={<Settings size={12} />} defaultOpen>
        <Row label="Max Messages">
          <NumInput value={content.settings.maxMessages ?? 12} onChange={v => updateContent({ maxMessages: Math.max(1, v) })} min={1} max={50} />
        </Row>
        <Row label="Show Badges">
          <label className="toggle">
            <input type="checkbox" checked={content.settings.showIcons ?? true} onChange={e => updateContent({ showIcons: e.target.checked })} />
            <span className="toggle-track" />
          </label>
        </Row>
        <Row label="Style Theme">
          <select className="select" value={content.settings.chatTheme ?? 'dark'} onChange={e => updateContent({ chatTheme: e.target.value })}>
            <option value="dark">Standard Dark</option>
            <option value="bubble">Clean Bubble</option>
            <option value="transparent">Transparent Minimal</option>
          </select>
        </Row>
      </Section>
    );
  }

  // 6. Social Links Widget
  if (cType === 'social-links' || cType === 'socials') {
    return (
      <Section title="Social Details" icon={<Settings size={12} />} defaultOpen>
        <Row label="Twitch">
          <input className="input" value={content.settings.twitch ?? 'Rave_VT'} onChange={e => updateContent({ twitch: e.target.value })} />
        </Row>
        <Row label="Twitter">
          <input className="input" value={content.settings.twitter ?? '@RaveVT'} onChange={e => updateContent({ twitter: e.target.value })} />
        </Row>
        <Row label="Discord">
          <input className="input" value={content.settings.discord ?? 'rave-vt-lounge'} onChange={e => updateContent({ discord: e.target.value })} />
        </Row>
      </Section>
    );
  }

  // 7. Clock & Date Widget
  if (cType === 'clock' || cType === 'date') {
    return (
      <Section title="Clock Settings" icon={<Settings size={12} />} defaultOpen>
        <Row label="Show Sec">
          <label className="toggle">
            <input type="checkbox" checked={content.settings.showSeconds ?? true} onChange={e => updateContent({ showSeconds: e.target.checked })} />
            <span className="toggle-track" />
          </label>
        </Row>
        <Row label="24h Format">
          <label className="toggle">
            <input type="checkbox" checked={content.settings.use24Hour ?? false} onChange={e => updateContent({ use24Hour: e.target.checked })} />
            <span className="toggle-track" />
          </label>
        </Row>
      </Section>
    );
  }

  // 8. VTuber Placeholder Widget
  if (cType === 'vtuber') {
    return (
      <Section title="Avatar Settings" icon={<Settings size={12} />} defaultOpen>
        <Row label="Sleeping">
          <label className="toggle">
            <input type="checkbox" checked={content.settings.sleeping ?? false} onChange={e => updateContent({ sleeping: e.target.checked })} />
            <span className="toggle-track" />
          </label>
        </Row>
        <Row label="Sensitivity">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="range" className="slider" min={0} max={100} value={content.settings.micSensitivity ?? 50}
              onChange={e => updateContent({ micSensitivity: parseInt(e.target.value) })} style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 24 }}>{content.settings.micSensitivity ?? 50}%</span>
          </div>
        </Row>
      </Section>
    );
  }

  // 9. Camera / Webcam / Game Captures Frames
  if (['camera-frame', 'avatar-frame', 'game-capture', 'game-frame'].includes(cType)) {
    return (
      <Section title="Frame Settings" icon={<Settings size={12} />} defaultOpen>
        <Row label="Aspect Ratio">
          <select className="select" value={content.settings.aspectRatio ?? '16:9'} onChange={e => updateContent({ aspectRatio: e.target.value })}>
            <option value="16:9">Widescreen (16:9)</option>
            <option value="4:3">Webcam standard (4:3)</option>
            <option value="1:1">Profile Square (1:1)</option>
            <option value="custom">Custom Freesize</option>
          </select>
        </Row>
        <Row label="Glow Speed">
          <select className="select" value={content.settings.glowSpeed ?? 'medium'} onChange={e => updateContent({ glowSpeed: e.target.value })}>
            <option value="slow">Slow Pulse</option>
            <option value="medium">Medium Glow</option>
            <option value="fast">Rapid Sparkle</option>
          </select>
        </Row>
      </Section>
    );
  }

  // 10. General Media Widgets (Image, GIF, Video, Lottie, SVG)
  if (['image', 'gif', 'video', 'lottie', 'svg', 'logo', 'media'].includes(cType)) {
    return (
      <Section title="Media Properties" icon={<Settings size={12} />} defaultOpen>
        <Row label="URL/Source">
          <input className="input" value={content.settings.url ?? ''} onChange={e => updateContent({ url: e.target.value })} placeholder="https://example.com/file.png" style={{ fontSize: 10 }} />
        </Row>
        <Row label="Object Fit">
          <select className="select" value={content.settings.objectFit ?? 'cover'} onChange={e => updateContent({ objectFit: e.target.value })}>
            <option value="cover">Cover (Fill & Crop)</option>
            <option value="contain">Contain (Fit Box)</option>
            <option value="fill">Stretch to Box</option>
          </select>
        </Row>
      </Section>
    );
  }

  return null;
};

// ─── Right Panel (Inspector) ──────────────────────────────────────────────────
export const RightPanel: React.FC = () => {
  const { getSelectedWidgets, updateWidget } = useEditorStore();
  const selected = getSelectedWidgets();

  if (selected.length === 0) {
    return (
      <div className="right-panel">
        <div className="panel-header">
          <span className="panel-title">Inspector</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--color-text-muted)', padding: 24 }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-3)', textAlign: 'center' }}>No element selected.</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 180 }}>Select an element on the canvas to inspect its properties.</span>
        </div>
      </div>
    );
  }

  if (selected.length > 1) {
    return (
      <div className="right-panel">
        <div className="panel-header">
          <span className="panel-title">{selected.length} selected</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--color-text-muted)', padding: 24 }}>
          <span style={{ fontSize: 32 }}>🗂️</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-3)', textAlign: 'center' }}>Multiple selected</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>Group properties or align tools in the toolbar.</span>
        </div>
      </div>
    );
  }

  const widget = selected[0];
  const update = (u: Partial<DraftWidget>) => updateWidget(widget.id, u);

  return (
    <div className="right-panel">
      <div className="panel-header">
        <span className="panel-title">Inspector</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{widget.type}</span>
      </div>

      {/* Widget label */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <input
          className="input"
          value={widget.label}
          onChange={e => update({ label: e.target.value })}
          style={{ fontWeight: 600 }}
          placeholder="Widget label"
        />
      </div>

      <div className="panel-body" style={{ padding: '8px 12px' }}>
        <ContentSection widget={widget} update={update} />
        <TransformSection widget={widget} update={update} />
        <AppearanceSection widget={widget} update={update} />
        <TypographySection widget={widget} update={update} />
        <AnimationSection widget={widget} update={update} />
      </div>
    </div>
  );
};
