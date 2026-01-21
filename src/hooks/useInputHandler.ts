import { useEffect, useRef } from 'react';
import { GameState } from '../types';

interface UseInputHandlerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  startGameLoop: () => void;
  playerTargetLane: React.MutableRefObject<number>;
}

export const useInputHandler = ({
  gameState,
  setGameState,
  startGameLoop,
  playerTargetLane
}: UseInputHandlerProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'RUNNING' && gameState !== 'START') return;
      
      if (gameState === 'START') {
        setGameState('RUNNING');
        startGameLoop();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        playerTargetLane.current = Math.max(0, playerTargetLane.current - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        playerTargetLane.current = Math.min(2, playerTargetLane.current + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState, startGameLoop, playerTargetLane]);
};
