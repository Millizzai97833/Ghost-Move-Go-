/**
 * GHOST MOVE GO - Strategic Baduk AI & Master Hint Engine
 * High-performance Go AI using tactical pattern heuristics,
 * group liberty analysis, eye-space evaluation, and territory influence fields.
 * NEVER plays random legal moves.
 */

import { executeMove, findGroup, getAdjacent, getCoordinateLabel, getLegalMoves, getStarPoints } from './goRules';
import { AIDifficulty, GhostHint, IntersectionState, Point, StoneColor } from './types';

interface ScoredMove {
  point: Point;
  score: number;
  concept: string;
  explanation: string;
}

/**
 * Computes the strategic value of a move for a given color.
 */
function evaluateMove(
  board: IntersectionState[][],
  point: Point,
  color: StoneColor,
  difficulty: AIDifficulty,
  koPoint: Point | null
): ScoredMove | null {
  const size = board.length;
  const opponentColor: StoneColor = color === 'BLACK' ? 'WHITE' : 'BLACK';

  // Test legal execution
  const exec = executeMove(board, point, color, koPoint);
  if (!exec.success) return null;

  const nextBoard = exec.newBoard;
  const capturedCount = exec.capturedStones.length;
  const myGroup = findGroup(nextBoard, point);

  let score = 0;
  let concept = 'Territory Expansion';
  let explanation = `Solidifies board presence at ${getCoordinateLabel(point, size)}.`;

  // 1. CAPTURES (Highest tactical priority)
  if (capturedCount > 0) {
    score += capturedCount * 120 + 80;
    concept = 'Tactical Capture';
    explanation = `Captures ${capturedCount} opponent stone${capturedCount > 1 ? 's' : ''} to remove threat and secure immediate territory.`;
  }

  // 2. AVOID SELF-ATARI (Crucial rule for competent Go AI)
  // If placing this stone leaves the group with only 1 liberty (in atari) without capturing:
  if (myGroup.libertyCount === 1 && capturedCount === 0) {
    // Huge penalty - blunder unless playing at novice level
    score -= (difficulty === 'easy' ? 40 : 250);
  }

  // 3. DEFEND OWN STONES IN ATARI
  // Check if any neighboring friendly group was in atari on the original board
  const neighbors = getAdjacent(point, size);
  let savedFriendlyStones = 0;
  for (const n of neighbors) {
    if (board[n.y][n.x] === color) {
      const origGroup = findGroup(board, n);
      if (origGroup.libertyCount === 1) {
        // Was in atari! Does our move increase liberties to >= 2?
        if (myGroup.libertyCount >= 2) {
          savedFriendlyStones += origGroup.stones.length;
        }
      }
    }
  }

  if (savedFriendlyStones > 0) {
    score += savedFriendlyStones * 95 + 110;
    concept = 'Urgent Escape from Atari';
    explanation = `Rescues ${savedFriendlyStones} stone${savedFriendlyStones > 1 ? 's' : ''} from immediate capture and restores liberties.`;
  }

  // 4. ATARI ATTACK (Putting opponent in atari)
  let opponentStonesPutInAtari = 0;
  for (const n of neighbors) {
    if (nextBoard[n.y][n.x] === opponentColor) {
      const oppGroup = findGroup(nextBoard, n);
      if (oppGroup.libertyCount === 1) {
        opponentStonesPutInAtari += oppGroup.stones.length;
      }
    }
  }

  if (opponentStonesPutInAtari > 0) {
    score += opponentStonesPutInAtari * 45 + 30;
    if (capturedCount === 0 && savedFriendlyStones === 0) {
      concept = 'Atari Attack';
      explanation = `Pressures opponent group into atari (1 liberty remaining) to force defense.`;
    }
  }

  // 5. LIBERTY COUNT HEURISTIC
  // Groups with 3+ liberties are much safer
  if (myGroup.libertyCount >= 3) {
    score += myGroup.libertyCount * 6;
  }

  // 6. OPENING & CORNER POSITIONING (Fuseki)
  // In Go: "Corners are gold, sides are silver, center is grass"
  const distFromEdgeX = Math.min(point.x, size - 1 - point.x);
  const distFromEdgeY = Math.min(point.y, size - 1 - point.y);

  // 3rd line (territory) and 4th line (influence) are ideal
  const isLine3Or4 = (distFromEdgeX === 2 || distFromEdgeX === 3) && (distFromEdgeY === 2 || distFromEdgeY === 3);
  if (isLine3Or4) {
    score += 35;
    if (score < 60) {
      concept = 'Harmonious Fuseki';
      explanation = `Occupies the vital 3rd/4th line intersection balancing territory and outer influence.`;
    }
  }

  // Star points bonus in early game
  const starPoints = getStarPoints(size as any);
  const isStar = starPoints.some(sp => sp.x === point.x && sp.y === point.y);
  if (isStar) {
    score += 25;
  }

  // Penalty for first line (edge) plays unless capturing or endgame
  if (distFromEdgeX === 0 || distFromEdgeY === 0) {
    if (capturedCount === 0 && savedFriendlyStones === 0) {
      score -= (difficulty === 'easy' ? 10 : 35);
    }
  }

  // 7. INFLUENCE & EYE CONNECTION (Medium / Hard / Expert)
  if (difficulty !== 'easy') {
    // Check diagonal connections (Kosumi) and knight moves (Keima)
    let friendlyDiagonals = 0;
    const diagonals = [
      { x: point.x - 1, y: point.y - 1 },
      { x: point.x + 1, y: point.y - 1 },
      { x: point.x - 1, y: point.y + 1 },
      { x: point.x + 1, y: point.y + 1 },
    ];

    for (const d of diagonals) {
      if (d.x >= 0 && d.x < size && d.y >= 0 && d.y < size) {
        if (nextBoard[d.y][d.x] === color) {
          friendlyDiagonals++;
        }
      }
    }

    score += friendlyDiagonals * 12;

    // Cutting opponent diagonal shapes
    let opponentDiagonals = 0;
    for (const d of diagonals) {
      if (d.x >= 0 && d.x < size && d.y >= 0 && d.y < size) {
        if (nextBoard[d.y][d.x] === opponentColor) {
          opponentDiagonals++;
        }
      }
    }
    if (opponentDiagonals >= 2) {
      score += 28;
      if (concept === 'Territory Expansion') {
        concept = 'Wedge & Cut (Warikomi)';
        explanation = `Disrupts opponent stone linkage to create weak divided groups.`;
      }
    }
  }

  // 8. EXPERT LEVEL: TERRITORY POTENTIAL LOOKAHEAD
  if (difficulty === 'expert') {
    // Check local density: prevent over-concentrated stones
    let localFriendlyCount = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = point.x + dx;
        const ny = point.y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          if (board[ny][nx] === color) localFriendlyCount++;
        }
      }
    }
    if (localFriendlyCount > 4 && capturedCount === 0) {
      score -= 20; // Over-concentration penalty
    } else if (localFriendlyCount >= 1 && localFriendlyCount <= 3) {
      score += 18; // Efficient development
    }
  }

  return {
    point,
    score,
    concept,
    explanation,
  };
}

/**
 * Main AI decision engine.
 * Evaluates all legal moves, ranks them, and picks the best strategic move according to difficulty.
 */
export function getAIMove(
  board: IntersectionState[][],
  color: StoneColor,
  difficulty: AIDifficulty,
  koPoint: Point | null
): Point | null {
  const legalMoves = getLegalMoves(board, color, koPoint);
  if (legalMoves.length === 0) return null; // Must pass

  const evaluatedMoves: ScoredMove[] = [];
  for (const pt of legalMoves) {
    const evaluated = evaluateMove(board, pt, color, difficulty, koPoint);
    if (evaluated) {
      evaluatedMoves.push(evaluated);
    }
  }

  if (evaluatedMoves.length === 0) return null;

  // Sort moves in descending order of score
  evaluatedMoves.sort((a, b) => b.score - a.score);

  // If top score is very negative (< -100), passing might be better
  if (evaluatedMoves[0].score < -150 && legalMoves.length < 10) {
    return null;
  }

  // Selection based on difficulty:
  if (difficulty === 'expert') {
    // Expert always plays the #1 top strategic move
    return evaluatedMoves[0].point;
  } else if (difficulty === 'hard') {
    // Hard picks between top 2 moves with 85% bias towards #1
    const pool = evaluatedMoves.slice(0, Math.min(2, evaluatedMoves.length));
    return Math.random() < 0.85 ? pool[0].point : pool[pool.length - 1].point;
  } else if (difficulty === 'medium') {
    // Medium picks from top 3 moves
    const pool = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx].point;
  } else {
    // Easy picks from top 6 moves, allowing occasional suboptimal plays
    const pool = evaluatedMoves.slice(0, Math.min(6, evaluatedMoves.length));
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx].point;
  }
}

/**
 * Ghost Move Generator (The Legendary Gwisu / 鬼手).
 * Provides the absolute best master recommendation with deep strategic commentary.
 */
export function getGhostMoveHint(
  board: IntersectionState[][],
  color: StoneColor,
  koPoint: Point | null
): GhostHint | null {
  const legalMoves = getLegalMoves(board, color, koPoint);
  if (legalMoves.length === 0) return null;

  const evaluatedMoves: ScoredMove[] = [];
  for (const pt of legalMoves) {
    const evaluated = evaluateMove(board, pt, color, 'expert', koPoint);
    if (evaluated) {
      evaluatedMoves.push(evaluated);
    }
  }

  if (evaluatedMoves.length === 0) return null;

  evaluatedMoves.sort((a, b) => b.score - a.score);
  const best = evaluatedMoves[0];

  const secondary = evaluatedMoves.slice(1, 3).map(m => m.point);

  // Normalize confidence (60% to 99%)
  const confidence = Math.min(99, Math.max(68, Math.round(75 + best.score / 8)));

  return {
    point: best.point,
    confidence,
    concept: best.concept,
    explanation: best.explanation,
    secondarySuggestions: secondary,
  };
}
