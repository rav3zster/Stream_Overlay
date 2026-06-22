import React, { useState } from 'react';
import { useOverlayStore, type SceneType, type AlertType } from '../../store/overlayStore';
import { Play, Pause, SkipForward, Mic, Volume2, Users, ShieldAlert, Sparkles, Layers } from 'lucide-react';

export const StreamDeck: React.FC = () => {
  const {
    currentScene: activeScene,
    theme: activeTheme,
    settings,
    music: currentSong,
    setScene,
    triggerAlert,
    setTheme,
  } = useOverlayStore();

  const streamerName = settings.streamerName;

  const [micMuted, setMicMuted] = useState(false);
  const [avatarMuted, setAvatarMuted] = useState(false);
  const [slowMode, setSlowMode] = useState(false);

  // Alert simulation helper
  const handleAlertTrigger = (type: AlertType) => {
    const names = ['KiraVT', 'VibeSeeker', 'NekoGamer', 'Yukari_Chan', 'DaveRetro'];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    let message = '';
    let amount = '';
    if (type === 'donation') { message = 'Support the stream! Keep it cozy!'; amount = `$${(Math.random() * 90 + 10).toFixed(2)}`; }
    else if (type === 'subscribe') message = 'Tier 1 sub hype!';
    triggerAlert(type, selectedName, message, amount);
  };

  const scenesList: Array<{ type: SceneType; label: string; icon: string }> = [
    { type: 'starting-soon', label: 'Starting Soon', icon: '⌛' },
    { type: 'chat-session', label: 'Just Chatting', icon: '💬' },
    { type: 'main-stream', label: 'Gameplay', icon: '🎮' },
    { type: 'brb', label: 'BRB Break', icon: '🍵' },
    { type: 'ending-stream', label: 'Ending Stream', icon: '👋' }
  ];

  return (
    <div className="min-h-screen bg-[#07050f] text-[#f8f5ff] p-4 flex flex-col font-sans select-none">
      {/* Stream Deck Header */}
      <header className="flex justify-between items-center pb-3 border-b border-purple-900/30 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-glow">
            VD
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase font-display text-white">VibeDeck Mobile</h1>
            <p className="text-[10px] text-purple-400">Streamer: {streamerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30 text-[10px] font-bold text-vibeCyan">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Deck Active
        </div>
      </header>

      {/* Grid: Scene Controllers */}
      <section className="mb-5">
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
          <Layers size={12} className="text-vibeSecondary" /> Switch Stream Scenes
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {scenesList.map(scene => {
            const isActive = activeScene === scene.type;
            return (
              <button
                key={scene.type}
                onClick={() => setScene(scene.type)}
                className={`h-20 rounded-xl flex flex-col justify-center items-center gap-1.5 border transition-all active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-400 text-white shadow-cyber font-bold' 
                    : 'bg-[#130d24] border-purple-900/40 hover:border-purple-800 text-white/70 active:bg-purple-950/20'
                }`}
              >
                <span className="text-2xl">{scene.icon}</span>
                <span className="text-[11px] uppercase tracking-wider font-semibold font-display">{scene.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid: Actions & Simulated Alerts */}
      <section className="mb-5 flex-grow">
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
          <Sparkles size={12} className="text-vibeAccent" /> Trigger Live Alerts
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleAlertTrigger('follow')}
            className="h-16 bg-[#160c29] border border-purple-900/40 rounded-xl flex flex-col justify-center items-center text-rose-400 hover:text-rose-300 font-semibold active:scale-95 transition"
          >
            <span className="text-lg">💖</span>
            <span className="text-[9px] uppercase tracking-wider mt-1">Follow</span>
          </button>
          <button
            onClick={() => handleAlertTrigger('subscribe')}
            className="h-16 bg-[#160c29] border border-purple-900/40 rounded-xl flex flex-col justify-center items-center text-amber-400 hover:text-amber-300 font-semibold active:scale-95 transition"
          >
            <span className="text-lg">⭐</span>
            <span className="text-[9px] uppercase tracking-wider mt-1">Sub</span>
          </button>
          <button
            onClick={() => handleAlertTrigger('donation')}
            className="h-16 bg-[#160c29] border border-purple-900/40 rounded-xl flex flex-col justify-center items-center text-emerald-400 hover:text-emerald-300 font-semibold active:scale-95 transition"
          >
            <span className="text-lg">💵</span>
            <span className="text-[9px] uppercase tracking-wider mt-1">Dono</span>
          </button>
          <button
            onClick={() => handleAlertTrigger('raid')}
            className="h-16 bg-[#160c29] border border-purple-900/40 rounded-xl flex flex-col justify-center items-center text-cyan-400 hover:text-cyan-300 font-semibold active:scale-95 transition"
          >
            <span className="text-lg">🔥</span>
            <span className="text-[9px] uppercase tracking-wider mt-1">Raid</span>
          </button>
        </div>

        {/* Device Controls */}
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-white/50 mb-2 mt-4 flex items-center gap-1.5">
          <Volume2 size={12} className="text-vibeCyan" /> Media & Mod Actions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`h-16 rounded-xl flex flex-col justify-center items-center transition border active:scale-95 ${
              micMuted 
                ? 'bg-red-950/60 border-red-500 text-red-300 font-bold' 
                : 'bg-[#101424] border-purple-900/40 text-slate-300'
            }`}
          >
            <Mic size={18} className={micMuted ? 'text-red-400' : 'text-slate-400'} />
            <span className="text-[9px] uppercase tracking-wider mt-1">{micMuted ? 'Mic MUTED' : 'Mic ON'}</span>
          </button>
          <button
            onClick={() => setAvatarMuted(!avatarMuted)}
            className={`h-16 rounded-xl flex flex-col justify-center items-center transition border active:scale-95 ${
              avatarMuted 
                ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold' 
                : 'bg-[#101424] border-purple-900/40 text-slate-300'
            }`}
          >
            <Users size={18} className={avatarMuted ? 'text-purple-400 animate-pulse' : 'text-slate-400'} />
            <span className="text-[9px] uppercase tracking-wider mt-1">{avatarMuted ? 'Avatar AFK' : 'Avatar LIVE'}</span>
          </button>
          <button
            onClick={() => setSlowMode(!slowMode)}
            className={`h-16 rounded-xl flex flex-col justify-center items-center transition border active:scale-95 ${
              slowMode 
                ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold' 
                : 'bg-[#101424] border-purple-900/40 text-slate-300'
            }`}
          >
            <ShieldAlert size={18} className={slowMode ? 'text-amber-400' : 'text-slate-400'} />
            <span className="text-[9px] uppercase tracking-wider mt-1">Slow Chat</span>
          </button>
        </div>
      </section>

      {/* Music Quick Player bar */}
      <section className="bg-[#120e24]/70 border border-purple-900/30 rounded-2xl p-3 flex justify-between items-center gap-3">
        <div className="overflow-hidden flex-grow flex items-center gap-2">
          <img src={currentSong.albumArt} alt="" className="w-8 h-8 rounded-lg" />
          <div className="overflow-hidden leading-tight">
            <span className="block text-[11px] font-bold text-white truncate">{currentSong.title}</span>
            <span className="block text-[9px] text-purple-400 truncate">{currentSong.artist}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="p-2 bg-purple-900/30 hover:bg-purple-800/40 rounded-full text-white/80 transition active:scale-90">
            <SkipForward size={14} />
          </button>
          <button className="p-2 bg-vibePrimary text-white rounded-full transition shadow-glow active:scale-90">
            <Play size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};
