import React from 'react';
import Skeleton from 'react-loading-skeleton';

export function FullPageSkeleton({ titleLines = 2, statCards = 4 }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      <div className="container-premium section-padding px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="card-premium p-8">
          <Skeleton height={28} width="40%" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: titleLines }).map((_, idx) => (
              <Skeleton key={`title-line-${idx}`} height={14} width={idx === 0 ? '70%' : '55%'} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: statCards }).map((_, idx) => (
            <div key={`stat-skeleton-${idx}`} className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton circle height={44} width={44} />
                <Skeleton height={12} width={52} />
              </div>
              <Skeleton height={22} width="50%" />
              <div className="mt-3">
                <Skeleton height={12} width="75%" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          <div className="xl:col-span-2 card-premium p-6 space-y-4">
            <Skeleton height={22} width="35%" />
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`list-skeleton-${idx}`} className="rounded-2xl border border-white/40 dark:border-secondary-700/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <Skeleton circle height={40} width={40} />
                    <div className="w-full space-y-2">
                      <Skeleton height={14} width="38%" />
                      <Skeleton height={12} width="60%" />
                    </div>
                  </div>
                  <Skeleton height={12} width={72} />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="card-premium p-6 space-y-3">
              <Skeleton height={18} width="55%" />
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={`right-col-${idx}`} height={12} width={idx % 2 === 0 ? '95%' : '80%'} />
              ))}
            </div>
            <div className="card-premium p-6 space-y-3">
              <Skeleton height={18} width="45%" />
              <Skeleton height={40} width="100%" />
              <Skeleton height={40} width="100%" />
              <Skeleton height={40} width="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CenteredLoaderSkeleton({ messageWidth = 180 }) {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <Skeleton circle height={64} width={64} />
        <div className="mt-4">
          <Skeleton height={12} width={messageWidth} />
        </div>
      </div>
    </div>
  );
}

export function RewardsViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5 card-premium p-6 space-y-4">
          <Skeleton height={20} width="45%" />
          <Skeleton height={40} width="35%" />
          <Skeleton height={12} width="60%" />
        </div>
        <div className="md:col-span-7 card-premium p-6 space-y-3">
          <Skeleton height={20} width="40%" />
          <Skeleton height={8} width="100%" borderRadius={999} />
          <Skeleton height={12} width="50%" />
        </div>
      </div>
      <div className="card-premium p-6">
        <Skeleton height={22} width="30%" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`reward-card-${idx}`} className="rounded-2xl border border-secondary-200/60 dark:border-secondary-700/50 overflow-hidden">
              <Skeleton height={140} width="100%" borderRadius={0} />
              <div className="p-5 space-y-2">
                <Skeleton height={12} width="90%" />
                <Skeleton height={12} width="55%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
