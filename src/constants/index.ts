import { Wind, Mountain, Footprints } from 'lucide-react';
import { ThemeConfig, NarrativeTexts, EnvironmentType } from '../types';

// Visual & Gameplay Constants
export const GAME_SPEED_BASE = 0.8;
export const LANE_WIDTH = 33; // Percentage
export const SEGMENT_DEPTH = 500; // Visual Z-depth units
export const VISIBILITY_DEPTH = 4000;
export const SPAWN_DISTANCE = 300; // How often a new segment spawns
export const FOG_COLOR = '#0A0A0B';

// Narrative / Thematic Constants
export const THEMES: Record<string, ThemeConfig> = {
  CARRYING: { color: '#A3A3A3', label: 'Aid', icon: <Footprints size={16} /> },
  DISCIPLINE: { color: '#F5F5F5', label: 'Duty', icon: <Mountain size={16} /> },
  HUNGER: { color: '#52525B', label: 'Hunger', icon: <Wind size={16} /> },
};

export const NARRATIVE_POOL: NarrativeTexts[] = [
  { left: "Lift the fallen", center: "Hold the formation", right: "Take their rations" },
  { left: "Share the water", center: "March in silence", right: "Drink your fill" },
  { left: "Bury the dead", center: "Ignore the ghosts", right: "Loot the bodies" },
  { left: "Remember them", center: "Focus forward", right: "Forget the weak" },
];

export const ENVIRONMENT_TYPES: EnvironmentType[] = ['orchard', 'ruins', 'storm', 'river-ford'];
