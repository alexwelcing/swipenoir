import { createClient } from '@supabase/supabase-js';
import { PlayerMemoryState } from '../types';

// Environment variable validation
const validateSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_KEY || 'placeholder-key';
  
  // Validate URL format if not placeholder
  if (!url.includes('placeholder')) {
    try {
      new URL(url);
    } catch {
      console.warn('Invalid SUPABASE_URL format, using placeholder');
      return { url: 'https://placeholder.supabase.co', key: 'placeholder-key' };
    }
  }
  
  // Validate key length if not placeholder
  if (!key.includes('placeholder') && key.length < 32) {
    console.warn('SUPABASE_KEY appears to be too short, using placeholder');
    return { url: 'https://placeholder.supabase.co', key: 'placeholder-key' };
  }
  
  return { url, key };
};

const { url: supabaseUrl, key: supabaseKey } = validateSupabaseConfig();

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
