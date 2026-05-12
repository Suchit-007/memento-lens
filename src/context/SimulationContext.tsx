import React, { createContext, useReducer, useContext, ReactNode } from 'react';

export interface SimulationState {
  currentLocation: string | null;
  currentCompanion: string | null;
  currentActivity: string | null;
}

export type SimulationAction =
  | { type: 'SET_LOCATION'; payload: string | null }
  | { type: 'SET_COMPANION'; payload: string | null }
  | { type: 'SET_ACTIVITY'; payload: string | null }
  | { type: 'RESET_ALL' };

const initialState: SimulationState = {
  currentLocation: null,
  currentCompanion: null,
  currentActivity: null,
};

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'SET_COMPANION':
      return { ...state, currentCompanion: action.payload };
    case 'SET_ACTIVITY':
      return { ...state, currentActivity: action.payload };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

export interface SimulationContextType {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  setLocation: (location: string | null) => void;
  setCompanion: (companion: string | null) => void;
  setActivity: (activity: string | null) => void;
  resetAll: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  const setLocation = (location: string | null) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const setCompanion = (companion: string | null) => {
    dispatch({ type: 'SET_COMPANION', payload: companion });
  };

  const setActivity = (activity: string | null) => {
    dispatch({ type: 'SET_ACTIVITY', payload: activity });
  };

  const resetAll = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  const value: SimulationContextType = {
    state,
    dispatch,
    setLocation,
    setCompanion,
    setActivity,
    resetAll,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation(): SimulationContextType {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
