import React, { useState } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

interface InstallPwaBannerProps {
  onInstall: () => void;
  canInstall: boolean;
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ onInstall, canInstall }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#1B0B07] via-[#2E140B] to-[#E4022D] text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top duration-300 border-b border-[#EACB85]/30">
      <div className="flex items-center space-x-3 max-w-3xl">
        <div className="p-1.5 rounded-full bg-white/15 text-[#EACB85]">
          <Smartphone className="w-4 h-4 text-[#EACB85]" />
        </div>
        <div>
          <span className="font-bold text-white">Install Morde QA Mobile PWA:</span>{' '}
          <span className="text-[#FDFBF7]/90 hidden sm:inline text-xs">
            Add to your plant mobile device for direct camera capture &amp; offline lab result buffering.
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onInstall}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-[#FAF3E3] text-[#1B0B07] font-bold rounded-full text-xs shadow transition border border-[#EACB85]/40"
        >
          <Download className="w-3.5 h-3.5 text-[#E4022D]" />
          <span>Install App</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-white/70 hover:text-white rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
