import React, { useState, useEffect } from 'react';
import { ADMOB_CONFIG } from './admobConfig';
import { ArrowRight, Shield } from 'lucide-react';

interface AdMobAppOpenProps {
  onDismiss: () => void;
}

export const AdMobAppOpen: React.FC<AdMobAppOpenProps> = ({ onDismiss }) => {
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#11100f] text-[#f4efe6] p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8c8273]">
          <Shield className="w-4 h-4 text-[#c49b63]" />
          <span className="font-semibold text-[#c49b63]">AdMob App Open Ad</span>
          <span>·</span>
          <span className="font-mono text-[10px]">{ADMOB_CONFIG.appOpenAdUnitId}</span>
        </div>

        <button
          onClick={onDismiss}
          className="px-3 py-1 bg-[#24201c] hover:bg-[#332e27] text-xs font-semibold rounded text-[#d6c9b6] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{secondsLeft > 0 ? `Skip (${secondsLeft})` : 'Continue'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Showcase Creative */}
      <div className="max-w-md mx-auto w-full flex flex-col items-center text-center my-auto">
        <div className="w-24 h-24 rounded-3xl wood-board border-2 border-[#b8860b] flex items-center justify-center shadow-2xl mb-6">
          <div className="w-12 h-12 rounded-full stone-black flex items-center justify-center text-amber-200 text-xl font-bold font-serif">
            碁
          </div>
        </div>

        <span className="text-xs uppercase tracking-widest text-[#c49b63] font-semibold mb-2">
          GHOST MOVE GO · KOREAN BADUK
        </span>
        <h2 className="text-2xl font-bold font-display text-[#f5ebd9] mb-3">
          Traditional Baduk Masters Series
        </h2>
        <p className="text-xs text-[#a89b88] leading-relaxed max-w-sm mb-6">
          Experience the pinnacle of strategic Go on 19×19, 13×13, and 9×9 Kaya goban boards with authentic rule verification, AI opponents, and Tsumego challenges.
        </p>

        <div className="w-full bg-[#1c1916] border border-[#2e2923] rounded-xl p-3 text-[11px] text-[#9c907e] space-y-1 mb-6 text-left">
          <div className="flex justify-between">
            <span>Package Name:</span>
            <span className="font-mono text-[#c49b63]">{ADMOB_CONFIG.packageName}</span>
          </div>
          <div className="flex justify-between">
            <span>AdMob App ID:</span>
            <span className="font-mono text-[#c49b63]">{ADMOB_CONFIG.appId}</span>
          </div>
          <div className="flex justify-between">
            <span>Target SDK:</span>
            <span className="font-mono text-[#e3c99f]">Android 16 (API 36)</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3 bg-[#c28e46] hover:bg-[#d69f53] text-[#1a140d] font-bold text-sm rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Enter Goban Arena
        </button>
      </div>

      {/* Footer policy */}
      <div className="text-center text-[10px] text-[#5e564a]">
        Complies with Google Mobile Ads Policy for Cold Start & Resume Triggers
      </div>
    </div>
  );
};
