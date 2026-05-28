import React from 'react';
import { GiftIcon } from '@heroicons/react/24/outline';
import { getRewardCardTheme } from '../utils/rewardCardTheme';

function RewardCardVisual({ reward, className = '' }) {
  const theme = getRewardCardTheme(reward);
  const title = reward?.name || 'Reward';
  const isLightText =
    theme.label === 'Silver' || theme.label === 'Platinum';

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: theme.gradient }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-10 h-48 w-48 rounded-full opacity-15"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 9px)',
        }}
      />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <div
          className="h-8 w-11 rounded-md shadow-inner"
          style={{ backgroundColor: theme.chip }}
        />
        <GiftIcon
          className="h-5 w-5 opacity-70"
          style={{ color: isLightText ? '#334155' : theme.accent }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span
          className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] opacity-80"
          style={{ color: isLightText ? '#334155' : theme.accent }}
        >
          {theme.label}
        </span>
        <p
          className="max-w-[90%] text-lg font-bold leading-snug sm:text-xl"
          style={{
            color: isLightText ? '#1e293b' : '#ffffff',
            textShadow: isLightText
              ? 'none'
              : '0 2px 12px rgba(0,0,0,0.25)',
          }}
        >
          {title}
        </p>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 opacity-30"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
        }}
      />
    </div>
  );
}

export default RewardCardVisual;
