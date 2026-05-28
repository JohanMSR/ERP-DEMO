import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'registered', label: 'Registrado' },
  { key: 'verified', label: 'Verificado' },
  { key: 'paid', label: 'Recompensa pagada' },
];

const ORDER = { registered: 0, verified: 1, paid: 2 };

/**
 * Maps status string to furthest pipeline step (API can send pipeline or status).
 */
function normalizePipeline(member) {
  const p = member.pipeline || member.invitee_status || member.referral_status;
  if (p === 'reward_paid' || p === 'paid') return 'paid';
  if (p === 'verified' || p === 'active') return 'verified';
  if (p === 'pending') return 'registered';
  return 'registered';
}

function InviteeStatusTimeline({ member, className = '' }) {
  const current = normalizePipeline(member);
  const idx = ORDER[current] ?? 0;

  return (
    <div className={`flex flex-wrap items-center gap-1 sm:gap-2 ${className}`}>
      {STEPS.map((step, i) => {
        const done = i <= idx;
        const last = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <motion.span
                initial={false}
                animate={{ scale: done ? 1 : 0.95 }}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-gradient-to-br from-success-500 to-emerald-600 text-white shadow-sm'
                    : 'bg-secondary-200 text-secondary-500'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </motion.span>
              <span className={`hidden text-xs font-medium sm:inline ${done ? 'text-secondary-800' : 'text-secondary-400'}`}>
                {step.label}
              </span>
            </div>
            {!last && (
              <div className={`mx-1 h-0.5 w-4 sm:w-6 ${idx > i ? 'bg-success-400' : 'bg-secondary-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default InviteeStatusTimeline;
