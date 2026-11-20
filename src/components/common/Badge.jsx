import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }) {
  const variants = {
    success: 'bg-sky-50 text-sky-800 border-sky-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-300'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-medium ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
