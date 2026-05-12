import { MementoItem } from './memento';

export interface ContextState {
  // Simulated real-world environment variables
  currentLocation: string;
  currentCompanion: string;
  currentTimeSlot: string;
  currentActivity: string;

  // Persistent memory collections
  memories: MementoItem[];
  
  // Active JIT Surfaced Memory (taps on the shoulder)
  surfacedMemoryId: string | null;

  // App UI operational states
  isCapturingVoice: boolean;
  isProcessingAI: boolean;
  lastError: string | null;
}

export type ContextAction =
  | { type: 'SET_SIMULATED_LOCATION'; payload: string }
  | { type: 'SET_SIMULATED_COMPANION'; payload: string }
  | { type: 'SET_SIMULATED_TIME_SLOT'; payload: string }
  | { type: 'SET_SIMULATED_ACTIVITY'; payload: string }
  | { type: 'ADD_MEMORY'; payload: MementoItem }
  | { type: 'UPDATE_MEMORY_STATUS'; payload: { id: string; status: MementoItem['status'] } }
  | { type: 'SURFACE_MEMORY'; payload: string | null }
  | { type: 'SET_VOICE_CAPTURING'; payload: boolean }
  | { type: 'SET_AI_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_MEMORIES'; payload: MementoItem[] };
