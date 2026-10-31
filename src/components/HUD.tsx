import React from 'react';
import { AIDifficulty, BoardSize, GameMode, StoneColor } from '../engine/types';
import { Volume2, VolumeX, RotateCcw, Flag, Sparkles, Play, Eraser } from 'lucide-react';

interface HUDProps {
  gameMode: GameMode;
  boardSize: BoardSize;
  onSelectBoardSize: (size: BoardSize) => void;
  turnColor: StoneColor;
  blackCaptures: number;
  whiteCaptures: number;
  timerSeconds: number;
  isAiThinking: boolean;
  aiDifficulty: AIDifficulty;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  onPass: () => void;
  onResign: () => void;
  onUndo: () => void;
  onTriggerGhostHint: () => void;
  canUndo: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  consecutivePasses: number;
  onClearBoard?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameMode,
  boardSize,
  onSelectBoardSize,
  turnColor,
  blackCaptures,
  whiteCaptures,
  timerSeconds,
  isAiThinking,
  aiDifficulty,
  onSelectDifficulty,
  onPass,
  onResign,
  onUndo,
  onTriggerGhostHint,
  canUndo,
  isMuted,
  onToggleMute,
  consecutivePasses,
  onClearBoard,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-2.5 px-3 py-2 bg-[#171513] border-b border-[#2d2720] text-[#f4efe6]">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Board Size Selector */}
        <div className="flex items-center gap-1.5 bg-[#211d19] p-1 rounded-lg border border-[#362f26]">
          <span className="text-[#8c806f] px-1 text-[11px] font-medium">Goban:</span>
          {([19, 13, 9] as BoardSize[]).map((s) => (
            <button
              key={`size-${s}`}
              onClick={() => onSelectBoardSize(s)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                boardSize === s
                  ? 'bg-[#c28e46] text-[#16120c] shadow-sm'
                  : 'text-[#a39785] hover:text-[#f4efe6]'
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>

        {/* AI Difficulty Selector (When in AI mode) */}
        {gameMode === 'ai' && (
          <div className="flex items-center gap-1.5 bg-[#211d19] p-1 rounded-lg border border-[#362f26]">
            <span className="text-[#8c806f] px-1 text-[11px] font-medium">AI Dan:</span>
            {(['easy', 'medium', 'hard', 'expert'] as AIDifficulty[]).map((d) => (
              <button
                key={`diff-${d}`}
                onClick={() => onSelectDifficulty(d)}
                className={`px-2 py-1 rounded text-[11px] capitalize font-medium transition-all cursor-pointer ${
                  aiDifficulty === d
                    ? 'bg-[#c28e46] text-[#16120c] font-bold'
                    : 'text-[#8c806f] hover:text-[#f4efe6]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Sound & Timer */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="font-mono text-sm text-[#e8c894] bg-[#211d19] px-2.5 py-1 rounded border border-[#362f26]">
            {formatTime(timerSeconds)}
          </div>
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-[#211d19] border border-[#362f26] text-[#a39785] hover:text-[#f4efe6] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Players & Stone Status Bar */}
      <div className="grid grid-cols-2 gap-3">
        {/* Black Player Card */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            turnColor === 'BLACK'
              ? 'bg-[#262019] border-[#c28e46] shadow-md ring-1 ring-[#c28e46]/40'
              : 'bg-[#1a1714] border-[#2e2821] opacity-75'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full stone-black border border-stone-700 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#f5ebd9]">Black (흑)</span>
                {gameMode === 'ai' && <span className="text-[10px] text-[#9c907e]">(Player)</span>}
              </div>
              <div className="text-[11px] text-[#8c806f]">
                Captured: <span className="font-mono font-bold text-[#e8c894]">{blackCaptures}</span>
              </div>
            </div>
          </div>
          {turnColor === 'BLACK' && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c28e46] bg-[#332719] px-2 py-0.5 rounded">
              Turn
            </span>
          )}
        </div>

        {/* White Player Card */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            turnColor === 'WHITE'
              ? 'bg-[#262019] border-[#c28e46] shadow-md ring-1 ring-[#c28e46]/40'
              : 'bg-[#1a1714] border-[#2e2821] opacity-75'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full stone-white border border-stone-400 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#f5ebd9]">White (백)</span>
                {gameMode === 'ai' && (
                  <span className="text-[10px] text-[#9c907e]">
                    ({isAiThinking ? 'Thinking...' : `AI ${aiDifficulty}`})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#8c806f]">
                Captured: <span className="font-mono font-bold text-[#e8c894]">{whiteCaptures}</span>
                <span className="ml-1 text-[9px] text-[#6b6255]">+6.5 Komi</span>
              </div>
            </div>
          </div>
          {turnColor === 'WHITE' && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c28e46] bg-[#332719] px-2 py-0.5 rounded">
              {isAiThinking ? '...' : 'Turn'}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#29231c]">
        <div className="flex items-center gap-2">
          {/* Pass Button */}
          <button
            onClick={onPass}
            disabled={isAiThinking}
            className="px-3 py-1.5 bg-[#26211b] hover:bg-[#362e26] disabled:opacity-50 text-[#e0d6c5] text-xs font-semibold rounded-lg border border-[#3d3429] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Pass {consecutivePasses > 0 && `(1/2)`}</span>
          </button>

          {/* Resign Button */}
          <button
            onClick={onResign}
            disabled={isAiThinking}
            className="px-3 py-1.5 bg-[#26211b] hover:bg-red-950/40 text-red-300 hover:text-red-200 text-xs font-semibold rounded-lg border border-[#3d3429] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Resign</span>
          </button>

          {/* Undo Button (For practice / local) */}
          <button
            onClick={onUndo}
            disabled={!canUndo || isAiThinking}
            className="px-3 py-1.5 bg-[#26211b] hover:bg-[#362e26] disabled:opacity-40 disabled:cursor-not-allowed text-[#c2b6a3] text-xs font-semibold rounded-lg border border-[#3d3429] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Undo move (local practice)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          {/* Clear Board for Pattern Study */}
          {onClearBoard && (
            <button
              onClick={onClearBoard}
              disabled={isAiThinking}
              className="px-3 py-1.5 bg-[#26211b] hover:bg-[#382b1d] text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-lg border border-[#4a3925] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Clear stones for pattern study without starting a new match"
            >
              <Eraser className="w-3.5 h-3.5 text-amber-400" />
              <span>Clear (Study)</span>
            </button>
          )}
        </div>

        {/* Ghost Move Hint Button */}
        <button
          onClick={onTriggerGhostHint}
          disabled={isAiThinking}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-700/80 to-amber-600/80 hover:from-amber-600 hover:to-amber-500 text-amber-100 text-xs font-bold rounded-lg border border-amber-500/40 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ghost Move (Hint)</span>
        </button>
      </div>
    </div>
  );
};
