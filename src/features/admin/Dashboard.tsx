import React, { useState, useEffect } from 'react';
import { useStreamStore, type SceneType, type ThemeType } from '../../store/useStreamStore';
import { SceneEditor } from '../editor/SceneEditor';
import { 
  Tv, Sparkles, Award, Calendar, ShoppingBag, Settings, Link2, 
  Volume2, ShieldAlert, Users, Compass, Send, Check, Copy, ExternalLink,
  ChevronRight, RefreshCw, Radio, Play, Plus, Trash, Globe, Twitch, Youtube
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    activeScene,
    activeTheme,
    streamerName,
    streamTitle,
    activeGame,
    viewerCount,
    goals,
    schedule,
    marketplaceThemes,
    aiMessages,
    alertHistory,
    sceneWidgets,
    setScene,
    setTheme,
    updateMetadata,
    updateGoalValue,
    updateWidget,
    addSchedule,
    removeSchedule,
    toggleSchedule,
    installMarketplaceTheme,
    executeAICommand,
    triggerAlert
  } = useStreamStore();

  // Sidebar Tab navigation
  const [activeTab, setActiveTab] = useState<'scenes' | 'widgets' | 'alerts' | 'goals' | 'scheduler' | 'marketplace' | 'integrations' | 'settings'>('scenes');
  
  // Custom inputs for scheduler
  const [schTime, setSchTime] = useState('20:00');
  const [schScene, setSchScene] = useState<SceneType>('main-stream');
  const [schLabel, setSchLabel] = useState('Gameplay Session');

  // Custom AI prompt input
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Custom quick edit fields for metadata
  const [editTitle, setEditTitle] = useState(streamTitle);
  const [editGame, setEditGame] = useState(activeGame);

  // Sync edit titles on store updates
  useEffect(() => {
    setEditTitle(streamTitle);
    setEditGame(activeGame);
  }, [streamTitle, activeGame]);

  // Sync scheduler timer ticks
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      useStreamStore.getState().checkSchedulerTime(timeStr);
    }, 15000); // Check every 15 seconds
    return () => clearInterval(t);
  }, []);

  const handleMetadataSave = () => {
    updateMetadata({ streamTitle: editTitle, activeGame: editGame });
  };

  const handleAddScheduleEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (schTime && schLabel) {
      addSchedule(schTime, schScene, schLabel);
      setSchLabel('');
    }
  };

  const handleAISend = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      executeAICommand(aiPrompt);
      setAiPrompt('');
    }
  };

  // Alert simulation helper
  const handleAlertTest = (type: 'follow' | 'subscribe' | 'donation' | 'raid') => {
    const names = ['KiraVT', 'VibeSeeker', 'NekoGamer', 'Yukari_Chan', 'DaveRetro'];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    
    let message = '';
    let amount = '';
    if (type === 'donation') {
      message = 'Support the stream! Keep it cozy!';
      amount = `$${(Math.random() * 90 + 10).toFixed(2)}`;
    } else if (type === 'subscribe') {
      message = 'Tier 1 sub hype!';
    }
    
    triggerAlert(type, selectedName, message, amount);

    // Broadcast trigger
    localStorage.setItem('vibe_overlay_broadcast_alert', JSON.stringify({
      type,
      user: selectedName,
      message,
      amount,
      timestamp: Date.now()
    }));
  };

  const themesList: Array<{ key: ThemeType; label: string; bg: string }> = [
    { key: 'cyber-synth', label: 'Cyber Synth', bg: 'linear-gradient(135deg, #FF4DFF, #5CFFE2)' },
    { key: 'galaxy-violet', label: 'Galaxy Violet', bg: 'linear-gradient(135deg, #A855F7, #FF4DFF)' },
    { key: 'anime-bedroom', label: 'Anime Bedroom', bg: 'linear-gradient(135deg, #FBCFE8, #C084FC)' },
    { key: 'lo-fi-cafe', label: 'Lo-fi Cafe', bg: 'linear-gradient(135deg, #d1c4e9, #ffb74d)' },
    { key: 'sakura-night', label: 'Sakura Night', bg: 'linear-gradient(135deg, #FF80BF, #FBCFE8)' },
    { key: 'neon-tokyo', label: 'Neon Tokyo', bg: 'linear-gradient(135deg, #FF0055, #00FFCC)' },
    { key: 'dark-amethyst', label: 'Dark Amethyst', bg: 'linear-gradient(135deg, #8b5cf6, #c084fc)' },
    { key: 'cosmic-nebula', label: 'Cosmic Nebula', bg: 'linear-gradient(135deg, #6366F1, #38BDF8)' },
    { key: 'vaporwave', label: 'Vaporwave', bg: 'linear-gradient(135deg, #00F5FF, #FF77FF)' },
    { key: 'minimal-purple', label: 'Minimal Purple', bg: 'linear-gradient(135deg, #C084FC, #94a3b8)' }
  ];

  return (
    <div className="h-screen w-screen bg-[#07050f] text-[#f8f5ff] flex flex-col font-sans overflow-hidden select-none">
      
      {/* ==================== TOP NAVIGATION BAR ==================== */}
      <header className="h-[60px] bg-[#0c0a1a]/85 border-b border-purple-900/30 px-6 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="text-vibeAccent animate-pulse" size={20} />
            <span className="font-display font-black text-lg tracking-widest bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              VIBEOVERLAY<span className="text-vibeAccent font-extrabold text-xs tracking-wider bg-vibeAccent/15 px-2 py-0.5 rounded ml-1 border border-vibeAccent/30">STUDIO</span>
            </span>
          </div>
          <div className="w-[1px] h-5 bg-white/10"></div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-slate-400">Title:</span>
            <span className="font-bold max-w-[200px] truncate">{streamTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Quick status counters */}
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-[#14102c] border border-purple-900/30 px-3 py-1 rounded-full text-white/80">
              <span className="font-semibold text-vibeAccent">{viewerCount}</span> viewers
            </div>
            <div className="flex gap-2">
              <span className="p-1 bg-[#1a123a] border border-purple-500/20 text-indigo-400 rounded-md" title="Twitch"><Twitch size={14}/></span>
              <span className="p-1 bg-[#1a123a] border border-purple-500/20 text-red-400 rounded-md" title="YouTube"><Youtube size={14}/></span>
              <span className="p-1 bg-[#1a123a] border border-purple-500/20 text-emerald-400 rounded-md" title="Ko-fi"><Globe size={14}/></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}#/overlay`;
                navigator.clipboard.writeText(url);
                alert(`OBS Browser Source URL Copied!\nPaste this inside OBS browser settings: ${url}`);
              }}
              className="px-3.5 py-1.5 text-xs font-bold border border-purple-900/50 bg-[#16122d] hover:bg-[#201a42] rounded-lg transition-all flex items-center gap-1.5"
            >
              <Copy size={13} /> Copy OBS URL
            </button>
            <a 
              href="#/overlay" 
              target="_blank"
              className="px-4 py-1.5 text-xs font-bold bg-gradient-to-tr from-vibePrimary to-vibeSecondary rounded-lg shadow-glow hover:brightness-110 flex items-center gap-1.5 text-white decoration-transparent"
            >
              <ExternalLink size={13} /> Open OBS Mode
            </a>
          </div>
        </div>
      </header>

      {/* ==================== MAIN DASHBOARD WORKSPACE ==================== */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* LEFT CONTROL SIDEBAR TAB NAVIGATION */}
        <aside className="w-[80px] bg-[#0c0a1a]/85 border-r border-purple-900/30 flex flex-col items-center py-6 gap-6 z-30">
          <button 
            onClick={() => setActiveTab('scenes')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'scenes' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Tv size={18} /> Scenes
          </button>
          <button 
            onClick={() => setActiveTab('widgets')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'widgets' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Sparkles size={18} /> Theme
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'goals' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Award size={18} /> Goals
          </button>
          <button 
            onClick={() => setActiveTab('scheduler')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'scheduler' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Calendar size={18} /> Timing
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'marketplace' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <ShoppingBag size={18} /> Shop
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'integrations' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Link2 size={18} /> Links
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-[48px] h-[48px] rounded-xl flex flex-col justify-center items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold transition-all duration-200 ${activeTab === 'settings' ? 'bg-vibePrimary/20 border border-vibePrimary text-white shadow-glow' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={18} /> Config
          </button>
        </aside>

        {/* EXPANDABLE TAB CONTROL SETTINGS CONSOLE */}
        <aside className="w-[300px] bg-[#0c0a1a]/50 border-r border-purple-900/30 p-5 overflow-y-auto flex flex-col gap-5 z-20">
          
          {/* TAB CONTENT: SCENE SWITCHER */}
          {activeTab === 'scenes' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">SCENE CONTROLLER</h2>
                <p className="text-[11px] text-slate-400">Instantly switch live layout frames inside OBS Browser Sources.</p>
              </div>
              <div className="flex flex-col gap-2">
                {(['starting-soon', 'main-stream', 'chat-session', 'brb', 'ending-stream'] as SceneType[]).map(scene => (
                  <button
                    key={scene}
                    onClick={() => setScene(scene)}
                    className={`w-full py-3.5 px-4 rounded-xl border text-left font-bold text-xs uppercase tracking-widest font-display transition-all duration-200 flex items-center justify-between ${
                      activeScene === scene 
                        ? 'bg-gradient-to-r from-vibePrimary to-vibeSecondary border-vibeAccent text-white shadow-cyber' 
                        : 'bg-[#15112e] border-purple-900/30 text-slate-300 hover:border-purple-800'
                    }`}
                  >
                    <span>{scene.replace('-', ' ')}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: THEME SELECTOR & WIDGET TOGGLES */}
          {activeTab === 'widgets' && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">VISUAL STYLE THEMES</h2>
                <p className="text-[11px] text-slate-400">Switch design variables, fonts, borders, and animations.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {themesList.map(theme => (
                  <button
                    key={theme.key}
                    onClick={() => setTheme(theme.key)}
                    className={`p-2 border rounded-lg text-left transition flex flex-col gap-2 ${
                      activeTheme === theme.key
                        ? 'bg-purple-950/20 border-vibeAccent shadow-glow'
                        : 'bg-[#15112e] border-purple-900/30 hover:border-purple-800'
                    }`}
                  >
                    <span 
                      className="w-full h-8 rounded" 
                      style={{ background: theme.bg }}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-200 truncate">{theme.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-purple-900/30 pt-4">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-2">Scene elements visibility</h3>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                  {sceneWidgets[activeScene]?.map(widget => (
                    <div key={widget.id} className="flex justify-between items-center p-2 bg-[#120f26] border border-purple-950 rounded-lg text-xs">
                      <span className="font-semibold text-slate-200 truncate">{widget.label}</span>
                      <button
                        onClick={() => updateWidget(widget.id, { isHidden: !widget.isHidden })}
                        className={`px-2 py-1 rounded text-[9px] font-extrabold tracking-wider uppercase transition ${
                          widget.isHidden 
                            ? 'bg-red-950 border border-red-500/30 text-red-400' 
                            : 'bg-emerald-950 border border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {widget.isHidden ? 'Hidden' : 'Visible'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GOALS CUSTOMIZATION */}
          {activeTab === 'goals' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">STREAM GOALS SETTINGS</h2>
                <p className="text-[11px] text-slate-400">Edit current progress and target goals for overlays.</p>
              </div>

              {Object.keys(goals).map(key => {
                const category = key as keyof typeof goals;
                const data = goals[category];
                return (
                  <div key={category} className="bg-[#120f28] border border-purple-900/30 p-3 rounded-xl flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-vibeSecondary">{category.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col flex-1">
                        <label className="text-[9px] text-slate-400">Current</label>
                        <input 
                          type="number" 
                          value={data.current} 
                          onChange={(e) => updateGoalValue(category, 'set', parseInt(e.target.value) || 0)}
                          className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white" 
                        />
                      </div>
                      <div className="flex flex-col flex-1">
                        <label className="text-[9px] text-slate-400">Target</label>
                        <input 
                          type="number" 
                          value={data.target} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 100;
                            // Update core target
                            useStreamStore.setState(state => ({
                              goals: {
                                ...state.goals,
                                [category]: { ...state.goals[category], target: Math.max(1, val) }
                              }
                            }));
                          }}
                          className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white" 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB CONTENT: TIMELINE SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">AUTO TRANSITIONS</h2>
                <p className="text-[11px] text-slate-400">Set clock intervals to automatically switch stream frames.</p>
              </div>

              <form onSubmit={handleAddScheduleEvent} className="bg-[#14102f] border border-purple-900/20 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-vibeAccent">Schedule new transition</span>
                <div className="flex gap-2">
                  <input 
                    type="time" 
                    value={schTime}
                    onChange={(e) => setSchTime(e.target.value)}
                    className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white" 
                  />
                  <select 
                    value={schScene}
                    onChange={(e) => setSchScene(e.target.value as SceneType)}
                    className="bg-black/30 border border-purple-950 rounded p-1 text-xs text-white flex-grow"
                  >
                    <option value="starting-soon">Starting Soon</option>
                    <option value="chat-session">Just Chatting</option>
                    <option value="main-stream">Gameplay</option>
                    <option value="brb">BRB Break</option>
                    <option value="ending-stream">Ending Stream</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder="Task Description (e.g. Q&A Session)" 
                  value={schLabel}
                  onChange={(e) => setSchLabel(e.target.value)}
                  className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white"
                />
                <button type="submit" className="py-1 bg-vibePrimary hover:bg-vibePrimary/80 text-white rounded text-xs font-bold flex justify-center items-center gap-1 shadow-glow">
                  <Plus size={13} /> Add Event
                </button>
              </form>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
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
                    <button 
                      onClick={() => removeSchedule(item.id)}
                      className="p-1 hover:bg-white/10 text-red-500 rounded"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: THEME MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">THEME MARKETPLACE</h2>
                <p className="text-[11px] text-slate-400">Download premium community visual overlay configurations.</p>
              </div>

              <div className="flex flex-col gap-3">
                {marketplaceThemes.map(theme => (
                  <div key={theme.id} className="p-3 bg-[#130f2c] border border-purple-950 rounded-xl flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.previewColor }}></span>
                        <span className="font-bold text-xs text-white">{theme.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">by {theme.author} • {theme.category}</span>
                      <div className="text-[9px] text-amber-400 font-extrabold mt-1">★ {theme.rating} ({theme.installs} downloads)</div>
                    </div>
                    <button
                      onClick={() => installMarketplaceTheme(theme.id)}
                      disabled={theme.isInstalled}
                      className={`px-3 py-1 rounded font-bold text-[10px] transition flex-shrink-0 ${
                        theme.isInstalled
                          ? 'bg-purple-950/30 border border-purple-800 text-purple-400'
                          : 'bg-vibePrimary hover:bg-vibePrimary/80 text-white shadow-glow'
                      }`}
                    >
                      {theme.isInstalled ? 'Active' : 'Get'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">PLATFORMS INTEGRATIONS</h2>
                <p className="text-[11px] text-slate-400">Setup connection webhooks for third party broadcasting tools.</p>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { name: 'Twitch SDK', status: 'Connected', icon: 'Twitch', color: 'text-purple-400 bg-purple-950/20' },
                  { name: 'YouTube Live APIs', status: 'Connected', icon: 'Youtube', color: 'text-red-400 bg-red-950/20' },
                  { name: 'Spotify Music', status: 'Authorized', icon: 'Volume2', color: 'text-emerald-400 bg-emerald-950/20' },
                  { name: 'Discord Webhook', status: 'Unconfigured', icon: 'Globe', color: 'text-slate-400 bg-slate-900/40' },
                  { name: 'OBS Web-Socket', status: 'Ready (Port 4455)', icon: 'Tv', color: 'text-vibeCyan bg-cyan-950/20' },
                  { name: 'Streamlabs SDK', status: 'Connected', icon: 'Link2', color: 'text-teal-400 bg-teal-950/20' }
                ].map(item => (
                  <div key={item.name} className="p-3 bg-[#110d24] border border-purple-950 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[9px] text-slate-400">WebSocket connection status</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase ${item.color} border border-white/5`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: METADATA SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">STREAM METADATA</h2>
                <p className="text-[11px] text-slate-400">Quick override panel values inside canvas textholders.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Stream Title</label>
                  <textarea 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    rows={2}
                    className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Current game title</label>
                  <input 
                    type="text" 
                    value={editGame}
                    onChange={(e) => setEditGame(e.target.value)}
                    className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary"
                  />
                </div>
                <button
                  onClick={handleMetadataSave}
                  className="py-1.5 bg-gradient-to-r from-vibePrimary to-vibeSecondary text-white text-xs font-bold rounded-lg shadow-glow hover:brightness-110"
                >
                  Save settings
                </button>
              </div>
            </div>
          )}

        </aside>

        {/* CENTER VIEWPORT CANVAS LAYOUT COMPONENT */}
        <main className="flex-grow p-6 flex items-center justify-center bg-black/25 relative overflow-hidden">
          <div className="w-full max-w-[900px] aspect-ratio-16-9 relative border border-purple-900/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
            <SceneEditor />
          </div>
        </main>

        {/* RIGHT QUICK CONTROLLER & AI COMPANION PANEL */}
        <aside className="w-[300px] bg-[#0c0a1a]/85 border-l border-purple-900/30 p-5 flex flex-col gap-5 z-20 overflow-y-auto">
          
          {/* Quick Alert Tests */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Quick Event Simulators</h2>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleAlertTest('follow')}
                className="py-2 bg-[#171331] border border-purple-900/40 hover:border-purple-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition"
              >
                <span>💖</span> Follower
              </button>
              <button 
                onClick={() => handleAlertTest('subscribe')}
                className="py-2 bg-[#171331] border border-purple-900/40 hover:border-purple-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition"
              >
                <span>⭐</span> Subscriber
              </button>
              <button 
                onClick={() => handleAlertTest('donation')}
                className="py-2 bg-[#171331] border border-purple-900/40 hover:border-purple-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition"
              >
                <span>💵</span> Donation
              </button>
              <button 
                onClick={() => handleAlertTest('raid')}
                className="py-2 bg-[#171331] border border-purple-900/40 hover:border-purple-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition"
              >
                <span>🔥</span> Raid
              </button>
            </div>
          </div>

          {/* AI assistant Chat interface */}
          <div className="flex-grow flex flex-col min-h-[220px] bg-[#100c22] border border-purple-950 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-black/40 border-b border-purple-950 flex items-center gap-2 text-xs font-extrabold text-vibeSecondary font-display tracking-widest">
              <Sparkles size={14} className="text-vibeAccent" /> VIBE_AI COMPANION
            </div>
            
            {/* Messages box feed */}
            <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 max-h-[250px] scrollbar-thin">
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

            {/* Prompt sending input */}
            <form onSubmit={handleAISend} className="p-2 border-t border-purple-950 flex gap-1.5 bg-black/20">
              <input 
                type="text" 
                placeholder="Ask me: 'Switch to BRB'..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-grow bg-black/35 border border-purple-950 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-vibePrimary"
              />
              <button 
                type="submit" 
                className="p-1.5 bg-vibePrimary hover:bg-vibePrimary/80 text-white rounded-lg flex items-center justify-center transition"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Event notifications logs history */}
          <div className="flex flex-col gap-2 max-h-[160px] overflow-hidden">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Events Stream</h2>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[130px] pr-1">
              {alertHistory.map(evt => (
                <div key={evt.id} className="p-1.5 bg-[#120f28] border border-purple-950 rounded-md text-[10px] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white mr-1">{evt.username}</span>
                    <span className="text-slate-400 lowercase">{evt.type}d</span>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {evt.amount || 'New'}
                  </span>
                </div>
              ))}
              {alertHistory.length === 0 && (
                <span className="text-[10px] text-white/30 italic">No recent stream events recorded.</span>
              )}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};
