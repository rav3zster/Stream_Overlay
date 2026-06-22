import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

export const TickerWidget: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);
  const showTicker = useOverlayStore(s => s.showTicker);

  if (!showTicker) return null;

  const speedMap = { slow: '40s', normal: '25s', fast: '14s' };
  const duration = speedMap[settings.tickerSpeed] ?? '25s';

  return (
    <div
      className="absolute bottom-0 left-0 w-full flex items-stretch z-30"
      style={{
        height: '32px',
        background: 'var(--panel-bg)',
        borderTop: '1px solid var(--panel-border)',
      }}
    >
      {/* Label pill */}
      <div
        className="flex items-center gap-1 px-3 flex-shrink-0 font-display font-extrabold uppercase tracking-widest text-white z-10"
        style={{
          fontSize: '0.65vw',
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '4px 0 12px var(--accent-primary-shadow, rgba(168,85,247,0.4))',
        }}
      >
        📢 INFO
      </div>

      {/* Scrolling text */}
      <div className="flex-grow overflow-hidden relative flex items-center">
        <div
          className="absolute whitespace-nowrap font-semibold text-[var(--text-primary)] px-4"
          style={{
            fontSize: '0.7vw',
            animation: `scrollTicker ${duration} linear infinite`,
          }}
        >
          {settings.tickerText}
          &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
          {settings.tickerText}
        </div>
      </div>

      {/* Socials */}
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0 border-l font-bold"
        style={{ borderColor: 'var(--panel-border)', fontSize: '0.65vw' }}
      >
        <span style={{ color: '#9146FF' }}>Twitch</span>
        <span style={{ color: 'var(--text-secondary)' }}>{settings.socials.twitch}</span>
        <span className="opacity-30 mx-1">|</span>
        <span style={{ color: '#1DA1F2' }}>Twitter</span>
        <span style={{ color: 'var(--text-secondary)' }}>{settings.socials.twitter}</span>
      </div>
    </div>
  );
};
