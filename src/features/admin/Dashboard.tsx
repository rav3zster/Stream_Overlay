import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverlayStore, type SceneType, type ThemeType } from '../../store/overlayStore';
import { OBSOverlay } from '../overlay/OBSOverlay';
import { SceneEditor } from '../editor/SceneEditor';
import { LayerPanel } from './LayerPanel';
import { WidgetInspector } from './WidgetInspector';
import {
  Tv, Sparkles, Award, Calendar, ShoppingBag, Settings, Link2,
  Volume2, ShieldAlert, Users, Globe, Send, Copy, ExternalLink,
  ChevronRight, Radio, Play, Plus, Trash, Pause, RotateCcw,
  Clock, Eye, EyeOff, Youtube, MessageSquare, Timer
} from 'lucide-react';

// ── Twitch icon as inline SVG (not in lucide) ──────────────────────────────
const TwitchIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
);

const THEMES: Array<{ key: ThemeType; label: string; bg: string }> = [
  { key: 'cyber-synth', label: 'Cyber Synth', bg: 'linear-gradient(135deg, #FF4DFF, #5CFFE2)' },
  { key: 'galaxy-violet', label: 'Galaxy Violet', bg: 'linear-gradient(135deg, #A855F7, #FF4DFF)' },
  { key: 'anime-bedroom', label: 'Anime Bedroom', bg: 'linear-gradient(135deg, #FBCFE8, #C084FC)' },
  { key: 'lo-fi-cafe', label: 'Lo-fi Cafe', bg: 'linear-gradient(135deg, #d1c4e9, #ffb74d)' },
  { key: 'sakura-night', label: 'Sakura Night', bg: 'linear-gradient(135deg, #FF80BF, #FBCFE8)' },
  { key: 'neon-tokyo', label: 'Neon Tokyo', bg: 'linear-gradient(135deg, #FF0055, #00FFCC)' },
  { key: 'dark-amethyst', label: 'Dark Amethyst', bg: 'linear-gradient(135deg, #8b5cf6, #c084fc)' },
  { key: 'cosmic-nebula', label: 'Cosmic Nebula', bg: 'linear-gradient(135deg, #6366F1, #38BDF8)' },
  { key: 'vaporwave', label: 'Vaporwave', bg: 'linear-gradient(135deg, #00F5FF, #FF77FF)' },
  { key: 'minimal-purple', label: 'Minimal Purple', bg: 'linear-gradient(135deg, #C084FC, #94a3b8)' },
];

const MARKETPLACE_THEMES = [
  { id: 'mt-1', name: 'Solaris Horizon', author: 'KiraDesigns', category: 'Warm', previewColor: '#f97316', rating: 4.8, installs: 1240, isInstalled: false },
  { id: 'mt-2', name: 'Arctic Eclipse', author: 'NekoStudios', category: 'Cool', previewColor: '#38bdf8', rating: 4.6, installs: 980, isInstalled: false },
  { id: 'mt-3', name: 'Void Walker', author: 'Yukari_Art', category: 'Dark', previewColor: '#6366f1', rating: 4.9, installs: 2100, isInstalled: true },
  { id: 'mt-4', name: 'Retro Wave', author: 'PixelDreams', category: 'Retro', previewColor: '#ec4899', rating: 4.7, installs: 1560, isInstalled: false },
];

interface DashboardProps {
  activeTabInitial?: 'scenes' | 'widgets' | 'alerts' | 'goals' | 'scheduler' | 'marketplace' | 'integrations' | 'settings';
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTabInitial = 'scenes' }) => {
  const navigate = useNavigate();
  const {
    currentScene, theme: activeTheme, viewerCount, settings,
    timer, aiMessages, alertHistory, schedule,
    chatMessages, showChat, showAvatar, showTicker,
    subGoal, donationGoal, followerGoal,
    selectedWidgetId,
    setScene, setTheme, addTime, pauseTimer, resumeTimer, resetTimer,
    setShowChat, setShowAvatar, setShowTicker,
    triggerAlert, executeAICommand, updateGoal,
    addScheduleEvent, removeScheduleEvent, updateSettings,
    addChatMessage,
  } = useOverlayStore();

  const [rightPanelTab, setRightPanelTab] = useState<'inspector' | 'controls'>('controls');

  // Auto-switch to inspector when a widget is selected
  useEffect(() => {
    if (selectedWidgetId) {
      setRightPanelTab('inspector');
    }
  }, [selectedWidgetId]);

  type TabType = 'scenes' | 'widgets' | 'alerts' | 'goals' | 'scheduler' | 'marketplace' | 'integrations' | 'settings';
  const [activeTab, setActiveTab] = useState<TabType>(activeTabInitial);

  useEffect(() => {
    setActiveTab(activeTabInitial);
  }, [activeTabInitial]);

  // Scheduler form state
  const [schTime, setSchTime] = useState('20:00');
  const [schScene, setSchScene] = useState<SceneType>('main-stream');
  const [schLabel, setSchLabel] = useState('Gameplay Session');

  // AI prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const aiScrollRef = useRef<HTMLDivElement>(null);

  // Settings edits
  const [editTitle, setEditTitle] = useState(settings.streamTitle);
  const [editGame, setEditGame] = useState(settings.activeGame);
  const [editName, setEditName] = useState(settings.streamerName);
  const [editTicker, setEditTicker] = useState(settings.tickerText);
  const [editTwitch, setEditTwitch] = useState(settings.socials.twitch);
  const [editTwitter, setEditTwitter] = useState(settings.socials.twitter);
  const [editYoutube, setEditYoutube] = useState(settings.socials.youtube);
  const [editDiscord, setEditDiscord] = useState(settings.socials.discord);

  // Chat sim
  const [chatInput, setChatInput] = useState('');
  const [chatName, setChatName] = useState('StreamerAdmin');

  // Goal edits
  const [editSubCur, setEditSubCur] = useState(subGoal.current.toString());
  const [editSubTarget, setEditSubTarget] = useState(subGoal.target.toString());
  const [editDonoCur, setEditDonoCur] = useState(donationGoal.current.toString());
  const [editDonoTarget, setEditDonoTarget] = useState(donationGoal.target.toString());
  const [editFollCur, setEditFollCur] = useState(followerGoal.current.toString());
  const [editFollTarget, setEditFollTarget] = useState(followerGoal.target.toString());

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // Scroll AI messages to bottom
  useEffect(() => {
    if (aiScrollRef.current) aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
  }, [aiMessages]);

  // Timer display
  const timerMins = Math.floor(timer.seconds / 60).toString().padStart(2, '0');
  const timerSecs = (timer.seconds % 60).toString().padStart(2, '0');

  const handleAISend = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) { executeAICommand(aiPrompt); setAiPrompt(''); }
  };

  const handleAlertTest = (type: 'follow' | 'subscribe' | 'donation' | 'raid') => {
    const names = ['KiraVT', 'VibeSeeker', 'NekoGamer', 'Yukari_Chan', 'DaveRetro'];
    const name = names[Math.floor(Math.random() * names.length)];
    let msg = '', amt = '';
    if (type === 'donation') { msg = 'Support the stream!'; amt = `$${(Math.random() * 90 + 10).toFixed(2)}`; }
    else if (type === 'subscribe') msg = 'Tier 1 sub hype!';
    triggerAlert(type, name, msg, amt);
  };

  const handleScheduleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (schTime && schLabel) { addScheduleEvent(schTime, schScene, schLabel); setSchLabel(''); }
  };

  const handleSettingsSave = () => {
    updateSettings({
      streamTitle: editTitle, activeGame: editGame, streamerName: editName, tickerText: editTicker,
      socials: { twitch: editTwitch, twitter: editTwitter, youtube: editYoutube, discord: editDiscord },
    });
  };

  const handleGoalsSave = () => {
    updateGoal('sub', 'current', parseInt(editSubCur) || 0);
    updateGoal('sub', 'target', parseInt(editSubTarget) || 200);
    updateGoal('donation', 'current', parseInt(editDonoCur) || 0);
    updateGoal('donation', 'target', parseInt(editDonoTarget) || 500);
    updateGoal('follower', 'current', parseInt(editFollCur) || 0);
    updateGoal('follower', 'target', parseInt(editFollTarget) || 2000);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) { addChatMessage(chatName, chatInput); setChatInput(''); }
  };

  const obsUrl = `${window.location.origin}/obs`;

  const TAB_BTNS: Array<{ tab: TabType; icon: React.ReactNode; label: string }> = [
    { tab: 'scenes', icon: <Tv size={18} />, label: 'Scenes' },
    { tab: 'widgets', icon: <Sparkles size={18} />, label: 'Theme' },
    { tab: 'goals', icon: <Award size={18} />, label: 'Goals' },
    { tab: 'scheduler', icon: <Calendar size={18} />, label: 'Timing' },
    { tab: 'marketplace', icon: <ShoppingBag size={18} />, label: 'Shop' },
    { tab: 'integrations', icon: <Link2 size={18} />, label: 'Links' },
    { tab: 'settings', icon: <Settings size={18} />, label: 'Config' },
  ];

  return (
    <div className="h-screen w-screen bg-[#07050f] text-[#f8f5ff] flex flex-col font-sans overflow-hidden select-none">

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="h-[60px] bg-[#0c0a1a]/85 border-b border-purple-900/30 px-6 flex justify-between items-center z-40 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="text-vibeAccent animate-pulse" size={20} />
            <span className="font-display font-black text-lg tracking-widest bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              VIBEOVERLAY<span className="text-vibeAccent font-extrabold text-xs tracking-wider bg-vibeAccent/15 px-2 py-0.5 rounded ml-1 border border-vibeAccent/30">STUDIO</span>
            </span>
          </div>
          <div className="w-[1px] h-5 bg-white/10" />
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-400">Title:</span>
            <span className="font-bold max-w-[200px] truncate">{settings.streamTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Viewer count & timer */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-[#14102c] border border-purple-900/30 px-3 py-1 rounded-full text-white/80">
              <span className="font-semibold text-vibeAccent">{viewerCount}</span> viewers
            </div>
            <div className="flex items-center gap-1 bg-[#14102c] border border-purple-900/30 px-3 py-1 rounded-full">
              <Timer size={11} className="text-vibeCyan" />
              <span className="font-display font-black text-vibeCyan tabular-nums">
                {timerMins}:{timerSecs}
              </span>
              {timer.isPaused && <span className="ml-1 text-amber-400 text-[9px] font-bold animate-pulse">PAUSED</span>}
            </div>
            <div className="flex gap-2">
              <span className="p-1 bg-[#1a123a] border border-purple-500/20 text-indigo-400 rounded-md" title="Twitch"><TwitchIcon /></span>
              <span className="p-1 bg-[#1a123a] border border-purple-500/20 text-red-400 rounded-md" title="YouTube"><Youtube size={14} /></span>
              <span className="p-1 bg-[#1a123a] border border-purple-500/20 text-emerald-400 rounded-md" title="Ko-fi"><Globe size={14} /></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(obsUrl); }}
              className="px-3.5 py-1.5 text-xs font-bold border border-purple-900/50 bg-[#16122d] hover:bg-[#201a42] rounded-lg transition-all flex items-center gap-1.5"
            >
              <Copy size={13} /> Copy OBS URL
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition flex items-center gap-1.5 ${showPreview ? 'border-vibeAccent bg-vibeAccent/10 text-vibeAccent' : 'border-purple-900/50 bg-[#16122d] text-slate-300 hover:bg-[#201a42]'}`}
            >
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />} Preview
            </button>
            <a
              href={obsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 text-xs font-bold bg-gradient-to-tr from-vibePrimary to-vibeSecondary rounded-lg shadow-glow hover:brightness-110 flex items-center gap-1.5 text-white no-underline"
            >
              <ExternalLink size={13} /> Open OBS Mode
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-grow flex overflow-hidden">

        {/* LEFT ICON SIDEBAR */}
        <aside className="w-[80px] bg-[#0c0a1a]/85 border-r border-purple-900/30 flex flex-col items-center py-6 gap-6 z-30 flex-shrink-0">
          {TAB_BTNS.map(({ tab, icon, label }) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'scenes') navigate('/');
                else navigate(`/${tab}`);
              }}
              className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </aside>

        {/* LEFT CONTENT PANEL */}
        <aside className="w-[300px] bg-[#0c0a1a]/50 border-r border-purple-900/30 p-5 overflow-y-auto flex flex-col gap-5 z-20 flex-shrink-0">

          {/* SCENES TAB */}
          {activeTab === 'scenes' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">SCENE CONTROLLER</h2>
                <p className="text-[11px] text-slate-400">Switch live layout frames inside OBS Browser Sources.</p>
              </div>

              {/* Scene buttons */}
              <div className="flex flex-col gap-2">
                {([
                  { scene: 'starting-soon' as SceneType, label: '⌛ Starting Soon' },
                  { scene: 'chat-session' as SceneType, label: '💬 Just Chatting' },
                  { scene: 'main-stream' as SceneType, label: '🎮 Gameplay' },
                  { scene: 'brb' as SceneType, label: '☕ BRB Break' },
                  { scene: 'ending-stream' as SceneType, label: '👋 Ending Stream' },
                ]).map(({ scene, label }) => (
                  <button
                    key={scene}
                    id={`scene-${scene}`}
                    onClick={() => setScene(scene)}
                    className={`w-full py-3.5 px-4 rounded-xl border text-left font-bold text-xs uppercase tracking-widest font-display transition-all duration-200 flex items-center justify-between ${
                      currentScene === scene
                        ? 'bg-gradient-to-r from-vibePrimary to-vibeSecondary border-vibeAccent text-white shadow-cyber'
                        : 'bg-[#15112e] border-purple-900/30 text-slate-300 hover:border-purple-800'
                    }`}
                  >
                    <span>{label}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>

              {/* Timer controls */}
              <div className="border-t border-purple-900/30 pt-4">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                  <Clock size={11} /> Timer Controls
                </h3>
                <div className="text-center font-display font-black text-3xl text-vibeCyan mb-3 tabular-nums" style={{ textShadow: '0 0 15px #5cffe280' }}>
                  {timerMins}:{timerSecs}
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  <button
                    id="timer-add-1m"
                    onClick={() => addTime(60)}
                    className="py-1.5 bg-[#15112e] border border-purple-900/30 hover:border-purple-700 text-xs font-bold rounded-lg text-slate-200 transition"
                  >
                    +1 Min
                  </button>
                  <button
                    id="timer-add-5m"
                    onClick={() => addTime(300)}
                    className="py-1.5 bg-[#15112e] border border-purple-900/30 hover:border-purple-700 text-xs font-bold rounded-lg text-slate-200 transition"
                  >
                    +5 Min
                  </button>
                  <button
                    id="timer-add-10m"
                    onClick={() => addTime(600)}
                    className="py-1.5 bg-[#15112e] border border-purple-900/30 hover:border-purple-700 text-xs font-bold rounded-lg text-slate-200 transition"
                  >
                    +10 Min
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    id="timer-pause"
                    onClick={timer.isPaused ? resumeTimer : pauseTimer}
                    className={`py-1.5 border text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition ${
                      timer.isPaused
                        ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                        : 'bg-[#15112e] border-purple-900/30 hover:border-purple-700 text-slate-200'
                    }`}
                  >
                    {timer.isPaused ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
                  </button>
                  <button
                    id="timer-reset-10"
                    onClick={() => resetTimer(600)}
                    className="py-1.5 bg-[#15112e] border border-purple-900/30 hover:border-red-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1 text-slate-200 transition"
                  >
                    <RotateCcw size={11} /> 10min
                  </button>
                  <button
                    id="timer-reset-5"
                    onClick={() => resetTimer(300)}
                    className="py-1.5 bg-[#15112e] border border-purple-900/30 hover:border-red-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1 text-slate-200 transition"
                  >
                    <RotateCcw size={11} /> 5min
                  </button>
                </div>
              </div>

              {/* Dynamic Layer Panel */}
              <div className="border-t border-purple-900/30 pt-4">
                <LayerPanel />
              </div>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === 'widgets' && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">VISUAL STYLE THEMES</h2>
                <p className="text-[11px] text-slate-400">Switch design variables, fonts, borders, and animations.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.key}
                    id={`theme-${t.key}`}
                    onClick={() => setTheme(t.key)}
                    className={`p-2 border rounded-lg text-left transition flex flex-col gap-2 ${
                      activeTheme === t.key
                        ? 'bg-purple-950/20 border-vibeAccent shadow-glow'
                        : 'bg-[#15112e] border-purple-900/30 hover:border-purple-800'
                    }`}
                  >
                    <span className="w-full h-8 rounded block" style={{ background: t.bg }} />
                    <span className="text-[10px] font-bold text-slate-200 truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">STREAM GOALS</h2>
                <p className="text-[11px] text-slate-400">Edit current progress and targets for overlay bars.</p>
              </div>

              {/* Sub goal */}
              <div className="bg-[#120f28] border border-purple-900/30 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-vibeSecondary">⭐ Subscriber Goal</span>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min((subGoal.current / subGoal.target) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col flex-1 gap-0.5">
                    <label className="text-[9px] text-slate-400">Current</label>
                    <input type="number" value={editSubCur} onChange={e => setEditSubCur(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white w-full" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <label className="text-[9px] text-slate-400">Target</label>
                    <input type="number" value={editSubTarget} onChange={e => setEditSubTarget(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white w-full" />
                  </div>
                </div>
              </div>

              {/* Donation goal */}
              <div className="bg-[#120f28] border border-purple-900/30 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-vibeSecondary">💰 Donation Goal</span>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full" style={{ width: `${Math.min((donationGoal.current / donationGoal.target) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col flex-1 gap-0.5">
                    <label className="text-[9px] text-slate-400">Current ($)</label>
                    <input type="number" value={editDonoCur} onChange={e => setEditDonoCur(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white w-full" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <label className="text-[9px] text-slate-400">Target ($)</label>
                    <input type="number" value={editDonoTarget} onChange={e => setEditDonoTarget(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white w-full" />
                  </div>
                </div>
              </div>

              {/* Follower goal */}
              <div className="bg-[#120f28] border border-purple-900/30 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-vibeSecondary">💜 Follower Goal</span>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full" style={{ width: `${Math.min((followerGoal.current / followerGoal.target) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col flex-1 gap-0.5">
                    <label className="text-[9px] text-slate-400">Current</label>
                    <input type="number" value={editFollCur} onChange={e => setEditFollCur(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white w-full" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <label className="text-[9px] text-slate-400">Target</label>
                    <input type="number" value={editFollTarget} onChange={e => setEditFollTarget(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white w-full" />
                  </div>
                </div>
              </div>

              <button onClick={handleGoalsSave} className="py-1.5 bg-gradient-to-r from-vibePrimary to-vibeSecondary text-white text-xs font-bold rounded-lg shadow-glow hover:brightness-110">
                Save Goals
              </button>
            </div>
          )}

          {/* SCHEDULER TAB */}
          {activeTab === 'scheduler' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">AUTO TRANSITIONS</h2>
                <p className="text-[11px] text-slate-400">Set clock intervals to automatically switch scenes.</p>
              </div>
              <form onSubmit={handleScheduleAdd} className="bg-[#14102f] border border-purple-900/20 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-vibeAccent">Schedule new transition</span>
                <div className="flex gap-2">
                  <input type="time" value={schTime} onChange={e => setSchTime(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white" />
                  <select value={schScene} onChange={e => setSchScene(e.target.value as SceneType)} className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white flex-grow">
                    <option value="starting-soon">Starting Soon</option>
                    <option value="chat-session">Just Chatting</option>
                    <option value="main-stream">Gameplay</option>
                    <option value="brb">BRB Break</option>
                    <option value="ending-stream">Ending Stream</option>
                  </select>
                </div>
                <input type="text" placeholder="Task Description" value={schLabel} onChange={e => setSchLabel(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white" />
                <button type="submit" className="py-1 bg-vibePrimary hover:bg-vibePrimary/80 text-white rounded text-xs font-bold flex justify-center items-center gap-1 shadow-glow">
                  <Plus size={13} /> Add Event
                </button>
              </form>
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Timeline</span>
                {schedule.map(item => (
                  <div key={item.id} className={`p-2 border rounded-lg flex items-center justify-between text-xs transition ${item.isActive ? 'bg-[#15112e] border-purple-900/30' : 'opacity-40 bg-black/20 border-transparent'}`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-display text-vibeCyan">{item.time}</span>
                        <span className="font-semibold text-slate-200">{item.label}</span>
                      </div>
                      <span className="text-[9px] text-purple-400 uppercase tracking-widest">{item.scene.replace('-', ' ')}</span>
                    </div>
                    <button onClick={() => removeScheduleEvent(item.id)} className="p-1 hover:bg-white/10 text-red-500 rounded">
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MARKETPLACE TAB */}
          {activeTab === 'marketplace' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">THEME MARKETPLACE</h2>
                <p className="text-[11px] text-slate-400">Premium community visual overlay configurations.</p>
              </div>
              <div className="flex flex-col gap-3">
                {MARKETPLACE_THEMES.map(t => (
                  <div key={t.id} className="p-3 bg-[#130f2c] border border-purple-950 rounded-xl flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.previewColor }} />
                        <span className="font-bold text-xs text-white">{t.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">by {t.author} · {t.category}</span>
                      <div className="text-[9px] text-amber-400 font-extrabold mt-1">★ {t.rating} ({t.installs} downloads)</div>
                    </div>
                    <button
                      disabled={t.isInstalled}
                      className={`px-3 py-1 rounded font-bold text-[10px] transition flex-shrink-0 ${
                        t.isInstalled
                          ? 'bg-purple-950/30 border border-purple-800 text-purple-400'
                          : 'bg-vibePrimary hover:bg-vibePrimary/80 text-white shadow-glow'
                      }`}
                    >
                      {t.isInstalled ? 'Active' : 'Get'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">PLATFORMS INTEGRATIONS</h2>
                <p className="text-[11px] text-slate-400">Connection status for broadcasting tools.</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Twitch SDK', status: 'Connected', color: 'text-purple-400 bg-purple-950/20' },
                  { name: 'YouTube Live APIs', status: 'Connected', color: 'text-red-400 bg-red-950/20' },
                  { name: 'Spotify Music', status: 'Authorized', color: 'text-emerald-400 bg-emerald-950/20' },
                  { name: 'Discord Webhook', status: 'Unconfigured', color: 'text-slate-400 bg-slate-900/40' },
                  { name: 'OBS WebSocket (4455)', status: 'Ready', color: 'text-cyan-400 bg-cyan-950/20' },
                  { name: 'Streamlabs SDK', status: 'Connected', color: 'text-teal-400 bg-teal-950/20' },
                ].map(item => (
                  <div key={item.name} className="p-3 bg-[#110d24] border border-purple-950 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[9px] text-slate-400">WebSocket connection status</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${item.color} border border-white/5`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">STREAM SETTINGS</h2>
                <p className="text-[11px] text-slate-400">Configure stream metadata, socials, and ticker text.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Streamer Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Stream Title</label>
                  <textarea value={editTitle} onChange={e => setEditTitle(e.target.value)} rows={2} className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Current Game</label>
                  <input value={editGame} onChange={e => setEditGame(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Ticker Text</label>
                  <textarea value={editTicker} onChange={e => setEditTicker(e.target.value)} rows={2} className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary" />
                </div>
                <div className="border-t border-purple-900/20 pt-2">
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Social Handles</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: 'Twitch', val: editTwitch, set: setEditTwitch },
                      { label: 'Twitter', val: editTwitter, set: setEditTwitter },
                      { label: 'YouTube', val: editYoutube, set: setEditYoutube },
                      { label: 'Discord', val: editDiscord, set: setEditDiscord },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 w-14">{label}</span>
                        <input value={val} onChange={e => set(e.target.value)} className="flex-grow bg-black/30 border border-purple-950 rounded p-1 text-xs text-white focus:outline-none focus:border-vibePrimary" />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleSettingsSave} className="py-1.5 bg-gradient-to-r from-vibePrimary to-vibeSecondary text-white text-xs font-bold rounded-lg shadow-glow hover:brightness-110">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER: preview or SceneEditor */}
        <main className="flex-grow p-6 flex items-center justify-center bg-black/25 relative overflow-hidden">
          {showPreview ? (
            <div className="w-full max-w-[900px] relative border border-purple-900/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <OBSOverlay />
            </div>
          ) : (
            <div className="w-full max-w-[900px] h-full flex flex-col justify-center">
              <SceneEditor />
            </div>
          )}
        </main>

        {/* RIGHT PANEL: Simulators + Chat + AI + Events OR Widget Inspector */}
        <aside className="w-[300px] bg-[#0c0a1a]/85 border-l border-purple-900/30 p-5 flex flex-col gap-4 z-20 overflow-y-auto flex-shrink-0">
          
          {/* Tab selector */}
          <div className="flex bg-[#100c22] border border-purple-950 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setRightPanelTab('controls')}
              className={`flex-grow py-1 rounded text-[10px] font-bold uppercase transition ${rightPanelTab === 'controls' ? 'bg-vibePrimary text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
            >
              Control Panel
            </button>
            <button
              onClick={() => setRightPanelTab('inspector')}
              className={`flex-grow py-1 rounded text-[10px] font-bold uppercase transition ${rightPanelTab === 'inspector' ? 'bg-vibePrimary text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
            >
              Inspector {selectedWidgetId && '●'}
            </button>
          </div>

          {rightPanelTab === 'inspector' ? (
            <WidgetInspector />
          ) : (
            <>
              {/* Event Simulators */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Quick Event Simulators</h2>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { type: 'follow' as const, icon: '💖', label: 'Follower' },
                    { type: 'subscribe' as const, icon: '⭐', label: 'Subscriber' },
                    { type: 'donation' as const, icon: '💵', label: 'Donation' },
                    { type: 'raid' as const, icon: '🔥', label: 'Raid' },
                  ]).map(({ type, icon, label }) => (
                    <button
                      key={type}
                      id={`sim-${type}`}
                      onClick={() => handleAlertTest(type)}
                      className="py-2 bg-[#171331] border border-purple-900/40 hover:border-purple-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition"
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Simulator */}
              <div className="flex flex-col gap-2 border-t border-purple-900/30 pt-3">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={11} /> Send Chat Message
                </h2>
                <div className="bg-[#100c22] border border-purple-950 rounded-xl overflow-hidden max-h-[120px]">
                  <div className="overflow-y-auto p-2 max-h-[80px]" style={{ scrollbarWidth: 'none' }}>
                    {chatMessages.slice(-5).map(m => (
                      <div key={m.id} className="text-[10px] text-slate-300 mb-1">
                        <span className="font-bold" style={{ color: m.color }}>{m.username}: </span>
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleChatSend} className="flex flex-col gap-1.5">
                  <input value={chatName} onChange={e => setChatName(e.target.value)} className="bg-black/30 border border-purple-950 rounded p-1 text-[10px] text-slate-300 w-full focus:outline-none" placeholder="Username" />
                  <div className="flex gap-1.5">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-grow bg-black/35 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary" placeholder="Type message..." />
                    <button type="submit" className="p-1.5 bg-vibePrimary text-white rounded flex items-center justify-center">
                      <Send size={13} />
                    </button>
                  </div>
                </form>
              </div>

              {/* AI Companion */}
              <div className="flex-grow flex flex-col bg-[#100c22] border border-purple-950 rounded-xl overflow-hidden min-h-[180px]">
                <div className="px-3 py-2 bg-black/40 border-b border-purple-950 flex items-center gap-2 text-xs font-extrabold text-vibeSecondary font-display tracking-widest flex-shrink-0">
                  <Sparkles size={14} className="text-vibeAccent" /> VIBE_AI COMPANION
                </div>
                <div ref={aiScrollRef} className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 max-h-[200px]" style={{ scrollbarWidth: 'thin' }}>
                  {aiMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-vibePrimary/20 border border-vibePrimary/30 text-white self-end'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 self-start'
                      }`}
                    >
                      <span className="block text-[8px] font-black opacity-50 mb-0.5 tracking-wider uppercase font-display">
                        {msg.sender === 'user' ? 'YOU' : 'AI ASSISTANT'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAISend} className="p-2 border-t border-purple-950 flex gap-1.5 bg-black/20 flex-shrink-0">
                  <input
                    id="ai-prompt-input"
                    type="text"
                    placeholder="Ask me: 'Switch to BRB'..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="flex-grow bg-black/35 border border-purple-950 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary"
                  />
                  <button type="submit" className="p-1.5 bg-vibePrimary hover:bg-vibePrimary/80 text-white rounded-lg flex items-center justify-center transition">
                    <Send size={13} />
                  </button>
                </form>
              </div>

              {/* Events History */}
              <div className="flex flex-col gap-2 max-h-[140px] flex-shrink-0">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Events Stream</h2>
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[110px] pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {alertHistory.length === 0 && (
                    <span className="text-[10px] text-white/30 italic">No events yet. Use simulators above!</span>
                  )}
                  {alertHistory.map(evt => (
                    <div key={evt.id} className="p-1.5 bg-[#120f28] border border-purple-950 rounded-md text-[10px] flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white mr-1">{evt.username}</span>
                        <span className="text-slate-400 lowercase">{evt.type}d</span>
                      </div>
                      <span className="text-purple-400 font-semibold">{evt.amount || 'New'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};
