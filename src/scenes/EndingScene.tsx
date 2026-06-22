import React from 'react';
import { useOverlayStore } from '../store/overlayStore';
import { SocialWidget } from '../widgets/SocialWidget';
import { FollowerGoalWidget, SubscriberGoalWidget } from '../widgets/GoalWidgets';

export const EndingScene: React.FC = () => {
  const settings = useOverlayStore(s => s.settings);
  const viewerCount = useOverlayStore(s => s.viewerCount);
  const alertHistory = useOverlayStore(s => s.alertHistory);

  const followCount = alertHistory.filter(a => a.type === 'follow').length;
  const subCount = alertHistory.filter(a => a.type === 'subscribe').length;
  const donationCount = alertHistory.filter(a => a.type === 'donation').length;

  return (
    <div className="absolute inset-x-0 top-0 bottom-[32px] z-10 flex flex-col items-center justify-center gap-[2%] p-[4%]">

      {/* Main goodbye card */}
      <div
        className="rounded-2xl text-center px-[4vw] py-[3vw] w-full max-w-[65%] relative overflow-hidden"
        style={{
          background: 'var(--panel-bg)',
          border: '1.5px solid var(--panel-border)',
          boxShadow: 'var(--glow-shadow)',
          animation: 'float 6s ease-in-out infinite',
        }}
      >
        {/* Shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent)' }}
        />

        <div
          className="font-display font-black uppercase tracking-widest mb-[0.8vw]"
          style={{ fontSize: '0.7vw', color: 'var(--accent-secondary)', letterSpacing: '5px' }}
        >
          THAT'S A WRAP
        </div>
        <h1
          className="font-display font-black uppercase leading-tight mb-[1vw]"
          style={{ fontSize: '3vw', color: 'var(--text-primary)', textShadow: 'var(--glow-text)' }}
        >
          Thanks for watching!
        </h1>
        <p style={{ fontSize: '0.85vw', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Huge thank you to everyone who joined tonight! 💜<br />
          Follow & share to never miss a stream from <strong style={{ color: 'var(--text-primary)' }}>{settings.streamerName}</strong>
        </p>

        {/* Session stats */}
        <div
          className="flex justify-center gap-[3vw] mt-[1.5vw] pt-[1vw]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            { label: 'New Followers', value: followCount, icon: '💜' },
            { label: 'New Subs', value: subCount, icon: '⭐' },
            { label: 'Donations', value: donationCount, icon: '💰' },
            { label: 'Viewers', value: viewerCount, icon: '👁' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <span className="block" style={{ fontSize: '1.5vw' }}>{stat.icon}</span>
              <span
                className="block font-display font-black"
                style={{ fontSize: '1.4vw', color: 'var(--accent-primary)', textShadow: 'var(--glow-text)' }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: '0.55vw', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div
        className="rounded-xl overflow-hidden w-full max-w-[65%] flex-shrink-0"
        style={{
          height: '7vw',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
        }}
      >
        <SocialWidget />
      </div>

      {/* Goal recap */}
      <div className="flex gap-[2%] w-full max-w-[65%] flex-shrink-0">
        <div
          className="flex-1 rounded-lg overflow-hidden"
          style={{ height: '5vw', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
        >
          <SubscriberGoalWidget compact />
        </div>
        <div
          className="flex-1 rounded-lg overflow-hidden"
          style={{ height: '5vw', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
        >
          <FollowerGoalWidget compact />
        </div>
      </div>
    </div>
  );
};
