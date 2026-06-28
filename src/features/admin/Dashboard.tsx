import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useOverlayStore, type SceneType, type ThemeType, type Widget } from '../../store/overlayStore';
import { OBSOverlay } from '../overlay/OBSOverlay';
import { SceneEditor } from '../editor/SceneEditor';
import { LayerPanel } from './LayerPanel';
import { WidgetInspector } from './WidgetInspector';
import {
  Tv, Sparkles, Award, Calendar, ShoppingBag, Settings, Link2,
  Volume2, ShieldAlert, Users, Globe, Send, Copy, ExternalLink,
  ChevronRight, Radio, Play, Plus, Trash, Pause, RotateCcw,
  Clock, Eye, EyeOff, Youtube, MessageSquare, Timer,
  FolderOpen, UploadCloud
} from 'lucide-react';

// ── Twitch icon as inline SVG (not in lucide) ──────────────────────────────
const TwitchIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
);

const THEMES: Array<{ key: ThemeType; label: string; bg: string }> = [
  { key: 'cyber-synth', label: 'Cyber Synth', bg: 'linear-gradient(135deg, #FF4DFF, #5CFFE2)' },
  { key: 'cyberpunk-neon', label: 'Cyberpunk Neon', bg: 'linear-gradient(135deg, #FF0055, #00FFCC)' },
  { key: 'synthwave', label: 'Synthwave', bg: 'linear-gradient(135deg, #f43f5e, #fbbf24)' },
  { key: 'retro-crt', label: 'Retro CRT', bg: 'repeating-linear-gradient(0deg, #051405, #051405 2px, #0c300c 2px, #0c300c 4px)' },
  
  // Lo-fi Collection
  { key: 'lo-fi-cafe', label: 'Lo-fi Cafe', bg: 'linear-gradient(135deg, #d1c4e9, #ffb74d)' },
  { key: 'lo-fi-bedroom', label: 'Lo-fi Bedroom', bg: 'linear-gradient(135deg, #a78bfa, #f472b6)' },
  { key: 'anime-room', label: 'Anime Room', bg: 'linear-gradient(135deg, #fda4af, #f472b6)' },
  { key: 'anime-sakura', label: 'Anime Sakura', bg: 'linear-gradient(135deg, #fbcfe8, #fda4af)' },
  
  // Minimal Languages
  { key: 'minimal-dark', label: 'Minimal Dark', bg: '#1A1A1A' },
  { key: 'minimal-white', label: 'Minimal White', bg: '#FFFFFF' },
  { key: 'modern-white', label: 'Modern White (Apple)', bg: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' },
  { key: 'corporate-tech', label: 'Corporate Tech', bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
  { key: 'modern-clean', label: 'Modern Clean', bg: 'linear-gradient(135deg, #0f172a, #1e293b)' },

  // Special Visuals
  { key: 'glassmorphism', label: 'Glassmorphism', bg: 'rgba(255,255,255,0.2)' },
  { key: 'neumorphism', label: 'Neumorphism', bg: '#E0E0E0' },
  { key: 'luxury-gold', label: 'Luxury Gold', bg: 'linear-gradient(135deg, #111, #D4AF37)' },
  { key: 'tokyo-night', label: 'Tokyo Night', bg: 'linear-gradient(135deg, #110c24, #ff0055)' },

  // Seasonals
  { key: 'halloween', label: 'Halloween', bg: 'linear-gradient(135deg, #F97316, #7C2D12)' },
  { key: 'christmas', label: 'Christmas', bg: 'linear-gradient(135deg, #DC2626, #16A34A)' },
  { key: 'snow-season', label: 'Snow Season', bg: 'linear-gradient(135deg, #E0F2FE, #93C5FD)' },

  // Motorsports
  { key: 'mclaren', label: 'McLaren F1', bg: 'linear-gradient(135deg, #FF8000, #1A1A1A)' },
  { key: 'porsche-gulf', label: 'Porsche Gulf', bg: 'linear-gradient(135deg, #709CB8, #FF5800)' },
  { key: 'ferrari', label: 'Ferrari F1', bg: 'linear-gradient(135deg, #C4151C, #FFEB3B)' },
  { key: 'mercedes-amg', label: 'Mercedes AMG', bg: 'linear-gradient(135deg, #CCCCCC, #00A3A6)' },
  { key: 'red-bull', label: 'Red Bull Racing', bg: 'linear-gradient(135deg, #001A30, #FFCC00)' },
  
  // Blanks
  { key: 'pure-transparent', label: 'Pure Transparent', bg: 'transparent' },
  { key: 'pure-black', label: 'Pure Black', bg: '#000000' },
  { key: 'pure-white', label: 'Pure White', bg: '#FFFFFF' },

  // Custom Reference Layouts
  { key: 'pastel-planets', label: 'Pastel Planets', bg: 'linear-gradient(135deg, #BDB2FF, #E8AEFF)' },
  { key: 'cyber-hud', label: 'Cyber HUD', bg: 'linear-gradient(135deg, #00F0FF, #0B0E14)' },
  { key: 'esports-blue', label: 'Esports Telemetry', bg: 'linear-gradient(135deg, #2979FF, #00081C)' },
];

const MARKETPLACE_THEMES: Array<{
  id: string;
  name: string;
  author: string;
  category: string;
  previewColor: string;
  rating: number;
  installs: number;
  themeKey: ThemeType;
}> = [
  { id: 'mt-1', name: 'Solaris Horizon', author: 'KiraDesigns', category: 'Warm', previewColor: '#f97316', rating: 4.8, installs: 1240, themeKey: 'luxury-gold' },
  { id: 'mt-2', name: 'Arctic Eclipse', author: 'NekoStudios', category: 'Cool', previewColor: '#38bdf8', rating: 4.6, installs: 980, themeKey: 'snow-season' },
  { id: 'mt-3', name: 'Void Walker', author: 'Yukari_Art', category: 'Dark', previewColor: '#6366f1', rating: 4.9, installs: 2100, themeKey: 'cyber-synth' },
  { id: 'mt-4', name: 'Retro Wave', author: 'PixelDreams', category: 'Retro', previewColor: '#ec4899', rating: 4.7, installs: 1560, themeKey: 'synthwave' },
];

interface DashboardProps {
  activeTabInitial?: 'scenes' | 'widgets' | 'alerts' | 'goals' | 'scheduler' | 'marketplace' | 'integrations' | 'settings' | 'assets';
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

  type TabType = 'scenes' | 'widgets' | 'alerts' | 'goals' | 'scheduler' | 'marketplace' | 'integrations' | 'settings' | 'assets';
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
  const [editDisableAnimations, setEditDisableAnimations] = useState(settings.disableAnimations || false);
  const [editAnimationPack, setEditAnimationPack] = useState(settings.activeAnimationPack || 'float');

  const projectId = useOverlayStore(s => s.projectId);
  const [assets, setAssets] = useState<Array<{
    id: string;
    name: string;
    type: 'image' | 'gif' | 'video' | 'lottie' | 'svg';
    url: string;
    size: string;
  }>>([]);

  // Fetch actual assets from Supabase
  useEffect(() => {
    const fetchAssets = async () => {
      if (!projectId) return;
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId);
      
      if (data && data.length > 0) {
        setAssets(data.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type as any,
          url: a.url,
          size: a.size ? `${(a.size / 1024).toFixed(0)} KB` : '0 KB'
        })));
      } else {
        // Seed default fallback assets for first-time use
        setAssets([
          { id: 'asset-1', name: 'Abstract Cyber Wave', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', size: '240 KB' },
          { id: 'asset-2', name: 'Cyberpunk Grid Sunset', type: 'gif', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZkMTNjc3B3dW16cTY0bzMzd3VjM2txNm1qam05Z2ZpZnYzdXQxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKUM3cGE6wy4UZy/giphy.gif', size: '1.2 MB' },
          { id: 'asset-3', name: 'Motorsport F1 Motion', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41851-large.mp4', size: '4.8 MB' },
          { id: 'asset-4', name: 'Twinkle Lottie Ring', type: 'lottie', url: 'https://assets2.lottiefiles.com/packages/lf20_aay9skwa.json', size: '12 KB' },
        ]);
      }
    };
    fetchAssets();
  }, [projectId]);

  const deleteAsset = async (assetId: string, assetUrl: string) => {
    try {
      await supabase.from('assets').delete().eq('id', assetId);

      if (assetUrl.includes('/storage/v1/object/public/assets/')) {
        const pathPart = assetUrl.split('/public/assets/')[1];
        if (pathPart) {
          await supabase.storage.from('assets').remove([pathPart]);
        }
      }

      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (e) {
      console.error('Failed to delete asset:', e);
    }
  };

  const addMediaWidget = (assetUrl: string, assetType: string, assetName: string) => {
    const currentWidgets = useOverlayStore.getState().sceneWidgets[currentScene];
    const newId = `media-${Date.now()}`;
    const newWidget: Widget = {
      id: newId,
      type: 'media',
      label: assetName,
      x: 30, y: 30, w: 25, h: 20,
      rotation: 0, opacity: 100, scale: 1.0, zIndex: currentWidgets.length + 1,
      visible: true, locked: false,
      style: { borderRadius: 8, background: 'transparent', borderSize: 0, borderStyle: 'none', borderColor: '', glowBlur: 0, padding: 0 },
      animation: { type: 'none', duration: 1, delay: 0, loop: false },
      content: {
        type: 'media',
        settings: {
          url: assetUrl,
          mediaMode: assetType as any,
          loop: true,
          blendMode: 'normal',
          masking: 'none',
          hoverEffect: 'none',
          crop: { top: 0, right: 0, bottom: 0, left: 0 }
        }
      }
    };
    useOverlayStore.setState(state => ({
      sceneWidgets: {
        ...state.sceneWidgets,
        [currentScene]: [...currentWidgets, newWidget]
      },
      selectedWidgetIds: [newId],
      selectedWidgetId: newId
    }));
    useOverlayStore.getState().pushHistoryState();
  };

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
      disableAnimations: editDisableAnimations, activeAnimationPack: editAnimationPack,
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
    { tab: 'assets', icon: <FolderOpen size={18} />, label: 'Assets' },
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

          {/* ASSETS TAB */}
          {activeTab === 'assets' && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">ASSETS LIBRARY</h2>
                <p className="text-[11px] text-slate-400">Upload and place graphics, GIFs, videos, and Lottie animations.</p>
              </div>

              {/* Upload Drop Zone */}
              <div 
                className="p-4 border-2 border-dashed border-purple-900/40 hover:border-purple-600/80 rounded-xl bg-black/25 flex flex-col items-center justify-center text-center cursor-pointer transition"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*,video/*,.json,image/gif';
                  input.onchange = async (e: any) => {
                    const file = e.target.files?.[0];
                    if (file && projectId) {
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                        const filePath = `${projectId}/${fileName}`;

                        const { data: uploadData, error: uploadErr } = await supabase.storage
                          .from('assets')
                          .upload(filePath, file);

                        if (uploadErr) {
                          console.error('Failed to upload file to Supabase storage:', uploadErr);
                          return;
                        }

                        const { data: { publicUrl } } = supabase.storage
                          .from('assets')
                          .getPublicUrl(filePath);

                        let mediaType: 'image' | 'gif' | 'video' | 'lottie' | 'svg' = 'image';
                        if (file.type.includes('gif')) mediaType = 'gif';
                        else if (file.type.includes('video')) mediaType = 'video';
                        else if (file.name.endsWith('.json')) mediaType = 'lottie';
                        else if (file.type.includes('svg')) mediaType = 'svg';

                        const { data: inserted, error: insertErr } = await supabase
                          .from('assets')
                          .insert({
                            project_id: projectId,
                            name: file.name,
                            type: mediaType,
                            url: publicUrl,
                            size: file.size
                          })
                          .select()
                          .single();

                        if (inserted) {
                          setAssets(prev => [
                            ...prev,
                            {
                              id: inserted.id,
                              name: inserted.name,
                              type: inserted.type as any,
                              url: inserted.url,
                              size: `${(inserted.size / 1024).toFixed(0)} KB`
                            }
                          ]);
                        }
                      } catch (err) {
                        console.error('Upload process failed:', err);
                      }
                    }
                  };
                  input.click();
                }}
              >
                <UploadCloud className="text-purple-400 mb-1" size={24} />
                <span className="text-[10px] font-bold text-slate-300">Select or drop media files</span>
                <span className="text-[8px] text-white/30 mt-0.5">Supports PNG, WebP, GIF, MP4, Lottie, SVG</span>
              </div>

              {/* Library grid list */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {assets.map(asset => (
                  <div key={asset.id} className="p-2.5 bg-[#110d24] border border-purple-950 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded border border-white/5 bg-black/40 flex-shrink-0 flex items-center justify-center text-[14px]">
                        {asset.type === 'video' ? '📹' : asset.type === 'gif' ? '🖼️' : asset.type === 'lottie' ? '💫' : '🎨'}
                      </div>
                      <div className="overflow-hidden">
                        <span className="block text-xs font-bold text-white truncate w-[100px]">{asset.name}</span>
                        <span className="text-[9px] text-slate-400 capitalize">{asset.type} · {asset.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => addMediaWidget(asset.url, asset.type, asset.name)}
                        className="px-2 py-1 bg-vibePrimary hover:bg-vibePrimary/80 text-white rounded font-bold text-[9px] transition"
                      >
                        + Place
                      </button>
                      <button
                        onClick={() => deleteAsset(asset.id, asset.url)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition"
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black font-display text-white mb-1 uppercase tracking-wider">VISUAL STYLE THEMES</h2>
                <p className="text-[11px] text-slate-400">Switch design variables, fonts, borders, and animations.</p>
              </div>
              
              <button
                onClick={() => useOverlayStore.getState().applyThemeLayoutPreset()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-900 to-indigo-950 border border-purple-700/50 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                🔄 Apply Default Layout Template
              </button>

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
                {MARKETPLACE_THEMES.map(t => {
                  const isActive = activeTheme === t.themeKey;
                  return (
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
                        disabled={isActive}
                        onClick={() => setTheme(t.themeKey)}
                        className={`px-3 py-1 rounded font-bold text-[10px] transition flex-shrink-0 ${
                          isActive
                            ? 'bg-purple-950/30 border border-purple-800 text-purple-400'
                            : 'bg-vibePrimary hover:bg-vibePrimary/80 text-white shadow-glow'
                        }`}
                      >
                        {isActive ? 'Active' : 'Get'}
                      </button>
                    </div>
                  );
                })}
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
                <div className="flex items-center gap-2 py-1">
                  <input 
                    type="checkbox" 
                    id="disable-anims" 
                    checked={editDisableAnimations} 
                    onChange={e => setEditDisableAnimations(e.target.checked)} 
                    className="rounded text-vibePrimary focus:ring-vibePrimary"
                  />
                  <label htmlFor="disable-anims" className="text-[10px] font-bold text-slate-300">Disable All Animations</label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Background Animation Pack</label>
                  <select
                    value={editAnimationPack}
                    onChange={e => setEditAnimationPack(e.target.value)}
                    className="bg-black/30 border border-purple-950 rounded p-1.5 text-xs text-white"
                  >
                    <option value="static">Static (None)</option>
                    <option value="minimal">Minimal</option>
                    <option value="float">Float (Default)</option>
                    <option value="glow">Glow Pulse</option>
                    <option value="pulse">Opacity Pulse</option>
                    <option value="aurora">Aurora Glow</option>
                    <option value="wave">Sinewave Float</option>
                    <option value="neon">Neon Sparkle</option>
                    <option value="particle-rain">Particle Rain</option>
                    <option value="snow">Snow Season</option>
                    <option value="fireflies">Summer Fireflies</option>
                    <option value="stars">Twinkling Stars</option>
                    <option value="rain">Streaking Rain</option>
                    <option value="fog">Drifting Fog</option>
                  </select>
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
