// Game Types and Interfaces
export type GameState = 'START' | 'RUNNING' | 'GLITCH';

export type ThemeKey = 'CARRYING' | 'DISCIPLINE' | 'HUNGER';

export type EnvironmentType = 'orchard' | 'ruins' | 'storm' | 'river-ford';

export interface PlayerMemoryState {
  carryingCount: number;
  disciplineCount: number;
  hungerCount: number;
  distanceTraveled: number;
  currentSpeed: number;
}

export interface PlayerPosition {
  lane: number;
  targetLane: number;
  x: number;
}

export interface LaneContent {
  type: 'obstacle' | 'prompt';
  text?: string;
  theme?: ThemeKey;
}

export interface NarrativeTexts {
  left: string;
  center: string;
  right: string;
}

export interface RoadSegment {
  id: string;
  z: number;
  lanes: (LaneContent | null)[];
  narrativePayload: NarrativeTexts | null;
  env: EnvironmentType;
  processed?: boolean;
}

export interface ActivePrompt {
  text: string;
  type: 'echo' | 'harm';
}

export interface ThemeConfig {
  color: string;
  label: string;
  icon: React.ReactNode;
}
