import React from 'react';
import { motion } from 'framer-motion';

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`empty-state-panel flex flex-col items-center text-center ${compact ? 'px-4 py-10' : 'px-6 py-14'} ${className}`}
    >
      {Icon && (
        <div className="relative mb-5">
          <div className="absolute inset-0 animate-pulse rounded-full bg-orange-200/30 blur-2xl dark:bg-orange-500/15" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-glow">
            <Icon className="h-10 w-10 text-white" strokeWidth={1.25} />
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 sm:text-xl">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary-600 dark:text-secondary-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;
