import React, { useEffect } from 'react';
import { useOverlayStore } from '../store/overlayStore';

const CHIME_NOTES: Record<string, number[]> = {
  follow: [587.33, 880],
  subscribe: [523.25, 659.25, 783.99, 1046.50],
  donation: [987.77, 1318.51],
  raid: [392.00, 587.33, 783.99],
  host: [392.00, 587.33, 783.99],
};

const playChime = (type: string) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = CHIME_NOTES[type] ?? [440];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type === 'raid' ? 'sawtooth' : type === 'donation' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
    });
  } catch { /* AudioContext may be blocked */ }
};

const TYPE_ICONS: Record<string, string> = {
  follow: '💜', subscribe: '⭐', donation: '💰', raid: '🔥', host: '🎉',
};
const TYPE_LABELS: Record<string, string> = {
  follow: 'NEW FOLLOWER', subscribe: 'NEW SUBSCRIBER', donation: 'NEW DONATION',
  raid: 'INCOMING RAID', host: 'HOSTED BY',
};

export const AlertsWidget: React.FC = () => {
  const activeAlert = useOverlayStore(s => s.activeAlert);
  const dismissAlert = useOverlayStore(s => s.dismissAlert);

  useEffect(() => {
    if (!activeAlert) return;
    playChime(activeAlert.type);
    const t = setTimeout(() => dismissAlert(), 5000);
    return () => clearTimeout(t);
  }, [activeAlert, dismissAlert]);

  if (!activeAlert) return null;

  return (
    <div
      className="absolute top-[5%] left-1/2 z-50 pointer-events-none"
      style={{
        transform: 'translateX(-50%)',
        animation: 'alertPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        width: 'min(380px, 38vw)',
      }}
    >
      <div
        className="relative rounded-[12px] p-[1vw] flex items-center gap-[1vw] overflow-hidden backdrop-blur-md"
        style={{
          background: 'var(--panel-bg)',
          border: '2px solid var(--accent-primary)',
          boxShadow: '0 0 30px var(--accent-primary-shadow, rgba(168,85,247,0.4))',
        }}
      >
        {/* Gradient shimmer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, var(--accent-primary) 0%, transparent 50%)', opacity: 0.08 }}
        />

        {/* Icon circle */}
        <div
          className="w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center text-[1.5vw] flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: '0 0 15px var(--accent-primary-shadow, rgba(168,85,247,0.5))',
          }}
        >
          {TYPE_ICONS[activeAlert.type] ?? '✨'}
        </div>

        {/* Text */}
        <div className="flex-grow overflow-hidden">
          <span
            className="block font-display font-black tracking-widest uppercase"
            style={{ fontSize: '0.6vw', color: 'var(--accent-primary)' }}
          >
            {TYPE_LABELS[activeAlert.type] ?? activeAlert.type.toUpperCase()}
          </span>
          <span
            className="block font-black leading-tight"
            style={{ fontSize: '1.4vw', color: 'var(--text-primary)', textShadow: 'var(--glow-text)' }}
          >
            {activeAlert.username}
          </span>
          {activeAlert.amount && (
            <span
              className="inline-block mt-[0.2vw] rounded px-[0.5vw] py-[0.1vw] font-extrabold"
              style={{
                fontSize: '0.8vw',
                color: 'var(--accent-secondary)',
                background: 'rgba(92,255,226,0.1)',
                border: '1px solid rgba(92,255,226,0.3)',
              }}
            >
              {activeAlert.amount}
            </span>
          )}
          {activeAlert.message && !activeAlert.amount && (
            <span
              className="block italic leading-tight mt-[0.2vw]"
              style={{ fontSize: '0.65vw', color: 'var(--text-secondary)' }}
            >
              "{activeAlert.message}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
