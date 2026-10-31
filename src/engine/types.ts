/**
 * GHOST MOVE GO - Types & Interfaces
 * Traditional Korean Baduk / Go Strategy Board Game
 * Developer: Shahab Millizai | Package: com.pixelfork.g.game
 */

export type BoardSize = 9 | 13 | 19;

export type StoneColor = 'BLACK' | 'WHITE';

export type IntersectionState = StoneColor | null;

export interface Point {
  x: number;
  y: number;
}

export interface MoveRecord {
  moveNumber: number;
  x: number;
  y: number;
  color: StoneColor;
  capturedCount: number;
  capturedPoints?: Point[];
  isPass?: boolean;
  isResign?: boolean;
  timestamp: number;
  comment?: string;
}

export type GameMode = 'ai' | 'pvp' | 'puzzle' | 'daily' | 'training';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ScoreDetails {
  blackTerritory: number;
  whiteTerritory: number;
  blackCaptures: number;
  whiteCaptures: number;
  komi: number;
  blackTotal: number;
  whiteTotal: number;
  winner: StoneColor;
  margin: number;
  territoryMap: ('BLACK' | 'WHITE' | 'DAME' | null)[][];
}

export interface GhostHint {
  point: Point;
  confidence: number;
  concept: string;
  explanation: string;
  secondarySuggestions?: Point[];
}

export interface TsumegoPuzzle {
  id: string;
  title: string;
  koreanTitle: string;
  difficulty: 'Novice' | 'Intermediate' | 'Advanced' | 'Master';
  category: 'Life & Death' | 'Snapback' | 'Ladder' | 'Crane\'s Nest' | 'Semeai';
  size: BoardSize;
  initialBoard: { point: Point; color: StoneColor }[];
  playerColor: StoneColor;
  description: string;
  objective: string;
  solutionTree: SolutionNode;
}

export interface SolutionNode {
  point: Point; // where player plays
  opponentResponse?: {
    point: Point;
    next?: SolutionNode;
  };
  isSuccess?: boolean;
  message?: string;
}
