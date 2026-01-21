import { RoadSegment, EnvironmentType, PlayerMemoryState } from '../types';
import { NARRATIVE_POOL, SPAWN_DISTANCE } from '../constants';
import { randomChoice } from '../utils';

export class WorldGenerator {
  private environment: EnvironmentType;

  constructor(initialEnvironment: EnvironmentType = 'orchard') {
    this.environment = initialEnvironment;
  }

  setEnvironment(env: EnvironmentType): void {
    this.environment = env;
  }

  spawnSegment(zPosition: number, memoryState: PlayerMemoryState): RoadSegment {
    // Difficulty scaling
    const difficulty = Math.min(0.8, memoryState.distanceTraveled / 10000);
    
    // Determine Segment Type
    const isNarrative = Math.random() > 0.7; // 30% chance of narrative choice
    const hasObstacle = !isNarrative && Math.random() < (0.3 + difficulty);
    
    let lanes = [null, null, null]; // [Left, Center, Right] - can contain 'obstacle' or 'prompt'
    let narrativePayload = null;

    if (isNarrative) {
      const texts = randomChoice(NARRATIVE_POOL);
      lanes[0] = { type: 'prompt' as const, text: texts.left, theme: 'CARRYING' as const };
      lanes[1] = { type: 'prompt' as const, text: texts.center, theme: 'DISCIPLINE' as const };
      lanes[2] = { type: 'prompt' as const, text: texts.right, theme: 'HUNGER' as const };
      narrativePayload = texts;
    } else if (hasObstacle) {
      const obstacleLane = Math.floor(Math.random() * 3);
      lanes[obstacleLane] = { type: 'obstacle' as const };
      // High difficulty adds second obstacle
      if (difficulty > 0.5 && Math.random() > 0.5) {
        const secondLane = (obstacleLane + 1) % 3;
        lanes[secondLane] = { type: 'obstacle' as const };
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      z: zPosition,
      lanes,
      narrativePayload,
      env: this.environment
    };
  }
}
