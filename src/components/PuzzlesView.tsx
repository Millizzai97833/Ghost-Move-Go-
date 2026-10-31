import React, { useState } from 'react';
import { TSUMEGO_PUZZLES } from '../engine/tsumegoPuzzles';
import { TsumegoPuzzle } from '../engine/types';
import { BookOpen, CheckCircle, ChevronRight, HelpCircle, RotateCcw } from 'lucide-react';

interface PuzzlesViewProps {
  onSelectPuzzle: (puzzle: TsumegoPuzzle) => void;
  activePuzzleId: string | null;
  puzzleStatus: { [id: string]: 'solved' | 'failed' | 'in_progress' };
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  onSelectPuzzle,
  activePuzzleId,
  puzzleStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Life & Death', 'Snapback', "Crane's Nest", 'Semeai'];

  const filtered = selectedCategory === 'All'
    ? TSUMEGO_PUZZLES
    : TSUMEGO_PUZZLES.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full flex flex-col bg-[#191714] border border-[#2e2821] rounded-xl overflow-hidden text-[#f4efe6]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#141210] border-b border-[#29241d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#c28e46]" />
          <h3 className="font-bold text-sm text-[#f5ebd9] font-display">Tsumego Practice Puzzles (묘수풀이)</h3>
        </div>
        <div className="text-xs text-[#8c806f]">
          Master classic tactical motifs: Two Eyes, Snapback, Nets, Semeai
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-2 bg-[#171512] border-b border-[#29241d] overflow-x-auto text-xs">
        {categories.map((cat) => (
          <button
            key={`cat-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#c28e46] text-[#16120c]'
                : 'text-[#8f8372] hover:text-[#f4efe6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Puzzle Cards Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto">
        {filtered.map((puzzle) => {
          const status = puzzleStatus[puzzle.id];
          const isSelected = activePuzzleId === puzzle.id;

          return (
            <div
              key={puzzle.id}
              onClick={() => onSelectPuzzle(puzzle)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#2a241b] border-[#c28e46] shadow-md ring-1 ring-[#c28e46]/40'
                  : 'bg-[#211d19] border-[#362f26] hover:bg-[#28231e]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-semibold text-[#c28e46] uppercase tracking-wider">
                    {puzzle.category} · {puzzle.difficulty}
                  </span>
                  {status === 'solved' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      Solved
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-[#f5ebd9] leading-snug mb-0.5">
                  {puzzle.title}
                </h4>
                <div className="text-[10px] text-[#8c806f] font-serif mb-1.5">
                  {puzzle.koreanTitle}
                </div>
                <p className="text-[11px] text-[#a89b88] line-clamp-2">
                  {puzzle.objective}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#312a22] text-[10px] text-[#807667]">
                <span>Board: {puzzle.size}×{puzzle.size}</span>
                <span className="flex items-center gap-1 text-[#c28e46] font-semibold">
                  Solve Now
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
