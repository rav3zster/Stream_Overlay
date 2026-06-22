import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

export const SocialWidget: React.FC = () => {
  const socials = useOverlayStore(s => s.settings.socials);

  return (
    <div className="flex flex-col justify-center items-center h-full gap-[0.6vw] p-[1vw]">
      <span className="font-display font-black uppercase tracking-widest" style={{ fontSize: '0.7vw', color: 'var(--accent-secondary)' }}>
        Follow & Connect
      </span>
      <div className="flex items-center gap-[1.5vw] flex-wrap justify-center">
        <div className="flex items-center gap-[0.4vw]">
          <span className="font-bold" style={{ fontSize: '0.75vw', color: '#9146FF' }}>Twitch</span>
          <span style={{ fontSize: '0.8vw', color: 'var(--text-primary)' }}>{socials.twitch}</span>
        </div>
        <div className="w-[1px] h-3 opacity-20" style={{ background: 'white' }} />
        <div className="flex items-center gap-[0.4vw]">
          <span className="font-bold" style={{ fontSize: '0.75vw', color: '#1DA1F2' }}>Twitter</span>
          <span style={{ fontSize: '0.8vw', color: 'var(--text-primary)' }}>{socials.twitter}</span>
        </div>
        <div className="w-[1px] h-3 opacity-20" style={{ background: 'white' }} />
        <div className="flex items-center gap-[0.4vw]">
          <span className="font-bold" style={{ fontSize: '0.75vw', color: '#FF0000' }}>YouTube</span>
          <span style={{ fontSize: '0.8vw', color: 'var(--text-primary)' }}>{socials.youtube}</span>
        </div>
        {socials.discord && (
          <>
            <div className="w-[1px] h-3 opacity-20" style={{ background: 'white' }} />
            <div className="flex items-center gap-[0.4vw]">
              <span className="font-bold" style={{ fontSize: '0.75vw', color: '#5865F2' }}>Discord</span>
              <span style={{ fontSize: '0.8vw', color: 'var(--text-primary)' }}>{socials.discord}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ViewerCountWidget: React.FC = () => {
  const viewerCount = useOverlayStore(s => s.viewerCount);
  return (
    <div className="flex items-center justify-center gap-[0.5vw] h-full">
      <span style={{ fontSize: '1.5vw' }}>👁</span>
      <span className="font-display font-black" style={{ fontSize: '1.5vw', color: 'var(--accent-primary)', textShadow: 'var(--glow-text)' }}>
        {viewerCount.toLocaleString()}
      </span>
      <span className="font-bold uppercase tracking-widest" style={{ fontSize: '0.6vw', color: 'var(--text-secondary)' }}>
        viewers
      </span>
    </div>
  );
};
