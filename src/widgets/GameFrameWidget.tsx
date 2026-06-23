import React from 'react';

interface GameFrameWidgetProps {
  settings: {
    titleBar?: boolean;
    titleText?: string;
    aspectRatio?: 'free' | '16-9' | '4-3' | '21-9';
  };
}

export const GameFrameWidget: React.FC<GameFrameWidgetProps> = ({ settings }) => {
  const {
    titleBar = true,
    titleText = 'GAMEPLAY WINDOW',
  } = settings;

  // Render the styled border, glow, and titlebar frame.
  // The center is kept transparent to let OBS game captures show through.
  return (
    <div className="w-full h-full flex flex-col relative bg-transparent">
      {titleBar && (
        <div 
          className="w-full px-[0.7vw] py-[0.3vw] flex items-center justify-between border-b border-[var(--panel-border)] bg-[var(--panel-bg)] select-none font-display z-20 flex-shrink-0"
        >
          <div className="flex items-center gap-[0.3vw]">
            <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-[#EF4444]" />
            <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-[#F59E0B]" />
            <span className="w-[0.45vw] h-[0.45vw] rounded-full bg-[#10B981]" />
          </div>
          <span 
            className="text-[0.65vw] font-black uppercase tracking-widest text-[var(--accent-primary)] glow-text-theme"
          >
            {titleText}
          </span>
          <span className="text-[0.55vw] text-[var(--text-secondary)] font-semibold tracking-wider">1080P ACTIVE</span>
        </div>
      )}
      
      {/* Center cutout placeholder (transparent inside live overlay, shows dashed instructions in editor mode) */}
      <div className="flex-1 w-full relative flex items-center justify-center bg-transparent z-10">
        <div className="absolute inset-[1.5vw] border border-dashed border-white/5 rounded flex flex-col items-center justify-center pointer-events-none opacity-20">
          <span className="font-display font-black text-[0.6vw] tracking-wider text-white">OBS GAME CAPTURE SOURCE</span>
          <span className="text-[0.45vw] text-slate-300 mt-0.5">Place Capture Layer Behind Browser Source</span>
        </div>
      </div>
    </div>
  );
};
