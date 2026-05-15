export type Domain = 'sleep' | 'study' | 'schedule';

export interface Block {
  id: string;
  title: string;
  icon: string;
  domain: Domain;
  startHour: number;   // 0–23
  startMin: number;    // 0–59
  durationMin: number;
  note?: string;
  completedAt?: string;
  createdAt: string;
}

export interface SleepEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  bedtime: string;     // HH:MM
  wakeTime: string;    // HH:MM
  durationMin: number;
  quality: number;     // 1–5
  moodEmoji?: string;
  note?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
  weeklyGoalMin: number;
}

export interface WeeklyGoal {
  weekStartDate: string;  // YYYY-MM-DD (Monday)
  sleepNightlyTargetMin: number;
  studyWeeklyTargetMin: number;
  scheduleCompletionTargetPct: number;
}
