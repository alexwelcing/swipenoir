import React from 'react';
import { ActivePrompt } from '../../types';

interface FeedbackOverlayProps {
  activePrompt: ActivePrompt | null;
  onAnimationEnd: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ 
  activePrompt, 
  onAnimationEnd 
}) => {
  if (!activePrompt) return null;

  return (
    <div 
      key={activePrompt.text}
      className="absolute top-1/3 w-full text-center z-[100] animate-fade-up pointer-events-none"
      onAnimationEnd={onAnimationEnd}
    >
      <span className={`inline-block px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] font-['Spectral'] text-xl italic
        ${activePrompt.type === 'harm' ? 'text-red-400 border-red-900/30' : 'text-white'}
      `}>
        {activePrompt.text}
      </span>
    </div>
  );
};
