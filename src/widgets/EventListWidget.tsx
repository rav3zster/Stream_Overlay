import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

export const EventListWidget: React.FC = () => {
  const latestFollower = useOverlayStore(s => s.latestFollower);
  const latestSubscriber = useOverlayStore(s => s.latestSubscriber);
  const latestDonation = useOverlayStore(s => s.latestDonation);

  return (
    <div className="flex items-center justify-around h-full px-[2vw]" style={{ fontSize: '0.75vw' }}>
      <div className="flex items-center gap-[0.5vw]">
        <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>💜 FOLLOW:</span>
        <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>{latestFollower}</span>
      </div>
      <div className="w-[1px] h-3 opacity-20" style={{ background: 'var(--text-primary)' }} />
      <div className="flex items-center gap-[0.5vw]">
        <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>⭐ SUB:</span>
        <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>{latestSubscriber}</span>
      </div>
      <div className="w-[1px] h-3 opacity-20" style={{ background: 'var(--text-primary)' }} />
      <div className="flex items-center gap-[0.5vw]">
        <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>💰 DONO:</span>
        <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {latestDonation ? `${latestDonation.user} ${latestDonation.amount}` : '—'}
        </span>
      </div>
    </div>
  );
};
