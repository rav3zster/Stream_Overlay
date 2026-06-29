import React from 'react';
import { motion } from 'framer-motion';
import { useOverlayStore, type Widget } from '../store/overlayStore';
import { MediaWidget } from './MediaWidget';
import { GameFrameWidget } from './GameFrameWidget';
import { TimerWidget } from './TimerWidget';
import { ChatWidget } from './ChatWidget';
import { MusicWidget } from './MusicWidget';
import { AlertsWidget } from './AlertsWidget';
import { SubscriberGoalWidget, DonationGoalWidget, FollowerGoalWidget } from './GoalWidgets';
import { EventListWidget } from './EventListWidget';
import { VtuberWidget } from './VtuberWidget';
import { SocialWidget } from './SocialWidget';
import { TickerWidget } from './TickerWidget';

// Import new widgets
import {
  ClockWidget,
  WeatherWidget,
  StreamUptimeWidget,
  DiscordStatusWidget,
  CpuRamWidget,
  CountdownWidget,
  CustomTextWidget,
  PetWidget,
  PollsWidget
} from './NewContentWidgets';

import { getThemeProfile } from '../lib/themes';

interface WidgetRendererProps {
  widget: Widget;
  isEditor?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, isEditor = false }) => {
  const disableAnimations = useOverlayStore(s => s.settings.disableAnimations);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);

  // If hidden on live OBS overlay, render nothing
  if (!widget.visible && !isEditor) return null;

  // Load default styles based on the theme profile if the user hasn't customized them manually
  let bg = widget.style?.background;
  let borderRadius = widget.style?.borderRadius;
  let border = `${widget.style?.borderSize ?? 1}px ${widget.style?.borderStyle || 'solid'} ${widget.style?.borderColor || '#A855F7'}`;
  let boxShadow = `${widget.style?.shadowX ?? 0}px ${widget.style?.shadowY ?? 4}px ${widget.style?.shadowBlur ?? 10}px ${widget.style?.shadowColor || 'rgba(0,0,0,0.5)'}`;
  let backdropFilter = '';
  let clipPath = '';

  const isTransparentWidget = ['game', 'game-frame', 'media'].includes(widget.type);
  const isDefaultBg = !bg || bg === 'rgba(14, 8, 26, 0.8)';
  const isDefaultRadius = borderRadius === undefined || borderRadius === 8;

  if (profile === 'racing') {
    if (isDefaultBg) {
      bg = theme === 'mclaren'
        ? 'repeating-linear-gradient(45deg, #111 0px, #111 2px, #222 2px, #222 4px)'
        : theme === 'ferrari'
        ? 'repeating-linear-gradient(45deg, #200202 0px, #200202 2px, #350404 2px, #350404 4px)'
        : 'repeating-linear-gradient(45deg, #020813 0px, #020813 2px, #041026 2px, #041026 4px)'; // red-bull / amg
    }
    if (isDefaultRadius) borderRadius = 0;
    if (!isTransparentWidget) {
      clipPath = 'polygon(0% 0%, 94% 0%, 100% 12%, 100% 100%, 6% 100%, 0% 88%)';
    }
    border = 'none'; // We render vector border inside the SVG overlay instead
  } else if (profile === 'planets') {
    if (isDefaultBg) bg = 'rgba(58, 43, 94, 0.85)';
    if (isDefaultRadius) borderRadius = 20;
    border = '3.5px solid #BDB2FF';
    boxShadow = '0 8px 24px rgba(28, 20, 44, 0.45)';
  } else if (profile === 'cyberhud') {
    if (isDefaultBg) bg = 'rgba(14, 22, 33, 0.92)';
    if (isDefaultRadius) borderRadius = 0;
    border = 'none';
    boxShadow = '0 0 16px rgba(0, 240, 255, 0.2)';
  } else if (profile === 'esports') {
    if (isDefaultBg) bg = 'rgba(5, 12, 32, 0.96)';
    if (isDefaultRadius) borderRadius = 0;
    if (!isTransparentWidget) {
      clipPath = 'polygon(0% 0%, 90% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%)';
    }
    border = 'none';
    boxShadow = '0 8px 24px rgba(2, 4, 12, 0.6)';
  } else if (profile === 'gulf') {
    if (isDefaultBg) bg = 'rgba(232, 241, 245, 0.95)'; 
    if (isDefaultRadius) borderRadius = 20;
    border = '3px solid #ff5800'; 
    boxShadow = '0 8px 16px rgba(18, 30, 44, 0.15)';
  } else if (profile === 'retro') {
    if (isDefaultBg) bg = '#051405';
    if (isDefaultRadius) borderRadius = 0;
    border = '2px solid #33ff33'; 
    boxShadow = 'none';
  } else if (profile === 'cozy') {
    if (isDefaultBg) bg = 'rgba(26, 18, 33, 0.92)'; 
    if (isDefaultRadius) borderRadius = 24;
    border = '2.5px solid var(--panel-border)';
    boxShadow = '0 10px 25px rgba(0, 0, 0, 0.35)';
  } else if (profile === 'minimal') {
    if (isDefaultBg) bg = theme.includes('white') || theme.includes('light') ? '#ffffff' : '#0f172a';
    if (isDefaultRadius) borderRadius = 12;
    border = `1px solid ${theme.includes('white') || theme.includes('light') ? '#e2e8f0' : '#334155'}`;
    boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
  } else if (profile === 'glass') {
    if (isDefaultBg) bg = 'rgba(255, 255, 255, 0.08)';
    if (isDefaultRadius) borderRadius = 20;
    border = '1px solid rgba(255, 255, 255, 0.15)';
    boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.2)';
    backdropFilter = 'blur(16px)';
  } else if (profile === 'neumorphic') {
    if (isDefaultBg) bg = '#e0e0e0';
    if (isDefaultRadius) borderRadius = 24;
    border = 'none';
    boxShadow = '9px 9px 18px rgba(0,0,0,0.08), -9px -9px 18px rgba(255,255,255,0.7)';
  } else if (profile === 'luxury') {
    if (isDefaultBg) bg = 'rgba(17, 17, 17, 0.98)';
    if (isDefaultRadius) borderRadius = 4;
    border = '1px solid #d4af37'; 
    boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
  }

  // Support custom gradient backgrounds
  const customGradient = widget.content?.settings?.gradient;
  let finalBg = isTransparentWidget ? 'transparent' : (customGradient || bg || 'rgba(14, 8, 26, 0.8)');
  const finalRadius = borderRadius !== undefined ? `${borderRadius}px` : '8px';

  // Support glassmorphism effect override
  if (widget.content?.settings?.glassEffect) {
    backdropFilter = `blur(${widget.content?.settings?.blur ?? 8}px)`;
    if (isDefaultBg) finalBg = 'rgba(255, 255, 255, 0.08)';
    border = '1px solid rgba(255, 255, 255, 0.15)';
  }

  // Support blend modes
  const mixBlendMode = (widget.content?.settings?.blendMode || 'normal') as React.CSSProperties['mixBlendMode'];

  // Support custom vector shape clip paths
  let customClipPath = clipPath;
  if (widget.content?.settings?.maskShape && widget.content.settings.maskShape !== 'none') {
    const shape = widget.content.settings.maskShape;
    if (shape === 'circle') customClipPath = 'circle(50% at 50% 50%)';
    else if (shape === 'triangle') customClipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    else if (shape === 'rhombus') customClipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    else if (shape === 'hexagon') customClipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  }

  // Support text shadow offsets
  let textShadow = '';
  if (widget.content?.settings?.textShadowColor) {
    const sx = widget.content.settings.textShadowX ?? 0;
    const sy = widget.content.settings.textShadowY ?? 2;
    const sb = widget.content.settings.textShadowBlur ?? 4;
    const sc = widget.content.settings.textShadowColor;
    textShadow = `${sx}px ${sy}px ${sb}px ${sc}`;
  }

  // Support text stroke outline
  let webkitTextStroke = '';
  if (widget.content?.settings?.textStrokeSize) {
    webkitTextStroke = `${widget.content.settings.textStrokeSize}px ${widget.content.settings.textStrokeColor || '#000000'}`;
  }

  const letterSpacing = widget.content?.settings?.letterSpacing !== undefined ? `${widget.content.settings.letterSpacing}px` : 'normal';
  const lineHeight = widget.content?.settings?.lineHeight !== undefined ? widget.content.settings.lineHeight : 'normal';
  const textTransform = (widget.content?.settings?.textTransform || 'none') as React.CSSProperties['textTransform'];

  // Support text gradient fills
  let textGradBg = '';
  if (widget.content?.settings?.gradientText) {
    textGradBg = widget.content.settings.gradientText;
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${widget.x}px`,
    top: `${widget.y}px`,
    width: `${widget.width ?? widget.w ?? 100}px`,
    height: `${widget.height ?? widget.h ?? 100}px`,
    transform: `rotate(${widget.rotation || 0}deg) scale(${widget.scale || 1.0})`,
    opacity: isEditor && !widget.visible ? 0.35 : (widget.opacity ?? 100) / 100,
    zIndex: widget.zIndex || 1,
    
    // Style settings
    borderRadius: finalRadius,
    background: finalBg,
    border: isTransparentWidget ? 'none' : border,
    boxShadow: isTransparentWidget ? 'none' : (boxShadow + (widget.style?.glowBlur ? `, 0 0 ${widget.style.glowBlur}px ${widget.style.glowColor || 'var(--accent-primary)'}` : '')),
    padding: `${widget.style?.padding ?? 4}px`,
    backdropFilter,
    clipPath: customClipPath,
    mixBlendMode,
    
    // Typography
    fontFamily: widget.style?.fontFamily || 'inherit',
    fontSize: widget.style?.fontSize ? `${widget.style.fontSize}px` : 'inherit',
    fontWeight: widget.style?.fontWeight || 'normal',
    color: widget.style?.fontColor || 'inherit',
    textAlign: widget.style?.textAlign || 'left',
    letterSpacing,
    lineHeight,
    textTransform,
    textShadow,
    WebkitTextStroke: webkitTextStroke,
    ...(textGradBg ? {
      backgroundImage: textGradBg,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    } : {}),
    overflow: 'hidden',
  };


  const getAnimateProps = () => {
    // Disable animations in editor mode or globally to make edit easy
    if (isEditor || disableAnimations) return {};
    if (!widget.animation || widget.animation.type === 'none') return {};
    
    const duration = widget.animation.duration || 1;
    const delay = widget.animation.delay || 0;
    const loop = widget.animation.loop;
    
    const transition = {
      duration,
      delay,
      repeat: loop ? Infinity : 0,
      repeatType: "reverse" as const,
      ease: "easeInOut" as const
    };

    switch (widget.animation.type) {
      case 'fade':
        return {
          animate: { opacity: [0, (widget.opacity ?? 100) / 100] },
          transition
        };
      case 'scale':
        return {
          animate: { scale: [0.9, 1.0] },
          transition
        };
      case 'pulse':
        return {
          animate: { opacity: [0.5, 1.0] },
          transition
        };
      case 'float':
        return {
          animate: { y: [0, -8, 0] },
          transition: { ...transition, repeatType: "loop" as const }
        };
      case 'bounce':
        return {
          animate: { y: [0, -10, 0] },
          transition: { ...transition, ease: "easeOut" as const, repeatType: "loop" as const }
        };
      case 'glow':
        return {
          animate: { 
            boxShadow: [
              `0px 4px 10px rgba(0,0,0,0.5), 0 0 4px ${widget.style?.glowColor || '#FF4DFF'}`,
              `0px 4px 10px rgba(0,0,0,0.5), 0 0 16px ${widget.style?.glowColor || '#FF4DFF'}`,
              `0px 4px 10px rgba(0,0,0,0.5), 0 0 4px ${widget.style?.glowColor || '#FF4DFF'}`
            ]
          },
          transition: { ...transition, repeatType: "loop" as const }
        };
      case 'shake':
        return {
          animate: { x: [-1, 1, -1, 1, 0] },
          transition: { ...transition, duration: 0.3, repeatType: "loop" as const }
        };
      default:
        return {};
    }
  };

  const renderContent = () => {
    const cType = widget.content?.type || widget.type;
    const settings = widget.content?.settings || {};
    
    switch (cType) {
      case 'timer':
        return <TimerWidget size={settings.size} label={settings.customLabel} />;
      case 'chat':
        return <ChatWidget size={settings.size} maxMessages={settings.maxMessages} />;
      case 'music':
        return <MusicWidget compact={settings.compact} />;
      case 'alerts':
        return <AlertsWidget />;
      case 'sub-goal':
        return <SubscriberGoalWidget compact={settings.compact} />;
      case 'dono-goal':
        return <DonationGoalWidget compact={settings.compact} />;
      case 'follower-goal':
        return <FollowerGoalWidget compact={settings.compact} />;
      case 'event-list':
        return <EventListWidget />;
      case 'vtuber':
        return <VtuberWidget size={settings.size} sleeping={settings.sleeping} />;
      case 'socials':
        return <SocialWidget />;
      case 'ticker':
        return <TickerWidget />;
      
      // New contents
      case 'clock':
      case 'date':
        return <ClockWidget settings={settings} />;
      case 'weather':
        return <WeatherWidget settings={settings} />;
      case 'stream-uptime':
        return <StreamUptimeWidget />;
      case 'discord-status':
        return <DiscordStatusWidget />;
      case 'cpu-usage':
      case 'ram-usage':
        return <CpuRamWidget />;
      case 'countdown':
        return <CountdownWidget settings={settings} />;
      case 'custom-text':
      case 'quote-of-the-day':
        return <CustomTextWidget settings={settings} />;
      case 'pet-widget':
        return <PetWidget />;
      case 'polls':
        return <PollsWidget />;
      case 'media':
        return <MediaWidget settings={settings} />;
      case 'game-frame':
        return <GameFrameWidget settings={settings} />;
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500 font-display uppercase tracking-widest text-[0.8vw]">
            {cType} Widget
          </div>
        );
    }
  };

  return (
    <motion.div
      id={`w-${widget.id}`}
      style={containerStyle}
      {...getAnimateProps()}
      className={isEditor && !widget.visible ? 'border-dashed border-red-500/40 bg-red-950/5' : ''}
    >
      {widget.content?.settings?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: `
          #w-${widget.id} {
            ${widget.content.settings.customCss}
          }
        `}} />
      )}
      {renderContent()}

      {/* 1. Custom Vector telemetry borders for Racing profile (McLaren, Ferrari, etc.) */}
      {profile === 'racing' && !isTransparentWidget && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon 
            points="0.5,0.5 93.8,0.5 99.5,12.2 99.5,99.5 6.2,99.5 0.5,87.8" 
            fill="none" 
            stroke={theme === 'mclaren' ? '#ff8000' : theme === 'ferrari' ? '#c4151c' : theme === 'mercedes-amg' ? '#00a3a6' : '#ffcc00'} 
            strokeWidth="1.5"
          />
        </svg>
      )}

      {/* 2. Custom Corner Brackets and grid markers for Racing Game Frame */}
      {widget.type === 'game-frame' && profile === 'racing' && (
        <div className="absolute inset-0 border border-white/5 pointer-events-none">
          {/* Telemetry brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--accent-primary)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--accent-primary)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--accent-primary)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--accent-primary)]" />
          
          {/* Center target crosshair or grid lines */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[var(--accent-primary)]/45" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[var(--accent-primary)]/45" />
        </div>
      )}

      {/* 3. Planets Profile: Sparkle and planet decorations */}
      {profile === 'planets' && !isTransparentWidget && (
        <>
          <div className="absolute -top-1 -left-1 text-xs text-[#FFD6A5] select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>✦</div>
          <div className="absolute -bottom-1 -right-1 text-xs text-[#FFD6A5] select-none pointer-events-none">✦</div>
        </>
      )}

      {/* 4. Cyber HUD Profile: Tech borders and brackets */}
      {profile === 'cyberhud' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Neon cyan outer box with double inside layout */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="rgba(0, 240, 255, 0.55)" strokeWidth="1" />
            <rect x="2.5" y="2.5" width="95" height="95" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="0.5" />
          </svg>
          {/* Tech ticks */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00F0FF]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00F0FF]" />
          
          <span className="absolute top-[3px] left-[5px] text-[5px] text-[#00F0FF]/35 font-mono uppercase tracking-widest scale-75 origin-top-left">SYS_UPLINK_ON</span>
        </div>
      )}
      {widget.type === 'game-frame' && profile === 'cyberhud' && (
        <div className="absolute inset-0 border border-[#00F0FF]/15 pointer-events-none">
          {/* Large Outer radar targets on gameplay capture window */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00F0FF]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00F0FF]" />
          
          {/* Tech target cursor in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-[#00F0FF]/30 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#00F0FF]/50 rounded-full" />
          </div>
        </div>
      )}

      {/* 5. Esports Profile: gamer slanted telemetry borders */}
      {profile === 'esports' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon 
              points="0.5,0.5 90.5,0.5 99.5,9.5 99.5,99.5 9.5,99.5 0.5,90.5" 
              fill="none" 
              stroke="#2979FF" 
              strokeWidth="2.0"
            />
          </svg>
        </div>
      )}
      {widget.type === 'game-frame' && profile === 'esports' && (
        <div className="absolute inset-0 border border-[#2979FF]/20 pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#2979FF]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#2979FF]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#2979FF]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#2979FF]" />
        </div>
      )}

      {/* 6. Retro CRT Profile: Monospace terminal scanlines & screen flicker */}
      {profile === 'retro' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none border-2 border-[#33ff33]">
          <div className="absolute inset-0 bg-scanlines opacity-15 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#33ff33]/5 to-transparent animate-scanline pointer-events-none" />
          <div className="absolute inset-0 animate-crt-flicker bg-transparent opacity-[0.98] pointer-events-none" />
        </div>
      )}

      {/* 7. Cozy Profile: Soft warm accents, rounded elements, organic shapes */}
      {profile === 'cozy' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none rounded-3xl border-2 border-amber-900/10 shadow-inner">
          <div className="absolute top-2 right-4 text-[10px] text-amber-300 animate-pulse pointer-events-none">✨</div>
          <div className="absolute bottom-2 left-4 text-[9px] text-amber-200 animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }}>🌸</div>
        </div>
      )}

      {/* 8. Neumorphic Profile: Smooth outset bevel borders */}
      {profile === 'neumorphic' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/40 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.5),_inset_-1px_-1px_2px_rgba(0,0,0,0.05)]" />
      )}

      {/* 9. Glass Profile: Frosted glare lines */}
      {profile === 'glass' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
      )}

      {/* 10. Cyber Profile: Neon outlines and matrix corner decorations */}
      {profile === 'cyber' && !isTransparentWidget && (
        <div className="absolute inset-0 pointer-events-none border border-[var(--accent-primary)]/20">
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent-primary)]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent-primary)]" />
          <div className="absolute inset-0 bg-[var(--accent-primary)]/[0.02] pointer-events-none" />
        </div>
      )}
    </motion.div>
  );
};
