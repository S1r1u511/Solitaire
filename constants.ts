
import { CellState } from './types';

// Standard English Board (33 holes)
export const INITIAL_BOARD: CellState[][] = [
  ['invalid', 'invalid', 'peg', 'peg', 'peg', 'invalid', 'invalid'],
  ['invalid', 'invalid', 'peg', 'peg', 'peg', 'invalid', 'invalid'],
  ['peg', 'peg', 'peg', 'peg', 'peg', 'peg', 'peg'],
  ['peg', 'peg', 'peg', 'empty', 'peg', 'peg', 'peg'],
  ['peg', 'peg', 'peg', 'peg', 'peg', 'peg', 'peg'],
  ['invalid', 'invalid', 'peg', 'peg', 'peg', 'invalid', 'invalid'],
  ['invalid', 'invalid', 'peg', 'peg', 'peg', 'invalid', 'invalid'],
];

export const BOARD_SIZE = 7;

export const NOTHING_RED = '#FF0000';
