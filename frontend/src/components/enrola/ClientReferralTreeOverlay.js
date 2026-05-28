import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, UserIcon, ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GitBranch } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

function ReferralPersonRow({ username, email, variant = 'referral' }) {
  const isRoot = variant === 'root';

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left backdrop-blur-sm ${
        isRoot
          ? 'border-orange-300/70 bg-orange-50/75 dark:border-orange-700/40 dark:bg-orange-950/40'
          : 'border-white/50 bg-white/55 dark:border-secondary-600/60 dark:bg-secondary-800/55'
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isRoot
            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
            : 'bg-secondary-100/90 text-secondary-600 dark:bg-secondary-700/90 dark:text-secondary-300'
        }`}
      >
        <UserIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-secondary-900 dark:text-secondary-100">
          {username}
        </p>
        {email && (
          <p className="truncate text-xs text-secondary-500 dark:text-secondary-400">{email}</p>
        )}
      </div>
    </div>
  );
}

function ClientReferralTreeOverlay({ clientUsername, tree, loading, onClose }) {
  const root = tree?.root;
  const directReferrals = tree?.direct_referrals ?? [];
  const directCount = tree?.direct_referrals_count ?? directReferrals.length;
  const hasReferrals = directReferrals.length > 0;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Direct referrals for ${clientUsername}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex h-full max-h-full min-h-0 flex-col overflow-hidden rounded-[inherit]"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/35 backdrop-blur-2xl backdrop-saturate-150 dark:bg-secondary-900/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/60 dark:ring-white/10"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col p-4">
        <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-600 backdrop-blur-sm dark:bg-orange-500/25 dark:text-orange-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-secondary-900 dark:text-secondary-100">
                Direct referrals
              </h4>
              <p className="truncate text-xs text-secondary-600 dark:text-secondary-400">
                {clientUsername}
                {!loading && (
                  <span className="text-secondary-500">
                    {' '}
                    · {directCount} direct referral{directCount === 1 ? '' : 's'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg bg-white/40 p-1.5 text-secondary-600 backdrop-blur-sm transition-colors hover:bg-white/70 hover:text-secondary-900 dark:bg-secondary-800/50 dark:text-secondary-300 dark:hover:bg-secondary-700/70 dark:hover:text-secondary-100"
            aria-label="Close referral tree"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="h-full min-h-0 overflow-y-auto overscroll-contain scroll-smooth pr-1">
            {loading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <LoadingSpinner size="default" message="" />
              </div>
            ) : !hasReferrals ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-secondary-300/60 bg-white/30 px-4 text-center backdrop-blur-sm dark:border-secondary-600/60 dark:bg-secondary-800/30">
                <GitBranch className="mb-2 h-8 w-8 text-secondary-400 dark:text-secondary-500" />
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  No direct referrals yet
                </p>
                <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                  Only people who signed up directly through this client are shown here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-1">
                <ReferralPersonRow
                  username={root?.username || clientUsername}
                  email={root?.email}
                  variant="root"
                />

                <div className="flex justify-center py-0.5" aria-hidden>
                  <ChevronDownIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>

                <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
                  Direct referrals
                </p>

                <ul className="space-y-2">
                  {directReferrals.map((referral) => (
                    <li key={referral.id} className="list-none">
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon
                          className="h-4 w-4 shrink-0 text-orange-500 dark:text-orange-400"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <ReferralPersonRow
                            username={referral.username}
                            email={referral.email}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {hasReferrals && !loading && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/50 to-transparent dark:from-secondary-900/50"
              aria-hidden
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ClientReferralTreeOverlay;
