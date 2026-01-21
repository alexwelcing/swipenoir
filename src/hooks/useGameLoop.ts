import { useRef, useCallback, useEffect } from 'react';
import { 
  GameState, 
  PlayerMemoryState, 
  PlayerPosition, 
  RoadSegment,
  ThemeKey,
  EnvironmentType,
  ActivePrompt
} from '../types';
import { 
  GAME_SPEED_BASE, 
  LANE_WIDTH, 
  VISIBILITY_DEPTH, 
  SPAWN_DISTANCE 
} from '../constants';
import { WorldGenerator } from '../components/WorldGenerator';
import { syncMemory } from '../services/supabase';

interface UseGameLoopProps {
  gameState: GameState;
  setUiState: (state: PlayerMemoryState) => void;
  setActivePrompt: (prompt: ActivePrompt | null) => void;
  setEnvironment: (env: EnvironmentType) => void;
  setGameState: (state: GameState) => void;
  environment: EnvironmentType;
}

export const useGameLoop = ({
  gameState,
  setUiState,
  setActivePrompt,
  setEnvironment,
  setGameState,
  environment
}: UseGameLoopProps) => {
  // Game state refs
  const memoryRef = useRef<PlayerMemoryState>({
    carryingCount: 0,
    disciplineCount: 0,
    hungerCount: 0,
    distanceTraveled: 0,
    currentSpeed: GAME_SPEED_BASE,
  });

  const playerRef = useRef<PlayerPosition>({ 
    lane: 1, 
    targetLane: 1, 
    x: 0 
  });

  const segmentsRef = useRef<RoadSegment[]>([]);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const globalZRef = useRef<number>(0);
  const worldGeneratorRef = useRef<WorldGenerator>(new WorldGenerator(environment));

  // Update world generator environment when it changes
  useEffect(() => {
    worldGeneratorRef.current.setEnvironment(environment);
  }, [environment]);

  // Choice Resolution
  const handleChoice = useCallback((theme: ThemeKey, text: string) => {
    setActivePrompt({ text: text, type: 'echo' });
    
    if (theme === 'CARRYING') {
      memoryRef.current.carryingCount++;
      memoryRef.current.currentSpeed *= 0.95; // Burden slows you
    } else if (theme === 'DISCIPLINE') {
      memoryRef.current.disciplineCount++;
      // Speed stays constant, stability increases (visualized later)
    } else if (theme === 'HUNGER') {
      memoryRef.current.hungerCount++;
      memoryRef.current.currentSpeed *= 1.05; // Hunger drives you
    }

    // Dynamic Environment change based on dominant stat
    const { carryingCount, hungerCount } = memoryRef.current;
    if (hungerCount > carryingCount + 5) setEnvironment('storm');
    else if (carryingCount > hungerCount + 5) setEnvironment('ruins');
    else setEnvironment('orchard');

    // Trigger save occasionally
    if (memoryRef.current.distanceTraveled % 500 < 10) {
      syncMemory(memoryRef.current);
    }
  }, [setActivePrompt, setEnvironment]);

  // Glitch trigger
  const triggerGlitch = useCallback(() => {
    setGameState('GLITCH');
    setTimeout(() => {
      setGameState('RUNNING');
      lastTimeRef.current = performance.now();
    }, 200);
  }, [setGameState]);

  // The Game Loop
  const gameLoop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // 1. Update Speed & Distance
    const speed = memoryRef.current.currentSpeed * (deltaTime * 0.05);
    globalZRef.current += speed * 20;
    memoryRef.current.distanceTraveled += speed;

    // 2. Smooth Player Movement (Lerp)
    const targetX = (playerRef.current.targetLane - 1) * LANE_WIDTH;
    playerRef.current.x += (targetX - playerRef.current.x) * 0.15;

    // 3. Segment Management (Spawn & Recycle)
    const frontZ = segmentsRef.current.length > 0 
      ? segmentsRef.current[segmentsRef.current.length - 1].z 
      : globalZRef.current;
    
    if (frontZ < globalZRef.current + VISIBILITY_DEPTH) {
      segmentsRef.current.push(
        worldGeneratorRef.current.spawnSegment(frontZ + SPAWN_DISTANCE, memoryRef.current)
      );
    }

    // Remove segments behind camera
    segmentsRef.current = segmentsRef.current.filter(s => s.z > globalZRef.current - 200);

    // 4. Collision & Interaction Detection
    const playerWorldZ = globalZRef.current + 100;

    segmentsRef.current.forEach(seg => {
      if (seg.z < playerWorldZ + 50 && seg.z > playerWorldZ - 50 && !seg.processed) {
        const laneContent = seg.lanes[playerRef.current.targetLane];
        
        if (laneContent) {
          if (laneContent.type === 'obstacle') {
            // HIT OBSTACLE
            seg.processed = true;
            triggerGlitch();
            memoryRef.current.currentSpeed *= 0.5; // Slow down
            setActivePrompt({ text: "The path rejects you", type: 'harm' });
          } else if (laneContent.type === 'prompt') {
            // NARRATIVE CHOICE
            seg.processed = true;
            if (laneContent.theme && laneContent.text) {
              handleChoice(laneContent.theme, laneContent.text);
            }
          }
        }
      }
    });

    // 5. Update React State for UI
    setUiState({ ...memoryRef.current });

    if (gameState === 'RUNNING') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, handleChoice, triggerGlitch, setActivePrompt, setUiState]);

  // Start game loop
  const startGameLoop = useCallback(() => {
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return {
    playerRef,
    segmentsRef,
    globalZRef,
    startGameLoop,
  };
};
