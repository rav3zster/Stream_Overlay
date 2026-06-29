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
          <select className="select" value={s.borderStyle ?? 'solid'} onChange={e => updateStyle({ borderStyle: e.target.value as any })} style={{ flex: 1, fontSize: 11 }}>
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
  const updateContent = (settings: Record<string, any>) => update({ content: { ...content, settings: { ...content.settings, ...settings } } });

  if (widget.type === 'countdown-timer') {
    return (
      <Section title="Content" icon={<Settings size={12} />} defaultOpen={false}>
        <Row label="Label">
          <input className="input" value={content.settings.label ?? ''} onChange={e => updateContent({ label: e.target.value })} placeholder="STREAM STARTING SOON" />
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

  if (widget.type === 'text' || widget.type === 'animated-text' || widget.type === 'typing-text') {
    return (
      <Section title="Content" icon={<Settings size={12} />} defaultOpen>
        <Row label="Text">
          <textarea
            className="input"
            value={content.settings.text ?? ''}
            onChange={e => updateContent({ text: e.target.value })}
            placeholder="Enter your text..."
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </Row>
      </Section>
    );
  }

  if (widget.type === 'chat-box') {
    return (
      <Section title="Content" icon={<Settings size={12} />} defaultOpen={false}>
        <Row label="Max msgs">
          <NumInput value={content.settings.maxMessages ?? 12} onChange={v => updateContent({ maxMessages: Math.max(1, v) })} min={1} max={50} />
        </Row>
        <Row label="Show icons">
          <label className="toggle">
            <input type="checkbox" checked={content.settings.showIcons ?? true} onChange={e => updateContent({ showIcons: e.target.checked })} />
            <span className="toggle-track" />
          </label>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--color-text-muted)', padding: 24 }}>
          <span style={{ fontSize: 28 }}>👆</span>
          <span style={{ fontSize: 12, textAlign: 'center' }}>Click an element on the canvas to inspect it</span>
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
        <div style={{ padding: 16, color: 'var(--color-text-muted)', fontSize: 12 }}>
          Multi-select: bulk property editing coming soon.
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
