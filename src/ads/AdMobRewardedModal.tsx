import React, { useState, useEffect } from 'react';
import { ADMOB_CONFIG } from './admobConfig';
import { Sparkles, X, Gift } from 'lucide-react';

interface AdMobRewardedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCountdown(5);
      setRewardClaimed(false);
      return;
    }
  }, [isOpen]);

  const handleStartWatch = () => {
    setIsPlaying(true);
    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRewardClaimed(true);
          onRewardGranted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#1c1a17] border border-[#3d362d] rounded-xl overflow-hidden shadow-2xl flex flex-col text-[#f4efe6]">
        {/* Header bar */}
        <div className="bg-[#141210] px-4 py-2.5 flex items-center justify-between border-b border-[#2b2620]">
          <div className="flex items-center gap-2 text-xs text-[#a89c89]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-400">Rewarded Ghost Move</span>
            <span>·</span>
            <span className="font-mono text-[10px] text-[#7a6f5e]">{ADMOB_CONFIG.rewardedInterstitialAdUnitId}</span>
          </div>

          <button
            onClick={onClose}
            className="text-[#8f8372] hover:text-[#f4efe6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content */}
        {!isPlaying ? (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 mb-4 shadow">
              <Gift className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-[#f5ebd9] mb-1 font-display">
              Unlock Master Ghost Move (Gwisu)
            </h3>
            <p className="text-xs text-[#a89b88] mb-5 max-w-sm">
              Watch a quick 5-second video sponsor to reveal the highest-rated tactical master move with strategic commentary on the board.
            </p>

            <div className="w-full bg-[#24201c] p-3 rounded-lg border border-[#3b342b] mb-5 text-left text-xs space-y-1.5 text-[#b5aa99]">
              <div className="flex justify-between items-center">
                <span className="text-[#807667]">AdMob Ad Unit:</span>
                <span className="font-mono text-[10px] text-[#c49b63]">Rewarded Interstitial</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#807667]">Policy Rule:</span>
                <span className="text-[#a3e635]">100% User Opt-in Only</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#807667]">Reward Granted:</span>
                <span className="text-amber-300 font-semibold">Ghost Hint + Vital Coordinate</span>
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#2a2621] hover:bg-[#38322c] text-[#c4baa8] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                No Thanks
              </button>
              <button
                onClick={handleStartWatch}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Watch for Hint</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center text-center">
            {rewardClaimed ? (
              <div className="space-y-4 py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-300 mb-1">Reward Granted!</h4>
                  <p className="text-xs text-[#a89b88]">
                    Ghost Move recommendation is now active on your Go board.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  View Ghost Move on Goban
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-4 w-full">
                <div className="w-full h-36 bg-[#121110] border border-[#3d362e] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2e261a] to-[#12100e] opacity-60" />
                  <span className="text-xs text-amber-400 font-semibold relative z-10 uppercase tracking-widest">
                    Sponsored Message
                  </span>
                  <span className="text-sm font-bold text-[#f5ebd9] relative z-10 mt-1">
                    Korean Baduk Federation Championship
                  </span>
                  <span className="text-[11px] text-[#8c8273] relative z-10 mt-1 font-mono">
                    Official AdMob Stream
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8f8372]">
                  <span>Completing ad requirement...</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{countdown}s</span>
                </div>

                <div className="w-full bg-[#26221d] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
