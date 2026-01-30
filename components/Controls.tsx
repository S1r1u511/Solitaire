
import React from 'react';
import { RotateCcw, Undo2, BrainCircuit, Info } from 'lucide-react';

interface ControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onHint: () => void;
  canUndo: boolean;
  isAiLoading: boolean;
  onShowRules: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onUndo, onReset, onHint, canUndo, isAiLoading, onShowRules }) => {
  return (
    <div className="flex gap-4 justify-center mt-8">
      <button 
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-4 rounded-full glass-panel transition-all active:scale-95 ${!canUndo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
        title="Undo Move"
      >
        <Undo2 className="w-6 h-6" />
      </button>
      
      <button 
        onClick={onReset}
        className="p-4 rounded-full glass-panel hover:bg-white/10 transition-all active:scale-95"
        title="Reset Game"
      >
        <RotateCcw className="w-6 h-6" />
      </button>

      <button 
        onClick={onHint}
        disabled={isAiLoading}
        className={`p-4 rounded-full glass-panel transition-all active:scale-95 relative ${isAiLoading ? 'animate-pulse' : 'hover:bg-white/10'}`}
        title="AI Hint"
      >
        <BrainCircuit className="w-6 h-6 text-[#FF0000]" />
        {isAiLoading && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
      </button>

      <button 
        onClick={onShowRules}
        className="p-4 rounded-full glass-panel hover:bg-white/10 transition-all active:scale-95"
        title="How to Play"
      >
        <Info className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Controls;
