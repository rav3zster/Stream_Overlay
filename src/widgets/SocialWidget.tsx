import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { getThemeProfile } from '../lib/themes';

export const SocialWidget: React.FC = () => {
  const socials = useOverlayStore(s => s.settings.socials);
  const theme = useOverlayStore(s => s.theme);
  const profile = getThemeProfile(theme);

  // ──────────────────────────────────────────────────────────────
  // 1. RETRO CRT SYSTEM ARGS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'retro') {
    return (
      <div className="flex flex-col justify-center items-start h-full font-mono text-[#33ff33] p-3 text-[0.75vw] leading-normal">
        <span className="text-[#228822] mb-1 font-bold">--- HOST_HANDLES // ---</span>
        <div>[TWITCH] : {socials.twitch}</div>
        <div>[TWITTER]: {socials.twitter}</div>
        {socials.discord && <div>[DISCORD]: {socials.discord}</div>}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 2. MOTORSPORT TELEMETRY CHANNELS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'racing') {
    return (
      <div className="flex items-center gap-[1.5vw] justify-center h-full px-[1vw] py-[0.5vw] font-mono text-white leading-none">
        <div className="flex flex-col items-start border-l border-[var(--accent-primary)] pl-2">
          <span className="text-[0.45vw] text-slate-500 font-extrabold">TCH_COMM</span>
          <span className="text-[0.8vw] font-black">{socials.twitch}</span>
        </div>
        <div className="flex flex-col items-start border-l border-[var(--accent-primary)] pl-2">
          <span className="text-[0.45vw] text-slate-500 font-extrabold">TW_CHANNEL</span>
          <span className="text-[0.8vw] font-black">{socials.twitter}</span>
        </div>
        {socials.discord && (
          <div className="flex flex-col items-start border-l border-[var(--accent-primary)] pl-2">
            <span className="text-[0.45vw] text-slate-500 font-extrabold">DSC_COMM</span>
            <span className="text-[0.8vw] font-black">{socials.discord}</span>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 3. PORSCHE GULF CLASSIC BADGE
  // ──────────────────────────────────────────────────────────────
  if (profile === 'gulf') {
    return (
      <div className="flex items-center gap-[1.5vw] justify-center h-full px-4 text-[#121e2c] font-serif leading-none">
        <span className="text-[0.6vw] font-black uppercase text-[#ff5800] tracking-widest mr-1 font-display">GULF DRIVERS:</span>
        <span className="text-[0.8vw] font-bold">Twitch{socials.twitch}</span>
        <span className="text-[0.8vw] font-bold">Twitter{socials.twitter}</span>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 4. COZY LOFI NOTECARDS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'cozy') {
    return (
      <div className="flex items-center gap-4 justify-center h-full text-amber-100 font-display p-2 text-[0.75vw]">
        <span className="text-amber-300 font-bold uppercase tracking-wider">📌 Connect:</span>
        <div className="flex gap-3">
          <span className="bg-amber-950/30 px-3 py-1 rounded-full border border-amber-900/10">Twitch: {socials.twitch}</span>
          <span className="bg-amber-950/30 px-3 py-1 rounded-full border border-amber-900/10">Twitter: {socials.twitter}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 5. MINIMALIST APPLE ALIGN
  // ──────────────────────────────────────────────────────────────
  if (profile === 'minimal') {
    return (
      <div className="flex items-center gap-6 justify-center h-full text-[var(--text-primary)] font-sans text-[0.75vw]">
        <div className="flex gap-2">
          <span className="font-extrabold">Twitch</span>
          <span className="text-[var(--text-secondary)]">{socials.twitch}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-extrabold">Twitter</span>
          <span className="text-[var(--text-secondary)]">{socials.twitter}</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 6. GLASSMORPHIC FLOATING LABELS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'glass') {
    return (
      <div className="flex items-center gap-[1.5vw] justify-center h-full text-white text-[0.75vw] backdrop-blur-md">
        <span className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 font-bold shadow-sm">Twitch: <span className="text-pink-300">{socials.twitch}</span></span>
        <span className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 font-bold shadow-sm">Twitter: <span className="text-pink-300">{socials.twitter}</span></span>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 7. LUXURY GOLD LETTERS
  // ──────────────────────────────────────────────────────────────
  if (profile === 'luxury') {
    return (
      <div className="flex items-center gap-[1.5vw] justify-center h-full text-white font-serif text-[0.7vw] tracking-widest">
        <span>TWITCH: <span className="text-[#d4af37]">{socials.twitch.toUpperCase()}</span></span>
        <span className="opacity-40">|</span>
        <span>TWITTER: <span className="text-[#d4af37]">{socials.twitter.toUpperCase()}</span></span>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 8. STANDARD CYBERPUNK / FALLBACK SOCIAL CARD
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col justify-center items-center h-full gap-[0.6vw] p-[1vw]">
      <span className="font-display font-black uppercase tracking-widest text-[0.7vw] text-[var(--accent-secondary)]">
        Follow & Connect
      </span>
      <div className="flex items-center gap-[1.5vw] flex-wrap justify-center">
        <div className="flex items-center gap-[0.4vw]">
          <span className="font-bold text-[0.75vw] text-[#9146FF]">Twitch</span>
          <span className="text-[0.8vw] text-[var(--text-primary)]">{socials.twitch}</span>
        </div>
        <div className="w-[1px] h-3 opacity-20 bg-white" />
        <div className="flex items-center gap-[0.4vw]">
          <span className="font-bold text-[0.75vw] text-[#1DA1F2]">Twitter</span>
          <span className="text-[0.8vw] text-[var(--text-primary)]">{socials.twitter}</span>
        </div>
        <div className="w-[1px] h-3 opacity-20 bg-white" />
        <div className="flex items-center gap-[0.4vw]">
          <span className="font-bold text-[0.75vw] text-[#FF0000]">YouTube</span>
          <span className="text-[0.8vw] text-[var(--text-primary)]">{socials.youtube}</span>
        </div>
        {socials.discord && (
          <>
            <div className="w-[1px] h-3 opacity-20 bg-white" />
            <div className="flex items-center gap-[0.4vw]">
              <span className="font-bold text-[0.75vw] text-[#5865F2]">Discord</span>
              <span className="text-[0.8vw] text-[var(--text-primary)]">{socials.discord}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ViewerCountWidget: React.FC = () => {
  const viewerCount = useOverlayStore(s => s.viewerCount);
  return (
    <div className="flex items-center justify-center gap-[0.5vw] h-full">
      <span className="text-[1.5vw]">👁</span>
      <span className="font-display font-black text-[1.5vw] text-[var(--accent-primary)]" style={{ textShadow: 'var(--glow-text)' }}>
        {viewerCount.toLocaleString()}
      </span>
      <span className="font-bold uppercase tracking-widest text-[0.6vw] text-[var(--text-secondary)]">
        viewers
      </span>
    </div>
  );
};
