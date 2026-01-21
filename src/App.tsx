```javascript
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Wind, Ghost, Mountain, Footprints, AlertCircle, Sparkles } from 'lucide-react';

/**
 * THE ROAD THAT REMEMBERS
 * A single-file React experience.
 * 
 * Architecture:
 * - DOM-based pseudo-3D runner using CSS perspective.
 * - State managed via Refs for high-performance game loop (60fps).
 * - React State used for high-level UI and Narrative syncing.
 * - Supabase integration for persisting "Memory States".
 */

// --- 1. CONFIGURATION & ASSETS ---

// Supabase Initialization (Placeholder mechanism)
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Visual & Gameplay Constants
const GAME_SPEED_BASE = 0.8;
const LANE_WIDTH = 33; // Percentage
const SEGMENT_DEPTH = 500; // Visual Z-depth units
const VISIBILITY_DEPTH = 4000;
const SPAWN_DISTANCE = 300; // How often a new segment spawns
const FOG_COLOR = '#0A0A0B';

// Narrative / Thematic Constants
const THEMES = {
  CARRYING: { color: '#A3A3A3', label: 'Aid', icon: <Footprints size={16} /> },
  DISCIPLINE: { color: '#F5F5F5', label: 'Duty', icon: <Mountain size={16} /> },
  HUNGER: { color: '#52525B', label: 'Hunger', icon: <Wind size={16} /> },
};

const NARRATIVE_POOL = [
  { left: "Lift the fallen", center: "Hold the formation", right: "Take their rations" },
  { left: "Share the water", center: "March in silence", right: "Drink your fill" },
  { left: "Bury the dead", center: "Ignore the ghosts", right: "Loot the bodies" },
  { left: "Remember them", center: "Focus forward", right: "Forget the weak" },
];

const ENVIRONMENT_TYPES = ['orchard', 'ruins', 'storm', 'river-ford'];

// --- 2. DATA MODELS ---

// Mocks the PlayerMemoryState
const initialMemoryState = {
  carryingCount: 0,
  disciplineCount: 0,
  hungerCount: 0,
  distanceTraveled: 0,
  currentSpeed: GAME_SPEED_BASE,
};

// --- 3. UTILITIES ---

const randomRange = (min, max) => Math.random() * (max - min) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- 4. REACT COMPONENT ---

export default function TheRoadThatRemembers() {
  // -- State --
  const [gameState, setGameState] = useState('START'); // START, RUNNING, GLITCH
  const [uiState, setUiState] = useState(initialMemoryState);
  const [activePrompt, setActivePrompt] = useState(null); // Floating text feedback
  const [environment, setEnvironment] = useState('orchard');
  
  // -- Refs for Game Loop (Mutable state to avoid re-renders) --
  const memoryRef = useRef({ ...initialMemoryState });
  const playerRef = useRef({ lane: 1, targetLane: 1, x: 0 }); // Lane 0, 1, 2
  const segmentsRef = useRef([]); // Array of active road segments
  const requestRef = useRef();
  const lastTimeRef = useRef();
  const globalZRef = useRef(0); // The player's progress into the world
  
  // -- Styles for Ethereal Fonts --
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400&family=Spectral:ital,wght@0,200;0,300;1,300&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // -- SUPABASE SYNC --
  const syncMemory = async () => {
    if (!supabaseUrl.includes('placeholder')) {
      try {
        await supabase.from('runs').insert([{
          carrying: memoryRef.current.carryingCount,
          discipline: memoryRef.current.disciplineCount,
          hunger: memoryRef.current.hungerCount,
          distance: memoryRef.current.distanceTraveled,
        }]);
      } catch (e) {
        console.warn("Supabase sync failed (expected in offline/demo mode)", e);
      }
    }
  };

  // -- LOGIC: World Generation --
  const spawnSegment = (zPosition) => {
    // Difficulty scaling
    const difficulty = Math.min(0.8, memoryRef.current.distanceTraveled / 10000);
    
    // Determine Segment Type
    const isNarrative = Math.random() > 0.7; // 30% chance of narrative choice
    const hasObstacle = !isNarrative && Math.random() < (0.3 + difficulty);
    
    let lanes = [null, null, null]; // [Left, Center, Right] - can contain 'obstacle' or 'prompt'
    let narrativePayload = null;

    if (isNarrative) {
      const texts = randomChoice(NARRATIVE_POOL);
      lanes[0] = { type: 'prompt', text: texts.left, theme: 'CARRYING' };
      lanes[1] = { type: 'prompt', text: texts.center, theme: 'DISCIPLINE' };
      lanes[2] = { type: 'prompt', text: texts.right, theme: 'HUNGER' };
      narrativePayload = texts;
    } else if (hasObstacle) {
      const obstacleLane = Math.floor(Math.random() * 3);
      lanes[obstacleLane] = { type: 'obstacle' };
      // High difficulty adds second obstacle
      if (difficulty > 0.5 && Math.random() > 0.5) {
        const secondLane = (obstacleLane + 1) % 3;
        lanes[secondLane] = { type: 'obstacle' };
      }
    }

    // World Building logic based on memory
    // If hunger is high, world gets darker/redder (handled in render)
    // If carrying is high, more open spaces.

    return {
      id: Math.random().toString(36).substr(2, 9),
      z: zPosition,
      lanes,
      narrativePayload,
      env: environment
    };
  };

  // -- LOGIC: Input Handling --
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'RUNNING' && gameState !== 'START') return;
      
      if (gameState === 'START') {
        setGameState('RUNNING');
        lastTimeRef.current = performance.now();
        gameLoop(performance.now());
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        playerRef.current.targetLane = Math.max(0, playerRef.current.targetLane - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        playerRef.current.targetLane = Math.min(2, playerRef.current.targetLane + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // -- LOGIC: The Game Loop --
  const gameLoop = useCallback((time) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // 1. Update Speed & Distance
    const speed = memoryRef.current.currentSpeed * (deltaTime * 0.05); // Speed multiplier
    globalZRef.current += speed * 20;
    memoryRef.current.distanceTraveled += speed;

    // 2. Smooth Player Movement (Lerp)
    const targetX = (playerRef.current.targetLane - 1) * LANE_WIDTH;
    playerRef.current.x += (targetX - playerRef.current.x) * 0.15;

    // 3. Segment Management (Spawn & Recycle)
    // Ensure we have enough segments ahead
    const frontZ = segmentsRef.current.length > 0 
      ? segmentsRef.current[segmentsRef.current.length - 1].z 
      : globalZRef.current;
    
    if (frontZ < globalZRef.current + VISIBILITY_DEPTH) {
      segmentsRef.current.push(spawnSegment(frontZ + SPAWN_DISTANCE));
    }

    // Remove segments behind camera
    segmentsRef.current = segmentsRef.current.filter(s => s.z > globalZRef.current - 200);

    // 4. Collision & Interaction Detection
    // Check segments very close to player (Player is effectively at Z = globalZRef + offset)
    // Let's define Player Z as globalZRef + 100 relative to world
    const playerWorldZ = globalZRef.current + 100;

    segmentsRef.current.forEach(seg => {
      // Check if player is "inside" this segment
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
            handleChoice(laneContent.theme, laneContent.text);
          }
        }
      }
    });

    // 5. Update React State for UI (throttled slightly ideally, but doing every frame for MVP smoothness)
    setUiState({ ...memoryRef.current });

    if (gameState === 'RUNNING') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState]);

  // -- LOGIC: Choice Resolution --
  const handleChoice = (theme, text) => {
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
    if (memoryRef.current.distanceTraveled % 500 < 10) syncMemory();
  };

  const triggerGlitch = () => {
    setGameState('GLITCH');
    setTimeout(() => {
      setGameState('RUNNING');
      lastTimeRef.current = performance.now();
      gameLoop(performance.now());
    }, 200);
  };

  // -- RENDERERS --

  // Calculate CSS Transform for a segment
  const getSegmentStyle = (seg) => {
    // Relative Z from camera
    const relZ = seg.z - globalZRef.current;
    // Simple projection scale (Perspective = 1000px)
    // CSS 3D: translateZ moves it.
    // We adjust opacity for fog.
    const opacity = Math.max(0, Math.min(1, 1 - (relZ / VISIBILITY_DEPTH)));
    
    return {
      transform: `translate3d(0, 0, ${-relZ + 1000}px)`, // Invert Z for CSS logic usually, but here we move world towards us
      // Actually, standard CSS perspective: object moves towards viewer (positive Z comes out of screen). 
      // Let's implement manually to ensure control:
      // We will place objects at negative Z deep in screen, moving to 0.
      // So if globalZ is 0, segment is at -2000. As globalZ increases, segment Z increases towards 0.
      transform: `translate3d(0, 50px, ${-1 * (seg.z - globalZRef.current) + 500}px)`,
      opacity: opacity,
      zIndex: Math.floor(10000 - relZ),
    };
  };

  return (
    <div className="w-full h-screen bg-[#0A0A0B] overflow-hidden text-[#D4D4D4] font-['Inter_Tight'] selection:bg-transparent">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-b from-[#0A0A0B] via-transparent to-transparent h-1/3" />
      <div className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-1000 ${environment === 'storm' ? 'opacity-30 bg-red-900/10 mix-blend-overlay' : 'opacity-0'}`} />
      
      {/* --- UI LAYER --- */}
      <div className="absolute top-0 left-0 w-full p-8 z-[100] flex justify-between items-start opacity-80 mix-blend-difference">
        <div>
          <h1 className="font-['Spectral'] text-2xl tracking-widest font-extralight italic opacity-70">
            THE ROAD THAT REMEMBERS
          </h1>
          <div className="mt-2 flex gap-6 text-sm font-light tracking-wide text-[#9A9EAB]">
            <span className="flex items-center gap-2"><Footprints size={14} /> {uiState.carryingCount}</span>
            <span className="flex items-center gap-2"><Mountain size={14} /> {uiState.disciplineCount}</span>
            <span className="flex items-center gap-2"><Wind size={14} /> {uiState.hungerCount}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-['Spectral'] font-thin">
            {Math.floor(uiState.distanceTraveled)}<span className="text-xs ml-1 opacity-50">m</span>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK OVERLAY --- */}
      {activePrompt && (
        <div 
          key={activePrompt.text} // remounts to animate
          className={`absolute top-1/3 w-full text-center z-[100] animate-fade-up pointer-events-none`}
          onAnimationEnd={() => setActivePrompt(null)}
        >
           <span className={`inline-block px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] font-['Spectral'] text-xl italic
             ${activePrompt.type === 'harm' ? 'text-red-400 border-red-900/30' : 'text-white'}
           `}>
             {activePrompt.text}
           </span>
        </div>
      )}

      {/* --- GLITCH EFFECT --- */}
      {gameState === 'GLITCH' && (
        <div className="absolute inset-0 bg-white z-[999] opacity-10 mix-blend-exclusion animate-pulse" />
      )}

      {/* --- 3D VIEWPORT --- */}
      <div 
        className="relative w-full h-full flex justify-center perspective-container"
        style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
      >
        {/* The World Container */}
        <div className="relative w-[600px] h-full preserve-3d">
          
          {/* PLAYER AVATAR */}
          {/* The player is stationary in visual Z, moves in X */}
          <div 
            className="absolute bottom-20 w-12 h-24 bg-[#D4D4D4] shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-full transition-transform duration-100 ease-out z-[2000] flex items-center justify-center group"
            style={{ 
              left: '50%', 
              transform: `translateX(-50%) translateX(${playerRef.current.x * 3}px)` // *3 is arbitrary scaling for visual width
            }}
          >
            <div className="w-8 h-20 bg-black/20 rounded-full blur-sm" />
            <Ghost size={24} className="absolute text-black/50 opacity-50 group-hover:opacity-80 transition-opacity" />
          </div>

          {/* ROAD SEGMENTS */}
          {gameState !== 'START' && segmentsRef.current.map((seg) => (
            <div
              key={seg.id}
              className="absolute bottom-0 w-full h-[100px] flex items-end justify-between px-4 border-b border-white/5"
              style={getSegmentStyle(seg)}
            >
              {/* Ground styling */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2E]/20 to-transparent" />
              
              {/* Lanes Render */}
              {seg.lanes.map((lane, idx) => (
                <div key={idx} className="relative w-1/3 h-full flex justify-center items-end pb-4">
                  {/* Debug lane guides - subtle */}
                  <div className="absolute bottom-0 h-4 w-full border-b border-white/5 opacity-30" />

                  {/* OBSTACLE */}
                  {lane?.type === 'obstacle' && (
                    <div className="w-16 h-32 bg-[#2C2C2E] border border-white/10 rounded-sm shadow-2xl flex items-center justify-center transform -translate-y-8">
                      <div className="w-1 h-full bg-red-900/20" />
                    </div>
                  )}

                  {/* PROMPT */}
                  {lane?.type === 'prompt' && (
                    <div className="absolute bottom-20 text-center w-64 transform transition-all duration-300">
                      <div className={`text-xs uppercase tracking-[0.2em] mb-1 font-bold ${
                        lane.theme === 'HUNGER' ? 'text-red-300/70' : 
                        lane.theme === 'CARRYING' ? 'text-blue-200/70' : 'text-gray-400'
                      }`}>
                        {THEMES[lane.theme].label}
                      </div>
                      <div className="font-['Spectral'] text-lg italic text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {lane.text}
                      </div>
                      <div className="w-1 h-12 bg-gradient-to-t from-white/20 to-transparent mx-auto mt-2" />
                    </div>
                  )}
                </div>
              ))}

              {/* Environment Decor */}
              {seg.env === 'ruins' && Math.random() > 0.8 && (
                <div className="absolute -left-40 bottom-0 w-20 h-60 bg-[#1a1a1a] opacity-50 transform skew-y-12" />
              )}
               {seg.env === 'orchard' && Math.random() > 0.8 && (
                <div className="absolute -right-40 bottom-0 w-4 h-40 bg-[#1a1a1a] opacity-30 rounded-full blur-md" />
              )}
            </div>
          ))}

          {/* START SCREEN */}
          {gameState === 'START' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-[3000]">
              <h2 className="font-['Spectral'] text-4xl italic mb-8 animate-pulse text-center">
                The road remembers what you carry.
              </h2>
              <div className="text-sm tracking-[0.3em] uppercase opacity-50 animate-bounce">
                Press any key to wake
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- GLOBAL STYLES & ANIMATIONS --- */}
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