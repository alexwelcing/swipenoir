import React from 'react';
import { RoadSegment as RoadSegmentType } from '../../types';
import { RoadSegment } from './RoadSegment';
import { PlayerAvatar } from './PlayerAvatar';
import { VISIBILITY_DEPTH } from '../../constants';

interface RoadContainerProps {
  segments: RoadSegmentType[];
  globalZ: number;
  playerX: number;
  isStartScreen: boolean;
}

export const RoadContainer: React.FC<RoadContainerProps> = ({ 
  segments, 
  globalZ, 
  playerX,
  isStartScreen 
}) => {
  return (
    <div 
      className="relative w-full h-full flex justify-center perspective-container"
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      {/* The World Container */}
      <div className="relative w-[600px] h-full preserve-3d">
        
        {/* PLAYER AVATAR */}
        <PlayerAvatar x={playerX} />

        {/* ROAD SEGMENTS */}
        {!isStartScreen && segments.map((seg) => (
          <RoadSegment 
            key={seg.id}
            segment={seg}
            globalZ={globalZ}
            visibilityDepth={VISIBILITY_DEPTH}
          />
        ))}

      </div>
    </div>
  );
};
