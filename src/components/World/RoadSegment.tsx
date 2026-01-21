import React from 'react';
import { RoadSegment as RoadSegmentType, EnvironmentType } from '../../types';
import { Obstacle } from './Obstacle';
import { PromptMarker } from './PromptMarker';

interface RoadSegmentProps {
  segment: RoadSegmentType;
  globalZ: number;
  visibilityDepth: number;
}

export const RoadSegment: React.FC<RoadSegmentProps> = ({ segment, globalZ, visibilityDepth }) => {
  const getSegmentStyle = () => {
    const relZ = segment.z - globalZ;
    const opacity = Math.max(0, Math.min(1, 1 - (relZ / visibilityDepth)));
    
    return {
      transform: `translate3d(0, 50px, ${-1 * (segment.z - globalZ) + 500}px)`,
      opacity: opacity,
      zIndex: Math.floor(10000 - relZ),
    };
  };

  return (
    <div
      className="absolute bottom-0 w-full h-[100px] flex items-end justify-between px-4 border-b border-white/5"
      style={getSegmentStyle()}
    >
      {/* Ground styling */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2E]/20 to-transparent" />
      
      {/* Lanes Render */}
      {segment.lanes.map((lane, idx) => (
        <div key={idx} className="relative w-1/3 h-full flex justify-center items-end pb-4">
          {/* Debug lane guides - subtle */}
          <div className="absolute bottom-0 h-4 w-full border-b border-white/5 opacity-30" />

          {/* OBSTACLE */}
          {lane?.type === 'obstacle' && <Obstacle />}

          {/* PROMPT */}
          {lane?.type === 'prompt' && <PromptMarker lane={lane} />}
        </div>
      ))}

      {/* Environment Decor */}
      {segment.env === 'ruins' && Math.random() > 0.8 && (
        <div className="absolute -left-40 bottom-0 w-20 h-60 bg-[#1a1a1a] opacity-50 transform skew-y-12" />
      )}
      {segment.env === 'orchard' && Math.random() > 0.8 && (
        <div className="absolute -right-40 bottom-0 w-4 h-40 bg-[#1a1a1a] opacity-30 rounded-full blur-md" />
      )}
    </div>
  );
};
