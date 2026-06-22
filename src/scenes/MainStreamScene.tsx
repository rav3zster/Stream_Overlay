import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { ChatWidget } from '../widgets/ChatWidget';
import { VtuberWidget } from '../widgets/VtuberWidget';
import { AlertsWidget } from '../widgets/AlertsWidget';
import { EventListWidget } from '../widgets/EventListWidget';
import { SubscriberGoalWidget, DonationGoalWidget } from '../widgets/GoalWidgets';

export const MainStreamScene: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);
  const showChat = useOverlayStore(s => s.showChat);
  const showAvatar = useOverlayStore(s => s.showAvatar);

  return (
    <div className="absolute inset-x-0 top-0 bottom-[32px] z-10 flex">

      {/* Main game viewport — left 78% */}
      <div className="relative flex-grow" style={{ flexBasis: '78%', maxWidth: '78%' }}>
        {/* Game capture placeholder */}
        <div className="w-full h-full relative overflow-hidden" style={{ background: '#050709' }}>
          {/* Dot matrix background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          {/* Animated game elements */}
          <div
            className="absolute rounded-full opacity-30"
            style={{
              width: '3vw', height: '3vw',
              background: 'var(--accent-primary)',
              top: '28%', left: '22%',
              animation: 'ping 4s cubic-bezier(0,0,0.2,1) infinite',
            }}
          />
          <div
            className="absolute rotate-45 opacity-20"
            style={{
              width: '2.5vw', height: '2.5vw',
              background: 'var(--accent-secondary)',
              top: '60%', left: '58%',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-3 left-3 font-display uppercase tracking-widest"
            style={{ fontSize: '0.65vw', color: 'rgba(255,255,255,0.2)' }}
          >
            🎮 {settings.activeGame} — GAME CAPTURE SOURCE
          </div>
        </div>

        {/* Event ticker at top of game */}
        <div
          className="absolute top-[1.5%] left-[2%] right-[2%] h-[7%] rounded-lg overflow-hidden"
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <EventListWidget />
        </div>

        {/* Alert popup */}
        <AlertsWidget />
      </div>

      {/* Right sidebar — 22% */}
      <div
        className="flex flex-col gap-[1%] p-[1%]"
        style={{ flexBasis: '22%', maxWidth: '22%', background: 'rgba(0,0,0,0.4)' }}
      >
        {/* Mini VTuber cam */}
        {showAvatar && (
          <div
            className="rounded-lg overflow-hidden flex-shrink-0"
            style={{
              height: '35%',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <VtuberWidget size="medium" />
          </div>
        )}

        {/* Chat widget */}
        {showChat && (
          <div
            className="rounded-lg overflow-hidden flex-grow"
            style={{
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              backdropFilter: 'blur(8px)',
              minHeight: 0,
            }}
          >
            <ChatWidget size="mini" maxMessages={10} />
          </div>
        )}

        {/* Sub goal */}
        <div
          className="rounded-lg overflow-hidden flex-shrink-0"
          style={{
            height: '6%',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <SubscriberGoalWidget compact />
        </div>

        {/* Donation goal */}
        <div
          className="rounded-lg overflow-hidden flex-shrink-0"
          style={{
            height: '6%',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <DonationGoalWidget compact />
        </div>
      </div>
    </div>
  );
};
