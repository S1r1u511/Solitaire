
import { CellState, Position } from "../types.ts";

/**
 * Hint engine. Previously called Gemini from the browser (which exposed the API key in the bundle).
 * Now runs locally: prefers a move that leaves the player with follow-up moves, otherwise any legal move.
 */
const DIRS = [
  { r: -2, c: 0 },
  { r: 2, c: 0 },
  { r: 0, c: -2 },
  { r: 0, c: 2 },
];

type Hint = { hasMove: boolean; from?: Position; to?: Position; explanation?: string };

const inBounds = (b: CellState[][], r: number, c: number) => r >= 0 && r < b.length && c >= 0 && c < b[r].length;

const legalMoves = (b: CellState[][]) => {
  const moves: { from: Position; to: Position; over: Position }[] = [];
  for (let r = 0; r < b.length; r++) {
    for (let c = 0; c < b[r].length; c++) {
      if (b[r][c] !== 'peg') continue;
      for (const d of DIRS) {
        const to = { r: r + d.r, c: c + d.c };
        const over = { r: r + d.r / 2, c: c + d.c / 2 };
        if (inBounds(b, to.r, to.c) && b[to.r][to.c] === 'empty' && b[over.r][over.c] === 'peg') {
          moves.push({ from: { r, c }, to, over });
        }
      }
    }
  }
  return moves;
};

export async function getHint(board: CellState[][]): Promise<Hint | null> {
  const moves = legalMoves(board);
  if (moves.length === 0) return { hasMove: false, explanation: 'No moves remain.' };

  // Score each move by how many legal moves it leaves open (simple 1-ply lookahead).
  let best = moves[0];
  let bestScore = -1;
  for (const m of moves) {
    const next = board.map((row) => [...row]);
    next[m.from.r][m.from.c] = 'empty';
    next[m.over.r][m.over.c] = 'empty';
    next[m.to.r][m.to.c] = 'peg';
    const score = legalMoves(next).length;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return { hasMove: true, from: best.from, to: best.to, explanation: 'Keeps the most options open.' };
}
