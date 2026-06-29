import React, { useEffect, useState } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { useEditorStore } from '../../store/editorStore';
import { WidgetRenderer } from '../../widgets/WidgetRenderer';

// ─── Minimal OBS Overlay ─────────────────────────────────────────────────────
// This component renders at /obs and is loaded as a Browser Source in OBS.
// It reads ONLY from liveStore (what OBS should see right now).
// It never reads from editorStore (draft state).
//
// To prevent layout shift and rounding errors, it renders at a fixed 1920x1080
// coordinate space, and automatically scales itself using CSS transform scale
// to match the actual OBS Browser Source viewport size.

export const OBSOverlay: React.FC = () => {
  const { liveSceneName } = useLiveStore();
  const { scenes } = useEditorStore();
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Update scale factor to fit window size
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale({
        x: w / 1920,
        y: h / 1080,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find the live scene's widgets from editorStore matching the liveSceneName
  const liveScene = scenes.find(s => s.name === liveSceneName);
  const widgets = liveScene?.widgets ?? [];
  const sortedWidgets = [...widgets].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `scale(${scale.x}, ${scale.y})`,
        transformOrigin: 'top left',
        background: 'transparent',
        overflow: 'hidden',
        pointerEvents: 'none', // OBS source doesn't intercept mouse clicks on stream usually
      }}
    >
      {/* Render widgets with identical renderer */}
      {sortedWidgets.map(widget => (
        <WidgetRenderer key={widget.id} widget={widget} isEditor={false} />
      ))}
    </div>
  );
};
