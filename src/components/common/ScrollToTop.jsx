import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Check both window and document scroll
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      if (scrolled > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#071933]/90 hover:bg-[#0284c7] text-white shadow-lg shadow-slate-900/30 backdrop-blur-xs transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group no-print"
      title="Scroll to top"
    >
      <ArrowUp className="w-5 h-5 text-amber-300 group-hover:-translate-y-0.5 transition-transform duration-200" />
    </button>
  );
}
