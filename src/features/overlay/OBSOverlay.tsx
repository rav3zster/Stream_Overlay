import React, { useEffect, useRef } from 'react';
import { useOverlayStore } from '../../store/overlayStore';
import { TickerWidget } from '../../widgets/TickerWidget';
import { WidgetRenderer } from '../../widgets/WidgetRenderer';

export const OBSOverlay: React.FC = () => {
  const currentScene = useOverlayStore(s => s.currentScene);
  const theme = useOverlayStore(s => s.theme);
  const settings = useOverlayStore(s => s.settings);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ──────────────────────────────────────────────────────────────
  // Canvas particle background — theme-responsive
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Build particles
    const particles: Array<{
      x: number; y: number; s: number; sx: number; sy: number;
      a: number; rot: number; sp: number;
    }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        s: Math.random() * 3 + 1,
        sx: (Math.random() - 0.5) * 0.4,
        sy: (Math.random() - 0.5) * 0.4 - 0.1,
        a: Math.random() * 0.5 + 0.2,
        rot: Math.random() * Math.PI,
        sp: (Math.random() - 0.5) * 0.02,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const d of particles) {
        d.x += d.sx; d.y += d.sy; d.rot += d.sp;
        if (d.x < 0) d.x = width;   if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;  if (d.y > height) d.y = 0;

        ctx.save();
        ctx.globalAlpha = d.a;

        const animPack = settings.activeAnimationPack || 'float';

        if (animPack === 'snow') {
          d.sy = Math.abs(d.sy) + 0.4;
          ctx.fillStyle = `rgba(255, 255, 255, ${d.a * 0.9})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (animPack === 'rain') {
          d.sy = Math.abs(d.sy) * 2.5 + 4;
          d.sx = 0.5;
          ctx.strokeStyle = `rgba(160, 207, 255, ${d.a * 0.45})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.sx * 5, d.y + d.sy * 2);
          ctx.stroke();
        } else if (animPack === 'fireflies') {
          ctx.fillStyle = `rgba(220, 255, 100, ${Math.sin(Date.now() * 0.003 + d.rot) * 0.4 + 0.5})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#dcf550';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 1.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (animPack === 'stars') {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(Date.now() * 0.004 + d.x * 0.1) * 0.5 + 0.5})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else if (animPack === 'fog') {
          d.sx = (d.sx > 0 ? 1 : -1) * 0.08;
          ctx.fillStyle = `rgba(255, 255, 255, ${d.a * 0.03})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 25, 0, Math.PI * 2);
          ctx.fill();
        } else if (['cyber-synth', 'vaporwave', 'neon-tokyo'].includes(theme)) {
          ctx.fillStyle = d.s > 2.5 ? '#FF4DFF' : '#5CFFE2';
          ctx.shadowBlur = 8; ctx.shadowColor = ctx.fillStyle;
          ctx.fillRect(d.x, d.y, d.s * 1.5, d.s * 1.5);
        } else if (['galaxy-violet', 'cosmic-nebula'].includes(theme)) {
          const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.s * 3.5);
          g.addColorStop(0, 'rgba(255,255,255,0.8)');
          g.addColorStop(0.3, 'rgba(168,85,247,0.4)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(d.x, d.y, d.s * 3.5, 0, Math.PI * 2); ctx.fill();
        } else if (['sakura-night', 'anime-bedroom'].includes(theme)) {
          ctx.translate(d.x, d.y); ctx.rotate(d.rot);
          ctx.fillStyle = 'rgba(251,207,232,0.8)';
          ctx.beginPath(); ctx.ellipse(0, 0, d.s * 2, d.s * 1.2, 0, 0, Math.PI * 2); ctx.fill();
        } else if (theme === 'dark-amethyst') {
          d.sy = -Math.abs(d.sy) - 0.15;
          ctx.fillStyle = '#c084fc'; ctx.shadowBlur = 6; ctx.shadowColor = '#c084fc';
          ctx.beginPath(); ctx.arc(d.x, d.y, d.s * 1.2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(192,132,252,0.3)';
          ctx.fillRect(d.x, d.y, 2, 2);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, [theme, settings.disableAnimations, settings.activeAnimationPack]);

  // ──────────────────────────────────────────────────────────────
  // Render the active scene widgets dynamically
  // ──────────────────────────────────────────────────────────────
  const widgets = useOverlayStore(s => s.sceneWidgets[s.currentScene] || []);

  const renderScene = () => {
    const sortedWidgets = [...widgets].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    return (
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {sortedWidgets.map(widget => (
          <WidgetRenderer key={widget.id} widget={widget} isEditor={false} />
        ))}
      </div>
    );
  };

  const cutoutWidgets = widgets.filter(w => w.type === 'game-frame' && w.visible);

  return (
    <div
      id="overlay-canvas"
      className={`theme-${theme} w-full h-screen relative overflow-hidden select-none`}
      style={{ fontFamily: 'var(--font-body)', background: 'transparent' }}
    >
      {/* Isolated background blending layers */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ isolation: 'isolate' }}>
        {/* Background color */}
        <div 
          className="absolute inset-0"
          style={{ background: theme === 'transparent' ? 'transparent' : 'var(--bg-color, #07050F)' }}
        />

        {/* Particle canvas */}
        {!settings.disableAnimations && (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        )}

        {/* Grid overlay */}
        <div className="bg-grid-overlay absolute inset-0" />

        {/* Transparent game frame cutouts */}
        {cutoutWidgets.map(w => (
          <div
            key={`cutout-${w.id}`}
            style={{
              position: 'absolute',
              left: `${w.x}%`,
              top: `${w.y}%`,
              width: `${w.w}%`,
              height: `${w.h}%`,
              borderRadius: `${w.style?.borderRadius ?? 8}px`,
              background: '#000000',
              mixBlendMode: 'destination-out' as any,
              transform: `rotate(${w.rotation || 0}deg) scale(${w.scale || 1.0})`,
            }}
          />
        ))}
      </div>

      {/* Scanline effect */}
      <div className="scanlines absolute inset-0 w-full h-full z-40 pointer-events-none opacity-20" />

      {/* Active scene content (z-10 inside scenes) */}
      {renderScene()}

      {/* Global ticker footer bar */}
      <TickerWidget />
    </div>
  );
};
