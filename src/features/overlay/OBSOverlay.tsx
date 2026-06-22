import React, { useEffect, useRef, useState } from 'react';
import { useStreamStore, type Widget, type SceneType } from '../../store/useStreamStore';

export const OBSOverlay: React.FC = () => {
  const {
    activeScene,
    activeTheme,
    streamerName,
    streamTitle,
    activeGame,
    viewerCount,
    sceneWidgets,
    goals,
    activeAlert,
    currentSong,
    alertHistory,
    dismissAlert,
    loadStateFromLocal
  } = useStreamStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [localTimer, setLocalTimer] = useState('10:00');
  const [simulatedChat, setSimulatedChat] = useState<Array<{ user: string; text: string; id: string; badge?: string }>>([]);
  const timerRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(600);

  // Initialize cross-tab synchronization listener
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'vibe_studio_realtime_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          // Strip timestamp to prevent loop and merge values
          delete parsed.timestamp;
          loadStateFromLocal(parsed);
        } catch (err) {
          console.warn('Sync parsing error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [loadStateFromLocal]);

  // Alert dismiss timeout triggers
  useEffect(() => {
    if (activeAlert) {
      // Play audio chime based on alert type
      playChime(activeAlert.type);
      const t = setTimeout(() => {
        dismissAlert();
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [activeAlert, dismissAlert]);

  // Audio synthesizer utilizing Web Audio API
  const playChime = (type: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'follow') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'subscribe') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.1, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.25);
        });
      } else if (type === 'donation') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(987.77, now); // B5
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.start(now);
        osc1.stop(now + 0.15);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain2.gain.setValueAtTime(0.08, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + 0.22);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.3);
      } else {
        // Raid epic tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(392.00, now);
        osc.frequency.linearRampToValueAtTime(587.33, now + 0.15);
        osc.frequency.linearRampToValueAtTime(783.99, now + 0.3);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn('Audio Context interaction pending.', e);
    }
  };

  // Timer Tick implementation
  useEffect(() => {
    if (activeScene === 'starting-soon' || activeScene === 'brb') {
      if (timerRef.current) window.clearInterval(timerRef.current);
      
      timerRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            window.clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [activeScene]);

  // Format timer text
  useEffect(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    setLocalTimer(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  }, [secondsLeft]);

  // Reset seconds left if scene switches
  useEffect(() => {
    setSecondsLeft(activeScene === 'starting-soon' ? 600 : 300);
  }, [activeScene]);

  // Chat message simulator drip for overlay feeds
  useEffect(() => {
    const userNames = ['Miko_Chan', 'CyberRider', 'SleepyNeko', 'ZenLofi', 'PixelGamer', 'KuroVT', 'GamerDrip'];
    const msgPool = [
      'This overlay looks insane! 💜',
      'Hydrate streamer! Drink water!',
      'Hollow Knight path of pain is real.',
      'Lurk mode on. Cozy beats!',
      'Hype hype hype!! 🔥',
      'Anyone playing tomorrow?',
      'Let\'s go RAVE! POGGERS'
    ];

    const dripInterval = setInterval(() => {
      const newUser = userNames[Math.floor(Math.random() * userNames.length)];
      const newText = msgPool[Math.floor(Math.random() * msgPool.length)];
      const isSub = Math.random() < 0.35;
      
      setSimulatedChat(prev => {
        const next = [...prev, {
          user: newUser,
          text: newText,
          id: `chat-${Date.now()}`,
          badge: isSub ? 'Sub' : undefined
        }];
        return next.slice(-12); // Max 12 messages visible
      });
    }, 4500);

    return () => clearInterval(dripInterval);
  }, []);

  // Theme-responsive canvas backgrounds loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const dots: Array<{ x: number; y: number; s: number; sx: number; sy: number; a: number; rot: number; sp: number }> = [];
    for (let i = 0; i < 45; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        s: Math.random() * 3 + 1,
        sx: (Math.random() - 0.5) * 0.4,
        sy: (Math.random() - 0.5) * 0.4 - 0.1,
        a: Math.random() * 0.5 + 0.2,
        rot: Math.random() * Math.PI,
        sp: (Math.random() - 0.5) * 0.02
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      dots.forEach(d => {
        d.x += d.sx;
        d.y += d.sy;
        d.rot += d.sp;

        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        ctx.save();
        ctx.globalAlpha = d.a;

        if (activeTheme === 'cyber-synth' || activeTheme === 'vaporwave' || activeTheme === 'neon-tokyo') {
          // Electric grid sparks
          ctx.fillStyle = d.s > 2.5 ? '#FF4DFF' : '#5CFFE2';
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fillRect(d.x, d.y, d.s * 1.5, d.s * 1.5);
        } else if (activeTheme === 'galaxy-violet' || activeTheme === 'cosmic-nebula') {
          // Drifting soft circular stars
          const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.s * 3.5);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          grad.addColorStop(0.3, 'rgba(168, 85, 247, 0.4)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (activeTheme === 'sakura-night' || activeTheme === 'anime-bedroom') {
          // Pink sakura petals falling
          ctx.translate(d.x, d.y);
          ctx.rotate(d.rot);
          ctx.fillStyle = 'rgba(251, 207, 232, 0.8)';
          ctx.beginPath();
          ctx.ellipse(0, 0, d.s * 2, d.s * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (activeTheme === 'dark-amethyst') {
          // Golden floating gems
          d.sy = -Math.abs(d.sy) - 0.15;
          ctx.fillStyle = '#c084fc';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#c084fc';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Minimal purple - simple static star points
          ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
          ctx.fillRect(d.x, d.y, 2, 2);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme]);

  // Widget rendering helper routes
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'timer':
        return (
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
            <span className="text-[1.2vw] uppercase tracking-widest text-[var(--accent-secondary)] font-display glow-text-theme mb-2">
              {activeScene === 'starting-soon' ? 'STREAM STARTING SOON' : 'BE RIGHT BACK'}
            </span>
            <span className="text-[4.5vw] font-black tracking-wider text-[var(--text-primary)] font-display glow-text-theme leading-none">
              {localTimer}
            </span>
          </div>
        );
      case 'music':
        return (
          <div className="flex items-center gap-[1vw] h-full p-[1vw]">
            <div className="relative w-[4vw] h-[4vw] rounded-full border-2 border-[var(--panel-border)] overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/40">
              <img src={currentSong.albumArt} alt="album art" className="w-[85%] h-[85%] rounded-full animate-[spin_8s_linear_infinite]" />
              <div className="absolute w-[1.2vw] h-[1.2vw] bg-[var(--bg-color)] border border-[var(--panel-border)] rounded-full top-[1.4vw] left-[1.4vw]"></div>
            </div>
            <div className="flex-grow overflow-hidden">
              <span className="block text-[0.65vw] text-[var(--text-secondary)] font-bold tracking-wider uppercase">NOW PLAYING</span>
              <span className="block text-[0.9vw] text-[var(--text-primary)] font-bold truncate leading-snug">{currentSong.title}</span>
              <span className="block text-[0.75vw] text-[var(--accent-secondary)] truncate">{currentSong.artist}</span>
            </div>
            {/* Visualizer Equalizer Bar mockup */}
            <div className="flex items-end gap-[2px] h-[2vw] px-[0.5vw]">
              <span className="w-1 bg-[var(--accent-primary)] animate-[equalizer_0.7s_infinite_alternate]" style={{ height: '30%' }}></span>
              <span className="w-1 bg-[var(--accent-secondary)] animate-[equalizer_1.2s_infinite_alternate]" style={{ height: '75%' }}></span>
              <span className="w-1 bg-[var(--accent-primary)] animate-[equalizer_0.9s_infinite_alternate]" style={{ height: '45%' }}></span>
              <span className="w-1 bg-[var(--accent-secondary)] animate-[equalizer_1.1s_infinite_alternate]" style={{ height: '90%' }}></span>
            </div>
          </div>
        );
      case 'chat':
        return (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center p-[0.8vw] border-b border-white/5 bg-black/20 text-[0.7vw] font-bold text-[var(--accent-secondary)] font-display tracking-widest">
              <span>LIVE CHAT</span>
              <span className="opacity-75">142 ONLINE</span>
            </div>
            <div className="flex-grow overflow-y-auto p-[1vw] flex flex-col gap-[0.8vw]">
              {simulatedChat.map(msg => (
                <div key={msg.id} className="flex flex-col gap-[2px] items-start animate-[chatFade_0.3s_ease-out]">
                  <div className="flex items-center gap-[4px] text-[0.7vw] font-bold text-[var(--accent-primary)]">
                    {msg.badge && (
                      <span className="px-[4px] py-[1px] bg-gradient-to-r from-pink-500 to-purple-600 rounded text-[0.5vw] text-white font-extrabold uppercase tracking-wider">
                        {msg.badge}
                      </span>
                    )}
                    <span>{msg.user}</span>
                  </div>
                  <div className="text-[0.8vw] bg-black/25 border border-white/5 text-[var(--text-primary)] rounded-[6px] py-[4px] px-[8px] max-w-[90%] leading-relaxed break-words">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'vtuber':
        return (
          <div className="w-full h-full flex flex-col justify-end items-center relative overflow-hidden bg-radial-gradient">
            <div className="absolute w-[60%] h-[60%] rounded-full bg-[var(--accent-primary)]/15 filter blur-[35px] top-[20%] z-0"></div>
            
            {/* Breathing avatar container */}
            <div className="w-[60%] h-[80%] flex flex-col justify-end items-center relative z-10 animate-[floatSlow_5s_ease-in-out_infinite]">
              <div className="w-[5vw] h-[5vw] relative z-20">
                {/* Custom CSS shapes drawing simulated VTuber head */}
                <div className="absolute w-full h-full rounded-full bg-[#ffe0cc] border-2 border-black/20 overflow-hidden flex items-center justify-center">
                  {/* Hair */}
                  <div className="absolute top-0 w-[110%] h-[35%] bg-[var(--accent-primary)] rounded-t-full"></div>
                  {/* Blinking eyes */}
                  <div className="absolute w-[8px] h-[8px] bg-white border border-black rounded-full top-[40%] left-[20%] flex items-center justify-center animate-[blink_4.5s_infinite]">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent-secondary)]"></span>
                  </div>
                  <div className="absolute w-[8px] h-[8px] bg-white border border-black rounded-full top-[40%] right-[20%] flex items-center justify-center animate-[blink_4.5s_infinite]">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent-secondary)]"></span>
                  </div>
                  {/* Smile */}
                  <div className="absolute w-[10px] h-[5px] border-b-2 border-red-700 rounded-b-full top-[65%]"></div>
                </div>
                {/* Animal cute ears */}
                <span className="absolute w-[1.5vw] h-[1.8vw] bg-[var(--accent-primary)] rounded-[100%_100%_0_0] rotate-[-20deg] top-[-10px] left-[-5px] border border-black/10"></span>
                <span className="absolute w-[1.5vw] h-[1.8vw] bg-[var(--accent-primary)] rounded-[100%_100%_0_0] rotate-[20deg] top-[-10px] right-[-5px] border border-black/10"></span>
              </div>
              {/* Body */}
              <div className="w-[6vw] h-[8vw] bg-[var(--panel-border)] border-2 border-black/20 rounded-t-[40px] z-10 mt-[-5px]"></div>
            </div>
            
            <div className="absolute bottom-0 w-full bg-black/45 border-t border-white/5 py-1 text-center text-[0.65vw] font-bold text-[var(--text-primary)] font-display z-20">
              {streamerName}
            </div>
          </div>
        );
      case 'game':
        return (
          <div className="w-full h-full relative overflow-hidden bg-[#0d0f15]">
            <div className="absolute top-4 right-4 bg-black/60 border border-[var(--panel-border)] px-3 py-1 rounded text-[0.7vw] font-bold text-[var(--text-primary)] tracking-wide z-20 font-display">
              🎯 GAME CAPTURE SOURCE
            </div>
            {/* Simulated moving elements of gameplay */}
            <div className="w-full h-full absolute inset-0 opacity-10 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
            <div className="absolute w-8 h-8 rounded-full bg-[var(--accent-primary)] animate-[ping_4s_infinite] top-[30%] left-[20%] opacity-40"></div>
            <div className="absolute w-10 h-10 bg-[var(--accent-secondary)] rotate-45 top-[60%] left-[60%] animate-pulse"></div>
            <div className="absolute bottom-4 left-4 text-[0.7vw] font-semibold text-white/30 tracking-widest uppercase">
              {activeGame}
            </div>
          </div>
        );
      case 'event-list':
        return (
          <div className="flex items-center justify-around h-full px-[2vw] text-[0.75vw]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-primary)] font-bold">LATEST FOLLOW:</span>
              <span className="text-[var(--text-primary)] font-extrabold">{alertHistory.find(h => h.type === 'follow')?.username || 'Yukari_Chan'}</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-secondary)] font-bold">LATEST SUB:</span>
              <span className="text-[var(--text-primary)] font-extrabold">{alertHistory.find(h => h.type === 'subscribe')?.username || 'GamerDave'}</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-primary)] font-bold">LATEST DONO:</span>
              <span className="text-[var(--text-primary)] font-extrabold">
                {alertHistory.find(h => h.type === 'donation')?.username || 'Aria'} 
                {alertHistory.find(h => h.type === 'donation')?.amount ? ` $${alertHistory.find(h => h.type === 'donation')?.amount}` : ' $20.00'}
              </span>
            </div>
          </div>
        );
      case 'sub-goal':
      case 'dono-goal':
      case 'follow-goal':
        const isSubGoal = widget.type === 'sub-goal';
        const isDono = widget.type === 'dono-goal';
        const goalData = isSubGoal ? goals.subscriber : isDono ? goals.donation : goals.follower;
        const current = goalData.current;
        const target = goalData.target;
        const pct = Math.min((current / target) * 100, 100);
        return (
          <div className="flex flex-col justify-center h-full px-[1.2vw] gap-1">
            <div className="flex justify-between text-[0.65vw] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              <span>{widget.label}</span>
              <span className="text-[var(--accent-secondary)] font-display">{isDono ? `$${current}` : current} / {isDono ? `$${target}` : target}</span>
            </div>
            <div className="w-full h-[6px] bg-black/40 rounded-full border border-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-500 shadow-glow" 
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      case 'socials':
        return (
          <div className="flex items-center justify-around h-full text-[0.7vw] font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1"><span className="text-purple-400">Twitch</span> /rave_vtuber</span>
            <span className="flex items-center gap-1"><span className="text-pink-400">Twitter</span> @RaveVT</span>
            <span className="flex items-center gap-1"><span className="text-red-400">YouTube</span> RaveVT</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-[0.75vw] text-white/40">
            {widget.label} Widget Placeholder
          </div>
        );
    }
  };

  const widgets = sceneWidgets[activeScene] || [];

  return (
    <div 
      id="overlay-canvas" 
      className={`theme-${activeTheme} w-full h-full relative overflow-hidden bg-vibeBg select-none`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Background Star Effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
      <div className="bg-grid-overlay" />
      <div className="scanlines absolute inset-0 w-full h-full z-40 pointer-events-none opacity-20" />

      {/* Render active scene widgets */}
      <div className="absolute inset-0 w-full h-full z-10">
        {widgets.filter(w => !w.isHidden).map(widget => {
          return (
            <div
              key={widget.id}
              className="absolute glass-panel border border-[var(--panel-border)] bg-[var(--panel-bg)] rounded-[8px] overflow-hidden shadow-glow"
              style={{
                left: `${widget.x}%`,
                top: `${widget.y}%`,
                width: `${widget.w}%`,
                height: `${widget.h}%`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Corner markers decor */}
              <div className="absolute top-0 left-0 w-[6px] h-[6px] border-t border-l border-[var(--accent-secondary)]"></div>
              <div className="absolute top-0 right-0 w-[6px] h-[6px] border-t border-r border-[var(--accent-secondary)]"></div>
              <div className="absolute bottom-0 left-0 w-[6px] h-[6px] border-b border-l border-[var(--accent-secondary)]"></div>
              <div className="absolute bottom-0 right-0 w-[6px] h-[6px] border-b border-r border-[var(--accent-secondary)]"></div>

              {renderWidgetContent(widget)}
            </div>
          );
        })}
      </div>

      {/* BOTTOM TICKER FOOTER BAR */}
      <div className="absolute bottom-0 left-0 w-full h-[32px] bg-[var(--panel-bg)] border-t border-[var(--panel-border)] flex items-center justify-between z-20 text-[0.7vw] font-medium text-[var(--text-primary)]">
        <div className="px-4 py-1 bg-[var(--accent-primary)] text-white font-display font-extrabold flex items-center gap-1 shadow-glow z-10 uppercase tracking-widest">
          📢 STREAM INFO
        </div>
        <div className="flex-grow overflow-hidden relative h-full flex items-center">
          <div className="absolute animate-[scrollTicker_25s_linear_infinite] whitespace-nowrap px-4 font-semibold">
            ✨ Welcome to VibeOverlay Studio! ✨ Follow us on socials and join our Discord community! ✨ Hydration Check: goal at {goals.water.current}/{goals.water.target} cups! ✨ Enjoy the gameplay and chat session!
          </div>
        </div>
        <div className="px-4 border-l border-[var(--panel-border)] bg-black/40 h-full flex items-center font-display font-bold text-[var(--accent-secondary)]">
          {streamerName}
        </div>
      </div>

      {/* ALERT POPUP OVERLAY */}
      {activeAlert && (
        <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-50 animate-[alertPop_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] pointer-events-none w-[380px]">
          <div className="bg-[var(--panel-bg)] border-2 border-[var(--accent-primary)] rounded-[12px] p-4 shadow-cyber flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
            {/* Particle sparkles decor */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent pointer-events-none"></div>
            
            <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-[1.2rem] shadow-glow flex-shrink-0">
              <span className="font-bold">✨</span>
            </div>
            <div className="flex-grow">
              <span className="block text-[0.65rem] font-bold text-[var(--accent-primary)] tracking-widest font-display">
                NEW {activeAlert.type.toUpperCase()}!
              </span>
              <span className="block text-[1.2rem] font-black text-[var(--text-primary)] leading-tight">
                {activeAlert.username}
              </span>
              {activeAlert.message && (
                <span className="block text-[0.7rem] text-[var(--text-secondary)] italic leading-tight mt-1">
                  "{activeAlert.message}"
                </span>
              )}
              {activeAlert.amount && (
                <span className="inline-block mt-1 bg-[var(--accent-secondary)]/15 border border-[var(--accent-secondary)]/30 rounded px-2 py-0.5 text-[0.75rem] font-extrabold text-[var(--accent-secondary)]">
                  {activeAlert.amount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
