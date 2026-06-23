import React from 'react';
import { useOverlayStore, type Widget } from '../../store/overlayStore';
import { Copy, Trash2, Shield, Eye, EyeOff, Lock, Unlock, Layers, ArrowUp, ArrowDown, Plus } from 'lucide-react';

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Orbitron, sans-serif', label: 'Orbitron' },
  { value: 'Share Tech Mono, monospace', label: 'Share Tech Mono' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk' },
  { value: 'Quicksand, sans-serif', label: 'Quicksand' },
  { value: 'Comfortaa, cursive', label: 'Comfortaa' },
  { value: 'Outfit, sans-serif', label: 'Outfit' },
  { value: 'Noto Sans JP, sans-serif', label: 'Noto Sans JP' },
  { value: 'Lora, serif', label: 'Lora' }
];

const ANIMATIONS = ['none', 'fade', 'scale', 'slide', 'bounce', 'glow', 'pulse', 'float', 'shake'];

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
  
  // New contents
  { value: 'clock', label: '🕒 Digital Wall Clock' },
  { value: 'weather', label: '🌤️ Local Weather Forecast' },
  { value: 'stream-uptime', label: '🚀 Live Stream Uptime' },
  { value: 'discord-status', label: '👾 Discord Rich Status' },
  { value: 'cpu-usage', label: '💻 CPU & RAM Usage Monitor' },
  { value: 'countdown', label: '⏲️ Custom Event Countdown' },
  { value: 'custom-text', label: '✍️ Custom Label / Text / Quote' },
  { value: 'pet-widget', label: '🐱 Interative Pixel Pet' },
  { value: 'polls', label: '🗳️ Live Chat Poll' }
];

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

  if (!widget) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8 text-center bg-black/20 border border-white/5 rounded-xl p-4">
        <Layers size={24} className="mb-2 opacity-40 text-purple-400" />
        <span className="font-bold uppercase tracking-wider text-slate-400">No Widget Selected</span>
        <span className="mt-1 text-[10px] text-white/30">Click any widget on the canvas editor to customize details.</span>
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

  const handleContentUpdate = (contentFields: Partial<Widget['content']>) => {
    handleUpdate({
      content: {
        ...widget.content,
        ...contentFields
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

  return (
    <div className="flex flex-col gap-4 text-xs bg-[#0b0918] border border-purple-950/60 rounded-xl p-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 scrollbar-thin">
      
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-purple-900/20 pb-2.5">
        <div className="flex flex-col">
          <span className="font-display font-black text-white uppercase tracking-wider text-[11px] truncate max-w-[150px]">
            {widget.label}
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">ID: {widget.id.split('-')[0]}</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => handleUpdate({ locked: !widget.locked })} 
            className={`p-1.5 rounded transition ${widget.locked ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            title={widget.locked ? "Unlock widget" : "Lock widget"}
          >
            {widget.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          <button 
            onClick={() => handleUpdate({ visible: !widget.visible })} 
            className={`p-1.5 rounded transition ${!widget.visible ? 'bg-red-950/80 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            title={widget.visible ? "Hide widget" : "Show widget"}
          >
            {widget.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>
      </div>

      {/* Widget General */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Name label</label>
        <input 
          type="text" 
          value={widget.label} 
          onChange={(e) => handleUpdate({ label: e.target.value })} 
          className="w-full bg-black/40 border border-purple-950 rounded p-1.5 text-white focus:outline-none focus:border-vibePrimary"
        />
      </div>

      {/* Positioning Coordinates (X, Y, W, H, Rotation, Opacity, Z-Index) */}
      <div className="grid grid-cols-2 gap-2 border-t border-purple-900/10 pt-3">
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Pos X (%)</label>
          <input 
            type="number" 
            value={Math.round(widget.x)} 
            onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Pos Y (%)</label>
          <input 
            type="number" 
            value={Math.round(widget.y)} 
            onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Width (%)</label>
          <input 
            type="number" 
            value={Math.round(widget.w)} 
            onChange={(e) => handleUpdate({ w: parseFloat(e.target.value) || 4 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Height (%)</label>
          <input 
            type="number" 
            value={Math.round(widget.h)} 
            onChange={(e) => handleUpdate({ h: parseFloat(e.target.value) || 4 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Rotation (°)</label>
          <input 
            type="number" 
            value={widget.rotation || 0} 
            onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) || 0 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Opacity (%)</label>
          <input 
            type="number" 
            min="0" max="100"
            value={widget.opacity ?? 100} 
            onChange={(e) => handleUpdate({ opacity: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Scale</label>
          <input 
            type="number" 
            step="0.1" min="0.1" max="5"
            value={widget.scale || 1.0} 
            onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) || 1.0 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase">Z-Index</label>
          <input 
            type="number" 
            value={widget.zIndex || 1} 
            onChange={(e) => handleUpdate({ zIndex: parseInt(e.target.value) || 1 })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-white text-center"
          />
        </div>
      </div>

      {/* Layer Depth Orders */}
      <div className="flex gap-2">
        <button onClick={() => bringToFront(widget.id)} className="flex-1 bg-purple-950/20 border border-purple-800/40 hover:border-purple-600/80 rounded py-1 flex items-center justify-center gap-1 text-[10px] font-bold text-purple-300">
          <ArrowUp size={11} /> Bring to Front
        </button>
        <button onClick={() => sendBackward(widget.id)} className="flex-1 bg-purple-950/20 border border-purple-800/40 hover:border-purple-600/80 rounded py-1 flex items-center justify-center gap-1 text-[10px] font-bold text-purple-300">
          <ArrowDown size={11} /> Send Backward
        </button>
      </div>

      {/* Content Customization Dropdown */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Widget Content Module</label>
        <select 
          value={widget.content?.type || widget.type}
          onChange={(e) => handleContentUpdate({ type: e.target.value })}
          className="w-full bg-black/40 border border-purple-950 rounded p-1.5 text-white"
        >
          {CONTENT_TYPES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        
        {/* Content specific customizations */}
        {['timer', 'countdown'].includes(widget.content?.type || widget.type) && (
          <div className="bg-black/35 rounded p-2 border border-white/5 mt-1 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-purple-400">Content settings:</span>
            <div className="flex flex-col gap-1">
              <label className="text-[8px] text-slate-400">Custom label (e.g. "BE RIGHT BACK")</label>
              <input 
                type="text"
                value={widget.content?.settings?.customLabel || ''}
                onChange={(e) => handleContentSettingsUpdate({ customLabel: e.target.value })}
                className="bg-black/50 border border-purple-950 rounded p-1 text-[10px]"
              />
            </div>
            {widget.content?.type === 'countdown' && (
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-slate-400">Countdown duration (minutes)</label>
                <input 
                  type="number"
                  value={widget.content?.settings?.targetMinutes || 10}
                  onChange={(e) => handleContentSettingsUpdate({ targetMinutes: parseInt(e.target.value) || 5 })}
                  className="bg-black/50 border border-purple-950 rounded p-1 text-[10px]"
                />
              </div>
            )}
          </div>
        )}

        {['custom-text', 'quote-of-the-day'].includes(widget.content?.type || widget.type) && (
          <div className="bg-black/35 rounded p-2 border border-white/5 mt-1 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-purple-400">Custom label:</span>
            <textarea
              rows={3}
              value={widget.content?.settings?.customText || ''}
              onChange={(e) => handleContentSettingsUpdate({ customText: e.target.value })}
              className="bg-black/50 border border-purple-950 rounded p-1.5 text-[10px] text-white focus:outline-none"
              placeholder="Type anything here..."
            />
          </div>
        )}

        {widget.content?.type === 'weather' && (
          <div className="bg-black/35 rounded p-2 border border-white/5 mt-1 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-purple-400">Location Settings:</span>
            <input 
              type="text"
              value={widget.content?.settings?.city || 'Tokyo, JP'}
              onChange={(e) => handleContentSettingsUpdate({ city: e.target.value })}
              className="bg-black/50 border border-purple-950 rounded p-1 text-[10px]"
              placeholder="City, Country"
            />
          </div>
        )}

        {widget.content?.type === 'chat' && (
          <div className="bg-black/35 rounded p-2 border border-white/5 mt-1 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-purple-400">Chat Settings:</span>
            <div className="flex gap-2">
              <label className="text-[8px] text-slate-400 flex-1 flex items-center">Box size:</label>
              <select
                value={widget.content?.settings?.size || 'normal'}
                onChange={(e) => handleContentSettingsUpdate({ size: e.target.value })}
                className="bg-black/50 border border-purple-950 rounded p-0.5 text-[10px]"
              >
                <option value="mini">Mini</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="flex gap-2">
              <label className="text-[8px] text-slate-400 flex-1 flex items-center">Max messages:</label>
              <input
                type="number"
                value={widget.content?.settings?.maxMessages || 12}
                onChange={(e) => handleContentSettingsUpdate({ maxMessages: parseInt(e.target.value) || 10 })}
                className="bg-black/50 border border-purple-950 rounded p-0.5 text-[10px] w-12 text-center"
              />
            </div>
          </div>
        )}
      </div>

      {/* Container Custom Styles */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-2">
        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Container Styles</label>
        
        {/* Background & Border Radius */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-slate-400">Corner Radius (px)</label>
            <input 
              type="number" 
              value={widget.style?.borderRadius ?? 8} 
              onChange={(e) => handleStyleUpdate({ borderRadius: parseInt(e.target.value) || 0 })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400">Padding (px)</label>
            <input 
              type="number" 
              value={widget.style?.padding ?? 4} 
              onChange={(e) => handleStyleUpdate({ padding: parseInt(e.target.value) || 0 })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-400">Background Fill</label>
          <input 
            type="text" 
            value={widget.style?.background || 'rgba(14, 8, 26, 0.8)'} 
            onChange={(e) => handleStyleUpdate({ background: e.target.value })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 font-mono text-[10px]"
          />
        </div>

        {/* Borders */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="col-span-1">
            <label className="text-[9px] text-slate-400">Border (px)</label>
            <input 
              type="number" 
              value={widget.style?.borderSize ?? 1} 
              onChange={(e) => handleStyleUpdate({ borderSize: parseInt(e.target.value) || 0 })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[9px] text-slate-400">Border style</label>
            <select
              value={widget.style?.borderStyle || 'solid'}
              onChange={(e) => handleStyleUpdate({ borderStyle: e.target.value })}
              className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px]"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-400">Border Color</label>
          <input 
            type="text" 
            value={widget.style?.borderColor || '#A855F7'} 
            onChange={(e) => handleStyleUpdate({ borderColor: e.target.value })} 
            className="w-full bg-black/45 border border-purple-950 rounded p-1 font-mono text-[10px]"
          />
        </div>

        {/* Neon Glow & Shadow */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-slate-400">Glow Blur</label>
            <input 
              type="number" 
              value={widget.style?.glowBlur || 0} 
              onChange={(e) => handleStyleUpdate({ glowBlur: parseInt(e.target.value) || 0 })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400">Glow Color</label>
            <input 
              type="text" 
              value={widget.style?.glowColor || '#FF4DFF'} 
              onChange={(e) => handleStyleUpdate({ glowColor: e.target.value })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1 font-mono text-[10px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <div>
            <label className="text-[9px] text-slate-400">Shadow X</label>
            <input type="number" value={widget.style?.shadowX ?? 0} onChange={(e) => handleStyleUpdate({ shadowX: parseInt(e.target.value) || 0 })} className="w-full bg-black/45 border border-purple-950 rounded p-1" />
          </div>
          <div>
            <label className="text-[9px] text-slate-400">Shadow Y</label>
            <input type="number" value={widget.style?.shadowY ?? 4} onChange={(e) => handleStyleUpdate({ shadowY: parseInt(e.target.value) || 0 })} className="w-full bg-black/45 border border-purple-950 rounded p-1" />
          </div>
          <div>
            <label className="text-[9px] text-slate-400">Blur</label>
            <input type="number" value={widget.style?.shadowBlur ?? 10} onChange={(e) => handleStyleUpdate({ shadowBlur: parseInt(e.target.value) || 0 })} className="w-full bg-black/45 border border-purple-950 rounded p-1" />
          </div>
        </div>
      </div>

      {/* Typography settings */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-2">
        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Typography Customization</label>
        
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-400">Font Family</label>
          <select 
            value={widget.style?.fontFamily || 'inherit'}
            onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px]"
          >
            <option value="inherit">Inherit Theme</option>
            {FONTS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-slate-400">Size (vw)</label>
            <input 
              type="number" 
              step="0.05"
              value={widget.style?.fontSize || 0.8} 
              onChange={(e) => handleStyleUpdate({ fontSize: parseFloat(e.target.value) || 0.8 })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400">Weight</label>
            <select 
              value={widget.style?.fontWeight || 'normal'}
              onChange={(e) => handleStyleUpdate({ fontWeight: e.target.value })}
              className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px]"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="900">Black</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-slate-400">Align</label>
            <select 
              value={widget.style?.textAlign || 'center'}
              onChange={(e) => handleStyleUpdate({ textAlign: e.target.value as any })}
              className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px]"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] text-slate-400">Text color</label>
            <input 
              type="text" 
              value={widget.style?.fontColor || '#F8F5FF'} 
              onChange={(e) => handleStyleUpdate({ fontColor: e.target.value })} 
              className="w-full bg-black/45 border border-purple-950 rounded p-1 font-mono text-[10px]"
            />
          </div>
        </div>
      </div>

      {/* Animation system options */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-2">
        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Animation Engine</label>
        
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-400">Animation style</label>
          <select 
            value={widget.animation?.type || 'none'}
            onChange={(e) => handleAnimationUpdate({ type: e.target.value as any })}
            className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px] uppercase font-bold"
          >
            {ANIMATIONS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {widget.animation?.type !== 'none' && (
          <div className="grid grid-cols-2 gap-2 bg-black/25 rounded p-2 border border-white/5">
            <div>
              <label className="text-[8px] text-slate-400">Duration (sec)</label>
              <input 
                type="number" 
                step="0.1" min="0.1"
                value={widget.animation?.duration ?? 1} 
                onChange={(e) => handleAnimationUpdate({ duration: parseFloat(e.target.value) || 1 })} 
                className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px]"
              />
            </div>
            <div>
              <label className="text-[8px] text-slate-400">Delay (sec)</label>
              <input 
                type="number" 
                step="0.1" min="0"
                value={widget.animation?.delay ?? 0} 
                onChange={(e) => handleAnimationUpdate({ delay: parseFloat(e.target.value) || 0 })} 
                className="w-full bg-black/45 border border-purple-950 rounded p-1 text-[10px]"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2 mt-1">
              <input 
                type="checkbox"
                id="loop-anim"
                checked={widget.animation?.loop ?? false}
                onChange={(e) => handleAnimationUpdate({ loop: e.target.checked })}
                className="rounded text-vibePrimary focus:ring-vibePrimary"
              />
              <label htmlFor="loop-anim" className="text-[9px] font-bold text-slate-300">Loop Animation Infinitely</label>
            </div>
          </div>
        )}
      </div>

      {/* Copy / Paste / Duplicate / Delete Actions */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-1.5">
        <div className="flex gap-2">
          <button 
            onClick={() => copyWidgetStyle(widget.id)} 
            className="flex-1 bg-white/5 hover:bg-white/10 border border-purple-900/30 rounded py-1.5 flex items-center justify-center gap-1 font-bold text-[10px] text-slate-300"
          >
            <Copy size={11} /> Copy Style
          </button>
          <button 
            onClick={() => pasteWidgetStyle(widget.id)} 
            className="flex-1 bg-white/5 hover:bg-white/10 border border-purple-900/30 rounded py-1.5 flex items-center justify-center gap-1 font-bold text-[10px] text-slate-300"
          >
            Paste Style
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => duplicateWidget(widget.id)} 
            className="flex-1 bg-[#141d1a] border border-emerald-950 hover:border-emerald-700 rounded py-1.5 flex items-center justify-center gap-1 font-bold text-[10px] text-emerald-400"
          >
            <Plus size={11} /> Duplicate
          </button>
          <button 
            onClick={() => removeWidget(widget.id)} 
            className="flex-1 bg-[#221015] border border-red-950 hover:border-red-700 rounded py-1.5 flex items-center justify-center gap-1 font-bold text-[10px] text-red-500"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};
