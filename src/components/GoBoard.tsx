import React, { useRef, useState } from 'react';
import { BoardSize, IntersectionState, Point, ScoreDetails, StoneColor } from '../engine/types';
import { getCoordinateLabel, getStarPoints } from '../engine/goRules';
import { Eraser, Eye, EyeOff, Sparkles } from 'lucide-react';

interface GoBoardProps {
  size: BoardSize;
  board: IntersectionState[][];
  lastMove: Point | null;
  ghostHintPoint: Point | null;
  turnColor: StoneColor;
  onIntersectionClick: (point: Point) => void;
  disabled?: boolean;
  scoreDetails: ScoreDetails | null;
  onClearBoard?: () => void;
  stoneCount?: number;
}

export const GoBoard: React.FC<GoBoardProps> = ({
  size,
  board,
  lastMove,
  ghostHintPoint,
  turnColor,
  onIntersectionClick,
  disabled = false,
  scoreDetails,
  onClearBoard,
  stoneCount,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const starPoints = getStarPoints(size);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

  // Padding percentage inside the board so stones and coordinates have breathing room
  const marginPercent = size === 19 ? 5.2 : size === 13 ? 6.5 : 8.5;
  const playAreaPercent = 100 - marginPercent * 2;
  const stepPercent = playAreaPercent / (size - 1);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const xRatio = (xPx / rect.width) * 100;
    const yRatio = (yPx / rect.height) * 100;

    const col = Math.round((xRatio - marginPercent) / stepPercent);
    const row = Math.round((yRatio - marginPercent) / stepPercent);

    if (col >= 0 && col < size && row >= 0 && row < size) {
      if (!hoveredPoint || hoveredPoint.x !== col || hoveredPoint.y !== row) {
        setHoveredPoint({ x: col, y: row });
      }
    } else {
      setHoveredPoint(null);
    }
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const handleClick = () => {
    if (disabled || !hoveredPoint) return;
    onIntersectionClick(hoveredPoint);
  };

  const handleClearClick = () => {
    if (!onClearBoard) return;
    if (stoneCount && stoneCount > 0) {
      setShowClearConfirm(true);
    } else {
      onClearBoard();
    }
  };

  const handleConfirmClear = () => {
    setShowClearConfirm(false);
    onClearBoard?.();
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Integrated GoBoard Controls Toolbar */}
      <div className="w-full max-w-[640px] flex items-center justify-between px-2 py-1.5 mb-1.5 bg-[#171513] border border-[#2d2720] rounded-lg text-xs text-[#a89b88]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#f5ebd9] text-[11px] tracking-wide">
            {size}×{size} Goban
          </span>
          {stoneCount !== undefined && (
            <span className="text-[10px] text-[#8c806f] font-mono">
              ({stoneCount} {stoneCount === 1 ? 'stone' : 'stones'})
            </span>
          )}
        </div>

        {/* Board Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Coordinate Toggle */}
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="px-2 py-1 bg-[#221e1a] hover:bg-[#2c2621] text-[#c2b6a3] text-[11px] rounded flex items-center gap-1 transition-colors cursor-pointer"
            title={showCoordinates ? 'Hide Coordinates' : 'Show Coordinates'}
          >
            {showCoordinates ? <Eye className="w-3 h-3 text-[#c28e46]" /> : <EyeOff className="w-3 h-3 text-[#6b6255]" />}
            <span className="hidden sm:inline">Coords</span>
          </button>

          {/* Clear Board for Pattern Study */}
          {onClearBoard && (
            <div className="relative">
              <button
                onClick={handleClearClick}
                disabled={disabled}
                className="px-2.5 py-1 bg-[#26201a] hover:bg-[#382b1d] border border-[#4a3925] text-amber-300 hover:text-amber-200 text-[11px] font-semibold rounded flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                title="Clear all stones to study patterns without starting a new match"
              >
                <Eraser className="w-3.5 h-3.5 text-amber-400" />
                <span>Clear Board</span>
              </button>

              {/* Clear Confirmation Popover */}
              {showClearConfirm && (
                <div className="absolute right-0 top-8 z-40 w-56 p-2.5 bg-[#1f1a15] border border-[#4a3925] rounded-lg shadow-xl text-xs space-y-2">
                  <p className="text-[#f5ebd9] text-[11px] leading-tight">
                    Clear all stones for <strong>pattern study</strong>? Match timer and settings remain active.
                  </p>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2 py-0.5 bg-[#2a241e] hover:bg-[#362e26] text-[10px] text-[#b5a997] rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmClear}
                      className="px-2.5 py-0.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[10px] rounded cursor-pointer"
                    >
                      Clear Stones
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Wooden Goban Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className="wood-board relative rounded-lg border-4 border-[#8c5922] shadow-2xl overflow-hidden cursor-crosshair touch-manipulation transition-all"
        style={{
          width: 'min(92vw, 84vh, 640px)',
          height: 'min(92vw, 84vh, 640px)',
        }}
      >
        {/* Subtle Traditional Dancheong Corner Accents */}
        <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#734316] opacity-40 pointer-events-none" />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[#734316] opacity-40 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[#734316] opacity-40 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#734316] opacity-40 pointer-events-none" />

        {/* Board Coordinate Notation (Letters along top/bottom, numbers along sides) */}
        {showCoordinates && Array.from({ length: size }).map((_, i) => {
          const pos = marginPercent + i * stepPercent;
          return (
            <React.Fragment key={`coord-${i}`}>
              {/* Top Letters */}
              <div
                className="absolute text-[9px] sm:text-[11px] font-mono font-bold text-[#633a10] transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${pos}%`, top: '1.2%' }}
              >
                {letters[i]}
              </div>
              {/* Bottom Letters */}
              <div
                className="absolute text-[9px] sm:text-[11px] font-mono font-bold text-[#633a10] transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${pos}%`, bottom: '1.2%' }}
              >
                {letters[i]}
              </div>
              {/* Left Numbers (19 at top, 1 at bottom) */}
              <div
                className="absolute text-[9px] sm:text-[11px] font-mono font-bold text-[#633a10] transform -translate-y-1/2 pointer-events-none"
                style={{ left: '1.5%', top: `${pos}%` }}
              >
                {size - i}
              </div>
              {/* Right Numbers */}
              <div
                className="absolute text-[9px] sm:text-[11px] font-mono font-bold text-[#633a10] transform -translate-y-1/2 pointer-events-none"
                style={{ right: '1.5%', top: `${pos}%` }}
              >
                {size - i}
              </div>
            </React.Fragment>
          );
        })}

        {/* SVG Grid Lines & Star Points (Exact intersection geometry) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Outer Border Line (thicker) */}
          <rect
            x={`${marginPercent}%`}
            y={`${marginPercent}%`}
            width={`${playAreaPercent}%`}
            height={`${playAreaPercent}%`}
            fill="none"
            stroke="#472608"
            strokeWidth="1.8"
          />

          {/* Vertical and Horizontal Grid Lines */}
          {Array.from({ length: size }).map((_, i) => {
            const p = marginPercent + i * stepPercent;
            return (
              <g key={`lines-${i}`}>
                {/* Vertical Line */}
                <line
                  x1={`${p}%`}
                  y1={`${marginPercent}%`}
                  x2={`${p}%`}
                  y2={`${100 - marginPercent}%`}
                  stroke="#57310e"
                  strokeWidth="1.1"
                />
                {/* Horizontal Line */}
                <line
                  x1={`${marginPercent}%`}
                  y1={`${p}%`}
                  x2={`${100 - marginPercent}%`}
                  y2={`${p}%`}
                  stroke="#57310e"
                  strokeWidth="1.1"
                />
              </g>
            );
          })}

          {/* Star Points (Hoshi) */}
          {starPoints.map((sp, idx) => {
            const cx = marginPercent + sp.x * stepPercent;
            const cy = marginPercent + sp.y * stepPercent;
            return (
              <circle
                key={`star-${idx}`}
                cx={`${cx}%`}
                cy={`${cy}%`}
                r={size === 19 ? '2.5' : '3.2'}
                fill="#361a04"
              />
            );
          })}
        </svg>

        {/* Interactive Intersections, Stones & Highlights */}
        {board.map((row, y) =>
          row.map((stone, x) => {
            const left = marginPercent + x * stepPercent;
            const top = marginPercent + y * stepPercent;
            const isLast = lastMove && lastMove.x === x && lastMove.y === y;
            const isGhost = ghostHintPoint && ghostHintPoint.x === x && ghostHintPoint.y === y;
            const territory = scoreDetails?.territoryMap?.[y]?.[x];

            // Stone diameter based on board size
            const stoneSizePercent = stepPercent * 0.94;

            return (
              <div
                key={`inter-${x}-${y}`}
                className="absolute flex items-center justify-center pointer-events-none"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${stoneSizePercent}%`,
                  height: `${stoneSizePercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Placed Black or White Stone */}
                {stone !== null && (
                  <div
                    className={`w-full h-full rounded-full transition-transform duration-150 flex items-center justify-center relative ${
                      stone === 'BLACK' ? 'stone-black' : 'stone-white'
                    }`}
                  >
                    {/* Last Move Indicator (Red ring or subtle dot) */}
                    {isLast && (
                      <div
                        className={`w-2.5 h-2.5 rounded-full border-2 ${
                          stone === 'BLACK' ? 'border-amber-400 bg-amber-400/30' : 'border-red-600 bg-red-600/30'
                        }`}
                      />
                    )}
                  </div>
                )}

                {/* Ghost Move Hint Highlight */}
                {isGhost && stone === null && (
                  <div
                    className="w-full h-full rounded-full ghost-hint border-2 border-amber-400 bg-amber-400/25 flex items-center justify-center"
                    title="Ghost Move (Gwisu) Vital Intersect"
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-amber-900 font-serif">鬼</span>
                  </div>
                )}

                {/* Territory Marker at Game Over */}
                {scoreDetails && stone === null && territory && (
                  <div
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm shadow-sm ${
                      territory === 'BLACK'
                        ? 'bg-stone-900 border border-stone-600'
                        : territory === 'WHITE'
                        ? 'bg-amber-100 border border-stone-400'
                        : 'bg-amber-700/50'
                    }`}
                  />
                )}

                {/* Hover Preview for Current Turn */}
                {!disabled && stone === null && hoveredPoint && hoveredPoint.x === x && hoveredPoint.y === y && (
                  <div
                    className={`w-full h-full rounded-full opacity-55 scale-90 ${
                      turnColor === 'BLACK' ? 'stone-black' : 'stone-white'
                    }`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
