import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Block, Domain } from '../types';
import { todayDateString } from '../utils/time';

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todaySeed(): Block[] {
  const today = todayDateString();
  return [
    {
      id: 'seed-sleep',
      title: 'Sleep',
      icon: '😴',
      domain: 'sleep' as Domain,
      startHour: 0,
      startMin: 0,
      durationMin: 420, // 7 hours
      createdAt: today,
    },
    {
      id: 'seed-calc',
      title: 'Calculus',
      icon: '📐',
      domain: 'study' as Domain,
      startHour: 9,
      startMin: 0,
      durationMin: 90,
      createdAt: today,
    },
    {
      id: 'seed-lunch',
      title: 'Lunch',
      icon: '🍜',
      domain: 'schedule' as Domain,
      startHour: 13,
      startMin: 0,
      durationMin: 30,
      createdAt: today,
    },
    {
      id: 'seed-gym',
      title: 'Gym',
      icon: '🏋️',
      domain: 'schedule' as Domain,
      startHour: 16,
      startMin: 0,
      durationMin: 60,
      createdAt: today,
    },
  ];
}

interface BlockStore {
  blocks: Block[];
  activeTimerBlockId: string | null;
  addBlock: (block: Omit<Block, 'id' | 'createdAt'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  completeBlock: (id: string) => void;
  moveBlock: (id: string, newStartHour: number, newStartMin: number) => void;
  setActiveTimer: (id: string | null) => void;
  getTodayBlocks: () => Block[];
}

export const useBlockStore = create<BlockStore>()(
  persist(
    (set, get) => ({
      blocks: todaySeed(),
      activeTimerBlockId: null,

      addBlock: (blockData) => {
        const block: Block = {
          ...blockData,
          id: uuid(),
          createdAt: todayDateString(),
        };
        set((state) => ({ blocks: [...state.blocks, block] }));
      },

      updateBlock: (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      removeBlock: (id) => {
        set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) }));
      },

      completeBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, completedAt: new Date().toISOString() } : b
          ),
        }));
      },

      moveBlock: (id, newStartHour, newStartMin) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, startHour: newStartHour, startMin: newStartMin } : b
          ),
        }));
      },

      setActiveTimer: (id) => {
        set({ activeTimerBlockId: id });
      },

      getTodayBlocks: () => {
        const { blocks } = get();
        return blocks
          .slice()
          .sort((a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin));
      },
    }),
    {
      name: 'blocks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
