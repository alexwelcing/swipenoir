import React from 'react';
import { LaneContent } from '../../types';
import { THEMES } from '../../constants';

interface PromptMarkerProps {
  lane: LaneContent;
}

export const PromptMarker: React.FC<PromptMarkerProps> = ({ lane }) => {
  if (lane.type !== 'prompt' || !lane.theme || !lane.text) return null;

  return (
    <div className="absolute bottom-20 text-center w-64 transform transition-all duration-300">
      <div className={`text-xs uppercase tracking-[0.2em] mb-1 font-bold ${
        lane.theme === 'HUNGER' ? 'text-red-300/70' : 
        lane.theme === 'CARRYING' ? 'text-blue-200/70' : 'text-gray-400'
      }`}>
        {THEMES[lane.theme].label}
      </div>
      <div className="font-['Spectral'] text-lg italic text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {lane.text}
      </div>
      <div className="w-1 h-12 bg-gradient-to-t from-white/20 to-transparent mx-auto mt-2" />
    </div>
  );
};
