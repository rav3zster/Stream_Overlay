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

interface WidgetRendererProps {
  widget: Widget;
  isEditor?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, isEditor = false }) => {
  const disableAnimations = useOverlayStore(s => s.settings.disableAnimations);

  // If hidden on live OBS overlay, render nothing
  if (!widget.visible && !isEditor) return null;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${widget.x}%`,
    top: `${widget.y}%`,
    width: `${widget.w}%`,
    height: `${widget.h}%`,
    transform: `rotate(${widget.rotation || 0}deg) scale(${widget.scale || 1.0})`,
    opacity: isEditor && !widget.visible ? 0.35 : (widget.opacity ?? 100) / 100,
    zIndex: widget.zIndex || 1,
    
    // Style settings
    borderRadius: `${widget.style?.borderRadius ?? 8}px`,
    background: widget.style?.background || 'rgba(14, 8, 26, 0.8)',
    border: `${widget.style?.borderSize ?? 1}px ${widget.style?.borderStyle || 'solid'} ${widget.style?.borderColor || '#A855F7'}`,
    boxShadow: `${widget.style?.shadowX ?? 0}px ${widget.style?.shadowY ?? 4}px ${widget.style?.shadowBlur ?? 10}px ${widget.style?.shadowColor || 'rgba(0,0,0,0.5)'}` +
      (widget.style?.glowBlur ? `, 0 0 ${widget.style.glowBlur}px ${widget.style.glowColor || 'var(--accent-primary)'}` : ''),
    padding: `${widget.style?.padding ?? 4}px`,
    
    // Typography
    fontFamily: widget.style?.fontFamily || 'inherit',
    fontSize: widget.style?.fontSize ? `${widget.style.fontSize}vw` : 'inherit',
    fontWeight: widget.style?.fontWeight || 'normal',
    color: widget.style?.fontColor || 'inherit',
    textAlign: widget.style?.textAlign || 'left',
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
      style={containerStyle}
      {...getAnimateProps()}
      className={isEditor && !widget.visible ? 'border-dashed border-red-500/40 bg-red-950/5' : ''}
    >
      {renderContent()}
    </motion.div>
  );
};
