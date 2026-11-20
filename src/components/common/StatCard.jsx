import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function AnimatedCounter({ value, duration = 800 }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue(value);
      return;
    }

    const valStr = String(value).trim();
    const match = valStr.match(/^([^\d.-]*)([\d,]+(?:\.\d+)?)(.*)$/);

    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || '';
    const numPart = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetNum = parseFloat(numPart);

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const hasComma = match[2].includes(',');
    const hasDecimal = numPart.includes('.');
    const decimalPlaces = hasDecimal ? numPart.split('.')[1].length : 0;

    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = targetNum * easeProgress;

      let formattedCurrent;
      if (hasDecimal) {
        formattedCurrent = current.toFixed(decimalPlaces);
      } else {
        formattedCurrent = Math.round(current).toString();
      }

      if (hasComma) {
        const parts = formattedCurrent.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formattedCurrent = parts.join('.');
      }

      setDisplayValue(`${prefix}${formattedCurrent}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(valStr);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export function StatCard({
  title,
  shortTitle,
  value,
  icon: Icon,
  change,
  trend = 'up',
  subtitle,
  color = 'blue',
  className = ''
}) {
  const colorStyles = {
    emerald: {
      bg: 'bg-sky-50 text-sky-800 border-sky-100',
      iconBg: 'bg-[#0284c7] text-white',
      border: 'border-sky-100/80 hover:border-sky-300'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-800 border-amber-100',
      iconBg: 'bg-amber-600 text-amber-50',
      border: 'border-amber-100/80 hover:border-amber-300'
    },
    blue: {
      bg: 'bg-sky-50 text-[#071933] border-sky-100',
      iconBg: 'bg-[#071933] text-white',
      border: 'border-sky-100/80 hover:border-sky-300'
    },
    purple: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-100',
      iconBg: 'bg-indigo-600 text-indigo-50',
      border: 'border-indigo-100/80 hover:border-indigo-300'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-2 sm:p-4 lg:p-5 border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.border} ${className} flex flex-col justify-between`}
    >
      {/* Decorative subtle ambient corner glow */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-slate-100/70 group-hover:scale-150 transition-transform duration-500 ease-out" />

      {/* MOBILE COMPACT VIEW (< sm) - 100% visible, zero truncation, high elegance */}
      <div className="sm:hidden relative z-10 flex flex-col justify-between h-full">
        {/* Top: Icon + Status Trend Badge */}
        <div className="flex items-center justify-between gap-1">
          <div className={`p-1.5 rounded-lg shadow-xs shrink-0 ${style.iconBg}`}>
            {Icon && <Icon className="w-3.5 h-3.5" />}
          </div>
          {change && (
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[8.5px] shrink-0 truncate max-w-[62px] ${
                trend === 'up' ? 'text-[#0284c7] bg-sky-50' : 'text-rose-700 bg-rose-50'
              }`}
            >
              <span className="truncate">{change}</span>
            </span>
          )}
        </div>

        {/* Center & Bottom: Value + Short Label */}
        <div className="mt-1.5">
          <h4 className="text-base font-extrabold text-slate-900 tracking-tight font-display leading-tight truncate">
            <AnimatedCounter value={value} />
          </h4>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tight text-slate-600 truncate" title={title}>
            {shortTitle || title}
          </p>
        </div>
      </div>

      {/* TABLET & DESKTOP VIEW (>= sm) - Classic Spacious Design */}
      <div className="hidden sm:block relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate" title={title}>
              {title}
            </p>
            <h4 className="mt-1 text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              <AnimatedCounter value={value} />
            </h4>
          </div>
          <div className={`p-2.5 lg:p-3 rounded-xl shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${style.iconBg}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
        </div>

        {(change || subtitle) && (
          <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
            {change && (
              <span
                className={`inline-flex items-center font-bold px-2 py-0.5 rounded transition-colors text-[11px] shrink-0 ${
                  trend === 'up' ? 'text-[#0284c7] bg-sky-50' : 'text-rose-700 bg-rose-50'
                }`}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1 shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 shrink-0" />
                )}
                <span>{change}</span>
              </span>
            )}
            {subtitle && (
              <span className="text-slate-400 text-[11px] font-medium truncate text-right">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
