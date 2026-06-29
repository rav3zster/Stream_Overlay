import React, { useState, useCallback } from 'react';
import { Upload, Search, Trash2, Download, Image, Film, Music, FileText, Filter } from 'lucide-react';

type AssetType = 'image' | 'gif' | 'video' | 'lottie' | 'audio' | 'font' | 'svg' | 'logo';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  size: number;
  uploadedAt: string;
}

const TYPE_ICONS: Record<AssetType, string> = {
  image: '🖼', gif: '🎞', video: '📹', lottie: '🌀', audio: '🎵', font: '✏️', svg: '▲', logo: '⚡',
};

const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'overlay_bg.png', type: 'image', url: '', size: 248000, uploadedAt: '2025-06-28' },
  { id: '2', name: 'alert_wave.gif', type: 'gif', url: '', size: 1200000, uploadedAt: '2025-06-27' },
  { id: '3', name: 'subscribe.mp4', type: 'video', url: '', size: 4500000, uploadedAt: '2025-06-25' },
  { id: '4', name: 'logo_white.svg', type: 'svg', url: '', size: 12000, uploadedAt: '2025-06-20' },
  { id: '5', name: 'intro_anim.lottie', type: 'lottie', url: '', size: 38000, uploadedAt: '2025-06-19' },
];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const AssetsPage: React.FC = () => {
  const [assets] = useState<Asset[]>(MOCK_ASSETS);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    return matchSearch && matchType;
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // File upload logic would go here
    console.log('Files dropped:', e.dataTransfer.files);
  }, []);

  return (
    <div className="assets-page">
      {/* Header toolbar */}
      <div className="top-toolbar">
        <Search size={14} color="var(--color-text-muted)" />
        <input
          className="input"
          placeholder="Search assets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
        <div className="toolbar-divider" />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'image', 'gif', 'video', 'svg', 'lottie', 'audio', 'font'] as const).map(t => (
            <button
              key={t}
              className={`btn btn-secondary${filterType === t ? ' active' : ''}`}
              style={{ fontSize: 11, padding: '4px 10px', borderColor: filterType === t ? 'var(--color-accent)' : 'var(--color-border)' }}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'All' : TYPE_ICONS[t as AssetType]}
            </button>
          ))}
        </div>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary">
          <Upload size={13} /> Upload Assets
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Drop zone */}
        <div
          className={`upload-zone${isDragOver ? ' drag-over' : ''}`}
          style={{ marginBottom: 24, padding: 40 }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <div style={{ fontSize: 36 }}>📁</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Drop files here or click to upload</div>
          <div style={{ fontSize: 12 }}>Supports PNG, JPG, GIF, SVG, WebP, MP4, WebM, Lottie, TTF, OTF</div>
          <input id="file-upload-input" type="file" multiple style={{ display: 'none' }} />
        </div>

        {/* Asset grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14 }}>No assets found</div>
          </div>
        ) : (
          <div className="assets-grid">
            {filtered.map(asset => (
              <div
                key={asset.id}
                className={`asset-card${selected.includes(asset.id) ? ' selected' : ''}`}
                onClick={() => setSelected(s => s.includes(asset.id) ? s.filter(i => i !== asset.id) : [...s, asset.id])}
              >
                <div className="asset-preview">
                  {asset.url ? (
                    asset.type === 'image' || asset.type === 'gif' || asset.type === 'svg' || asset.type === 'logo'
                      ? <img src={asset.url} alt={asset.name} />
                      : <span>{TYPE_ICONS[asset.type]}</span>
                  ) : (
                    <span style={{ fontSize: 28 }}>{TYPE_ICONS[asset.type]}</span>
                  )}
                </div>
                <div className="asset-info">
                  <div className="asset-name">{asset.name}</div>
                  <div className="asset-meta">{formatSize(asset.size)} · {asset.uploadedAt}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
