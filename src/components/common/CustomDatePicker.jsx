import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CustomDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date...',
  required = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse current date or today
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    setViewDate(today);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const formatDisplay = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val + 'T00:00:00');
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return val;
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs bg-white text-left transition-all cursor-pointer ${
          isOpen
            ? 'border-[#0284c7] ring-2 ring-sky-500/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className={value ? 'font-semibold text-slate-900' : 'text-slate-400'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-[#0284c7]' : 'text-slate-400'}`} />
      </button>

      {/* In-DOM Calendar Popover (Never overflows mobile viewport) */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 sm:right-auto sm:w-72 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150"
          style={{ position: 'absolute' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-800">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayNames.map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`prev-${i}`} className="text-[11px] text-slate-300 py-1.5">
                {prevMonthDays - firstDayIndex + i + 1}
              </span>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(month + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const currentStr = `${year}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === currentStr;
              const isToday =
                new Date().toISOString().slice(0, 10) === currentStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0284c7] text-white font-bold shadow-xs scale-105'
                      : isToday
                      ? 'bg-sky-50 text-[#0284c7] font-bold border border-sky-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[#0284c7] hover:text-[#0369a1] font-bold cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
