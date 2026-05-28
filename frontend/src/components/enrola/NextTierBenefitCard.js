import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

function pickNext(totalReferrals) {
  if (totalReferrals >= 5) return null;
  if (totalReferrals === 0) return { title: 'Primer referido', bonus: '+50 pts al primer registro válido', need: 1 };
  if (totalReferrals < 3) return { title: 'Nivel Plata', bonus: 'Cupón 10% extra en el club', need: 3 };
  return { title: 'Nivel Oro', bonus: 'Bono $25 + badge exclusivo', need: 5 };
}

function NextTierBenefitCard({ totalReferrals = 0, className = '' }) {
  const row = pickNext(totalReferrals);
  if (!row) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 shadow-soft dark:border-amber-500/30 dark:from-secondary-900/90 dark:to-secondary-900/70 ${className}`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">¡Nivel Oro!</p>
        <p className="mt-1 font-bold text-secondary-900 dark:text-secondary-100">Has desbloqueado todos los hitos</p>
        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">Sigue invitando para ampliar tu red.</p>
      </motion.div>
    );
  }
  const remaining = Math.max(0, row.need - totalReferrals);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border border-dashed border-secondary-300/80 bg-gradient-to-br from-secondary-100/80 to-secondary-50/50 p-5 shadow-inner dark:border-secondary-600 dark:from-secondary-800/80 dark:to-secondary-900/70 ${className}`}
    >
      <div className="absolute right-3 top-3 opacity-10">
        <Lock className="h-16 w-16 text-secondary-700 dark:text-secondary-500" />
      </div>
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-200/80 text-secondary-600 dark:bg-secondary-700/80 dark:text-secondary-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">Próximo beneficio</p>
          <p className="font-bold text-secondary-900 dark:text-secondary-100">{row.title}</p>
          <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">{row.bonus}</p>
          {remaining > 0 && (
            <p className="mt-2 text-xs font-medium text-orange-600 dark:text-orange-400">
              Faltan {remaining} referido{remaining !== 1 ? 's' : ''} para desbloquear
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default NextTierBenefitCard;
