```javascript
import React, { useState } from 'react';
import { GameState, PlayerMemoryState, ActivePrompt, EnvironmentType } from './types';
import { GAME_SPEED_BASE } from './constants';
import { Header } from './components/UI/Header';
import { FeedbackOverlay } from './components/UI/FeedbackOverlay';
import { StartScreen } from './components/UI/StartScreen';
import { AtmosphereEffects } from './components/UI/AtmosphereEffects';
import { RoadContainer } from './components/World/RoadContainer';
import { useGameLoop } from './hooks/useGameLoop';
import { useInputHandler } from './hooks/useInputHandler';

/**
 * THE ROAD THAT REMEMBERS
 * A modular React experience.
 * 
 * Architecture:
 * - DOM-based pseudo-3D runner using CSS perspective.
 * - State managed via Refs for high-performance game loop (60fps).
 * - React State used for high-level UI and Narrative syncing.
 * - Supabase integration for persisting "Memory States".
 * 
 * Now refactored into modular components for better maintainability.
 */

const initialMemoryState: PlayerMemoryState = {
  carryingCount: 0,
  disciplineCount: 0,
  hungerCount: 0,
  distanceTraveled: 0,
  currentSpeed: GAME_SPEED_BASE,
};

export default function TheRoadThatRemembers() {
  // High-level state
  const [gameState, setGameState] = useState<GameState>('START');
  const [uiState, setUiState] = useState<PlayerMemoryState>(initialMemoryState);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentType>('orchard');

  // Game loop hook
  const { playerRef, segmentsRef, globalZRef, startGameLoop } = useGameLoop({
    gameState,
    setUiState,
    setActivePrompt,
    setEnvironment,
    setGameState,
    environment,
  });

  // Input handler hook
  useInputHandler({
    gameState,
    setGameState,
    startGameLoop,
    playerTargetLane: {
      get current() { return playerRef.current.targetLane; },
      set current(value) { playerRef.current.targetLane = value; }
    } as React.MutableRefObject<number>,
  });

  return (
    <div className="w-full h-screen bg-[#0A0A0B] overflow-hidden text-[#D4D4D4] font-['Inter_Tight'] selection:bg-transparent">
      
      {/* Atmosphere Effects */}
      <AtmosphereEffects 
        environment={environment} 
        isGlitch={gameState === 'GLITCH'} 
      />
      
      {/* UI Layer */}
      <Header memoryState={uiState} />

      {/* Feedback Overlay */}
      <FeedbackOverlay 
        activePrompt={activePrompt}
        onAnimationEnd={() => setActivePrompt(null)}
      />

      {/* 3D Viewport */}
      <RoadContainer 
        segments={segmentsRef.current}
        globalZ={globalZRef.current}
        playerX={playerRef.current.x}
        isStartScreen={gameState === 'START'}
      />

      {/* Start Screen */}
      {gameState === 'START' && <StartScreen />}

      {/* Global Styles & Animations */}
      <style>{`
        .perspective-container {
          perspective: 800px;
          overflow: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-up {
          animation: fade-up 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
```