import React, { useState } from 'react';
import { Save, Twitch, Youtube, MessageCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [streamerName, setStreamerName] = useState('Rave_VT');
  const [streamTitle, setStreamTitle] = useState('Indie Game Night');
  const [activeGame, setActiveGame] = useState('Hollow Knight');
  const [twitch, setTwitch] = useState('');
  const [youtube, setYoutube] = useState('');
  const [discord, setDiscord] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <div className="top-toolbar">
        <span style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 16, fontWeight: 700 }}>Settings</span>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={13} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        <div style={{ maxWidth: 600 }}>
          {/* Stream Info */}
          <div className="inspector-section" style={{ marginBottom: 20 }}>
            <div className="inspector-section-header" style={{ cursor: 'default' }}>
              🎙 Stream Info
            </div>
            <div className="inspector-section-body">
              <div className="input-group">
                <div className="input-group-label">Streamer Name</div>
                <input className="input" value={streamerName} onChange={e => setStreamerName(e.target.value)} placeholder="Your channel name" />
              </div>
              <div className="input-group">
                <div className="input-group-label">Stream Title</div>
                <input className="input" value={streamTitle} onChange={e => setStreamTitle(e.target.value)} placeholder="What are you streaming?" />
              </div>
              <div className="input-group">
                <div className="input-group-label">Active Game</div>
                <input className="input" value={activeGame} onChange={e => setActiveGame(e.target.value)} placeholder="Game name" />
              </div>
            </div>
          </div>

          {/* Socials */}
          <div className="inspector-section" style={{ marginBottom: 20 }}>
            <div className="inspector-section-header" style={{ cursor: 'default' }}>
              🔗 Social Links
            </div>
            <div className="inspector-section-body">
              <div className="input-group">
                <div className="input-group-label">Twitch</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Twitch size={16} color="#9146FF" />
                  <input className="input" value={twitch} onChange={e => setTwitch(e.target.value)} placeholder="username" />
                </div>
              </div>
              <div className="input-group">
                <div className="input-group-label">YouTube</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Youtube size={16} color="#FF0000" />
                  <input className="input" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="channel handle" />
                </div>
              </div>
              <div className="input-group">
                <div className="input-group-label">Discord</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <MessageCircle size={16} color="#5865F2" />
                  <input className="input" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="discord.gg/yourserver" />
                </div>
              </div>
            </div>
          </div>

          {/* OBS Setup */}
          <div className="inspector-section">
            <div className="inspector-section-header" style={{ cursor: 'default' }}>
              📺 OBS Setup
            </div>
            <div className="inspector-section-body">
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                Add these URLs as <strong style={{ color: 'var(--color-text-2)' }}>Browser Sources</strong> in OBS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {[
                  { label: 'Overlay (1920×1080)', url: `${window.location.origin}/obs` },
                ].map(item => (
                  <div key={item.url} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <code style={{ flex: 1, fontSize: 11, color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>{item.url}</code>
                      <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => navigator.clipboard.writeText(item.url)}>
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
