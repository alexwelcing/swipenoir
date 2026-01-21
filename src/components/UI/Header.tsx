import React from 'react';
import { Footprints, Mountain, Wind } from 'lucide-react';
import { PlayerMemoryState } from '../../types';

interface HeaderProps {
  memoryState: PlayerMemoryState;
}

export const Header: React.FC<HeaderProps> = ({ memoryState }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-8 z-[100] flex justify-between items-start opacity-80 mix-blend-difference">
      <div>
        <h1 className="font-['Spectral'] text-2xl tracking-widest font-extralight italic opacity-70">
          THE ROAD THAT REMEMBERS
        </h1>
        <div className="mt-2 flex gap-6 text-sm font-light tracking-wide text-[#9A9EAB]">
          <span className="flex items-center gap-2">
            <Footprints size={14} /> {memoryState.carryingCount}
          </span>
          <span className="flex items-center gap-2">
            <Mountain size={14} /> {memoryState.disciplineCount}
          </span>
          <span className="flex items-center gap-2">
            <Wind size={14} /> {memoryState.hungerCount}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-4xl font-['Spectral'] font-thin">
          {Math.floor(memoryState.distanceTraveled)}
          <span className="text-xs ml-1 opacity-50">m</span>
        </div>
      </div>
    </div>
  );
};
