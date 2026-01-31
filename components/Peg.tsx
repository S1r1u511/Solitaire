
import React from 'react';
import { NOTHING_RED } from '../constants.ts';

interface PegProps {
  state: 'peg' | 'empty' | 'invalid';
  isSelected: boolean;
  isHint?: boolean;
  isValidTarget?: boolean;
  onClick: () => void;
}

const Peg: React.FC<PegProps> = ({ state, isSelected, isHint, isValidTarget, onClick }) => {
  if (state === 'invalid') return <div className="w-10 h-10 md:w-14 md:h-14" />;

  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-300 flex items-center justify-center
        ${state === 'peg' ? 'bg-white shadow-[0_4px_10px_rgba(255,255,255,0.2)]' : 'bg-white/10 border border-white/5'}
        ${isSelected ? 'scale-110 !bg-[#FF0000] shadow-[0_0_20px_#FF0000]' : ''}
        ${isHint ? 'ring-2 ring-[#FF0000] ring-offset-2 ring-offset-black animate-pulse' : ''}
        ${isValidTarget ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-black' : ''}
        group relative
      `}
    >
      {state === 'peg' && (
        <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${isSelected ? 'bg-white' : 'bg-black/20'}`} />
      )}
      {state === 'empty' && (
        <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors`} />
      )}
    </button>
  );
};

export default Peg;
