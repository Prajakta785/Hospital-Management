import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  Smartphone,
  ShieldCheck,
  Globe,
  ArrowRight
} from 'lucide-react';

export function QrRegistrationModal({ isOpen, onClose, onOpenDirectForm }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Permanent, fixed, static Cloud URL - Works universally on any mobile phone (Mobile Data Jio/Airtel or Wi-Fi)
  const registrationUrl = 'https://hospital-management-system-swart-nu.vercel.app/register-qr';

  // Generate iOS Vision / Apple Camera & Android fully compatible permanent QR Code
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(registrationUrl, {
      width: 360,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000', // Pure optical black for instant iOS / Android Camera detection
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR Code:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'MedicalCare-Patient-Registration-QR.png';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#022119] via-[#022c22] to-[#033b20] px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Fast QR Patient Registration</h3>
              <p className="text-xs text-emerald-200">नवीन नोंदणी किंवा आधीचा Patient ID वापरून थेट चेक-इन</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 text-center">
          
          <div className="mb-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Universal Cloud QR (Android &amp; iOS Ready)</span>
          </div>
          
          {/* iOS / Android Camera Compatible QR Box */}
          <div className="inline-block p-2 bg-white rounded-2xl border-2 border-emerald-200 shadow-md mb-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Patient Registration QR Code - iOS and Android Ready"
                className="w-56 h-56 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Form URL Direct Link */}
          <div className="mb-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-left">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                🌐 Live Cloud Registration Link:
              </span>
              <a
                href={registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-bold text-emerald-700 hover:underline truncate block"
              >
                {registrationUrl}
              </a>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* 1-Click Direct Form Open Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenDirectForm) onOpenDirectForm();
              else window.location.href = '/register-qr';
            }}
            className="w-full py-3 px-4 mb-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
            <span>याच स्क्रीनवर थेट फॉर्म उघडा (Open Form Directly)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Link Copied!' : 'Copy Form URL'}</span>
            </button>
            <button
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Save High-Res QR</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            iOS 12-18 &amp; Android Compatible • Instant Camera Scan
          </span>
        </div>
      </div>
    </div>
  );
}

export default QrRegistrationModal;
