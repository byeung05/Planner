import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry } from '../types';
import { dateStringForDaysAgo, todayDateString } from '../utils/time';

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function seedSleepEntries(): SleepEntry[] {
  return [
    {
      id: 'seed-sleep-0',
      date: todayDateString(),
      bedtime: '23:00',
      wakeTime: '07:00',
      durationMin: 480,
      quality: 4,
      moodEmoji: '😊',
    },
    {
      id: 'seed-sleep-1',
      date: dateStringForDaysAgo(1),
      bedtime: '23:30',
      wakeTime: '07:15',
      durationMin: 465,
      quality: 3,
      moodEmoji: '😐',
    },
    {
      id: 'seed-sleep-2',
      date: dateStringForDaysAgo(2),
      bedtime: '22:45',
      wakeTime: '06:45',
      durationMin: 480,
      quality: 5,
      moodEmoji: '😄',
    },
    {
      id: 'seed-sleep-3',
      date: dateStringForDaysAgo(3),
      bedtime: '00:15',
      wakeTime: '07:30',
      durationMin: 435,
      quality: 3,
      moodEmoji: '😴',
    },
    {
      id: 'seed-sleep-4',
      date: dateStringForDaysAgo(4),
      bedtime: '23:00',
      wakeTime: '07:00',
      durationMin: 480,
      quality: 4,
      moodEmoji: '😊',
    },
    {
      id: 'seed-sleep-5',
      date: dateStringForDaysAgo(5),
      bedtime: '22:30',
      wakeTime: '06:30',
      durationMin: 480,
      quality: 4,
      moodEmoji: '😊',
    },
    {
      id: 'seed-sleep-6',
      date: dateStringForDaysAgo(6),
      bedtime: '01:00',
      wakeTime: '08:00',
      durationMin: 420,
      quality: 2,
      moodEmoji: '😫',
    },
  ];
}

interface SleepStore {
  entries: SleepEntry[];
  morningRevealShownDate: string | null;
  addEntry: (entry: Omit<SleepEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<SleepEntry>) => void;
  removeEntry: (id: string) => void;
  setMorningRevealShownDate: (date: string) => void;
  getLastNightEntry: () => SleepEntry | null;
  getLast7Entries: () => SleepEntry[];
}

export const useSleepStore = create<SleepStore>()(
  persist(
    (set, get) => ({
      entries: seedSleepEntries(),
      morningRevealShownDate: null,

      addEntry: (entryData) => {
        const entry: SleepEntry = {
          ...entryData,
          id: uuid(),
        };
        set((state) => ({ entries: [...state.entries, entry] }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      removeEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },

      setMorningRevealShownDate: (date) => {
        set({ morningRevealShownDate: date });
      },

      getLastNightEntry: () => {
        const { entries } = get();
        const yesterday = dateStringForDaysAgo(1);
        const today = todayDateString();
        return (
          entries.find((e) => e.date === yesterday || e.date === today) ?? null
        );
      },

      getLast7Entries: () => {
        const { entries } = get();
        const sorted = entries
          .slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 7);
        return sorted.reverse();
      },
    }),
    {
      name: 'sleep',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
