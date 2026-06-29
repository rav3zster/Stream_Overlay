/**
 * EditorWidgets.tsx
 *
 * Self-contained widget renderers for the new editor system.
 * All data is read from `settings` passed in as props (from widget.content.settings).
 * No dependency on useOverlayStore — works in both editor canvas and OBS /obs route.
 */
import React, { useState, useEffect } from 'react';
import { useLiveStore } from '../store/liveStore';

// ─── Types ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type S = Record<string, any>;

// ─── 1. COUNTDOWN TIMER ───────────────────────────────────────────────────────
// Reads live countdown from liveStore (same source as OBS renderer)
export const EditorCountdownTimer: React.FC<{ settings: S }> = ({ settings }) => {
  const { timer } = useLiveStore();
  const label = settings.label ?? 'STARTING IN';
  const showHours = settings.showHours ?? false;

  const s = timer.seconds;
  const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
  const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const secs = (s % 60).toString().padStart(2, '0');
  const display = showHours ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 8 }}>
      <span style={{ fontSize: '0.55em', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7, marginBottom: 4 }}>
        {label}
      </span>
      <span style={{ fontSize: '2em', fontWeight: 900, fontFamily: 'inherit', letterSpacing: '4px', lineHeight: 1 }}>
        {display}
      </span>
      {timer.isPaused && (
        <span style={{ fontSize: '0.45em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 6, opacity: 0.6 }}>
          ⏸ PAUSED
        </span>
      )}
    </div>
  );
};

// ─── 2. CLOCK WIDGET ──────────────────────────────────────────────────────────
export const EditorClockWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const [time, setTime] = useState(new Date());
  const use24Hour = settings.use24Hour ?? false;
  const showSeconds = settings.showSeconds ?? true;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12: !use24Hour,
  });

  const dateStr = time.toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <span style={{ fontSize: '1.5em', fontWeight: 900, letterSpacing: '2px' }}>{timeStr}</span>
      <span style={{ fontSize: '0.5em', opacity: 0.6, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dateStr}</span>
    </div>
  );
};

// ─── 3. TEXT WIDGET ───────────────────────────────────────────────────────────
export const EditorTextWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const text = settings.text ?? 'Double-click to edit text…';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 8, wordBreak: 'break-word' }}>
      {text}
    </div>
  );
};

// ─── 4. SCROLLING TEXT TICKER ─────────────────────────────────────────────────
export const EditorScrollingText: React.FC<{ settings: S }> = ({ settings }) => {
  const text = settings.text ?? '⚡ Welcome to the stream! • Follow for updates ⚡';
  const speed = settings.scrollSpeed === 'slow' ? 40 : settings.scrollSpeed === 'fast' ? 12 : 22;

  return (
    <div style={{ overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center' }}>
      <style>{`
        @keyframes _ticker { from { transform: translateX(100%) } to { transform: translateX(-100%) } }
      `}</style>
      <span style={{
        whiteSpace: 'nowrap',
        display: 'inline-block',
        animation: `_ticker ${speed}s linear infinite`,
      }}>
        {text}
      </span>
    </div>
  );
};

// ─── 5. SPOTIFY / MUSIC WIDGET ───────────────────────────────────────────────
export const EditorMusicWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const isConnected = settings.connected ?? false;
  const track = settings.trackTitle ?? 'Chill Synthwave Mix';
  const artist = settings.artistName ?? 'VibeOverlay DJ';
  const [dot, setDot] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setDot(d => !d), 800);
    return () => clearInterval(t);
  }, []);

  if (!isConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, opacity: 0.5 }}>
        <span style={{ fontSize: '1.5em' }}>🎵</span>
        <span style={{ fontSize: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Spotify not connected</span>
        <span style={{ fontSize: '0.4em', opacity: 0.6 }}>Connect in the Inspector →</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%', padding: '0 12px' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(30,215,96,0.15)', border: '2px solid rgba(30,215,96,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 18 }}>{dot ? '♪' : '♫'}</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ fontSize: '0.6em', color: 'rgba(30,215,96,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>♪ NOW PLAYING</div>
        <div style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track}</div>
        <div style={{ fontSize: '0.75em', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist}</div>
      </div>
    </div>
  );
};

// ─── 6. GOAL COUNTER / PROGRESS BAR ──────────────────────────────────────────
export const EditorGoalWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const label = settings.goalLabel ?? 'Follower Goal';
  const current = settings.currentValue ?? 0;
  const target = settings.targetValue ?? 100;
  const pct = Math.min((current / Math.max(target, 1)) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '8px 12px', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.55em', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.7 }}>{label}</span>
        <span style={{ fontSize: '0.7em', fontWeight: 900 }}>{current} / {target}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #a855f7, #5cffe2)',
          borderRadius: 99,
          transition: 'width 0.4s ease',
          boxShadow: '0 0 8px rgba(168,85,247,0.5)',
        }} />
      </div>
      {pct >= 100 && (
        <span style={{ textAlign: 'center', fontSize: '0.55em', fontWeight: 800, color: '#5cffe2', animation: 'pulse 1s infinite' }}>
          🎉 GOAL REACHED!
        </span>
      )}
    </div>
  );
};

// ─── 7. CHAT BOX WIDGET ───────────────────────────────────────────────────────
const SAMPLE_CHAT = [
  { id: 1, user: 'StreamerFan42', msg: 'PogChamp lets gooo!!', color: '#ff4dff' },
  { id: 2, user: 'CyberViewer', msg: 'Love the overlay design 🔥', color: '#5cffe2' },
  { id: 3, user: 'CozyWatcher', msg: 'Hi everyone!! ✨', color: '#fbbf24' },
  { id: 4, user: 'GamerDude', msg: 'HYPED for today\'s stream!', color: '#60a5fa' },
  { id: 5, user: 'ChatMod_X', msg: 'Welcome to the stream! Follow the rules!', color: '#34d399' },
];

export const EditorChatWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const max = settings.maxMessages ?? 12;
  const theme = settings.chatTheme ?? 'dark';
  const msgs = SAMPLE_CHAT.slice(0, Math.min(max, SAMPLE_CHAT.length));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.55em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, flexShrink: 0 }}>
        💬 LIVE CHAT
      </div>
      <div style={{ flex: 1, overflowY: 'hidden', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.55em', fontWeight: 800, color: m.color }}>{m.user}</span>
            <div style={{
              fontSize: '0.6em',
              padding: '3px 8px',
              borderRadius: theme === 'bubble' ? 16 : 4,
              background: theme === 'transparent' ? 'transparent' : 'rgba(255,255,255,0.05)',
              border: theme === 'transparent' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              lineHeight: 1.4,
            }}>
              {m.msg}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 8. SOCIAL LINKS WIDGET ───────────────────────────────────────────────────
export const EditorSocialWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const twitch = settings.twitch ?? 'YourChannel';
  const twitter = settings.twitter ?? '@YourHandle';
  const discord = settings.discord ?? 'discord.gg/invite';

  const links = [
    { icon: '🟣', label: 'Twitch', value: twitch },
    { icon: '🐦', label: 'Twitter', value: twitter },
    { icon: '💬', label: 'Discord', value: discord },
  ].filter(l => l.value);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, height: '100%', flexWrap: 'wrap', padding: '0 8px' }}>
      {links.map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '1em' }}>{l.icon}</span>
          <span style={{ fontSize: '0.55em', fontWeight: 700 }}>{l.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── 9. CAMERA / WEBCAM / GAME FRAME PLACEHOLDER ─────────────────────────────
export const EditorFrameWidget: React.FC<{ settings: S; label?: string }> = ({ settings, label = 'Webcam' }) => {
  const aspectRatio = settings.aspectRatio ?? '16:9';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 8, opacity: 0.4,
      border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 4,
    }}>
      <span style={{ fontSize: '2em' }}>🎥</span>
      <span style={{ fontSize: '0.55em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: '0.45em', opacity: 0.6 }}>{aspectRatio}</span>
    </div>
  );
};

// ─── 10. MEDIA (IMAGE / GIF / VIDEO) WIDGET ──────────────────────────────────
export const EditorMediaWidget: React.FC<{ settings: S }> = ({ settings }) => {
  const url = settings.url ?? '';
  const fit = settings.objectFit ?? 'cover';

  if (!url) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, opacity: 0.4 }}>
        <span style={{ fontSize: '2em' }}>🖼️</span>
        <span style={{ fontSize: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No media source set</span>
        <span style={{ fontSize: '0.4em', opacity: 0.6 }}>Set URL in Inspector →</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Media"
      style={{ width: '100%', height: '100%', objectFit: fit as React.CSSProperties['objectFit'] }}
    />
  );
};

// ─── 11. GENERIC FALLBACK ─────────────────────────────────────────────────────
export const EditorGenericWidget: React.FC<{ type: string }> = ({ type }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, opacity: 0.4 }}>
    <span style={{ fontSize: '1.5em' }}>🧩</span>
    <span style={{ fontSize: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{type}</span>
  </div>
);
