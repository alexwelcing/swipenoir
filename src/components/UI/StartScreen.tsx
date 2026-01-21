import React from 'react';

export const StartScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-[3000]">
      <h2 className="font-['Spectral'] text-4xl italic mb-8 animate-pulse text-center">
        The road remembers what you carry.
      </h2>
      <div className="text-sm tracking-[0.3em] uppercase opacity-50 animate-bounce">
        Press any key to wake
      </div>
    </div>
  );
};
