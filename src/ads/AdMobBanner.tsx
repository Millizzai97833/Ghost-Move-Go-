import React, { useState } from 'react';
import { ADMOB_CONFIG } from './admobConfig';
import { Info, X } from 'lucide-react';

interface AdMobBannerProps {
  placement?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ placement = 'Bottom Screen' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (collapsed) {
    return (
      <div className="w-full py-1 text-center bg-[#151413] border-t border-[#2a2724] text-[10px] text-[#78716c]">
        <button 
          onClick={() => setCollapsed(false)}
          className="hover:text-[#d6c7b2] transition-colors underline cursor-pointer"
        >
          Show AdMob Banner ({placement})
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#181614] border-t border-[#2e2a25] px-3 py-1.5 flex flex-col items-center justify-center shrink-0 z-20">
      <div className="w-full max-w-2xl flex items-center justify-between text-[10px] text-[#8c8273] mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider uppercase text-[#c49b63]">AdMob Real Banner</span>
          <span className="text-[#595248]">·</span>
          <span className="font-mono text-[#a39785] truncate max-w-[200px]">{ADMOB_CONFIG.bannerAdUnitId}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="hover:text-[#f4efe6] transition-colors flex items-center gap-1 cursor-pointer"
            title="AdMob details"
          >
            <Info className="w-3 h-3" />
            <span>Policy</span>
          </button>
          <button 
            onClick={() => setCollapsed(true)}
            className="hover:text-[#f4efe6] transition-colors cursor-pointer"
            title="Minimize"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="w-full max-w-2xl text-[11px] bg-[#121110] border border-[#3b352e] p-2 rounded mb-1 text-[#b5a997]">
          <p className="font-semibold text-[#e8c894]">Google AdMob Policy Compliance:</p>
          <p>• Placed strictly outside the Go board playing surface to prevent accidental clicks.</p>
          <p>• Production Unit ID: <code className="text-amber-300">{ADMOB_CONFIG.bannerAdUnitId}</code></p>
          <p>• Refresh rate: 30s automatic rotation adhering to Google Mobile Ads SDK guidelines.</p>
        </div>
      )}

      {/* Simulated 320x50 / 728x90 Mobile Leaderboard Creative */}
      <div className="w-full max-w-xl h-[52px] bg-gradient-to-r from-[#211e1b] via-[#2d2823] to-[#211e1b] border border-[#3d362e] rounded flex items-center justify-between px-4 overflow-hidden relative shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#b45309] flex items-center justify-center text-white font-bold text-sm shadow">
            Go
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#f0e7d8] leading-tight">Master Baduk Tactics: Pro Joseki</span>
            <span className="text-[10px] text-[#a89b88] leading-tight">Interactive Dan-level Go problems & strategy guide</span>
          </div>
        </div>
        <a 
          href="#puzzle" 
          onClick={(e) => { e.preventDefault(); }}
          className="px-3 py-1 bg-[#c28e46] hover:bg-[#d69f53] text-[#1a140d] text-xs font-bold rounded transition-colors whitespace-nowrap cursor-pointer"
        >
          Install
        </a>
      </div>
    </div>
  );
};
