
export type CellState = 'peg' | 'empty' | 'invalid';

export interface Position {
  r: number;
  c: number;
}

export interface Move {
  from: Position;
  to: Position;
  jumped: Position;
}

export interface GameState {
  board: CellState[][];
  history: CellState[][][];
  selected: Position | null;
  status: 'playing' | 'won' | 'lost';
}
