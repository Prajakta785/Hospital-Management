import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = '-- Select an option --',
  required = false,
  searchable = true,
  disabled = false,
  className = '',
  buttonClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Normalize options to { value, label, sublabel }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label || opt.name || opt.title || String(opt.value !== undefined ? opt.value : opt.id),
        sublabel: opt.sublabel || opt.specialty || opt.mrn || ''
      };
    }
    return { value: opt, label: String(opt), sublabel: '' };
  });

  const selectedOption = normalizedOptions.find(o => String(o.value) === String(value));

  // Filter options if searchable
  const filteredOptions = normalizedOptions.filter(o => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (o.label && o.label.toLowerCase().includes(term)) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(term))
    );
  });

  // Handle outside click
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

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className || 'w-full'}`} ref={dropdownRef}>
      {label && (
        <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs bg-white text-left transition-all cursor-pointer ${
          isOpen
            ? 'border-[#059669] ring-2 ring-emerald-500/20'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <span className={`truncate pr-2 ${selectedOption ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? (
            <>
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="text-[10px] text-slate-500 font-normal ml-1.5 opacity-80">
                  ({selectedOption.sublabel})
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#059669]' : ''}`} />
      </button>

      {/* In-DOM Popover Dropdown (Never overflows outside mobile viewport) */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{ position: 'absolute' }}
        >
          {searchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#059669]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-52 divide-y divide-slate-50 p-1 pr-1.5 dropdown-scroll">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">No matching options found.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-[10px] text-slate-400 truncate">{opt.sublabel}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#059669] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
