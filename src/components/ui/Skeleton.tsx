import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-800/60 border border-zinc-700/30 ${className}`}
    />
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
};
