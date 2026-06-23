import React, { useState, useEffect } from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { Cpu, Heart, MessageSquare, Plus } from 'lucide-react';

// ─── CLOCK & DATE WIDGET ──────────────────────────────────────────────────
export const ClockWidget: React.FC<{ settings?: Record<string, any> }> = ({ settings }) => {
  const [time, setTime] = useState(new Date());
  const use24h = settings?.use24h ?? false;
  const showDate = settings?.showDate ?? true;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24h,
  });

  const dateStr = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-2 font-display">
      <span className="text-[2.2vw] font-black text-white leading-none tracking-wider text-shadow-glow">
        {timeStr}
      </span>
      {showDate && (
        <span className="text-[0.9vw] text-purple-400 font-bold uppercase tracking-widest mt-1">
          {dateStr}
        </span>
      )}
    </div>
  );
};

// ─── WEATHER WIDGET ────────────────────────────────────────────────────────
export const WeatherWidget: React.FC<{ settings?: Record<string, any> }> = ({ settings }) => {
  const city = settings?.city || 'Tokyo, JP';
  const [temp, setTemp] = useState(24);
  const [condition, setCondition] = useState('Vibrant Rain');

  useEffect(() => {
    // Slight fluctuation
    const t = setInterval(() => {
      setTemp(prev => Math.round(prev + (Math.random() - 0.5) * 2));
    }, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center justify-between h-full w-full px-4 font-display">
      <div className="flex flex-col">
        <span className="text-[0.75vw] text-slate-400 font-extrabold uppercase tracking-wider">{city}</span>
        <span className="text-[0.9vw] text-vibeSecondary font-bold mt-0.5">{condition}</span>
      </div>
      <div className="text-[2vw] font-black text-vibeAccent flex items-start leading-none">
        {temp}<span className="text-[1vw] font-bold mt-1">°C</span>
      </div>
    </div>
  );
};

// ─── STREAM UPTIME WIDGET ──────────────────────────────────────────────────
export const StreamUptimeWidget: React.FC = () => {
  const [seconds, setSeconds] = useState(3600 + 1200 + 45); // starts at 1h 20m 45s

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center h-full text-center font-display">
      <span className="text-[0.6vw] text-slate-400 font-extrabold tracking-widest uppercase mb-1">STREAM UPTIME</span>
      <span className="text-[1.8vw] font-black text-vibeCyan tabular-nums leading-none">
        {hrs}:{mins}:{secs}
      </span>
    </div>
  );
};

// ─── DISCORD STATUS WIDGET ─────────────────────────────────────────────────
export const DiscordStatusWidget: React.FC = () => {
  return (
    <div className="flex items-center gap-3 h-full px-3 font-body">
      <div className="relative">
        <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-indigo-600 flex items-center justify-center text-white text-[1.2vw] font-black shadow-lg">
          D
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0a1a] shadow-glow" />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[0.8vw] font-black text-slate-200 truncate">Rave_VT#1337</span>
        <span className="text-[0.65vw] text-emerald-400 font-semibold truncate">Playing: Hollow Knight</span>
      </div>
    </div>
  );
};

// ─── CPU & RAM USAGE GAUGES ────────────────────────────────────────────────
export const CpuRamWidget: React.FC = () => {
  const [cpu, setCpu] = useState(32);
  const [ram, setRam] = useState(64);

  useEffect(() => {
    const t = setInterval(() => {
      setCpu(Math.round(20 + Math.random() * 25));
      setRam(Math.round(60 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex justify-around items-center h-full w-full px-2 font-display text-[0.8vw]">
      <div className="flex flex-col items-center flex-1">
        <div className="flex items-center gap-1 text-vibeSecondary font-black uppercase mb-1">
          <Cpu size={12} /> CPU
        </div>
        <span className="text-[1.2vw] font-black text-white tracking-wide">{cpu}%</span>
      </div>
      <div className="w-[1px] h-2/3 bg-white/10 mx-1" />
      <div className="flex flex-col items-center flex-1">
        <span className="text-vibeAccent font-black uppercase mb-1">RAM</span>
        <span className="text-[1.2vw] font-black text-white tracking-wide">{ram}%</span>
      </div>
    </div>
  );
};

// ─── COUNTDOWN TIMER WIDGET ────────────────────────────────────────────────
export const CountdownWidget: React.FC<{ settings?: Record<string, any> }> = ({ settings }) => {
  const targetLabel = settings?.targetLabel || 'GIVEAWAY IN';
  const targetMinutes = settings?.targetMinutes || 15;
  const [secondsLeft, setSecondsLeft] = useState(targetMinutes * 60);

  useEffect(() => {
    setSecondsLeft(targetMinutes * 60);
  }, [targetMinutes]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-2 font-display">
      <span className="text-[0.6vw] text-slate-400 font-extrabold uppercase tracking-widest mb-1">{targetLabel}</span>
      <span className="text-[2vw] font-black text-vibeAccent tabular-nums leading-none">
        {mins}:{secs}
      </span>
    </div>
  );
};

// ─── CUSTOM TEXT / QUOTE WIDGET ────────────────────────────────────────────
export const CustomTextWidget: React.FC<{ settings?: Record<string, any> }> = ({ settings }) => {
  const text = settings?.customText || '✨ Welcome to VibeOverlay Studio! Customize this text box in the inspector. ✨';
  return (
    <div className="flex items-center justify-center h-full w-full p-3 text-center leading-relaxed break-words font-body text-[0.85vw] text-slate-200">
      {text}
    </div>
  );
};

// ─── PET WIDGET ────────────────────────────────────────────────────────────
export const PetWidget: React.FC = () => {
  const [petState, setPetState] = useState<'idle' | 'sleeping' | 'happy'>('idle');
  const [petClicks, setPetClicks] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPetState(prev => {
        if (prev === 'happy') return 'idle';
        return Math.random() < 0.3 ? 'sleeping' : 'idle';
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPetClicks(c => c + 1);
    setPetState('happy');
  };

  const getEmoji = () => {
    switch (petState) {
      case 'sleeping': return '💤🐱💤';
      case 'happy': return '😸✨🐾';
      default: return '🐱🐾🎀';
    }
  };

  return (
    <div 
      onClick={handlePetClick}
      className="flex flex-col items-center justify-center h-full cursor-pointer select-none font-display p-2 text-center"
      title="Click me to pet!"
    >
      <span className="text-[1.8vw] animate-bounce select-none" style={{ animationDuration: petState === 'happy' ? '0.8s' : '3s' }}>
        {getEmoji()}
      </span>
      <span className="text-[0.65vw] text-slate-400 font-extrabold uppercase mt-1 flex items-center gap-1">
        <Heart size={10} className="text-vibeAccent fill-vibeAccent animate-pulse" /> Pet Clicks: {petClicks}
      </span>
    </div>
  );
};

// ─── POLLS WIDGET ──────────────────────────────────────────────────────────
export const PollsWidget: React.FC = () => {
  const [voted, setVoted] = useState(false);
  const [yesVotes, setYesVotes] = useState(42);
  const [noVotes, setNoVotes] = useState(18);

  const handleVote = (choice: 'yes' | 'no') => {
    if (voted) return;
    if (choice === 'yes') setYesVotes(y => y + 1);
    else setNoVotes(n => n + 1);
    setVoted(true);
  };

  const total = yesVotes + noVotes;
  const yesPct = total > 0 ? Math.round((yesVotes / total) * 100) : 0;
  const noPct = total > 0 ? Math.round((noVotes / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden font-display p-[0.5vw]">
      <div className="text-[0.7vw] font-black text-vibeSecondary uppercase tracking-widest border-b border-white/5 pb-[0.2vw] mb-[0.4vw]">
        🗳️ CHAT POLL: NEXT GAME?
      </div>
      <div className="flex-grow flex flex-col justify-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[0.7vw] font-bold">
            <span className="text-white">Yes (Hollow Knight)</span>
            <span className="text-vibeCyan">{yesPct}%</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded overflow-hidden">
            <div className="h-full bg-vibeCyan rounded" style={{ width: `${yesPct}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[0.7vw] font-bold">
            <span className="text-white">No (Minecraft)</span>
            <span className="text-vibeAccent">{noPct}%</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded overflow-hidden">
            <div className="h-full bg-vibeAccent rounded" style={{ width: `${noPct}%` }} />
          </div>
        </div>
      </div>
      {!voted && (
        <div className="flex gap-2 mt-[0.4vw]">
          <button onClick={() => handleVote('yes')} className="flex-1 py-[2px] bg-vibeCyan/15 border border-vibeCyan/40 hover:bg-vibeCyan/30 text-[0.6vw] text-vibeCyan font-black uppercase rounded">
            Vote YES
          </button>
          <button onClick={() => handleVote('no')} className="flex-1 py-[2px] bg-vibeAccent/15 border border-vibeAccent/40 hover:bg-vibeAccent/30 text-[0.6vw] text-vibeAccent font-black uppercase rounded">
            Vote NO
          </button>
        </div>
      )}
    </div>
  );
};
