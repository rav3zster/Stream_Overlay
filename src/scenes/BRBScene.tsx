import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { VtuberWidget } from '../widgets/VtuberWidget';
import { TimerWidget } from '../widgets/TimerWidget';
import { ChatWidget } from '../widgets/ChatWidget';
import { MusicWidget } from '../widgets/MusicWidget';

export const BRBScene: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);

  return (
    <div className="absolute inset-x-0 top-0 bottom-[32px] z-10 flex items-center justify-center p-[2%]">

      {/* Center layout */}
      <div className="flex gap-[2%] w-full h-full">

        {/* Avatar */}
        <div
          className="rounded-xl overflow-hidden flex-shrink-0"
          style={{
            width: '35%',
            background: 'var(--panel-bg)',
            border: '1.5px solid var(--panel-border)',
            boxShadow: 'var(--glow-shadow)',
          }}
        >
          <VtuberWidget size="large" sleeping />
        </div>

        {/* Right column */}
        <div className="flex-grow flex flex-col gap-[2%]">

          {/* BRB Header */}
          <div
            className="rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-center py-[2vw]"
            style={{
              background: 'var(--panel-bg)',
              border: '1.5px solid var(--panel-border)',
              boxShadow: 'var(--glow-shadow)',
            }}
          >
            <span
              className="font-display font-black uppercase tracking-[6px]"
              style={{ fontSize: '1.5vw', color: 'var(--accent-primary)', textShadow: 'var(--glow-text)' }}
            >
              ☕ BE RIGHT BACK
            </span>
            <span style={{ fontSize: '0.7vw', color: 'var(--text-secondary)', marginTop: '0.4vw' }}>
              {settings.streamerName} is taking a short break
            </span>
          </div>

          {/* Timer */}
          <div
            className="rounded-xl overflow-hidden flex-shrink-0"
            style={{
              height: '22%',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
            }}
          >
            <TimerWidget label="RETURNING IN" />
          </div>

          {/* Mini chat */}
          <div
            className="rounded-xl overflow-hidden flex-grow"
            style={{
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              minHeight: 0,
            }}
          >
            <ChatWidget size="mini" maxMessages={8} />
          </div>

          {/* Music */}
          <div
            className="rounded-lg overflow-hidden flex-shrink-0"
            style={{
              height: '5vw',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
            }}
          >
            <MusicWidget compact />
          </div>
        </div>
      </div>
    </div>
  );
};
