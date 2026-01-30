
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_BOARD, BOARD_SIZE } from './constants';
import { CellState, Position, Move } from './types';
import Peg from './components/Peg';
import Controls from './components/Controls';
import { getHint } from './services/geminiService';
import { X, Sparkles, Trophy, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [board, setBoard] = useState<CellState[][]>(INITIAL_BOARD.map(row => [...row]));
  const [history, setHistory] = useState<CellState[][][]>([]);
  const [selected, setSelected] = useState<Position | null>(null);
  const [hint, setHint] = useState<{from: Position, to: Position} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Check Game End
  const checkGameEnd = useCallback((currentBoard: CellState[][]) => {
    let pegsLeft = 0;
    let hasMoves = false;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === 'peg') {
          pegsLeft++;
          // Check neighbors
          const neighbors = [
            { dr: 0, dc: 1 }, { dr: 0, dc: -1 },
            { dr: 1, dc: 0 }, { dr: -1, dc: 0 }
          ];
          for (const { dr, dc } of neighbors) {
            const midR = r + dr;
            const midC = c + dc;
            const endR = r + 2 * dr;
            const endC = c + 2 * dc;
            if (
              endR >= 0 && endR < BOARD_SIZE && 
              endC >= 0 && endC < BOARD_SIZE &&
              currentBoard[midR][midC] === 'peg' &&
              currentBoard[endR][endC] === 'empty'
            ) {
              hasMoves = true;
              break;
            }
          }
        }
        if (hasMoves) break;
      }
      if (hasMoves) break;
    }

    if (!hasMoves) {
      if (pegsLeft === 1 && currentBoard[3][3] === 'peg') {
        setStatus('won');
      } else if (pegsLeft === 1) {
        setStatus('won'); // Technically a win if 1 left anywhere, but center is perfect
      } else {
        setStatus('lost');
      }
    }
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (status !== 'playing') return;
    setHint(null);

    const cell = board[r][c];

    // Select a peg
    if (cell === 'peg') {
      setSelected({ r, c });
      return;
    }

    // Attempt a move
    if (cell === 'empty' && selected) {
      const dr = Math.abs(r - selected.r);
      const dc = Math.abs(c - selected.c);

      // Must move exactly 2 cells horizontally or vertically
      if ((dr === 2 && dc === 0) || (dr === 0 && dc === 2)) {
        const midR = (r + selected.r) / 2;
        const midC = (c + selected.c) / 2;

        if (board[midR][midC] === 'peg') {
          // Valid move!
          const newBoard = board.map(row => [...row]);
          newBoard[selected.r][selected.c] = 'empty';
          newBoard[midR][midC] = 'empty';
          newBoard[r][c] = 'peg';

          setHistory([...history, board.map(row => [...row])]);
          setBoard(newBoard);
          setSelected(null);
          checkGameEnd(newBoard);
        }
      }
    }
  };

  const undoMove = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last);
    setHistory(history.slice(0, -1));
    setSelected(null);
    setHint(null);
    setStatus('playing');
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]));
    setHistory([]);
    setSelected(null);
    setHint(null);
    setStatus('playing');
  };

  const requestHint = async () => {
    setIsAiLoading(true);
    const result = await getHint(board);
    if (result && result.hasMove) {
      setHint({ from: result.from, to: result.to });
    } else {
      alert("AI couldn't find a move. Maybe game over?");
    }
    setIsAiLoading(false);
  };

  const getValidTargets = () => {
    if (!selected) return [];
    const targets = [];
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
    for (const [dr, dc] of dirs) {
      const nr = selected.r + dr;
      const nc = selected.c + dc;
      const mr = selected.r + dr / 2;
      const mc = selected.c + dc / 2;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && 
          board[nr][nc] === 'empty' && board[mr][mc] === 'peg') {
        targets.push({ r: nr, c: nc });
      }
    }
    return targets;
  };

  const validTargets = getValidTargets();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-red-500/30">
      {/* HUD Header */}
      <header className="fixed top-8 left-0 right-0 px-8 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <h1 className="dot-matrix text-3xl md:text-4xl font-bold tracking-tight text-white/90">
            Neural<span className="text-[#FF0000]">Solitaire</span>
          </h1>
          <p className="text-[10px] md:text-xs text-white/40 font-mono tracking-widest uppercase">
            Brainvita Logic Engine v2.5.0
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] md:text-xs text-white/40 font-mono uppercase tracking-widest">
            Pegs Remaining
          </div>
          <div className="dot-matrix text-3xl md:text-4xl font-bold text-white/90">
            {board.flat().filter(c => c === 'peg').length.toString().padStart(2, '0')}
          </div>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="relative z-10 p-6 md:p-12 rounded-[40px] glass-panel flex flex-col items-center max-w-full">
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
          {board.map((row, r) => (
            row.map((cell, c) => (
              <Peg 
                key={`${r}-${c}`}
                state={cell}
                isSelected={selected?.r === r && selected?.c === c}
                isHint={hint?.from.r === r && hint?.from.c === c || hint?.to.r === r && hint?.to.c === c}
                isValidTarget={validTargets.some(t => t.r === r && t.c === c)}
                onClick={() => handleCellClick(r, c)}
              />
            ))
          ))}
        </div>
        
        <Controls 
          onUndo={undoMove}
          onReset={resetGame}
          onHint={requestHint}
          canUndo={history.length > 0}
          isAiLoading={isAiLoading}
          onShowRules={() => setShowRules(true)}
        />
      </main>

      {/* Status Indicators */}
      {status !== 'playing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-8 rounded-[32px] max-w-sm w-full text-center border-t-2 border-white/20">
            {status === 'won' ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="dot-matrix text-2xl font-bold mb-2">Victory</h2>
                <p className="text-white/60 mb-6 italic">Precision achieved. The neural pathways are clear.</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-16 h-16 text-[#FF0000] mx-auto mb-4" />
                <h2 className="dot-matrix text-2xl font-bold mb-2">System Locked</h2>
                <p className="text-white/60 mb-6 italic">No viable paths detected. Pegs remain stranded.</p>
              </>
            )}
            <button 
              onClick={resetGame}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold dot-matrix hover:bg-white/80 transition-colors"
            >
              Reinitialize
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-panel p-8 rounded-[32px] max-w-md w-full relative">
            <button onClick={() => setShowRules(false)} className="absolute top-6 right-6 text-white/40 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="dot-matrix text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF0000]" />
              Manual
            </h2>
            <ul className="space-y-4 text-white/70 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[#FF0000] font-bold">01</span>
                <span>Select a peg to activate it. Red highlight indicates selection.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF0000] font-bold">02</span>
                <span>Jump over an adjacent peg into an empty hole. The jumped peg is removed.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF0000] font-bold">03</span>
                <span>The goal is to leave only ONE peg on the board. The center is the optimal finish.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF0000] font-bold">04</span>
                <span>Use the AI Engine if you require tactical redirection.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="fixed bottom-8 text-[10px] text-white/20 font-mono uppercase tracking-[0.3em]">
        Design Language: Void 1.0 // Inspired by Nothing
      </footer>
    </div>
  );
};

export default App;
