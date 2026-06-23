import React, { useEffect } from 'react';

interface MediaWidgetProps {
  settings: {
    url?: string;
    mediaMode?: 'image' | 'gif' | 'video' | 'lottie' | 'svg';
    loop?: boolean;
    blendMode?: string;
    masking?: string;
    crop?: { top: number; right: number; bottom: number; left: number };
    hoverEffect?: 'none' | 'scale' | 'glow' | 'lift' | 'grayscale';
  };
}

export const MediaWidget: React.FC<MediaWidgetProps> = ({ settings }) => {
  const {
    url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    mediaMode = 'image',
    loop = true,
    blendMode = 'normal',
    masking = 'none',
    crop = { top: 0, right: 0, bottom: 0, left: 0 },
    hoverEffect = 'none',
  } = settings;

  // Dynamically load standard Lottie player web-component script if lottie mode is active
  useEffect(() => {
    if (mediaMode === 'lottie' && !document.getElementById('lottie-player-script')) {
      const script = document.createElement('script');
      script.id = 'lottie-player-script';
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      document.body.appendChild(script);
    }
  }, [mediaMode]);

  const cropClipPath = `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`;
  
  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    mixBlendMode: blendMode as any,
    clipPath: cropClipPath,
    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  // Preset masking shapes using CSS clip-path
  if (masking && masking !== 'none') {
    if (masking === 'circle') {
      mediaStyle.clipPath = `circle(50% at 50% 50%)`;
    } else if (masking === 'rhombus') {
      mediaStyle.clipPath = `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`;
    } else if (masking === 'triangle') {
      mediaStyle.clipPath = `polygon(50% 0%, 0% 100%, 100% 100%)`;
    } else if (masking === 'hexagon') {
      mediaStyle.clipPath = `polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`;
    }
  }

  // Hover animations micro-interactions
  let hoverClass = 'transition-transform transition-all duration-300 ';
  if (hoverEffect === 'scale') hoverClass += 'hover:scale-105';
  else if (hoverEffect === 'glow') hoverClass += 'hover:shadow-[0_0_15px_var(--accent-primary)] hover:border hover:border-[var(--accent-primary)]';
  else if (hoverEffect === 'lift') hoverClass += 'hover:-translate-y-1.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]';
  else if (hoverEffect === 'grayscale') hoverClass += 'grayscale hover:grayscale-0';

  const renderMedia = () => {
    switch (mediaMode) {
      case 'video':
        return (
          <video
            src={url}
            style={mediaStyle}
            className={hoverClass}
            autoPlay
            loop={loop}
            muted
            playsInline
          />
        );
      case 'lottie':
        return (
          <div style={{ width: '100%', height: '100%', mixBlendMode: blendMode as any }} className={hoverClass}>
            {/* @ts-ignore */}
            <lottie-player
              src={url}
              background="transparent"
              speed="1"
              style={{ width: '100%', height: '100%' }}
              loop={loop ? true : undefined}
              autoplay
            />
          </div>
        );
      case 'svg':
      case 'image':
      case 'gif':
      default:
        return (
          <img
            src={url}
            alt="media asset content"
            style={mediaStyle}
            className={hoverClass}
            loading="lazy"
          />
        );
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      {renderMedia()}
    </div>
  );
};
