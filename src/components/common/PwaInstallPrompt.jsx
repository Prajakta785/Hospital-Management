import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user previously dismissed prompt
    const dismissed = localStorage.getItem('apexcare_pwa_dismissed');
    if (dismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    // For Android / Chrome
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // On iOS, show prompt after 3 seconds if not standalone
    if (ios && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('apexcare_pwa_dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="md:hidden fixed top-14 left-3 right-3 z-45 animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-[#022c22] via-[#033b20] to-[#044434] text-white p-3 rounded-2xl shadow-xl border border-emerald-400/40 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/images/logo-icon.png" alt="MedicalCare App" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate flex items-center gap-1">
              <span>MedicalCare Mobile App</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">FREE</span>
            </p>
            <p className="text-[10px] text-emerald-200 truncate">
              {isIos ? (
                <span>Tap <strong>Share ⎋</strong> → <strong>Add to Home Screen ⊞</strong></span>
              ) : (
                <span>Fast full-screen app experience</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isIos && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PwaInstallPrompt;
