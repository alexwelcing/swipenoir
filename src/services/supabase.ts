import { createClient } from '@supabase/supabase-js';
import { PlayerMemoryState } from '../types';

// Supabase Initialization (Placeholder mechanism)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const syncMemory = async (memoryState: PlayerMemoryState): Promise<void> => {
  if (!supabaseUrl.includes('placeholder')) {
    try {
      await supabase.from('runs').insert([{
        carrying: memoryState.carryingCount,
        discipline: memoryState.disciplineCount,
        hunger: memoryState.hungerCount,
        distance: memoryState.distanceTraveled,
      }]);
    } catch (e) {
      console.warn("Supabase sync failed (expected in offline/demo mode)", e);
    }
  }
};
