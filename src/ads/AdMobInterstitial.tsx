import React, { useState, useEffect } from 'react';
import { ADMOB_CONFIG } from './admobConfig';
import { X, ShieldCheck } from 'lucide-react';

interface AdMobInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({
  isOpen,
  onClose,
  reason = 'Match Finished',
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#1c1a17] border border-[#3d362d] rounded-xl overflow-hidden shadow-2xl flex flex-col text-[#f4efe6]">
        {/* Header bar */}
        <div className="bg-[#141210] px-4 py-2.5 flex items-center justify-between border-b border-[#2b2620]">
          <div className="flex items-center gap-2 text-xs text-[#a89c89]">
            <ShieldCheck className="w-4 h-4 text-[#c49b63]" />
            <span className="font-semibold text-[#c49b63]">AdMob Real Interstitial</span>
            <span>·</span>
            <span className="font-mono text-[10px] text-[#7a6f5e]">{ADMOB_CONFIG.interstitialAdUnitId}</span>
          </div>

          {canSkip ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#2e2923] hover:bg-[#3f3830] text-xs font-semibold rounded text-[#f4efe6] transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-mono text-[#8f8372] px-2 py-0.5 bg-[#26221d] rounded">
              Reward in {countdown}s
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c28e46] to-[#80501a] flex items-center justify-center text-3xl font-serif text-[#16120c] font-bold shadow-lg mb-4">
            氣
          </div>

          <h3 className="text-lg font-bold text-[#f5ebd9] mb-1 font-display">
            Korean Baduk Academy Online
          </h3>
          <p className="text-xs text-[#a89b88] mb-4 max-w-xs">
            {reason}: Sharpen your reading skills with thousands of Joseki problems, professional Dan commentaries, and AI game reviews.
          </p>

          <div className="w-full bg-[#24201c] p-3 rounded-lg border border-[#3b342b] mb-4 text-left text-xs space-y-1 text-[#b5aa99]">
            <div className="flex justify-between">
              <span className="text-[#807667]">Trigger Reason:</span>
              <span className="font-medium text-[#e3c99f]">{reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#807667]">Frequency Cap:</span>
              <span className="font-medium text-[#e3c99f]">1 per completed game</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#807667]">Google SDK Target:</span>
              <span className="font-mono text-[10px] text-[#c49b63]">play-services-ads:23.6.0</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#c28e46] hover:bg-[#d69f53] text-[#1a140d] font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Continue to Board
          </button>
        </div>
      </div>
    </div>
  );
};
