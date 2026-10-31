/**
 * GHOST MOVE GO - Curated Baduk Tsumego Puzzles
 * Authentic Life & Death, Snapback, Crane's Nest, and Capturing Race problems.
 */

import { TsumegoPuzzle } from './types';

export const TSUMEGO_PUZZLES: TsumegoPuzzle[] = [
  {
    id: 'snapback-1',
    title: 'The Hungry Tiger Trap (Snapback)',
    koreanTitle: '먹절수 (Ut-soo / Snapback)',
    difficulty: 'Novice',
    category: 'Snapback',
    size: 9,
    playerColor: 'BLACK',
    description: 'White has pushed aggressively, leaving a deceptive vulnerability. Sacrifice one stone to capture the entire enemy cluster.',
    objective: 'Play the classic sacrifice move to trigger a snapback capture.',
    initialBoard: [
      // Black surrounding stones
      { point: { x: 3, y: 1 }, color: 'BLACK' },
      { point: { x: 2, y: 2 }, color: 'BLACK' },
      { point: { x: 5, y: 2 }, color: 'BLACK' },
      { point: { x: 2, y: 3 }, color: 'BLACK' },
      { point: { x: 5, y: 3 }, color: 'BLACK' },
      { point: { x: 3, y: 4 }, color: 'BLACK' },
      { point: { x: 4, y: 4 }, color: 'BLACK' },
      // White target stones
      { point: { x: 3, y: 2 }, color: 'WHITE' },
      { point: { x: 4, y: 2 }, color: 'WHITE' },
      { point: { x: 4, y: 3 }, color: 'WHITE' },
    ],
    solutionTree: {
      point: { x: 3, y: 3 }, // Black sacrifices at (3,3)
      opponentResponse: {
        point: { x: 3, y: 3 }, // White captures Black stone at (3,3)
        next: {
          point: { x: 3, y: 2 }, // Black immediately recaptures all 4 stones
          isSuccess: true,
          message: 'Brilliant Snapback! White fell into the trap and you captured all 4 stones on the counter-stroke.',
        },
      },
      isSuccess: true,
      message: 'Spot on! Sacrificing at D6 forces the snapback sequence.',
    },
  },
  {
    id: 'life-death-corner-1',
    title: 'Two Eyes in the Corner',
    koreanTitle: '귀의 사활 (Corner Life & Death)',
    difficulty: 'Novice',
    category: 'Life & Death',
    size: 9,
    playerColor: 'BLACK',
    description: 'Black corner group is under heavy siege. Find the single vital point that divides the territory into two uninvadable eyes.',
    objective: 'Make unconditional life by creating two distinct eyes.',
    initialBoard: [
      { point: { x: 0, y: 2 }, color: 'BLACK' },
      { point: { x: 1, y: 2 }, color: 'BLACK' },
      { point: { x: 2, y: 2 }, color: 'BLACK' },
      { point: { x: 2, y: 1 }, color: 'BLACK' },
      { point: { x: 2, y: 0 }, color: 'BLACK' },
      // White encirclement
      { point: { x: 0, y: 3 }, color: 'WHITE' },
      { point: { x: 1, y: 3 }, color: 'WHITE' },
      { point: { x: 2, y: 3 }, color: 'WHITE' },
      { point: { x: 3, y: 2 }, color: 'WHITE' },
      { point: { x: 3, y: 1 }, color: 'WHITE' },
      { point: { x: 3, y: 0 }, color: 'WHITE' },
    ],
    solutionTree: {
      point: { x: 1, y: 1 }, // Vital 2-2 point dividing the eye space
      isSuccess: true,
      message: 'Flawless! Playing at B8 (1,1) partitions the corner into two living eyes that White can never enter.',
    },
  },
  {
    id: 'cranes-nest-1',
    title: "The Crane's Nest Enclosure (Jangmun)",
    koreanTitle: '장문 (Net / Crane\'s Nest)',
    difficulty: 'Intermediate',
    category: "Crane's Nest",
    size: 9,
    playerColor: 'BLACK',
    description: 'Two White stones are trying to break out toward center freedom. Instead of chasing with a loose ladder, drop an inescapable net.',
    objective: 'Enclose the fleeing White cutting stones in a net.',
    initialBoard: [
      { point: { x: 3, y: 3 }, color: 'BLACK' },
      { point: { x: 5, y: 3 }, color: 'BLACK' },
      { point: { x: 3, y: 5 }, color: 'BLACK' },
      // White fleeing stones
      { point: { x: 4, y: 3 }, color: 'WHITE' },
      { point: { x: 4, y: 4 }, color: 'WHITE' },
    ],
    solutionTree: {
      point: { x: 4, y: 5 }, // Net at (4,5)
      opponentResponse: {
        point: { x: 5, y: 4 },
        next: {
          point: { x: 5, y: 5 },
          isSuccess: true,
          message: 'Magnificent net! The White stones have no breathing room and will be captured on the next move.',
        },
      },
      isSuccess: true,
      message: 'Perfection! The knight-move net shuts down all escape trajectories.',
    },
  },
  {
    id: 'semeai-race-1',
    title: 'The Crucial Liberty Race (Semeai)',
    koreanTitle: '수상전 (Semeai / Capturing Race)',
    difficulty: 'Intermediate',
    category: 'Semeai',
    size: 9,
    playerColor: 'BLACK',
    description: 'Both groups are cut off from safety and have few liberties. One wrong move costs the entire quadrant.',
    objective: 'Reduce White\'s liberties from the outside to win the race.',
    initialBoard: [
      // Black stones with 2 liberties
      { point: { x: 6, y: 2 }, color: 'BLACK' },
      { point: { x: 7, y: 2 }, color: 'BLACK' },
      { point: { x: 8, y: 2 }, color: 'BLACK' },
      // White stones with 2 liberties
      { point: { x: 6, y: 3 }, color: 'WHITE' },
      { point: { x: 7, y: 3 }, color: 'WHITE' },
      { point: { x: 8, y: 3 }, color: 'WHITE' },
      // Boundaries
      { point: { x: 5, y: 2 }, color: 'BLACK' },
      { point: { x: 5, y: 3 }, color: 'WHITE' },
    ],
    solutionTree: {
      point: { x: 6, y: 4 }, // Outside liberty reduction
      opponentResponse: {
        point: { x: 7, y: 1 },
        next: {
          point: { x: 7, y: 4 },
          isSuccess: true,
          message: 'Captured! You properly attacked the exterior liberties and won the semeai by one move.',
        },
      },
      isSuccess: true,
      message: 'Correct! In Semeai, reducing external liberties first guarantees victory.',
    },
  },
  {
    id: 'eye-puncture-1',
    title: 'Ghost Strike: The Eye Puncture',
    koreanTitle: '치중수 (Chijung / Eye Stealing)',
    difficulty: 'Advanced',
    category: 'Life & Death',
    size: 13,
    playerColor: 'BLACK',
    description: 'White looks almost settled with a bulky five-space shape. Strike at the belly vital point to prevent the second eye from blooming.',
    objective: 'Play the classic Gwisu (Ghost Move) eye-puncture.',
    initialBoard: [
      { point: { x: 1, y: 1 }, color: 'WHITE' },
      { point: { x: 2, y: 1 }, color: 'WHITE' },
      { point: { x: 3, y: 1 }, color: 'WHITE' },
      { point: { x: 1, y: 2 }, color: 'WHITE' },
      { point: { x: 3, y: 2 }, color: 'WHITE' },
      // Black outer blockade
      { point: { x: 0, y: 1 }, color: 'BLACK' },
      { point: { x: 0, y: 2 }, color: 'BLACK' },
      { point: { x: 0, y: 3 }, color: 'BLACK' },
      { point: { x: 1, y: 3 }, color: 'BLACK' },
      { point: { x: 2, y: 3 }, color: 'BLACK' },
      { point: { x: 3, y: 3 }, color: 'BLACK' },
      { point: { x: 4, y: 2 }, color: 'BLACK' },
      { point: { x: 4, y: 1 }, color: 'BLACK' },
    ],
    solutionTree: {
      point: { x: 2, y: 2 }, // Center eye point
      isSuccess: true,
      message: 'Exquisite! Hitting the 2-2 center point destroys the bulky five and prevents White from ever making two true eyes.',
    },
  },
];
