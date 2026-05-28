import React from 'react';

function PageHeader({ title, subtitle, action, icon: Icon, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-glow">
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-secondary-100">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-secondary-600 dark:text-secondary-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default PageHeader;
