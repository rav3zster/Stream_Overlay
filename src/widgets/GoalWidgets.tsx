import React from 'react';
import { useOverlayStore } from '../store/overlayStore';

interface GoalWidgetProps {
  type: 'sub' | 'donation' | 'follower';
  compact?: boolean;
}

const GOAL_CONFIG = {
  sub: { label: 'SUBSCRIBER GOAL', icon: '⭐', accentClass: 'from-purple-500 to-pink-500' },
  donation: { label: 'DONATION GOAL', icon: '💰', accentClass: 'from-emerald-400 to-cyan-500' },
  follower: { label: 'FOLLOWER GOAL', icon: '💜', accentClass: 'from-indigo-400 to-purple-600' },
};

export const GoalWidget: React.FC<GoalWidgetProps> = ({ type, compact = false }) => {
  const subGoal = useOverlayStore(s => s.subGoal);
  const donationGoal = useOverlayStore(s => s.donationGoal);
  const followerGoal = useOverlayStore(s => s.followerGoal);

  const goal = type === 'sub' ? subGoal : type === 'donation' ? donationGoal : followerGoal;
  const cfg = GOAL_CONFIG[type];
  const pct = Math.min((goal.current / goal.target) * 100, 100);

  const isDono = type === 'donation';
  const currentStr = isDono ? `$${goal.current}` : goal.current.toString();
  const targetStr = isDono ? `$${goal.target}` : goal.target.toString();

  if (compact) {
    return (
      <div className="flex flex-col justify-center h-full px-[1vw] gap-[0.3vw]">
        <div className="flex justify-between items-center" style={{ fontSize: '0.6vw' }}>
          <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {cfg.icon} {cfg.label}
          </span>
          <span className="font-display font-black text-[var(--accent-secondary)]">
            {currentStr} / {targetStr}
          </span>
        </div>
        <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className={`h-full bg-gradient-to-r ${cfg.accentClass} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%`, boxShadow: '0 0 6px var(--accent-primary-shadow)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full px-[1.2vw] gap-[0.5vw]">
      <div className="flex justify-between items-center" style={{ fontSize: '0.65vw' }}>
        <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {cfg.icon} {cfg.label}
        </span>
        <span className="font-display font-black text-[var(--accent-secondary)]" style={{ fontSize: '0.8vw' }}>
          {currentStr} / {targetStr}
        </span>
      </div>
      <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div
          className={`h-full bg-gradient-to-r ${cfg.accentClass} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, boxShadow: '0 0 8px var(--accent-primary-shadow)' }}
        />
      </div>
      {pct >= 100 && (
        <span className="text-center font-bold text-[var(--accent-secondary)] animate-pulse" style={{ fontSize: '0.6vw' }}>
          🎉 GOAL REACHED!
        </span>
      )}
    </div>
  );
};

export const SubscriberGoalWidget: React.FC<{ compact?: boolean }> = (p) => <GoalWidget type="sub" {...p} />;
export const DonationGoalWidget: React.FC<{ compact?: boolean }> = (p) => <GoalWidget type="donation" {...p} />;
export const FollowerGoalWidget: React.FC<{ compact?: boolean }> = (p) => <GoalWidget type="follower" {...p} />;
