/**
 * GHOST MOVE GO - Traditional Baduk Rules Engine
 * 100% accurate traditional Go rules:
 * - Group connectivity & liberty calculation
 * - Surrounding capture
 * - Suicide prohibition (strictly checked, allowed only if capturing)
 * - Ko rule enforcement
 * - Territory scoring (Japanese / Korean standard with 6.5 Komi)
 */

import { BoardSize, IntersectionState, Point, ScoreDetails, StoneColor } from './types';

export function createEmptyBoard(size: BoardSize): IntersectionState[][] {
  const board: IntersectionState[][] = [];
  for (let y = 0; y < size; y++) {
    const row: IntersectionState[] = [];
    for (let x = 0; x < size; x++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

export function cloneBoard(board: IntersectionState[][]): IntersectionState[][] {
  return board.map(row => [...row]);
}

export function getAdjacent(point: Point, size: number): Point[] {
  const { x, y } = point;
  const adj: Point[] = [];
  if (x > 0) adj.push({ x: x - 1, y });
  if (x < size - 1) adj.push({ x: x + 1, y });
  if (y > 0) adj.push({ x, y: y - 1 });
  if (y < size - 1) adj.push({ x, y: y + 1 });
  return adj;
}

export function pointEquals(p1: Point | null, p2: Point | null): boolean {
  if (!p1 || !p2) return false;
  return p1.x === p2.x && p1.y === p2.y;
}

export interface GroupResult {
  stones: Point[];
  liberties: Point[];
  libertyCount: number;
}

/**
 * Finds all connected stones of the same color starting at startPoint,
 * along with all unique liberties (empty adjacent intersections).
 */
export function findGroup(board: IntersectionState[][], startPoint: Point): GroupResult {
  const size = board.length;
  const color = board[startPoint.y][startPoint.x];
  if (!color) {
    return { stones: [], liberties: [], libertyCount: 0 };
  }

  const visitedStones: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const visitedLiberties: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const stones: Point[] = [];
  const liberties: Point[] = [];
  const queue: Point[] = [startPoint];
  visitedStones[startPoint.y][startPoint.x] = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    stones.push(curr);

    const neighbors = getAdjacent(curr, size);
    for (const n of neighbors) {
      const neighborColor = board[n.y][n.x];
      if (neighborColor === null) {
        if (!visitedLiberties[n.y][n.x]) {
          visitedLiberties[n.y][n.x] = true;
          liberties.push(n);
        }
      } else if (neighborColor === color) {
        if (!visitedStones[n.y][n.x]) {
          visitedStones[n.y][n.x] = true;
          queue.push(n);
        }
      }
    }
  }

  return {
    stones,
    liberties,
    libertyCount: liberties.length,
  };
}

export interface MoveExecutionResult {
  success: boolean;
  error?: string;
  newBoard: IntersectionState[][];
  capturedStones: Point[];
  newKoPoint: Point | null;
}

/**
 * Validates and executes a Go move.
 * Enforces:
 * 1. Intersection must be empty.
 * 2. Point cannot match active Ko point.
 * 3. Cannot be suicide (unless move immediately captures opponent stones).
 */
export function executeMove(
  board: IntersectionState[][],
  point: Point,
  color: StoneColor,
  koPoint: Point | null
): MoveExecutionResult {
  const size = board.length;
  const { x, y } = point;

  // 1. Boundary check
  if (x < 0 || x >= size || y < 0 || y >= size) {
    return { success: false, error: 'Position out of board bounds', newBoard: board, capturedStones: [], newKoPoint: koPoint };
  }

  // 2. Occupancy check
  if (board[y][x] !== null) {
    return { success: false, error: 'Intersection is already occupied', newBoard: board, capturedStones: [], newKoPoint: koPoint };
  }

  // 3. Ko rule check
  if (koPoint && pointEquals(point, koPoint)) {
    return { success: false, error: 'Ko rule violation: cannot immediately recapture to repeat board state', newBoard: board, capturedStones: [], newKoPoint: koPoint };
  }

  const opponentColor: StoneColor = color === 'BLACK' ? 'WHITE' : 'BLACK';
  const simulatedBoard = cloneBoard(board);
  simulatedBoard[y][x] = color;

  // 4. Check for opponent captures
  const capturedStones: Point[] = [];
  const neighbors = getAdjacent(point, size);
  const checkedGroups: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  for (const n of neighbors) {
    if (simulatedBoard[n.y][n.x] === opponentColor && !checkedGroups[n.y][n.x]) {
      const oppGroup = findGroup(simulatedBoard, n);
      for (const stone of oppGroup.stones) {
        checkedGroups[stone.y][stone.x] = true;
      }
      if (oppGroup.libertyCount === 0) {
        // Group is surrounded and captured!
        for (const stone of oppGroup.stones) {
          capturedStones.push(stone);
          simulatedBoard[stone.y][stone.x] = null;
        }
      }
    }
  }

  // 5. Suicide rule check:
  // After opponent stones are removed, does the newly placed stone's group have at least 1 liberty?
  const myGroup = findGroup(simulatedBoard, point);
  if (myGroup.libertyCount === 0) {
    // Suicide move! Strictly prohibited in traditional Go.
    return { success: false, error: 'Suicide move prohibited: placed stone has zero liberties', newBoard: board, capturedStones: [], newKoPoint: koPoint };
  }

  // 6. Compute new Ko point:
  // Ko occurs when:
  // - Exactly 1 opponent stone was captured
  // - The newly placed group consists of ONLY 1 stone
  // - That placed stone now has exactly 1 liberty (which is the intersection just captured)
  let newKoPoint: Point | null = null;
  if (capturedStones.length === 1 && myGroup.stones.length === 1 && myGroup.libertyCount === 1) {
    newKoPoint = capturedStones[0];
  }

  return {
    success: true,
    newBoard: simulatedBoard,
    capturedStones,
    newKoPoint,
  };
}

/**
 * Checks if a move is valid without applying it permanently
 */
export function isLegalMove(
  board: IntersectionState[][],
  point: Point,
  color: StoneColor,
  koPoint: Point | null
): boolean {
  const res = executeMove(board, point, color, koPoint);
  return res.success;
}

/**
 * Returns all legal moves for a given color
 */
export function getLegalMoves(
  board: IntersectionState[][],
  color: StoneColor,
  koPoint: Point | null
): Point[] {
  const size = board.length;
  const legal: Point[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === null) {
        const pt = { x, y };
        if (isLegalMove(board, pt, color, koPoint)) {
          legal.push(pt);
        }
      }
    }
  }

  return legal;
}

/**
 * Traditional Japanese / Korean territory evaluation.
 * Flood fills all empty intersection territories.
 * A connected empty region touching ONLY Black stones = Black territory.
 * A connected empty region touching ONLY White stones = White territory.
 * Touching both or neither = Dame (neutral, 0 points).
 */
export function calculateTerritory(
  board: IntersectionState[][],
  blackCaptures: number,
  whiteCaptures: number,
  komi: number = 6.5
): ScoreDetails {
  const size = board.length;
  const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const territoryMap: ('BLACK' | 'WHITE' | 'DAME' | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] !== null) {
        territoryMap[y][x] = null;
        continue;
      }

      if (visited[y][x]) continue;

      // Flood-fill this empty region
      const regionPoints: Point[] = [];
      const queue: Point[] = [{ x, y }];
      visited[y][x] = true;

      let touchesBlack = false;
      let touchesWhite = false;

      while (queue.length > 0) {
        const curr = queue.shift()!;
        regionPoints.push(curr);

        const neighbors = getAdjacent(curr, size);
        for (const n of neighbors) {
          const nColor = board[n.y][n.x];
          if (nColor === 'BLACK') {
            touchesBlack = true;
          } else if (nColor === 'WHITE') {
            touchesWhite = true;
          } else if (nColor === null && !visited[n.y][n.x]) {
            visited[n.y][n.x] = true;
            queue.push(n);
          }
        }
      }

      let owner: 'BLACK' | 'WHITE' | 'DAME' = 'DAME';
      if (touchesBlack && !touchesWhite) {
        owner = 'BLACK';
        blackTerritory += regionPoints.length;
      } else if (touchesWhite && !touchesBlack) {
        owner = 'WHITE';
        whiteTerritory += regionPoints.length;
      }

      for (const p of regionPoints) {
        territoryMap[p.y][p.x] = owner;
      }
    }
  }

  const blackTotal = blackTerritory + blackCaptures;
  const whiteTotal = whiteTerritory + whiteCaptures + komi;
  const winner: StoneColor = blackTotal > whiteTotal ? 'BLACK' : 'WHITE';
  const margin = Math.abs(blackTotal - whiteTotal);

  return {
    blackTerritory,
    whiteTerritory,
    blackCaptures,
    whiteCaptures,
    komi,
    blackTotal,
    whiteTotal,
    winner,
    margin: Number(margin.toFixed(1)),
    territoryMap,
  };
}

/**
 * Star points (Hoshi) coordinates for standard Go boards
 */
export function getStarPoints(size: BoardSize): Point[] {
  if (size === 19) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
      { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
      { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
    ];
  } else if (size === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 }, { x: 9, y: 9 },
    ];
  } else {
    // 9x9
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 }, { x: 6, y: 6 },
    ];
  }
}

/**
 * Standard Baduk Board Coordinates (A-T excluding 'I', 1-19)
 */
export function getCoordinateLabel(point: Point, size: number): string {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  const col = letters[point.x] || '?';
  const row = (size - point.y).toString();
  return `${col}${row}`;
}
