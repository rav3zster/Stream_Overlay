import React, { useState, useEffect } from 'react';
import { useOverlayStore, type Widget } from '../../store/overlayStore';
import { 
  Copy, Trash2, Eye, EyeOff, Lock, Unlock, Layers, ArrowUp, ArrowDown, Plus, 
  ChevronDown, ChevronRight, Sliders, Palette, Type, Move, Activity, 
  Settings, HelpCircle, Pipette, Zap
} from 'lucide-react';

const GOOGLE_FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter (Clean)' },
  { value: 'Orbitron, sans-serif', label: 'Orbitron (Futuristic)' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk (Tech)' },
  { value: 'Share Tech Mono, monospace', label: 'Share Tech Mono (Retro Code)' },
  { value: 'Poppins, sans-serif', label: 'Poppins (Geometric)' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Sleek)' },
  { value: 'Bebas Neue, sans-serif', label: 'Bebas Neue (Bold Display)' },
  { value: 'Playfair Display, serif', label: 'Playfair Display (Elegant)' },
  { value: 'Comfortaa, cursive', label: 'Comfortaa (Rounded Cozy)' },
  { value: 'Outfit, sans-serif', label: 'Outfit (Modern)' },
  { value: 'Noto Sans JP, sans-serif', label: 'Noto Sans JP (Japanese)' },
  { value: 'Lora, serif', label: 'Lora (Editorial)' },
  { value: 'Cinzel Decorative, serif', label: 'Cinzel (Classical Luxury)' }
];

const ANIMATION_TYPES = [
  { value: 'none', label: '🚫 Static (None)' },
  { value: 'fade', label: '✨ Fade In' },
  { value: 'scale', label: '🔍 Zoom Scale' },
  { value: 'slide', label: '➡️ Slide Entrance' },
  { value: 'bounce', label: '🏀 Bounce' },
  { value: 'glow', label: '💡 Pulsing Glow' },
  { value: 'pulse', label: '💓 Heartbeat Pulse' },
  { value: 'float', label: '🎈 Floating Float' },
  { value: 'shake', label: '📳 Shake Wobble' }
];

const CONTENT_TYPES = [
  { value: 'timer', label: '⏳ Timer / Countdown' },
  { value: 'chat', label: '💬 Scrolling Live Chat' },
  { value: 'music', label: '🎵 Now Playing Song' },
  { value: 'alerts', label: '🔔 Alerts Notification' },
  { value: 'sub-goal', label: '⭐ Subscriber Progress Goal' },
  { value: 'dono-goal', label: '💰 Donation Progress Goal' },
  { value: 'follower-goal', label: '💜 Follower Progress Goal' },
  { value: 'event-list', label: '📋 Recent Event Log' },
  { value: 'vtuber', label: '😊 VTuber Avatar Box' },
  { value: 'socials', label: '📌 Social Handles Card' },
  { value: 'ticker', label: '📢 Bottom Info Ticker' },
  { value: 'clock', label: '🕒 Digital Wall Clock' },
  { value: 'weather', label: '🌤️ Local Weather Forecast' },
  { value: 'stream-uptime', label: '🚀 Live Stream Uptime' },
  { value: 'discord-status', label: '👾 Discord Rich Status' },
  { value: 'cpu-usage', label: '💻 CPU & RAM Usage Monitor' },
  { value: 'countdown', label: '⏲️ Custom Event Countdown' },
  { value: 'custom-text', label: '✍️ Custom Label / Text / Quote' },
  { value: 'pet-widget', label: '🐱 Interactive Pixel Pet' },
  { value: 'polls', label: '🗳️ Live Chat Poll' },
  { value: 'media', label: '🖼️ Custom Media Asset' },
  { value: 'game-frame', label: '🎮 Gameplay Capture Frame' }
];

// Helper Color Picker Component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  recentColors?: string[];
}

const PremiumColorPicker: React.FC<ColorPickerProps> = ({ 
  label, 
  value = '#A855F7', 
  onChange,
  recentColors = ['#ff4dff', '#5cffe2', '#a855f7', '#ff0055', '#33ff33', '#1e1b4b', '#000000', '#ffffff']
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [gradientType, setGradientType] = useState<'solid' | 'linear' | 'radial'>('solid');
  const [color1, setColor1] = useState('#a855f7');
  const [color2, setColor2] = useState('#ff4dff');
  const [angle, setAngle] = useState(90);

  // Parse color on mount
  useEffect(() => {
    if (!value) return;
    if (value.startsWith('linear-gradient')) {
      setGradientType('linear');
      const matches = value.match(/#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g);
      if (matches && matches.length >= 2) {
        setColor1(matches[0]);
        setColor2(matches[1]);
      }
      const degMatch = value.match(/(\d+)deg/);
      if (degMatch) setAngle(parseInt(degMatch[1]));
    } else if (value.startsWith('radial-gradient')) {
      setGradientType('radial');
      const matches = value.match(/#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g);
      if (matches && matches.length >= 2) {
        setColor1(matches[0]);
        setColor2(matches[1]);
      }
    } else {
      setGradientType('solid');
      setColor1(value);
    }
  }, [value]);

  const handleGradientChange = (type: 'solid' | 'linear' | 'radial', c1: string, c2: string, ang: number) => {
    if (type === 'linear') {
      onChange(`linear-gradient(${ang}deg, ${c1}, ${c2})`);
    } else if (type === 'radial') {
      onChange(`radial-gradient(circle, ${c1}, ${c2})`);
    } else {
      onChange(c1);
    }
  };

  const triggerEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const dropper = new (window as any).EyeDropper();
        const result = await dropper.open();
        setColor1(result.sRGBHex);
        handleGradientChange(gradientType, result.sRGBHex, color2, angle);
      } catch (err) {
        console.error('Eyedropper failed:', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <div className="flex justify-between items-center text-slate-400 font-bold mb-0.5">
        <span>{label}</span>
        {'EyeDropper' in window && (
          <button 
            onClick={triggerEyeDropper} 
            className="p-0.5 rounded hover:bg-white/10 text-vibeCyan"
            title="Pick color from screen"
          >
            <Pipette size={11} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 bg-black/40 border border-purple-950/60 p-1.5 rounded-lg">
        <button 
          className="w-6 h-6 rounded border border-white/10 flex-shrink-0 cursor-pointer"
          style={{ background: value }}
          onClick={() => setPickerOpen(!pickerOpen)}
        />
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-white font-mono text-[9px] w-full focus:outline-none"
        />
      </div>

      {pickerOpen && (
        <div className="mt-1.5 p-2 bg-[#120f28] border border-purple-900/40 rounded-xl flex flex-col gap-2 z-50">
          <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-center">
            {(['solid', 'linear', 'radial'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setGradientType(t);
                  handleGradientChange(t, color1, color2, angle);
                }}
                className={`py-0.5 rounded ${gradientType === t ? 'bg-vibePrimary text-white' : 'bg-black/20 text-slate-400 hover:text-slate-200'}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2 items-center">
              <span className="text-[8px] text-slate-400 font-semibold w-10">Color 1:</span>
              <input 
                type="color" 
                value={color1.startsWith('#') && color1.length === 7 ? color1 : '#a855f7'} 
                onChange={(e) => {
                  setColor1(e.target.value);
                  handleGradientChange(gradientType, e.target.value, color2, angle);
                }}
                className="bg-transparent w-full h-5 rounded border border-purple-950 cursor-pointer"
              />
            </div>

            {gradientType !== 'solid' && (
              <>
                <div className="flex gap-2 items-center">
                  <span className="text-[8px] text-slate-400 font-semibold w-10">Color 2:</span>
                  <input 
                    type="color" 
                    value={color2.startsWith('#') && color2.length === 7 ? color2 : '#ff4dff'} 
                    onChange={(e) => {
                      setColor2(e.target.value);
                      handleGradientChange(gradientType, color1, e.target.value, angle);
                    }}
                    className="bg-transparent w-full h-5 rounded border border-purple-950 cursor-pointer"
                  />
                </div>
                {gradientType === 'linear' && (
                  <div className="flex gap-2 items-center">
                    <span className="text-[8px] text-slate-400 font-semibold w-10">Angle:</span>
                    <input 
                      type="range" 
                      min="0" max="360"
                      value={angle} 
                      onChange={(e) => {
                        const deg = parseInt(e.target.value);
                        setAngle(deg);
                        handleGradientChange(gradientType, color1, color2, deg);
                      }}
                      className="w-full accent-vibePrimary"
                    />
                    <span className="text-[9px] text-slate-300 font-mono w-8 text-right">{angle}°</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-purple-950 pt-2 flex flex-col gap-1">
            <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Recent Colors</span>
            <div className="flex gap-1.5 flex-wrap">
              {recentColors.map((c, i) => (
                <button
                  key={i}
                  className="w-4 h-4 rounded border border-white/5 cursor-pointer hover:scale-110 transition"
                  style={{ background: c }}
                  onClick={() => {
                    setColor1(c);
                    handleGradientChange(gradientType, c, color2, angle);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WidgetInspector: React.FC = () => {
  const activeScene = useOverlayStore(s => s.currentScene);
  const selectedWidgetId = useOverlayStore(s => s.selectedWidgetId);
  const widgets = useOverlayStore(s => s.sceneWidgets[activeScene] || []);
  const widget = widgets.find(w => w.id === selectedWidgetId);
  
  const updateWidget = useOverlayStore(s => s.updateWidget);
  const removeWidget = useOverlayStore(s => s.removeWidget);
  const duplicateWidget = useOverlayStore(s => s.duplicateWidget);
  const copyWidgetStyle = useOverlayStore(s => s.copyWidgetStyle);
  const pasteWidgetStyle = useOverlayStore(s => s.pasteWidgetStyle);
  const bringToFront = useOverlayStore(s => s.bringToFront);
  const sendBackward = useOverlayStore(s => s.sendBackward);

  // Inspector Section Collapsibles
  const [sections, setSections] = useState<Record<string, boolean>>({
    general: true,
    appearance: true,
    typography: false,
    layout: false,
    behavior: false,
    animation: false,
    advanced: false
  });

  const toggleSection = (sec: string) => {
    setSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Google Fonts dynamic loader
  useEffect(() => {
    if (widget?.style?.fontFamily) {
      const fontName = widget.style.fontFamily.split(',')[0].replace(/['"]/g, '');
      const linkId = `google-font-${fontName}`;
      if (!document.getElementById(linkId) && fontName !== 'inherit') {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;700;900&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [widget?.style?.fontFamily]);

  if (!widget) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8 text-center bg-black/20 border border-white/5 rounded-xl p-4">
        <Layers size={24} className="mb-2 opacity-40 text-purple-400 animate-pulse" />
        <span className="font-bold uppercase tracking-wider text-slate-400">Select an Element</span>
        <span className="mt-1 text-[10px] text-white/30">Click on any overlay widget inside the scene workspace to load properties.</span>
      </div>
    );
  }

  const handleUpdate = (fields: Partial<Widget>) => {
    updateWidget(widget.id, fields);
  };

  const handleStyleUpdate = (styleFields: Partial<Widget['style']>) => {
    handleUpdate({
      style: {
        ...widget.style,
        ...styleFields
      }
    });
  };

  const handleAnimationUpdate = (animFields: Partial<Widget['animation']>) => {
    handleUpdate({
      animation: {
        ...widget.animation,
        ...animFields
      }
    });
  };

  const handleContentSettingsUpdate = (settingsFields: Record<string, any>) => {
    handleUpdate({
      content: {
        ...widget.content,
        settings: {
          ...widget.content?.settings,
          ...settingsFields
        }
      }
    });
  };

  const settings = widget.content?.settings || {};

  return (
    <div className="flex flex-col gap-3 text-xs bg-[#090715]/90 border border-purple-950/65 rounded-2xl p-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin select-none shadow-glow">
      
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center border-b border-purple-900/25 pb-3">
        <div className="flex flex-col min-w-0">
          <span className="font-display font-black text-white uppercase tracking-wider text-[12px] truncate">
            {widget.label}
          </span>
          <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">ID: {widget.id.split('-')[0]}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button 
            onClick={() => handleUpdate({ locked: !widget.locked })} 
            className={`p-1.5 rounded-lg border transition ${widget.locked ? 'bg-amber-950/40 text-amber-400 border-amber-500/25' : 'bg-white/5 text-slate-400 hover:text-white border-transparent'}`}
            title={widget.locked ? "Unlock" : "Lock"}
          >
            {widget.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          <button 
            onClick={() => handleUpdate({ visible: !widget.visible })} 
            className={`p-1.5 rounded-lg border transition ${!widget.visible ? 'bg-red-950/40 text-red-400 border-red-500/25' : 'bg-white/5 text-slate-400 hover:text-white border-transparent'}`}
            title={widget.visible ? "Hide" : "Show"}
          >
            {widget.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>
      </div>

      {/* ── GENERAL SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('general')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Sliders size={12} className="text-vibeAccent" /> General</span>
          {sections.general ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.general && (
          <div className="p-3 flex flex-col gap-3 border-t border-purple-950/20">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Layer label</label>
              <input 
                type="text" 
                value={widget.label} 
                onChange={(e) => handleUpdate({ label: e.target.value })} 
                className="w-full bg-black/40 border border-purple-950/60 rounded-lg p-1.5 text-white focus:outline-none focus:border-vibePrimary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Widget Type</label>
              <select 
                value={widget.content?.type || widget.type}
                onChange={(e) => handleUpdate({ type: e.target.value, content: { ...widget.content, type: e.target.value } })}
                className="w-full bg-black/40 border border-purple-950/60 rounded-lg p-1.5 text-white focus:outline-none"
              >
                {CONTENT_TYPES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Description / Notes</label>
              <input 
                type="text" 
                value={settings.description || ''} 
                onChange={(e) => handleContentSettingsUpdate({ description: e.target.value })} 
                className="w-full bg-black/40 border border-purple-950/60 rounded-lg p-1.5 text-white focus:outline-none"
                placeholder="Developer design logs..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Tags (comma separated)</label>
              <input 
                type="text" 
                value={settings.tags || ''} 
                onChange={(e) => handleContentSettingsUpdate({ tags: e.target.value })} 
                className="w-full bg-black/40 border border-purple-950/60 rounded-lg p-1.5 text-white focus:outline-none"
                placeholder="chat, alert, gameplay"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── APPEARANCE SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('appearance')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Palette size={12} className="text-vibeSecondary" /> Appearance</span>
          {sections.appearance ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.appearance && (
          <div className="p-3 flex flex-col gap-3.5 border-t border-purple-950/20">
            <PremiumColorPicker 
              label="Canvas background fill / Gradient"
              value={settings.gradient || widget.style?.background || 'rgba(14, 8, 26, 0.8)'}
              onChange={(val) => {
                if (val.includes('gradient')) {
                  handleContentSettingsUpdate({ gradient: val });
                } else {
                  handleContentSettingsUpdate({ gradient: '' });
                  handleStyleUpdate({ background: val });
                }
              }}
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Corner Radius (px)</label>
                <input 
                  type="number" 
                  value={widget.style?.borderRadius ?? 8} 
                  onChange={(e) => handleStyleUpdate({ borderRadius: parseInt(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Container padding (px)</label>
                <input 
                  type="number" 
                  value={widget.style?.padding ?? 4} 
                  onChange={(e) => handleStyleUpdate({ padding: parseInt(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
            </div>

            {/* Borders */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Border Width (px)</label>
                <input 
                  type="number" 
                  value={widget.style?.borderSize ?? 1} 
                  onChange={(e) => handleStyleUpdate({ borderSize: parseInt(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Border Style</label>
                <select
                  value={widget.style?.borderStyle || 'solid'}
                  onChange={(e) => handleStyleUpdate({ borderStyle: e.target.value })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white focus:outline-none"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <PremiumColorPicker 
              label="Border color stroke"
              value={widget.style?.borderColor || '#A855F7'}
              onChange={(val) => handleStyleUpdate({ borderColor: val })}
            />

            {/* Neon Glow */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Glow Blur (px)</label>
                <input 
                  type="number" 
                  value={widget.style?.glowBlur || 0} 
                  onChange={(e) => handleStyleUpdate({ glowBlur: parseInt(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <PremiumColorPicker 
                label="Glow color"
                value={widget.style?.glowColor || '#FF4DFF'}
                onChange={(val) => handleStyleUpdate({ glowColor: val })}
              />
            </div>

            {/* Glassmorphism & backdrop filters */}
            <div className="border-t border-purple-950/20 pt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-slate-300 font-bold">Frosted Glassmorphism</label>
                <input 
                  type="checkbox"
                  checked={settings.glassEffect || false}
                  onChange={(e) => handleContentSettingsUpdate({ glassEffect: e.target.checked })}
                  className="rounded accent-vibePrimary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Backdrop Blur filter (px)</label>
                <input 
                  type="range"
                  min="0" max="32"
                  value={settings.blur ?? 0}
                  onChange={(e) => handleContentSettingsUpdate({ blur: parseInt(e.target.value) })}
                  className="w-full accent-vibePrimary cursor-pointer"
                />
              </div>
            </div>

            {/* Outline size and custom clip masking */}
            <div className="grid grid-cols-2 gap-2 border-t border-purple-950/20 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Blend Mode</label>
                <select
                  value={settings.blendMode || 'normal'}
                  onChange={(e) => handleContentSettingsUpdate({ blendMode: e.target.value })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white text-[10px]"
                >
                  <option value="normal">Normal</option>
                  <option value="screen">Screen</option>
                  <option value="multiply">Multiply</option>
                  <option value="overlay">Overlay</option>
                  <option value="color-dodge">Color Dodge</option>
                  <option value="luminosity">Luminosity</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Vector Shape Mask</label>
                <select
                  value={settings.maskShape || 'none'}
                  onChange={(e) => handleContentSettingsUpdate({ maskShape: e.target.value })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white text-[10px]"
                >
                  <option value="none">Rectangle (Default)</option>
                  <option value="circle">Circle Shape</option>
                  <option value="triangle">Triangle Shape</option>
                  <option value="rhombus">Diamond Shape</option>
                  <option value="hexagon">Hexagon Badge</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TYPOGRAPHY SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('typography')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Type size={12} className="text-vibeCyan" /> Typography</span>
          {sections.typography ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.typography && (
          <div className="p-3 flex flex-col gap-3.5 border-t border-purple-950/20">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-bold">Font Family</label>
              <select 
                value={widget.style?.fontFamily || 'inherit'}
                onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
                className="w-full bg-black/40 border border-purple-950/60 rounded-lg p-1.5 text-white focus:outline-none font-sans"
              >
                <option value="inherit">Theme Default Font</option>
                {GOOGLE_FONTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Size (vw)</label>
                <input 
                  type="number" 
                  step="0.05"
                  value={widget.style?.fontSize || 0.8} 
                  onChange={(e) => handleStyleUpdate({ fontSize: parseFloat(e.target.value) || 0.8 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Weight</label>
                <select 
                  value={widget.style?.fontWeight || 'normal'}
                  onChange={(e) => handleStyleUpdate({ fontWeight: e.target.value })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="900">Heavy Black</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Letter Spacing (px)</label>
                <input 
                  type="number" 
                  value={settings.letterSpacing ?? 0} 
                  onChange={(e) => handleContentSettingsUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Line Height</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={settings.lineHeight ?? 1.2} 
                  onChange={(e) => handleContentSettingsUpdate({ lineHeight: parseFloat(e.target.value) || 1.2 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Text Transform</label>
                <select
                  value={settings.textTransform || 'none'}
                  onChange={(e) => handleContentSettingsUpdate({ textTransform: e.target.value })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white text-[10px]"
                >
                  <option value="none">None</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="lowercase">lowercase</option>
                  <option value="capitalize">Capitalize</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Text Alignment</label>
                <select 
                  value={widget.style?.textAlign || 'center'}
                  onChange={(e) => handleStyleUpdate({ textAlign: e.target.value as any })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <PremiumColorPicker 
              label="Text fill color"
              value={widget.style?.fontColor || '#F8F5FF'}
              onChange={(val) => handleStyleUpdate({ fontColor: val })}
            />

            {/* Gradient text overlay */}
            <PremiumColorPicker 
              label="Text Gradient background (optional)"
              value={settings.gradientText || ''}
              onChange={(val) => handleContentSettingsUpdate({ gradientText: val })}
            />

            {/* Text Stroke / border */}
            <div className="border-t border-purple-950/20 pt-3 flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-300">Text stroke outline:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-400">Stroke Size (px)</label>
                  <input 
                    type="number" 
                    value={settings.textStrokeSize || 0} 
                    onChange={(e) => handleContentSettingsUpdate({ textStrokeSize: parseInt(e.target.value) || 0 })} 
                    className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                  />
                </div>
                <PremiumColorPicker 
                  label="Stroke color"
                  value={settings.textStrokeColor || '#000000'}
                  onChange={(val) => handleContentSettingsUpdate({ textStrokeColor: val })}
                />
              </div>
            </div>

            {/* Text Shadow */}
            <div className="border-t border-purple-950/20 pt-3 flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-300">Text drop shadow:</span>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <span className="text-[7px] text-slate-400 block text-center">Offset X</span>
                  <input type="number" value={settings.textShadowX ?? 0} onChange={(e) => handleContentSettingsUpdate({ textShadowX: parseInt(e.target.value) || 0 })} className="bg-black/40 border border-purple-950/60 rounded-lg p-0.5 text-center text-white text-[10px] font-mono" />
                </div>
                <div>
                  <span className="text-[7px] text-slate-400 block text-center">Offset Y</span>
                  <input type="number" value={settings.textShadowY ?? 2} onChange={(e) => handleContentSettingsUpdate({ textShadowY: parseInt(e.target.value) || 0 })} className="bg-black/40 border border-purple-950/60 rounded-lg p-0.5 text-center text-white text-[10px] font-mono" />
                </div>
                <div>
                  <span className="text-[7px] text-slate-400 block text-center">Blur</span>
                  <input type="number" value={settings.textShadowBlur ?? 4} onChange={(e) => handleContentSettingsUpdate({ textShadowBlur: parseInt(e.target.value) || 0 })} className="bg-black/40 border border-purple-950/60 rounded-lg p-0.5 text-center text-white text-[10px] font-mono" />
                </div>
              </div>
              <PremiumColorPicker 
                label="Shadow color"
                value={settings.textShadowColor || 'rgba(0,0,0,0.5)'}
                onChange={(val) => handleContentSettingsUpdate({ textShadowColor: val })}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── LAYOUT SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('layout')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Move size={12} className="text-vibeAccent" /> Layout</span>
          {sections.layout ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.layout && (
          <div className="p-3 flex flex-col gap-3.5 border-t border-purple-950/20">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Pos X (%)</label>
                <input 
                  type="number" 
                  value={Math.round(widget.x)} 
                  onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Pos Y (%)</label>
                <input 
                  type="number" 
                  value={Math.round(widget.y)} 
                  onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Width (%)</label>
                <input 
                  type="number" 
                  value={Math.round(widget.w)} 
                  onChange={(e) => handleUpdate({ w: parseFloat(e.target.value) || 4 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Height (%)</label>
                <input 
                  type="number" 
                  value={Math.round(widget.h)} 
                  onChange={(e) => handleUpdate({ h: parseFloat(e.target.value) || 4 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Rotation (°)</label>
                <input 
                  type="number" 
                  value={widget.rotation || 0} 
                  onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) || 0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Scale mult</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={widget.scale || 1.0} 
                  onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) || 1.0 })} 
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-center text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-purple-950/20 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Aspect Ratio</label>
                <select
                  value={settings.aspectRatioLock ? 'lock' : 'unlock'}
                  onChange={(e) => handleContentSettingsUpdate({ aspectRatioLock: e.target.value === 'lock' })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white focus:outline-none"
                >
                  <option value="unlock">Free Transform</option>
                  <option value="lock">Lock Aspect Ratio</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Anchor Point</label>
                <select
                  value={settings.anchorPoint || 'top-left'}
                  onChange={(e) => handleContentSettingsUpdate({ anchorPoint: e.target.value })}
                  className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-white text-[10px] focus:outline-none"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => bringToFront(widget.id)} className="flex-1 bg-purple-950/20 border border-purple-800/40 hover:border-purple-600/80 rounded-lg py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-purple-300 transition cursor-pointer">
                <ArrowUp size={11} /> Front
              </button>
              <button onClick={() => sendBackward(widget.id)} className="flex-1 bg-purple-950/20 border border-purple-800/40 hover:border-purple-600/80 rounded-lg py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-purple-300 transition cursor-pointer">
                <ArrowDown size={11} /> Backward
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── BEHAVIOR SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('behavior')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Settings size={12} className="text-amber-500" /> Behavior</span>
          {sections.behavior ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.behavior && (
          <div className="p-3 flex flex-col gap-2.5 border-t border-purple-950/20">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">Click Through</span>
                <span className="text-[8px] text-slate-500 leading-normal">Ignore mouse events on OBS.</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.clickThrough || false}
                onChange={(e) => handleContentSettingsUpdate({ clickThrough: e.target.checked })}
                className="rounded accent-vibePrimary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-purple-950/10 pt-2">
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">OBS Mode Only</span>
                <span className="text-[8px] text-slate-500 leading-normal">Hide in stream dashboard edit canvas.</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.obsOnly || false}
                onChange={(e) => handleContentSettingsUpdate({ obsOnly: e.target.checked })}
                className="rounded accent-vibePrimary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-purple-950/10 pt-2">
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">Dashboard Only</span>
                <span className="text-[8px] text-slate-500 leading-normal">Do not render inside active stream overlay.</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.dashboardOnly || false}
                onChange={(e) => handleContentSettingsUpdate({ dashboardOnly: e.target.checked })}
                className="rounded accent-vibePrimary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-purple-950/10 pt-2">
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">Responsive Scaler</span>
                <span className="text-[8px] text-slate-500 leading-normal">Scale dynamically according to client viewport.</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.responsive || false}
                onChange={(e) => handleContentSettingsUpdate({ responsive: e.target.checked })}
                className="rounded accent-vibePrimary cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── ANIMATION SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('animation')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Activity size={12} className="text-emerald-500" /> Animation</span>
          {sections.animation ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.animation && (
          <div className="p-3 flex flex-col gap-3 border-t border-purple-950/20">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-bold">Transition Type</label>
              <select 
                value={widget.animation?.type || 'none'}
                onChange={(e) => handleAnimationUpdate({ type: e.target.value as any })}
                className="w-full bg-black/40 border border-purple-950/60 rounded-lg p-1.5 text-white text-[10px] focus:outline-none"
              >
                {ANIMATION_TYPES.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {widget.animation?.type !== 'none' && (
              <div className="flex flex-col gap-2.5 bg-black/20 p-2 border border-purple-950/40 rounded-xl">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-400 font-semibold">Duration (sec)</span>
                    <input 
                      type="number" 
                      step="0.1" min="0.1"
                      value={widget.animation?.duration ?? 1} 
                      onChange={(e) => handleAnimationUpdate({ duration: parseFloat(e.target.value) || 1 })} 
                      className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-[10px] text-center font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-400 font-semibold">Delay (sec)</span>
                    <input 
                      type="number" 
                      step="0.1" min="0"
                      value={widget.animation?.delay ?? 0} 
                      onChange={(e) => handleAnimationUpdate({ delay: parseFloat(e.target.value) || 0 })} 
                      className="bg-black/40 border border-purple-950/60 rounded-lg p-1 text-[10px] text-center font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="checkbox"
                    id="loop-anim-in"
                    checked={widget.animation?.loop ?? false}
                    onChange={(e) => handleAnimationUpdate({ loop: e.target.checked })}
                    className="rounded accent-vibePrimary cursor-pointer"
                  />
                  <label htmlFor="loop-anim-in" className="text-[9px] font-bold text-slate-300">Loop Motion Preset</label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADVANCED SECTION ── */}
      <div className="border border-purple-950/40 rounded-xl overflow-hidden bg-black/15">
        <button 
          onClick={() => toggleSection('advanced')} 
          className="w-full px-3 py-2.5 bg-black/25 flex items-center justify-between font-bold text-slate-300 uppercase tracking-widest text-[9.5px] hover:bg-black/35 cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-vibeSecondary" /> Advanced</span>
          {sections.advanced ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {sections.advanced && (
          <div className="p-3 flex flex-col gap-3.5 border-t border-purple-950/20">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 font-bold uppercase">Custom inline CSS style</label>
              <textarea
                rows={4}
                value={settings.customCss || ''}
                onChange={(e) => handleContentSettingsUpdate({ customCss: e.target.value })}
                className="bg-black/50 border border-purple-950/60 rounded-lg p-2 text-[9px] text-white font-mono focus:outline-none"
                placeholder="/* e.g. text-shadow: 0 2px purple; */"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <button 
            onClick={() => copyWidgetStyle(widget.id)} 
            className="flex-1 bg-white/5 hover:bg-white/10 border border-purple-900/30 rounded-xl py-2 flex items-center justify-center gap-1 font-bold text-[10px] text-slate-300 transition cursor-pointer"
          >
            <Copy size={11} /> Copy Style
          </button>
          <button 
            onClick={() => pasteWidgetStyle(widget.id)} 
            className="flex-1 bg-white/5 hover:bg-white/10 border border-purple-900/30 rounded-xl py-2 flex items-center justify-center gap-1 font-bold text-[10px] text-slate-300 transition cursor-pointer"
          >
            Paste Style
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => duplicateWidget(widget.id)} 
            className="flex-1 bg-emerald-950/20 border border-emerald-900/50 hover:border-emerald-700/80 rounded-xl py-2 flex items-center justify-center gap-1 font-bold text-[10px] text-emerald-400 transition cursor-pointer"
          >
            <Plus size={11} /> Duplicate
          </button>
          <button 
            onClick={() => removeWidget(widget.id)} 
            className="flex-1 bg-red-950/20 border border-red-900/50 hover:border-red-700/80 rounded-xl py-2 flex items-center justify-center gap-1 font-bold text-[10px] text-red-500 transition cursor-pointer"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};
