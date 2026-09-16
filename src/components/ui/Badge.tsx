import React from 'react';

interface BadgeProps {
  variant?: 'purple' | 'green' | 'amber' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'purple', children, className = '' }) => {
  const styles = {
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]',
    green: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    red: 'bg-red-950/60 text-red-300 border-red-500/40',
    blue: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    gray: 'bg-zinc-900 text-zinc-400 border-zinc-700/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border whitespace-nowrap ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
