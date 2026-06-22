import React, { useEffect, useRef } from 'react';
import { useOverlayStore } from '../store/overlayStore';

interface ChatWidgetProps {
  maxMessages?: number;
  size?: 'mini' | 'normal' | 'large';
}

const BADGE_STYLES: Record<string, string> = {
  sub: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white',
  mod: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
  vip: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ maxMessages = 12, size = 'normal' }) => {
  const chatMessages = useOverlayStore(s => s.chatMessages);
  const viewerCount = useOverlayStore(s => s.viewerCount);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = chatMessages.slice(-maxMessages);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const textSize = size === 'mini' ? 'text-[0.65vw]' : size === 'large' ? 'text-[1vw]' : 'text-[0.8vw]';
  const nameSz = size === 'mini' ? 'text-[0.7vw]' : size === 'large' ? 'text-[0.9vw]' : 'text-[0.8vw]';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-[0.8vw] py-[0.4vw] border-b border-white/5 bg-black/20 flex-shrink-0">
        <span
          className="text-[0.65vw] font-bold tracking-widest uppercase font-display text-[var(--accent-secondary)]"
        >
          💬 LIVE CHAT
        </span>
        <span className="text-[0.6vw] text-[var(--text-secondary)] font-semibold">
          {viewerCount} 👁
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-[0.6vw] flex flex-col gap-[0.5vw] scrollbar-thin"
        style={{ scrollbarWidth: 'none' }}
      >
        {visible.map((msg, i) => (
          <div
            key={msg.id}
            className="flex flex-col gap-[2px] items-start"
            style={{
              animation: i === visible.length - 1 ? 'chatFadeIn 0.3s ease-out' : undefined,
            }}
          >
            <div className="flex items-center gap-[4px] flex-wrap">
              {msg.badge && (
                <span
                  className={`${BADGE_STYLES[msg.badge] ?? ''} px-[3px] py-[1px] rounded text-[0.45vw] font-extrabold uppercase tracking-wider`}
                >
                  {msg.badge.toUpperCase()}
                </span>
              )}
              <span
                className={`${nameSz} font-bold`}
                style={{ color: msg.color ?? 'var(--accent-primary)' }}
              >
                {msg.username}
              </span>
            </div>
            <div
              className={`${textSize} bg-black/20 border border-white/5 text-[var(--text-primary)] rounded-[4px] py-[3px] px-[6px] max-w-[95%] leading-relaxed break-words`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
