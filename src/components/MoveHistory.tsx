import React from 'react';
import { MoveRecord } from '../engine/types';
import { getCoordinateLabel } from '../engine/goRules';
import { Download, History, SkipBack, SkipForward } from 'lucide-react';

interface MoveHistoryProps {
  history: MoveRecord[];
  currentMoveIndex: number;
  boardSize: number;
  onJumpToMove: (index: number) => void;
  onExportSGF: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  boardSize,
  onJumpToMove,
  onExportSGF,
}) => {
  return (
    <div className="w-full flex flex-col bg-[#191714] border border-[#2e2821] rounded-xl overflow-hidden text-[#f4efe6]">
      {/* Header */}
      <div className="px-3 py-2 bg-[#141210] border-b border-[#29241d] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#e0d6c5]">
          <History className="w-4 h-4 text-[#c28e46]" />
          <span>Move Notation ({history.length})</span>
        </div>
        <button
          onClick={onExportSGF}
          disabled={history.length === 0}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#c28e46] hover:text-amber-300 disabled:opacity-40 transition-colors cursor-pointer"
          title="Export SGF game record"
        >
          <Download className="w-3.5 h-3.5" />
          <span>SGF</span>
        </button>
      </div>

      {/* Notation List */}
      <div className="p-2 max-h-48 overflow-y-auto space-y-1 text-xs">
        {history.length === 0 ? (
          <div className="text-center py-6 text-[11px] text-[#6b6255]">
            No moves played yet. Tap the intersections to begin.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {history.map((m, idx) => {
              const label = m.isPass
                ? 'PASS'
                : m.isResign
                ? 'RESIGN'
                : getCoordinateLabel({ x: m.x, y: m.y }, boardSize);
              const isActive = idx === currentMoveIndex;

              return (
                <button
                  key={`move-${idx}-${m.moveNumber}`}
                  onClick={() => onJumpToMove(idx)}
                  className={`flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#c28e46] text-[#16120c] font-bold'
                      : 'bg-[#221e1a] text-[#b5a997] hover:bg-[#2c2621]'
                  }`}
                >
                  <span className="font-mono text-[#8c806f]">{m.moveNumber}.</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.color === 'BLACK' ? 'bg-stone-900 border border-stone-600' : 'bg-white border border-stone-400'
                      }`}
                    />
                    <span className="font-mono">{label}</span>
                  </div>
                  {m.capturedCount > 0 && (
                    <span className="text-[10px] text-red-400 font-mono">+{m.capturedCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Nav footer */}
      {history.length > 0 && (
        <div className="px-3 py-1.5 bg-[#141210] border-t border-[#29241d] flex items-center justify-between text-xs">
          <button
            onClick={() => onJumpToMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex < 0}
            className="p-1 hover:text-[#c28e46] disabled:opacity-30 cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-[#807667]">
            Move {currentMoveIndex + 1} of {history.length}
          </span>
          <button
            onClick={() => onJumpToMove(Math.min(history.length - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= history.length - 1}
            className="p-1 hover:text-[#c28e46] disabled:opacity-30 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
