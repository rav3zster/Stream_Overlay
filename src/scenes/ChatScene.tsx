import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { VtuberWidget } from '../widgets/VtuberWidget';
import { ChatWidget } from '../widgets/ChatWidget';
import { MusicWidget } from '../widgets/MusicWidget';
import { SubscriberGoalWidget, FollowerGoalWidget } from '../widgets/GoalWidgets';
import { EventListWidget } from '../widgets/EventListWidget';
import { AlertsWidget } from '../widgets/AlertsWidget';

export const ChatScene: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);
  const showAvatar = useOverlayStore(s => s.showAvatar);
  const showChat = useOverlayStore(s => s.showChat);

  return (
    <div className="absolute inset-x-0 top-0 bottom-[32px] z-10 flex gap-[1%] p-[1.5%]">

      {/* Left: VTuber avatar */}
      {showAvatar && (
        <div
          className="rounded-xl overflow-hidden flex-shrink-0"
          style={{
            width: '40%',
            background: 'var(--panel-bg)',
            border: '1.5px solid var(--panel-border)',
            boxShadow: 'var(--glow-shadow)',
          }}
        >
          <VtuberWidget size="large" />
        </div>
      )}

      {/* Right: info + chat + goals */}
      <div className="flex-grow flex flex-col gap-[1%] min-w-0">

        {/* Event bar */}
        <div
          className="rounded-lg overflow-hidden flex-shrink-0"
          style={{
            height: '8%',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <EventListWidget />
        </div>

        {/* Header */}
        <div
          className="rounded-xl p-[1vw] flex-shrink-0"
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <h2
            className="font-display font-black"
            style={{ fontSize: '1.1vw', color: 'var(--text-primary)', textShadow: 'var(--glow-text)' }}
          >
            {settings.streamTitle}
          </h2>
          <p style={{ fontSize: '0.7vw', color: 'var(--text-secondary)', marginTop: '0.2vw' }}>
            Just Chatting with {settings.streamerName}
          </p>
        </div>

        {/* Chat */}
        {showChat && (
          <div
            className="rounded-xl overflow-hidden flex-grow"
            style={{
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              minHeight: 0,
            }}
          >
            <ChatWidget maxMessages={14} />
          </div>
        )}

        {/* Goal bars row */}
        <div className="flex gap-[1%] flex-shrink-0">
          <div
            className="flex-1 rounded-lg overflow-hidden"
            style={{ height: '5vw', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
          >
            <SubscriberGoalWidget />
          </div>
          <div
            className="flex-1 rounded-lg overflow-hidden"
            style={{ height: '5vw', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
          >
            <FollowerGoalWidget />
          </div>
        </div>

        {/* Music */}
        <div
          className="rounded-lg overflow-hidden flex-shrink-0"
          style={{
            height: '4.5vw',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <MusicWidget compact />
        </div>
      </div>

      <AlertsWidget />
    </div>
  );
};
