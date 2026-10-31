/**
 * GHOST MOVE GO - Traditional Korean Baduk Strategy Board Game
 * Developer: Shahab Millizai | Package: com.pixelfork.g.game
 * Version: 1.3 (3) | Target SDK: 36
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BoardSize, 
  GameMode, 
  IntersectionState, 
  MoveRecord, 
  Point, 
  ScoreDetails, 
  StoneColor, 
  AIDifficulty, 
  GhostHint, 
  TsumegoPuzzle 
} from './engine/types';
import { 
  calculateTerritory, 
  createEmptyBoard, 
  executeMove, 
  getCoordinateLabel, 
  pointEquals 
} from './engine/goRules';
import { getAIMove, getGhostMoveHint } from './engine/goAI';
import { TSUMEGO_PUZZLES } from './engine/tsumegoPuzzles';
import { sounds } from './engine/soundEffects';
import { GoBoard } from './components/GoBoard';
import { HUD } from './components/HUD';
import { MoveHistory } from './components/MoveHistory';
import { PuzzlesView } from './components/PuzzlesView';
import { TutorialView } from './components/TutorialView';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { AdMobBanner } from './ads/AdMobBanner';
import { AdMobInterstitial } from './ads/AdMobInterstitial';
import { AdMobRewardedModal } from './ads/AdMobRewardedModal';
import { AdMobAppOpen } from './ads/AdMobAppOpen';
import { 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  Calendar, 
  BookOpen, 
  Smartphone, 
  Flame, 
  X,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'board' | 'puzzles' | 'daily' | 'tutorial' | 'android'>('board');

  // Game Configuration
  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('hard');

  // Board State
  const [board, setBoard] = useState<IntersectionState[][]>(() => createEmptyBoard(19));
  const [turnColor, setTurnColor] = useState<StoneColor>('BLACK');
  const [koPoint, setKoPoint] = useState<Point | null>(null);
  const [blackCaptures, setBlackCaptures] = useState(0);
  const [whiteCaptures, setWhiteCaptures] = useState(0);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [resignedColor, setResignedColor] = useState<StoneColor | null>(null);

  // History & Move Nav
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [historyBoards, setHistoryBoards] = useState<IntersectionState[][][]>([createEmptyBoard(19)]);
  const [viewingMoveIndex, setViewingMoveIndex] = useState(-1);

  // AI & Hints
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeGhostHint, setActiveGhostHint] = useState<GhostHint | null>(null);
  const [ghostHintPoint, setGhostHintPoint] = useState<Point | null>(null);

  // Timer & Sound
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Puzzles
  const [activePuzzle, setActivePuzzle] = useState<TsumegoPuzzle | null>(null);
  const [puzzleStatus, setPuzzleStatus] = useState<{ [id: string]: 'solved' | 'failed' | 'in_progress' }>({});
  const [puzzleFeedback, setPuzzleFeedback] = useState<string | null>(null);

  // Daily Challenge
  const [dailyStreak, setDailyStreak] = useState(3);
  const [dailySolved, setDailySolved] = useState(false);

  // AdMob presentation states
  const [showAppOpenAd, setShowAppOpenAd] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [showRewardedModal, setShowRewardedModal] = useState(false);

  // Initialize sound mute preference
  useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Start new game
  const resetGame = (newSize: BoardSize = boardSize, newMode: GameMode = gameMode) => {
    setBoardSize(newSize);
    setGameMode(newMode);
    const empty = createEmptyBoard(newSize);
    setBoard(empty);
    setHistoryBoards([empty]);
    setTurnColor('BLACK');
    setKoPoint(null);
    setBlackCaptures(0);
    setWhiteCaptures(0);
    setLastMove(null);
    setConsecutivePasses(0);
    setIsGameOver(false);
    setScoreDetails(null);
    setResignedColor(null);
    setHistory([]);
    setViewingMoveIndex(-1);
    setActiveGhostHint(null);
    setGhostHintPoint(null);
    setTimerSeconds(0);
    sounds.playGong();
  };

  // Change board size
  const handleSelectBoardSize = (size: BoardSize) => {
    resetGame(size, gameMode);
  };

  // Handle Stone Placement on Intersection
  const handleIntersectionClick = (point: Point) => {
    if (isGameOver || isAiThinking) return;

    // In AI mode, player only plays Black
    if (gameMode === 'ai' && turnColor !== 'BLACK') return;

    // If viewing past history, branch forward
    if (viewingMoveIndex >= 0 && viewingMoveIndex < history.length - 1) {
      setBoard(historyBoards[historyBoards.length - 1]);
      setViewingMoveIndex(-1);
    }

    // If in puzzle mode
    if (activeTab === 'puzzles' && activePuzzle) {
      handlePuzzleMove(point);
      return;
    }

    const exec = executeMove(board, point, turnColor, koPoint);
    if (!exec.success) {
      // Inadmissible move (e.g. suicide, occupied, ko)
      return;
    }

    // Valid move!
    sounds.playStoneClack();
    if (exec.capturedStones.length > 0) {
      sounds.playCapture();
    }

    const nextBoard = exec.newBoard;
    const newBlackCaptures = turnColor === 'BLACK' ? blackCaptures + exec.capturedStones.length : blackCaptures;
    const newWhiteCaptures = turnColor === 'WHITE' ? whiteCaptures + exec.capturedStones.length : whiteCaptures;

    const moveRec = {
      x: point.x,
      y: point.y,
      color: turnColor,
      capturedCount: exec.capturedStones.length,
      capturedPoints: exec.capturedStones,
      timestamp: Date.now(),
    };

    setBoard(nextBoard);
    setHistory(prev => [...prev, { ...moveRec, moveNumber: prev.length + 1 }]);
    setHistoryBoards(prev => [...prev, nextBoard]);
    setViewingMoveIndex(-1);
    setLastMove(point);
    setKoPoint(exec.newKoPoint);
    setConsecutivePasses(0);
    setGhostHintPoint(null);
    setActiveGhostHint(null);

    if (turnColor === 'BLACK') {
      setBlackCaptures(newBlackCaptures);
      setTurnColor('WHITE');

      // Trigger AI turn if in AI mode
      if (gameMode === 'ai') {
        setIsAiThinking(true);
        setTimeout(() => {
          makeAIMove(nextBoard, exec.newKoPoint, newBlackCaptures, newWhiteCaptures);
        }, 420);
      }
    } else {
      setWhiteCaptures(newWhiteCaptures);
      setTurnColor('BLACK');
    }
  };

  // AI Turn Execution
  const makeAIMove = (
    currentBoard: IntersectionState[][],
    currentKo: Point | null,
    currentBlackCaps: number,
    currentWhiteCaps: number
  ) => {
    const aiMove = getAIMove(currentBoard, 'WHITE', aiDifficulty, currentKo);

    if (!aiMove) {
      // AI chooses to pass
      sounds.playStoneClack();
      const moveRec = {
        x: -1,
        y: -1,
        color: 'WHITE' as const,
        capturedCount: 0,
        isPass: true,
        timestamp: Date.now(),
      };
      setHistory(prev => [...prev, { ...moveRec, moveNumber: prev.length + 1 }]);
      setTurnColor('BLACK');
      setIsAiThinking(false);

      if (consecutivePasses >= 1) {
        // Two consecutive passes -> End of Game!
        endGameWithScoring(currentBoard, currentBlackCaps, currentWhiteCaps);
      } else {
        setConsecutivePasses(c => c + 1);
      }
      return;
    }

    const exec = executeMove(currentBoard, aiMove, 'WHITE', currentKo);
    if (exec.success) {
      sounds.playStoneClack();
      if (exec.capturedStones.length > 0) {
        sounds.playCapture();
      }

      const nextBoard = exec.newBoard;
      const updatedWhiteCaps = currentWhiteCaps + exec.capturedStones.length;

      const moveRec = {
        x: aiMove.x,
        y: aiMove.y,
        color: 'WHITE' as const,
        capturedCount: exec.capturedStones.length,
        capturedPoints: exec.capturedStones,
        timestamp: Date.now(),
      };

      setBoard(nextBoard);
      setHistory(prev => [...prev, { ...moveRec, moveNumber: prev.length + 1 }]);
      setHistoryBoards(prev => [...prev, nextBoard]);
      setWhiteCaptures(updatedWhiteCaps);
      setLastMove(aiMove);
      setKoPoint(exec.newKoPoint);
      setConsecutivePasses(0);
      setTurnColor('BLACK');
    }

    setIsAiThinking(false);
  };

  // Pass Move
  const handlePass = () => {
    if (isGameOver || isAiThinking) return;

    sounds.playStoneClack();
    const moveRec = {
      x: -1,
      y: -1,
      color: turnColor,
      capturedCount: 0,
      isPass: true,
      timestamp: Date.now(),
    };

    setHistory(prev => [...prev, { ...moveRec, moveNumber: prev.length + 1 }]);
    const newPassCount = consecutivePasses + 1;
    setConsecutivePasses(newPassCount);

    if (newPassCount >= 2) {
      endGameWithScoring(board, blackCaptures, whiteCaptures);
      return;
    }

    if (turnColor === 'BLACK') {
      setTurnColor('WHITE');
      if (gameMode === 'ai') {
        setIsAiThinking(true);
        setTimeout(() => {
          makeAIMove(board, koPoint, blackCaptures, whiteCaptures);
        }, 400);
      }
    } else {
      setTurnColor('BLACK');
    }
  };

  // Resign Move
  const handleResign = () => {
    if (isGameOver || isAiThinking) return;
    setResignedColor(turnColor);
    setIsGameOver(true);
    sounds.playVictory();
    // Trigger AdMob Interstitial ad after game completion
    setTimeout(() => {
      setShowInterstitialAd(true);
    }, 600);
  };

  // End Game & Territory Count
  const endGameWithScoring = (finalBoard: IntersectionState[][], bCaps: number, wCaps: number) => {
    const score = calculateTerritory(finalBoard, bCaps, wCaps, 6.5);
    setScoreDetails(score);
    setIsGameOver(true);
    sounds.playVictory();
    // Trigger AdMob Interstitial ad
    setTimeout(() => {
      setShowInterstitialAd(true);
    }, 600);
  };

  // Undo (Available in practice / local games)
  const handleUndo = () => {
    if (history.length === 0 || isAiThinking) return;

    // In AI mode, undo both the AI's last move and player's move
    const undoSteps = gameMode === 'ai' ? 2 : 1;
    const targetLength = Math.max(0, history.length - undoSteps);

    const newHistory = history.slice(0, targetLength);
    const newBoards = historyBoards.slice(0, targetLength + 1);
    const targetBoard = newBoards[newBoards.length - 1];

    setHistory(newHistory);
    setHistoryBoards(newBoards);
    setBoard(targetBoard);
    setTurnColor('BLACK');
    setLastMove(newHistory.length > 0 ? { x: newHistory[newHistory.length - 1].x, y: newHistory[newHistory.length - 1].y } : null);
    setGhostHintPoint(null);
    setActiveGhostHint(null);
    setIsGameOver(false);
    setScoreDetails(null);
  };

  // Clear Board for Pattern Study without starting a new match
  const handleClearBoard = () => {
    if (isAiThinking) return;
    const empty = createEmptyBoard(boardSize);
    setBoard(empty);
    setHistoryBoards([empty]);
    setHistory([]);
    setViewingMoveIndex(-1);
    setTurnColor('BLACK');
    setLastMove(null);
    setKoPoint(null);
    setConsecutivePasses(0);
    setIsGameOver(false);
    setScoreDetails(null);
    setResignedColor(null);
    setActiveGhostHint(null);
    setGhostHintPoint(null);
    sounds.playCapture();
  };

  // Trigger Ghost Move Hint (Prompts user with opt-in Rewarded Ad)
  const handleTriggerGhostHint = () => {
    if (isGameOver || isAiThinking) return;
    setShowRewardedModal(true);
  };

  // Reward Granted from AdMob
  const handleRewardGranted = () => {
    sounds.playGhostHint();
    const hint = getGhostMoveHint(board, turnColor, koPoint);
    if (hint) {
      setActiveGhostHint(hint);
      setGhostHintPoint(hint.point);
    }
  };

  // Jump to specific move in history viewer
  const handleJumpToMove = (index: number) => {
    if (index < 0) {
      setBoard(historyBoards[0]);
      setViewingMoveIndex(-1);
      return;
    }
    if (index < historyBoards.length - 1) {
      setBoard(historyBoards[index + 1]);
      setViewingMoveIndex(index);
    } else {
      setBoard(historyBoards[historyBoards.length - 1]);
      setViewingMoveIndex(-1);
    }
  };

  // SGF Export
  const handleExportSGF = () => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'];
    let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[GhostMoveGo:1.3]SZ[${boardSize}]KM[6.5]RU[Japanese]PW[White]PB[Black]\n`;

    for (const m of history) {
      const colorChar = m.color === 'BLACK' ? 'B' : 'W';
      if (m.isPass) {
        sgf += `;${colorChar}[]`;
      } else {
        const col = letters[m.x] || 'a';
        const row = letters[m.y] || 'a';
        sgf += `;${colorChar}[${col}${row}]`;
      }
    }
    sgf += ')';

    const blob = new Blob([sgf], { type: 'application/x-go-sgf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GhostMoveGo_Match_${Date.now()}.sgf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tsumego Puzzle selection & interaction
  const handleSelectPuzzle = (puzzle: TsumegoPuzzle) => {
    setActivePuzzle(puzzle);
    setActiveTab('puzzles');
    setBoardSize(puzzle.size);
    setPuzzleFeedback(null);

    // Initialize board with puzzle setup
    const newBoard = createEmptyBoard(puzzle.size);
    for (const item of puzzle.initialBoard) {
      newBoard[item.point.y][item.point.x] = item.color;
    }

    setBoard(newBoard);
    setTurnColor(puzzle.playerColor);
    setLastMove(null);
    setGhostHintPoint(null);
    setActiveGhostHint(null);
  };

  const handlePuzzleMove = (point: Point) => {
    if (!activePuzzle) return;

    sounds.playStoneClack();
    const sol = activePuzzle.solutionTree;

    if (pointEquals(point, sol.point)) {
      // Correct Move!
      const exec = executeMove(board, point, activePuzzle.playerColor, null);
      if (exec.success) {
        setBoard(exec.newBoard);
        setLastMove(point);

        if (sol.opponentResponse) {
          // Play opponent response
          setTimeout(() => {
            const oppPoint = sol.opponentResponse!.point;
            const oppExec = executeMove(exec.newBoard, oppPoint, activePuzzle.playerColor === 'BLACK' ? 'WHITE' : 'BLACK', null);
            if (oppExec.success) {
              setBoard(oppExec.newBoard);
              setLastMove(oppPoint);
              sounds.playStoneClack();
            }
          }, 350);
        }

        sounds.playVictory();
        setPuzzleStatus(prev => ({ ...prev, [activePuzzle.id]: 'solved' }));
        setPuzzleFeedback(sol.message || 'Brilliant move! You solved this Tsumego problem.');
      }
    } else {
      // Suboptimal move
      setPuzzleFeedback('Incorrect response. The stones remain vulnerable. Tap Retry to try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4efe6] flex flex-col justify-between selection:bg-[#c28e46] selection:text-[#121110]">
      {/* Top Application Bar */}
      <header className="w-full bg-[#171513] border-b border-[#2d2720] px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg wood-board border border-[#a36f2b] flex items-center justify-center text-sm font-bold font-serif text-[#121110] shadow">
            碁
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#f5ebd9] font-display whitespace-nowrap">
              GHOST MOVE GO
            </span>
            <span className="text-[10px] text-[#8c806f] font-mono leading-none">
              com.pixelfork.g.game · v1.3
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs overflow-x-auto py-0.5">
          {[
            { id: 'board', label: 'Goban Play' },
            { id: 'puzzles', label: 'Tsumego' },
            { id: 'daily', label: 'Daily Task' },
            { id: 'tutorial', label: 'Academy' },
            { id: 'android', label: 'Android APK' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#c28e46] text-[#16120c] shadow-sm'
                  : 'text-[#a39785] hover:text-[#f4efe6] hover:bg-[#211d19]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Sound & Reset Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              sounds.setMuted(next);
            }}
            className="p-1.5 rounded-lg bg-[#211d19] border border-[#332b22] text-[#a39785] hover:text-[#f4efe6] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => resetGame(boardSize, gameMode)}
            className="px-3 py-1.5 bg-[#26211b] hover:bg-[#362e26] border border-[#3d3429] text-[#e0d6c5] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Match</span>
          </button>
        </div>
      </header>

      {/* Main Body Content Container */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col items-center p-2 sm:p-4">
        {/* VIEW 1: MAIN GOBAN BOARD */}
        {activeTab === 'board' && (
          <div className="w-full flex flex-col items-center">
            {/* Game Mode Selector Bar */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-2 px-1 text-xs text-[#8c806f]">
              <div className="flex items-center gap-1 bg-[#1a1714] p-1 rounded-lg border border-[#2b251e]">
                <button
                  onClick={() => resetGame(boardSize, 'ai')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    gameMode === 'ai' ? 'bg-[#c28e46] text-[#16120c]' : 'text-[#8c806f] hover:text-[#f4efe6]'
                  }`}
                >
                  Vs AI Master
                </button>
                <button
                  onClick={() => resetGame(boardSize, 'pvp')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    gameMode === 'pvp' ? 'bg-[#c28e46] text-[#16120c]' : 'text-[#8c806f] hover:text-[#f4efe6]'
                  }`}
                >
                  2-Player Local
                </button>
              </div>

              <div className="text-[11px] text-[#807667]">
                Komi: <strong className="text-[#e8c894]">6.5 pts</strong> for White · Traditional Korean Rule
              </div>
            </div>

            {/* Game HUD (Captures, Turn, Pass, Resign, Undo, Hint) */}
            <HUD
              gameMode={gameMode}
              boardSize={boardSize}
              onSelectBoardSize={handleSelectBoardSize}
              turnColor={turnColor}
              blackCaptures={blackCaptures}
              whiteCaptures={whiteCaptures}
              timerSeconds={timerSeconds}
              isAiThinking={isAiThinking}
              aiDifficulty={aiDifficulty}
              onSelectDifficulty={setAiDifficulty}
              onPass={handlePass}
              onResign={handleResign}
              onUndo={handleUndo}
              onTriggerGhostHint={handleTriggerGhostHint}
              canUndo={history.length > 0}
              isMuted={isMuted}
              onToggleMute={() => {
                const next = !isMuted;
                setIsMuted(next);
                sounds.setMuted(next);
              }}
              consecutivePasses={consecutivePasses}
              onClearBoard={handleClearBoard}
            />

            {/* Ghost Hint Strategic Banner (If active) */}
            {activeGhostHint && (
              <div className="w-full max-w-4xl mt-2 p-3 bg-gradient-to-r from-[#2a2217] via-[#211a12] to-[#2a2217] border border-amber-600/40 rounded-xl flex items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 font-display">
                        Ghost Move: {activeGhostHint.concept}
                      </span>
                      <span className="font-mono text-[11px] text-[#e8c894] bg-[#382b18] px-1.5 py-0.5 rounded">
                        {getCoordinateLabel(activeGhostHint.point, boardSize)}
                      </span>
                      <span className="text-[10px] text-amber-400/80">({activeGhostHint.confidence}% Confidence)</span>
                    </div>
                    <p className="text-[#c7baa7] text-[11px] mt-0.5">
                      {activeGhostHint.explanation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveGhostHint(null);
                    setGhostHintPoint(null);
                  }}
                  className="text-[#8c806f] hover:text-[#f4efe6] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Center Area: Goban Board + Side Notation Layout */}
            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 mt-2">
              {/* Go Board */}
              <GoBoard
                size={boardSize}
                board={board}
                lastMove={lastMove}
                ghostHintPoint={ghostHintPoint}
                turnColor={turnColor}
                onIntersectionClick={handleIntersectionClick}
                disabled={isGameOver || isAiThinking}
                scoreDetails={scoreDetails}
                onClearBoard={handleClearBoard}
                stoneCount={board.reduce((acc, row) => acc + row.filter(cell => cell !== null).length, 0)}
              />

              {/* Side History & Notation Panel */}
              <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
                <MoveHistory
                  history={history}
                  currentMoveIndex={viewingMoveIndex >= 0 ? viewingMoveIndex : history.length - 1}
                  boardSize={boardSize}
                  onJumpToMove={handleJumpToMove}
                  onExportSGF={handleExportSGF}
                />

                {/* Tactical Tips Card */}
                <div className="p-3 bg-[#191714] border border-[#2e2821] rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#e0d6c5]">
                    <Info className="w-4 h-4 text-[#c28e46]" />
                    <span>Korean Baduk Etiquette</span>
                  </div>
                  <p className="text-[11px] text-[#a89b88] leading-relaxed">
                    Place stones firmly with middle and index finger. Two passes conclude the game for territory counting (계가).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TSUMEGO PRACTICE PUZZLES */}
        {activeTab === 'puzzles' && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-4">
            <PuzzlesView
              onSelectPuzzle={handleSelectPuzzle}
              activePuzzleId={activePuzzle?.id || null}
              puzzleStatus={puzzleStatus}
            />

            {/* If a puzzle is active, render interactive board */}
            {activePuzzle && (
              <div className="w-full flex flex-col items-center p-3 bg-[#191714] border border-[#2e2821] rounded-xl">
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#2b251e] text-xs">
                  <div>
                    <span className="font-bold text-[#f5ebd9] text-sm">{activePuzzle.title}</span>
                    <span className="text-[#8c806f] ml-2 font-serif">({activePuzzle.koreanTitle})</span>
                  </div>
                  <button
                    onClick={() => handleSelectPuzzle(activePuzzle)}
                    className="px-2.5 py-1 bg-[#26211b] hover:bg-[#362e26] rounded text-xs text-[#d6c9b6] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Puzzle</span>
                  </button>
                </div>

                {puzzleFeedback && (
                  <div className="w-full mb-3 p-2.5 rounded bg-[#241f18] border border-amber-600/40 text-xs text-amber-300">
                    {puzzleFeedback}
                  </div>
                )}

                <GoBoard
                  size={activePuzzle.size}
                  board={board}
                  lastMove={lastMove}
                  ghostHintPoint={ghostHintPoint}
                  turnColor={turnColor}
                  onIntersectionClick={handleIntersectionClick}
                  scoreDetails={null}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: DAILY CHALLENGE */}
        {activeTab === 'daily' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="w-full p-6 bg-[#191714] border border-[#2e2821] rounded-xl text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 mb-3 shadow">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#f5ebd9] font-display mb-1">
                Daily Baduk Master Challenge
              </h3>
              <p className="text-xs text-[#a89b88] mb-4 max-w-md mx-auto">
                Solve today's hand-crafted Life & Death scenario. Maintain your streak to earn Dan ranking trophies.
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#211d19] rounded-lg border border-[#332b22] text-xs">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-[#a89b88]">Active Streak:</span>
                  <span className="font-bold text-[#f4efe6]">{dailyStreak} Days</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#211d19] rounded-lg border border-[#332b22] text-xs">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-[#a89b88]">Status:</span>
                  <span className="font-bold text-emerald-400">
                    {dailySolved ? 'Completed' : 'Available'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPuzzle(TSUMEGO_PUZZLES[0])}
                className="px-6 py-2.5 bg-[#c28e46] hover:bg-[#d69f53] text-[#16120c] font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Launch Today's Tsumego Challenge
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: BADUK ACADEMY TUTORIAL */}
        {activeTab === 'tutorial' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <TutorialView />
          </div>
        )}

        {/* VIEW 5: ANDROID PROJECT & APK DOWNLOAD HUB */}
        {activeTab === 'android' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <AndroidProjectHub />
          </div>
        )}
      </main>

      {/* Real AdMob Banner (Strictly placed outside playing board) */}
      <AdMobBanner placement="Applet Footer" />

      {/* GAME OVER DIALOG */}
      {isGameOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1a17] border border-[#3d362d] rounded-xl overflow-hidden shadow-2xl p-6 text-center text-[#f4efe6]">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#c28e46] to-[#80501a] flex items-center justify-center text-3xl font-serif text-[#16120c] font-bold shadow-lg mb-3">
              完
            </div>

            <h3 className="text-xl font-bold font-display text-[#f5ebd9] mb-1">
              Match Concluded (계가 종료)
            </h3>

            {resignedColor ? (
              <p className="text-xs text-[#a89b88] mb-4">
                {resignedColor === 'BLACK' ? 'Black (흑)' : 'White (백)'} resigned. Victory belongs to{' '}
                <strong className="text-amber-300">
                  {resignedColor === 'BLACK' ? 'White (백)' : 'Black (흑)'}
                </strong>
                .
              </p>
            ) : scoreDetails ? (
              <div className="my-4 p-3 bg-[#221e1a] border border-[#362f26] rounded-lg text-left text-xs space-y-1.5 text-[#b5aa99]">
                <div className="flex justify-between">
                  <span>Black Territory + Captures:</span>
                  <span className="font-mono text-[#f4efe6] font-bold">
                    {scoreDetails.blackTerritory} + {scoreDetails.blackCaptures} = {scoreDetails.blackTotal} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>White Territory + Captures + 6.5 Komi:</span>
                  <span className="font-mono text-[#f4efe6] font-bold">
                    {scoreDetails.whiteTerritory} + {scoreDetails.whiteCaptures} + 6.5 = {scoreDetails.whiteTotal} pts
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#312b23] text-sm font-bold text-amber-300">
                  <span>Winner:</span>
                  <span>
                    {scoreDetails.winner === 'BLACK' ? 'Black (흑)' : 'White (백)'} by {scoreDetails.margin} pts
                  </span>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsGameOver(false);
                }}
                className="flex-1 py-2.5 bg-[#2a2621] hover:bg-[#38322c] text-[#c4baa8] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Inspect Goban
              </button>
              <button
                onClick={() => resetGame(boardSize, gameMode)}
                className="flex-1 py-2.5 bg-[#c28e46] hover:bg-[#d69f53] text-[#16120c] font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMOB OVERLAYS */}
      <AdMobInterstitial
        isOpen={showInterstitialAd}
        onClose={() => setShowInterstitialAd(false)}
        reason="Match Finished"
      />

      <AdMobRewardedModal
        isOpen={showRewardedModal}
        onClose={() => setShowRewardedModal(false)}
        onRewardGranted={handleRewardGranted}
      />

      {showAppOpenAd && (
        <AdMobAppOpen onDismiss={() => setShowAppOpenAd(false)} />
      )}
    </div>
  );
}
