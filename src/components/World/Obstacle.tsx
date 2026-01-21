import React from 'react';

export const Obstacle: React.FC = () => {
  return (
    <div className="w-16 h-32 bg-[#2C2C2E] border border-white/10 rounded-sm shadow-2xl flex items-center justify-center transform -translate-y-8">
      <div className="w-1 h-full bg-red-900/20" />
    </div>
  );
};
