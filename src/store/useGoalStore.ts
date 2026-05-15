import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyGoal } from '../types';
import { weekStartDate } from '../utils/time';

interface GoalStore {
  goals: WeeklyGoal[];
  getCurrentGoal: () => WeeklyGoal;
  updateCurrentGoal: (updates: Partial<WeeklyGoal>) => void;
}

function defaultGoal(): WeeklyGoal {
  return {
    weekStartDate: weekStartDate(),
    sleepNightlyTargetMin: 480,      // 8 hours
    studyWeeklyTargetMin: 1200,      // 20 hours
    scheduleCompletionTargetPct: 80,
  };
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [defaultGoal()],

      getCurrentGoal: () => {
        const { goals } = get();
        const wsDate = weekStartDate();
        return goals.find((g) => g.weekStartDate === wsDate) ?? defaultGoal();
      },

      updateCurrentGoal: (updates) => {
        const wsDate = weekStartDate();
        set((state) => {
          const existing = state.goals.find((g) => g.weekStartDate === wsDate);
          if (existing) {
            return {
              goals: state.goals.map((g) =>
                g.weekStartDate === wsDate ? { ...g, ...updates } : g
              ),
            };
          }
          return {
            goals: [...state.goals, { ...defaultGoal(), ...updates, weekStartDate: wsDate }],
          };
        });
      },
    }),
    {
      name: 'goals',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
