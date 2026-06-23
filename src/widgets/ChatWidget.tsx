import React, { useEffect, useRef } from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

interface ChatWidgetProps {
  maxMessages?: number;
  size?: 'mini' | 'normal' | 'large';
}

const BADGE_STYLES: Record<string, string> = {
  sub: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white',
  mod: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
  vip: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ maxMessages = 12, size = 'normal' }) => {
  const chatMessages = useOverlayStore(s => s.chatMessages);
  const viewerCount = useOverlayStore(s => s.viewerCount);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = chatMessages.slice(-maxMessages);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const textSize = size === 'mini' ? 'text-[0.65vw]' : size === 'large' ? 'text-[1vw]' : 'text-[0.8vw]';
  const nameSz = size === 'mini' ? 'text-[0.7vw]' : size === 'large' ? 'text-[0.9vw]' : 'text-[0.8vw]';

  // ──────────────────────────────────────────────────────────────
  // 1. PASTEL PLANETS THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'planets') {
    return (
      <div className="flex flex-col h-full text-white overflow-hidden relative">
        <div className="flex justify-between items-center px-4 py-2 bg-[#4c3a75] border-b border-[#BDB2FF]/30 text-[0.65vw] font-black uppercase tracking-widest text-[#FFC6FF] font-display">
          <span>✦ SPACE COMMUNICATOR ✦</span>
          <span>{viewerCount} ASTEROIDS</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 pb-8 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5 items-start">
              <span className="text-[0.7vw] font-black text-[#FFD6A5] font-display">{msg.username}</span>
              <div className="text-[0.75vw] bg-[#6c559c]/55 border border-[#BDB2FF]/20 text-white rounded-2xl py-1.5 px-3 max-w-[90%] break-words leading-relaxed shadow-sm">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        {/* Cute alien bug mascot peaking from the bottom right corner */}
        <div className="absolute bottom-0 right-2 w-10 h-8 pointer-events-none select-none overflow-hidden">
          <svg viewBox="0 0 100 80" className="w-full h-full text-[#BDB2FF] fill-current translate-y-1">
            {/* Body */}
            <path d="M20,80 Q20,30 50,30 Q80,30 80,80 Z" />
            {/* Antennas */}
            <line x1="38" y1="32" x2="30" y2="10" stroke="currentColor" strokeWidth="4" />
            <circle cx="30" cy="10" r="6" fill="#FFC6FF" />
            <line x1="62" y1="32" x2="70" y2="10" stroke="currentColor" strokeWidth="4" />
            <circle cx="70" cy="10" r="6" fill="#FFC6FF" />
            {/* Eyes */}
            <circle cx="40" cy="50" r="8" fill="white" />
            <circle cx="40" cy="50" r="4" fill="black" />
            <circle cx="60" cy="50" r="8" fill="white" />
            <circle cx="60" cy="50" r="4" fill="black" />
          </svg>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. CYBER HUD THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cyberhud') {
    return (
      <div className="flex flex-col h-full font-mono text-[#00F0FF] overflow-hidden bg-[#0e1621]/40 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />
        <div className="flex justify-between items-center px-3 py-1.5 border-b border-[#00F0FF]/30 bg-[#0e1621]/70 text-[0.55vw] font-bold tracking-widest">
          <span>[NET_RECEIVE_STREAM]</span>
          <span className="text-[#00F0FF]/60">{viewerCount} NODES_CONNECTED</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="text-[0.7vw] border-l-2 border-[#00F0FF]/40 pl-2 py-0.5 bg-[#00F0FF]/5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#00F0FF]" style={{ color: msg.color || '#00F0FF' }}>
                  {msg.username.toUpperCase()}
                </span>
                <span className="text-[0.5vw] text-[#00F0FF]/40">[LOG_IN_SEC: {(new Date(msg.timestamp).getSeconds())}]</span>
              </div>
              <p className="text-[#a5f3fc] mt-0.5 leading-snug break-words">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. ESPORTS TELEMETRY THEME DESIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'esports') {
    return (
      <div className="flex flex-col h-full text-white font-sans overflow-hidden bg-gradient-to-b from-[#050c20] to-[#010512]">
        <div className="flex justify-between items-center px-4 py-2 border-b-2 border-[#2979FF] bg-[#071333] text-[0.6vw] font-black uppercase tracking-widest text-[#2979FF] skew-x-[-4deg] origin-left ml-2">
          <span>⚔️ CHAT_TELEMETRY</span>
          <span className="text-white bg-[#2979FF] px-1.5 py-0.5 rounded-sm">{viewerCount} ONLINE</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-3.5 flex flex-col gap-3.5 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1 items-start border-b border-[#2979FF]/10 pb-2">
              <span 
                className={`${nameSz} font-black uppercase tracking-tight skew-x-[-6deg]`}
                style={{ color: msg.color || '#2979FF' }}
              >
                {msg.username}
              </span>
              <p className={`${textSize} text-[#d2dae8] leading-tight break-words font-medium`}>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. RETRO CRT TERMINAL FEED LOG
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    return (
      <div className="flex flex-col h-full font-mono text-[#33ff33] bg-[#051405] overflow-hidden leading-snug">
        <div className="flex justify-between items-center px-3 py-1.5 border-b border-[#33ff33]/30 bg-black/45 text-[0.6vw] font-bold">
          <span>LOGGER_FEED // STREAMS_ACTIVE</span>
          <span>{viewerCount} LURKERS</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-2.5 flex flex-col gap-1.5 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="text-[0.75vw] flex items-start gap-1">
              <span className="text-[#228822] flex-shrink-0">[{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <div className="break-words w-full">
                <span className="font-extrabold text-[#33ff33] mr-1">&lt;{msg.username}&gt;</span>
                <span className="text-[#aaffaa]">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT DRIVER TEAM COMMUNICATIONS RADIO
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    return (
      <div className="flex flex-col h-full font-mono text-white leading-none overflow-hidden bg-black/10">
        <div className="flex justify-between items-center px-[0.8vw] py-[0.4vw] border-b border-white/10 bg-black/50 text-[0.55vw] font-extrabold text-[var(--accent-primary)] uppercase tracking-wider">
          <span className="tracking-widest">LIVE CHAT FEED</span>
          <span className="text-slate-400 font-bold">SIGNAL: LOCK 100%</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-[0.6vw] flex flex-col gap-[0.5vw] scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg, i) => {
            const teamBadgeNum = (msg.username.length * 7) % 99 + 1;
            return (
              <div key={msg.id} className="flex gap-[0.5vw] items-start border-l-2 border-[var(--accent-primary)] pl-2 bg-white/5 py-[0.3vw] px-[0.5vw] rounded-r">
                <div 
                  className="flex-shrink-0 text-black text-[0.5vw] font-black w-[1.2vw] h-[1.2vw] flex items-center justify-center rounded-sm"
                  style={{ backgroundColor: msg.color || 'var(--accent-primary)' }}
                >
                  #{teamBadgeNum}
                </div>
                <div className="flex-grow overflow-hidden leading-tight">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span 
                      className={`${nameSz} font-black uppercase`}
                      style={{ color: msg.color || '#ffffff' }}
                    >
                      {msg.username}
                    </span>
                    <span className="text-[0.45vw] text-slate-500 font-bold">CAR #{teamBadgeNum}</span>
                  </div>
                  <p className={`${textSize} text-slate-200 mt-1 break-words font-medium`}>{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF CLASSIC LOG
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div className="flex flex-col h-full text-[#121e2c] leading-tight overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 border-b border-[#709cb8]/20 bg-[#709cb8]/10 text-[0.6vw] font-black uppercase tracking-widest text-[#709cb8]">
          <span>GULF RADIO CONTROL</span>
          <span className="text-[#ff5800]">{viewerCount} RACERS</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="text-[0.75vw] flex items-start gap-1">
              <span className="font-serif font-black text-[#ff5800] mr-1">{msg.username}:</span>
              <span className="text-[#121e2c] font-medium">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY SPEECH BUBBLES (Lo-fi Bedroom, Cafe, Anime)
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div className="flex flex-col h-full text-amber-100 font-display overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 border-b border-amber-900/10 bg-amber-950/20 text-[0.65vw] font-bold text-amber-300">
          <span>💬 LOFI BOARD FEED</span>
          <span>☕ {viewerCount} CHILLING</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-3.5 flex flex-col gap-3 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5 items-start">
              <span className="text-[0.75vw] font-bold text-amber-300 font-display">{msg.username}</span>
              <div className="text-[0.75vw] bg-amber-950/40 border border-amber-900/25 text-amber-50 rounded-2xl py-2 px-3.5 max-w-[90%] break-words leading-relaxed shadow-sm">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE CLEAN LOG
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    return (
      <div className="flex flex-col h-full text-[var(--text-primary)] overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2.5 border-b border-slate-200/5 text-[0.55vw] font-extrabold uppercase tracking-widest text-[var(--text-secondary)]">
          <span>Live Chat Feed</span>
          <span className="bg-slate-500/5 px-2 py-0.5 rounded-full">{viewerCount} Viewers</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="text-[0.75vw] flex items-start gap-1 font-sans">
              <span className="font-extrabold text-[var(--text-primary)] mr-1.5">{msg.username}</span>
              <span className="text-[var(--text-secondary)] font-normal">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC FLOATING PANEL
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div className="flex flex-col h-full text-white overflow-hidden backdrop-blur-md">
        <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/5 text-[0.6vw] font-bold tracking-wider text-pink-300">
          <span>🔮 CHAT STREAM</span>
          <span>{viewerCount} ONLINE</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="bg-white/5 border border-white/10 rounded-xl p-2 text-[0.75vw] leading-relaxed break-words flex flex-col">
              <span className="font-black text-pink-300 mb-0.5">{msg.username}</span>
              <span className="text-white/95">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY GOLD ACCENTS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div className="flex flex-col h-full text-white font-serif overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 border-b border-[#d4af37]/20 bg-black/25 text-[0.55vw] font-bold tracking-widest text-[#d4af37]">
          <span>SALON CHAT</span>
          <span>{viewerCount} GUESTS</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-3 flex flex-col gap-2.5 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {visible.map((msg) => (
            <div key={msg.id} className="text-[0.75vw] border-b border-white/5 pb-1">
              <span className="font-extrabold text-[#d4af37] mr-1.5">{msg.username.toUpperCase()}:</span>
              <span className="text-slate-200 font-serif font-light">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. STANDARD CYBERPUNK / FALLBACK CHAT BOX
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center px-[0.8vw] py-[0.4vw] border-b border-white/5 bg-black/20 flex-shrink-0">
        <span className="text-[0.65vw] font-bold tracking-widest uppercase font-display text-[var(--accent-secondary)]">
          💬 LIVE CHAT
        </span>
        <span className="text-[0.6vw] text-[var(--text-secondary)] font-semibold">
          {viewerCount} 👁
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-[0.6vw] flex flex-col gap-[0.5vw] scrollbar-thin"
        style={{ scrollbarWidth: 'none' }}
      >
        {visible.map((msg, i) => (
          <div
            key={msg.id}
            className="flex flex-col gap-[2px] items-start"
            style={{
              animation: i === visible.length - 1 ? 'chatFadeIn 0.3s ease-out' : undefined,
            }}
          >
            <div className="flex items-center gap-[4px] flex-wrap">
              {msg.badge && (
                <span className={`${BADGE_STYLES[msg.badge] ?? ''} px-[3px] py-[1px] rounded text-[0.45vw] font-extrabold uppercase tracking-wider`}>
                  {msg.badge.toUpperCase()}
                </span>
              )}
              <span className={`${nameSz} font-bold`} style={{ color: msg.color ?? 'var(--accent-primary)' }}>
                {msg.username}
              </span>
            </div>
            <div className={`${textSize} bg-black/20 border border-white/5 text-[var(--text-primary)] rounded-[4px] py-[3px] px-[6px] max-w-[95%] leading-relaxed break-words`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
