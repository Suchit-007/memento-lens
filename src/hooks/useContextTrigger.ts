import { useState, useEffect, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { getMementoItems, markItemSurfaced } from '../utils/storage';
import { MementoItem } from '../types';

export interface UseContextTriggerReturn {
  activeNudges: MementoItem[];
  dismissNudge: (id: string) => void;
}

export function useContextTrigger(): UseContextTriggerReturn {
  const { state } = useSimulation();
  const [activeNudges, setActiveNudges] = useState<MementoItem[]>([]);

  // Helper for case-insensitive exact string checks
  const checkIncludes = (arr: string[], target: string | null): boolean => {
    if (!target) return false;
    const lowerTarget = target.trim().toLowerCase();
    return arr.some((item) => item.trim().toLowerCase() === lowerTarget);
  };

  const evaluateTriggers = useCallback(() => {
    // Only evaluate if at least one simulation variable is actively active
    const { currentLocation, currentCompanion, currentActivity } = state;
    if (!currentLocation && !currentCompanion && !currentActivity) {
      return;
    }

    const items = getMementoItems();
    const pendingItems = items.filter((item) => item.status === 'pending');

    const newNudges: MementoItem[] = [];

    pendingItems.forEach((item) => {
      const reasons: string[] = [];
      let matchCount = 0;

      // Check Location
      if (currentLocation && checkIncludes(item.triggers.where, currentLocation)) {
        matchCount++;
        reasons.push(`Near ${currentLocation}`);
      }

      // Check Companion
      if (currentCompanion && checkIncludes(item.triggers.who, currentCompanion)) {
        matchCount++;
        reasons.push(`With ${currentCompanion}`);
      }

      // Check Activity
      if (currentActivity && checkIncludes(item.triggers.activity, currentActivity)) {
        matchCount++;
        reasons.push(`Activity: ${currentActivity}`);
      }

      // Threshold: 1+ match triggers the prospective memory nudge
      if (matchCount >= 1) {
        const matchReason = reasons.join(' • ');
        const surfacedItem: MementoItem = {
          ...item,
          matchReason,
        };

        newNudges.push(surfacedItem);
        // Mark item as surfaced persistently to prevent redundant notification triggers
        markItemSurfaced(item.id);
      }
    });

    if (newNudges.length > 0) {
      setActiveNudges((prev) => {
        // Prevent duplicate IDs in active nudges stack
        const existingIds = new Set(prev.map((n) => n.id));
        const filteredNew = newNudges.filter((n) => !existingIds.has(n.id));
        return [...prev, ...filteredNew];
      });
    }
  }, [state]);

  // Evaluate on simulation context change
  useEffect(() => {
    evaluateTriggers();
  }, [evaluateTriggers]);

  // Optional: re-evaluate if storage updates externally (e.g. fresh item captured during matching context)
  useEffect(() => {
    const handleStorageUpdate = () => {
      evaluateTriggers();
    };

    window.addEventListener('memento_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('memento_storage_update', handleStorageUpdate);
    };
  }, [evaluateTriggers]);

  const dismissNudge = useCallback((id: string) => {
    setActiveNudges((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    activeNudges,
    dismissNudge,
  };
}
