import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { TimerWidget } from '../widgets/TimerWidget';
import { MusicWidget } from '../widgets/MusicWidget';
import { EventListWidget } from '../widgets/EventListWidget';

export const StartingSoonScene: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);

  return (
    <div className="absolute inset-x-0 top-0 bottom-[32px] z-10 flex flex-col items-center justify-center p-[3vw]">

      {/* Top event bar */}
      <div
        className="absolute top-[2%] left-[4%] right-[4%] h-[8%] rounded-lg overflow-hidden"
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <EventListWidget />
      </div>

      {/* Center card */}
      <div
        className="relative z-10 text-center rounded-xl px-[4vw] py-[3vw] max-w-[55%] w-full"
        style={{
          background: 'var(--panel-bg)',
          border: '1.5px solid var(--panel-border)',
          boxShadow: 'var(--glow-shadow)',
          backdropFilter: 'blur(12px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      >
        {/* Status tag */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-[1vw] font-display font-bold uppercase tracking-widest"
          style={{
            fontSize: '0.65vw',
            color: 'var(--accent-secondary)',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{
              background: 'var(--accent-primary)',
              boxShadow: '0 0 6px var(--accent-primary)',
              animation: 'pulseGlow 1s infinite',
            }}
          />
          PRE-STREAM ACTIVE
        </div>

        {/* Title */}
        <h1
          className="font-display font-black uppercase leading-tight mb-[0.8vw]"
          style={{
            fontSize: '2.2vw',
            letterSpacing: '4px',
            color: 'var(--text-primary)',
            textShadow: 'var(--glow-text)',
          }}
        >
          STREAM STARTING SOON
        </h1>

        {/* Countdown timer */}
        <div className="mb-[1.5vw]" style={{ height: '8vw' }}>
          <TimerWidget />
        </div>

        {/* Stream meta */}
        <div
          className="flex justify-center rounded-lg p-[0.8vw]"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex-1 text-center px-[1vw]">
            <span className="block font-bold uppercase tracking-widest" style={{ fontSize: '0.55vw', color: 'var(--text-secondary)' }}>
              HOST
            </span>
            <span className="font-black" style={{ fontSize: '0.9vw', color: 'var(--text-primary)' }}>
              {settings.streamerName}
            </span>
          </div>
          <div className="w-[1px]" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex-1 text-center px-[1vw]">
            <span className="block font-bold uppercase tracking-widest" style={{ fontSize: '0.55vw', color: 'var(--text-secondary)' }}>
              PLAYING
            </span>
            <span className="font-black" style={{ fontSize: '0.9vw', color: 'var(--text-primary)' }}>
              {settings.activeGame}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom music widget */}
      <div
        className="absolute bottom-[3%] left-1/2 rounded-[30px] overflow-hidden"
        style={{
          transform: 'translateX(-50%)',
          width: 'min(340px, 34vw)',
          height: '4.5vw',
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid var(--panel-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <MusicWidget compact />
      </div>
    </div>
  );
};
