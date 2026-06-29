import React, { useEffect, useState } from 'react';
import { useLiveStore, startLiveTimerEngine } from '../../store/liveStore';
import { useEditorStore } from '../../store/editorStore';
import { WidgetRenderer } from '../../widgets/WidgetRenderer';

// ─── OBS Overlay ──────────────────────────────────────────────────────────────
// Rendered at /obs — loaded as a Browser Source in OBS.
// Reads from liveStore (shared timer, scene, theme) and editorStore (widget layout).
// Scales from the fixed 1920×1080 canvas to any viewport size.

export const OBSOverlay: React.FC = () => {
  const { liveSceneName, projectId, subscribeToRealtime } = useLiveStore();
  const { scenes } = useEditorStore();
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Update scale factor to fit window size
  useEffect(() => {
    const handleResize = () => {
      setScale({
        x: window.innerWidth / 1920,
        y: window.innerHeight / 1080,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure timer engine is ticking on this page too
  useEffect(() => {
    startLiveTimerEngine();
  }, []);

  // Re-subscribe to realtime whenever projectId becomes available
  // (AppShell handles this too, but this is a safety fallback for direct /obs access)
  useEffect(() => {
    if (!projectId) return;
    const unsub = subscribeToRealtime();
    return unsub;
  }, [projectId, subscribeToRealtime]);

  // Find the live scene widgets matching liveSceneName
  const liveScene = scenes.find(s => s.name === liveSceneName);
  const widgets = liveScene?.widgets ?? [];
  const sortedWidgets = [...widgets].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const visibleWidgets = sortedWidgets.filter(w => w.visible !== false);

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
        pointerEvents: 'none',
      }}
    >
      {visibleWidgets.map(widget => (
        <WidgetRenderer key={widget.id} widget={widget} isEditor={false} />
      ))}
    </div>
  );
};
