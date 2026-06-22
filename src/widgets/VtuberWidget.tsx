import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

interface VtuberWidgetProps {
  size?: 'mini' | 'medium' | 'large';
  sleeping?: boolean;
}

export const VtuberWidget: React.FC<VtuberWidgetProps> = ({ size = 'medium', sleeping = false }) => {
  const streamerName = useOverlayStore(s => s.settings.streamerName);

  const scale = size === 'mini' ? 0.5 : size === 'large' ? 1.0 : 0.7;
  const avatarVW = size === 'mini' ? '4vw' : size === 'large' ? '8vw' : '6vw';
  const bodyH = size === 'mini' ? '5vw' : size === 'large' ? '10vw' : '7.5vw';

  return (
    <div className="w-full h-full flex flex-col justify-end items-center relative overflow-hidden">
      {/* Glow backdrop */}
      <div
        className="absolute w-[60%] h-[50%] rounded-full pointer-events-none"
        style={{
          background: 'var(--accent-primary)',
          filter: 'blur(40px)',
          opacity: 0.12,
          top: '15%',
          left: '20%',
        }}
      />

      {/* Avatar container — floating animation */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: 'floatSlow 5s ease-in-out infinite' }}
      >
        {/* Head */}
        <div
          className="relative"
          style={{ width: avatarVW, height: avatarVW }}
        >
          {/* Base face */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: '#ffe0cc', border: '2px solid rgba(0,0,0,0.15)' }}
          >
            {/* Hair top */}
            <div
              className="absolute top-0 w-[110%] h-[35%] rounded-t-full"
              style={{ background: 'var(--accent-primary)' }}
            />
            {/* Left eye */}
            <div
              className="absolute bg-white rounded-full border border-black flex items-center justify-center"
              style={{
                width: '18%', height: '18%', top: '38%', left: '18%',
                animation: 'blink 4.5s infinite',
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: '55%', height: '55%',
                  background: 'var(--accent-secondary)',
                  boxShadow: '0 0 4px var(--accent-secondary)',
                }}
              />
            </div>
            {/* Right eye */}
            <div
              className="absolute bg-white rounded-full border border-black flex items-center justify-center"
              style={{
                width: '18%', height: '18%', top: '38%', right: '18%',
                animation: 'blink 4.5s 0.15s infinite',
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: '55%', height: '55%',
                  background: 'var(--accent-secondary)',
                  boxShadow: '0 0 4px var(--accent-secondary)',
                }}
              />
            </div>
            {/* Cheek blushes */}
            <div className="absolute w-[14%] h-[8%] rounded-full opacity-40" style={{ background: '#ff9fa0', top: '57%', left: '12%' }} />
            <div className="absolute w-[14%] h-[8%] rounded-full opacity-40" style={{ background: '#ff9fa0', top: '57%', right: '12%' }} />
            {/* Mouth */}
            {sleeping ? (
              <div className="absolute w-[20%] h-[8%] border-b-2 border-red-300 rounded-b-full" style={{ top: '67%' }} />
            ) : (
              <div className="absolute w-[20%] h-[8%] border-b-2 border-red-600 rounded-b-full" style={{ top: '67%' }} />
            )}
          </div>
          {/* Left ear */}
          <span
            className="absolute rounded-[100%_100%_0_0]"
            style={{
              width: '28%', height: '35%',
              background: 'var(--accent-primary)',
              top: '-12%', left: '-8%',
              transform: 'rotate(-20deg)',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
          {/* Right ear */}
          <span
            className="absolute rounded-[100%_100%_0_0]"
            style={{
              width: '28%', height: '35%',
              background: 'var(--accent-primary)',
              top: '-12%', right: '-8%',
              transform: 'rotate(20deg)',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Body */}
        <div
          className="rounded-t-[40px] mt-[-4%] z-10"
          style={{
            width: `calc(${avatarVW} * 1.2)`,
            height: bodyH,
            background: 'var(--panel-border)',
            border: '2px solid rgba(0,0,0,0.15)',
          }}
        />

        {/* Sleeping ZZZ */}
        {sleeping && (
          <div className="absolute top-[-15%] right-[-15%] flex flex-col items-center z-20">
            <span className="text-[0.8vw] font-black text-[var(--accent-secondary)] animate-bounce" style={{ animationDelay: '0s' }}>z</span>
            <span className="text-[0.6vw] font-black text-[var(--accent-primary)] animate-bounce" style={{ animationDelay: '0.3s' }}>z</span>
            <span className="text-[0.4vw] font-black text-white/50 animate-bounce" style={{ animationDelay: '0.6s' }}>z</span>
          </div>
        )}
      </div>

      {/* Name label */}
      <div
        className="absolute bottom-0 w-full bg-black/50 border-t border-white/5 py-[0.3vw] text-center font-bold font-display z-20 truncate px-2"
        style={{ fontSize: '0.65vw', color: 'var(--text-primary)' }}
      >
        {streamerName}
      </div>
    </div>
  );
};
