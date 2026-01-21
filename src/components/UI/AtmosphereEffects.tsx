import React from 'react';
import { EnvironmentType } from '../../types';

interface AtmosphereEffectsProps {
  environment: EnvironmentType;
  isGlitch: boolean;
}

export const AtmosphereEffects: React.FC<AtmosphereEffectsProps> = ({ 
  environment, 
  isGlitch 
}) => {
  return (
    <>
      {/* Top gradient */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-b from-[#0A0A0B] via-transparent to-transparent h-1/3" />
      
      {/* Storm overlay */}
      <div className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-1000 ${
        environment === 'storm' ? 'opacity-30 bg-red-900/10 mix-blend-overlay' : 'opacity-0'
      }`} />
      
      {/* Glitch effect */}
      {isGlitch && (
        <div className="absolute inset-0 bg-white z-[999] opacity-10 mix-blend-exclusion animate-pulse" />
      )}
    </>
  );
};
