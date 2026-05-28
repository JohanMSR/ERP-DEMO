import React from 'react';
import { motion } from 'framer-motion';
import { Award, Medal, Crown } from 'lucide-react';

const TIERS = [
  { key: 'bronze', label: 'Bronce', referrals: 1, Icon: Award, color: 'from-amber-700 to-amber-600' },
  { key: 'silver', label: 'Plata', referrals: 3, Icon: Medal, color: 'from-slate-400 to-slate-500' },
  { key: 'gold', label: 'Oro', referrals: 5, Icon: Crown, color: 'from-yellow-500 to-amber-500' },
];

/**
 * Progress stepper: milestones for referral counts (gamification).
 */
function ReferralTierStepper({ totalReferrals = 0, className = '' }) {
  const maxTier = TIERS[TIERS.length - 1];
  const progress = Math.min(totalReferrals / maxTier.referrals, 1);

  return (
    <div className={`rounded-3xl border border-white/40 bg-white/60 p-5 sm:p-6 shadow-soft backdrop-blur-sm ${className}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Tu progreso</p>
          <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">Refiere para subir de nivel</h3>
          <p className="text-sm text-secondary-600">
            {totalReferrals} referido{totalReferrals !== 1 ? 's' : ''} · meta Oro: {maxTier.referrals}
          </p>
        </div>
      </div>

      <div className="relative mb-8 px-1">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary-200" />
        <motion.div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="relative flex justify-between">
          {TIERS.map((tier, i) => {
            const reached = totalReferrals >= tier.referrals;
            const Icon = tier.Icon;
            return (
              <div key={tier.key} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 * i }}
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-2 shadow-md ${
                    reached
                      ? `bg-gradient-to-br ${tier.color} border-white text-white`
                      : 'border-secondary-200 bg-white text-secondary-400 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-500'
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </motion.div>
                <span className={`mt-2 text-center text-xs font-semibold ${reached ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-400'}`}>
                  {tier.label}
                </span>
                <span className="text-2xs text-secondary-500 dark:text-secondary-400">{tier.referrals} ref.</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ReferralTierStepper;
