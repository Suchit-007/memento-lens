import { MementoItem } from '../types';

const STORAGE_KEY = 'memento_lens_items';

const INITIAL_PRESETS: MementoItem[] = [
  {
    id: 'preset-1',
    rawInput: 'Pick up prescription at the pharmacy counter',
    summary: 'Pick up prescription',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
    triggers: {
      when: [],
      where: ['Pharmacy'],
      who: [],
      activity: [],
    },
  },
  {
    id: 'preset-2',
    rawInput: 'Discuss Q3 roadmap updates with Manager while working',
    summary: 'Discuss Q3 roadmap updates',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'pending',
    triggers: {
      when: [],
      where: ['Office'],
      who: ['Manager'],
      activity: ['Working'],
    },
  },
  {
    id: 'preset-3',
    rawInput: 'Grab milk, eggs, and fresh spinach from Grocery Store',
    summary: 'Grocery run: milk, eggs, spinach',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'pending',
    triggers: {
      when: [],
      where: ['Grocery Store'],
      who: [],
      activity: [],
    },
  },
  {
    id: 'preset-4',
    rawInput: 'Listen to the new deep learning podcast episode while walking alone',
    summary: 'Listen to deep learning podcast',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'pending',
    triggers: {
      when: [],
      where: [],
      who: ['Alone'],
      activity: ['Walking', 'Driving'],
    },
  },
];

export function loadMemories(): MementoItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      saveMemories(INITIAL_PRESETS);
      return INITIAL_PRESETS;
    }
    return JSON.parse(data) as MementoItem[];
  } catch (err) {
    console.error('Failed to parse Memento items from localStorage:', err);
    return INITIAL_PRESETS;
  }
}

export function saveMemories(items: MementoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('memento_storage_update'));
  } catch (err) {
    console.error('Failed to save Memento items to localStorage:', err);
  }
}

export function addMemory(item: MementoItem): void {
  try {
    const items = loadMemories();
    saveMemories([item, ...items]);
  } catch (err) {
    console.error('Failed to add Memento item:', err);
  }
}

export function updateMemoryStatus(id: string, status: MementoItem['status']): void {
  try {
    const items = loadMemories();
    const updated = items.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    saveMemories(updated);
  } catch (err) {
    console.error('Failed to update Memento item status:', err);
  }
}

// Aliases to preserve exact API compatibility across components
export const getMementoItems = loadMemories;
export const saveMementoItems = saveMemories;
export const addMementoItem = addMemory;
export const updateMementoItemStatus = updateMemoryStatus;

export function markItemSurfaced(id: string): void {
  updateMemoryStatus(id, 'surfaced');
}


// Pre-seed demo memories on first load
export function seedDemoMemories() {
  const existing = loadMemories();
  if (existing.length > 0) return; // Only seed if empty
  
  const demoMemories: MementoItem[] = [
    {
      id: 'demo-1',
      rawInput: 'Pick up the dry cleaning when I pass by the pharmacy',
      summary: 'Pick up dry cleaning',
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2h ago
      status: 'pending',
      triggers: {
        when: [],
        where: ['Pharmacy'],
        who: [],
        activity: ['Walking']
      },
      isRememberThisArchive: false
    },
    {
      id: 'demo-2',
      rawInput: 'Call mom about Sunday dinner plans',
      summary: 'Call mom about dinner',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
      status: 'pending',
      triggers: {
        when: ['Sunday'],
        where: ['Home'],
        who: ['Mom'],
        activity: ['Relaxing']
      },
      isRememberThisArchive: false
    },
    {
      id: 'demo-3',
      rawInput: 'Send the Q3 report to manager Sarah before the meeting',
      summary: 'Send Q3 report to Sarah',
      createdAt: new Date(Date.now() - 1800000).toISOString(), // 30m ago
      status: 'pending',
      triggers: {
        when: ['Morning'],
        where: ['Office'],
        who: ['Sarah', 'Manager'],
        activity: ['Working', 'High Focus']
      },
      isRememberThisArchive: false
    }
  ];
  
  saveMemories(demoMemories);
}