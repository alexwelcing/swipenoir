import React from 'react';
import { Ghost } from 'lucide-react';

interface PlayerAvatarProps {
  x: number;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ x }) => {
  return (
    <div 
      className="absolute bottom-20 w-12 h-24 bg-[#D4D4D4] shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-full transition-transform duration-100 ease-out z-[2000] flex items-center justify-center group"
      style={{ 
        left: '50%', 
        transform: `translateX(-50%) translateX(${x * 3}px)`
      }}
    >
      <div className="w-8 h-20 bg-black/20 rounded-full blur-sm" />
      <Ghost size={24} className="absolute text-black/50 opacity-50 group-hover:opacity-80 transition-opacity" />
    </div>
  );
};
