# Focus & Rest — Mobile Tracking App Brainstorm

A unified daily tracker for **sleep**, **study sessions**, and **scheduling** — built around a timeline UI inspired by the Structured app (shown above), evolving from v1.0 → v2.0 polish.

---

## Core Concept

One scrollable timeline per day. Every block — whether a sleep window, a study sprint, or a scheduled event — lives on the same vertical axis. The app answers three questions at a glance:

> *Did I sleep enough? Did I study enough? What's next today?*

---

## Feature Pillars

### 1. Sleep Tracker
| Feature | Detail |
|---|---|
| Bedtime / wake goal | User sets target window (e.g. 10:30 PM – 6:30 AM) |
| Actual log | Manual entry or health API pull (HealthKit / Google Fit) |
| Sleep score | Simple 0–100 based on duration, consistency, and timing |
| Streak | Consecutive nights within goal window |
| Sleep debt meter | Rolling 7-day deficit vs. target |
| Nap logging | Short blocks tagged separately from night sleep |
| Notes | One-line mood/quality note per night ("groggy", "refreshed") |

**Timeline block style:** Deep purple gradient, moon icon, spans actual sleep hours.

---

### 2. Study Tracker
| Feature | Detail |
|---|---|
| Subject tags | Color-coded labels (Math, Biology, Spanish, etc.) |
| Focus session | Start/stop timer; optional Pomodoro (25/5 default, configurable) |
| Session log | Duration, subject, and optional note per session |
| Daily study goal | e.g. "3 hours/day" with progress ring |
| Weekly heatmap | GitHub-style grid — intensity = total minutes studied |
| Streak | Consecutive days hitting study goal |
| Distraction log | Optional — tap to mark a distraction during a session |

**Timeline block style:** Coral/orange pill, book icon, shows subject tag and duration inline.

---

### 3. Schedule Tracker
| Feature | Detail |
|---|---|
| Timeline view | Vertical scroll, 30-min grid, current time line in red |
| Day tabs | Today / Tomorrow / + 5-day strip (like Structured v2.0) |
| Task blocks | Title, icon, start + duration, optional note |
| Recurring tasks | Daily / weekly / custom repeat |
| Quick-add | "What do you have to do?" floating prompt at bottom of empty slots |
| Copy tasks | Copy yesterday's or last week's schedule as a template |
| Completion | Tap circle to complete; block grays out and shows checkmark |
| Time remaining | Live countdown on the current/next block |

---

## Screen Map

```
App
├── Today (default tab)
│   ├── Timeline view — all blocks merged (sleep, study, schedule)
│   ├── Current-time indicator
│   └── Quick-add FAB (+)
│
├── Stats
│   ├── Sleep tab — 7-day chart, avg duration, consistency score
│   ├── Study tab — weekly heatmap, subject breakdown pie, streak
│   └── Schedule tab — completion rate, on-time rate
│
├── Goals
│   ├── Sleep goal (bedtime, wake time, min duration)
│   ├── Daily study goal (total hours, subjects)
│   └── Schedule habits (recurring anchors like "Morning Routine")
│
└── Settings
    ├── Health app sync toggle
    ├── Notification preferences
    ├── Pomodoro config
    └── Theme (light / dark / auto)
```

---

## Data Models

### `SleepEntry`
```
id, date, bedtime, wakeTime, quality (1–5), note, source (manual | healthkit)
```

### `StudySession`
```
id, startTime, endTime, subjectId, mode (free | pomodoro), distractionCount, note
```

### `Subject`
```
id, name, colorHex, icon, weeklyGoalMinutes
```

### `ScheduleBlock`
```
id, title, icon, startTime, durationMinutes, recurrence, completedAt, note
```

### `DayStats` (computed)
```
date, sleepScore, studyMinutes, blocksCompleted, blocksTotal
```

---

## UI Design Direction

### Color Language (inspired by Structured v2.0)
| Block type | Color |
|---|---|
| Sleep | Deep purple `#6B4EFF` |
| Morning routine | Warm amber `#F5A623` |
| Study — focused | Coral `#E8604C` |
| Study — review | Soft orange `#F0884A` |
| Break | Light sage `#A8C5A0` |
| Scheduled event | Dusty rose `#C97B84` |
| Completed | Muted gray `#C4C4C4` |

### Typography
- Header (day/date): Bold, large, left-aligned
- Block title: Medium weight, single line, truncate with ellipsis
- Time labels: Monospace, small, left gutter
- Stats: Tabular figures

### Key UI Patterns (from reference app)
- **Pill-shaped blocks** — height proportional to duration
- **Live countdown** on in-progress block ("12 min remaining")
- **Checkmark animation** on completion tap
- **Subtle connector line** between adjacent blocks
- **Empty slot prompts** — ghost "+" at unscheduled gaps

---

## Version Roadmap

### v1.0 — Core Loop
- Timeline view with manual schedule blocks
- Sleep log (manual entry)
- Study session timer (free mode)
- Daily study goal ring
- Basic stats screen

### v1.5 — Depth
- Pomodoro mode with break blocks auto-inserted
- Sleep score + 7-day trend chart
- Subject tags + weekly heatmap
- Recurring tasks
- HealthKit / Google Fit sync

### v2.0 — Polish
- Full calendar strip (Structured 2.0 style)
- Copy-tasks-from-yesterday
- Widgets (lock screen: sleep score + next block; home screen: study ring)
- Streak system with milestone badges
- Export (CSV / PDF weekly report)

---

## Differentiators vs. Existing Apps

| App | Gap this fills |
|---|---|
| Structured | No sleep or study tracking — pure schedule |
| Sleep Cycle | No daytime schedule or study context |
| Forest / Focus | No sleep or schedule; study only |
| Notion / Todoist | No timeline view, no passive tracking |

**This app unifies all three into one scrollable day** — the same way a real day actually flows.

---

## Tech Stack Suggestions (React Native)

| Layer | Choice |
|---|---|
| Framework | React Native + Expo |
| Navigation | Expo Router (file-based) |
| State | Zustand + MMKV for persistence |
| Charts | Victory Native or Skia-based custom |
| Health sync | `expo-health` (HealthKit + Health Connect) |
| Notifications | `expo-notifications` |
| Animations | Reanimated 3 + Gesture Handler |
