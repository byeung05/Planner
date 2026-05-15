# Focus & Rest — App Plan & UI Schema

A unified daily tracker for **sleep**, **study sessions**, and **scheduling**.
One scrollable timeline per day. Every block lives on the same axis so the app
answers three questions at a glance:

> *Did I sleep enough? Did I study enough? What's next today?*

---

## Research Findings — What the Best Apps Do

| App | Nav pattern | Dominant UI | Time display | Key interaction | Weekly summary |
|---|---|---|---|---|---|
| **Structured** | Floating bottom tab bar | Vertical timeline, pill blocks | Block height = duration | Drag to reschedule | Icon-only weekly grid |
| **Sunsama** | 3-panel sidebar | Kanban columns | Calendar time-grid (side panel) | Drag task → calendar | Channel-hour breakdown + objectives |
| **Reclaim.ai** | Left sidebar | Weekly calendar grid | Standard time-grid | AI auto-schedules | Budget Bar (% by type) |
| **Fantastical** | DayTicker strip + list | DayTicker carousel + event list | Day/week grid + dot density | Natural language input | None |
| **Sleep Cycle** | 5-tab bottom bar | Hypnogram sleep graph | Stepped chart (sleep stages) | Swipe-up morning reveal | 7-night rolling report |
| **Forest** | 4-tab bottom bar | Animated growing tree | Session grid (forest) | Single-tap to plant | Forest density view |

### Key patterns adopted for this app

- **Structured**: Vertical timeline, drag-to-reschedule, block height ∝ duration, circular progress icon, pull-down to week view
- **Sleep Cycle**: 5-tab nav model, hypnogram-style sleep chart, swipe-up morning summary reveal, domain-specific dark/calm palette at night
- **Forest**: Single-tap to start a focus session (zero friction), session grid view in stats, streak/gamification layer
- **Sunsama**: Weekly goals tied to domains (sleep, study, schedule) with channel-breakdown summaries and a qualitative reflection field
- **Fantastical**: Natural language quick-add for schedule blocks

---

## Navigation Structure

**Bottom tab bar — 5 tabs** (floating, centered "+" FAB embedded, same as Structured 4.0)

```
[ Today ]  [ Week ]  [ + ]  [ Stats ]  [ Goals ]
```

| Tab | Purpose |
|---|---|
| **Today** | Unified timeline — all sleep/study/schedule blocks on one axis |
| **Week** | 7-column compressed week view (icons only, like Structured's weekly grid) |
| **+** (FAB) | Context-aware quick-add sheet |
| **Stats** | Domain-tabbed stats — Sleep / Study / Schedule |
| **Goals** | Weekly goal dashboard — set targets, track progress |

---

## Screen-by-Screen UI Schema

---

### 1. Today Screen (Primary)

**Layout: full-screen vertical scrollable timeline**

```
┌─────────────────────────────────┐
│  Thu, May 15          [Today] ⚙ │  ← date header, settings icon
│  ◀  29  30  31  1  2  3  4  ▶  │  ← 7-day DayTicker strip (Fantastical)
├─────────────────────────────────┤
│  12 AM ─────────────────────── │  ← time gutter (left, small monospace)
│                                 │
│  ████████████████████████████  │  ← SLEEP block (purple, spans 12 AM–7 AM)
│  🌙 Sleep   7h 0m              │    icon left-anchored, title + duration
│                                 │
│  7 AM ──────────────────────── │
│  ████████████████████          │  ← Wake Up block (amber, 15 min)
│  ☀ Wake Up  15 min             │
│                                 │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← empty slot ghost → tap = quick-add
│  + What do you have to do?     │
│                                 │
│  8 AM ──────────────────────── │
│  ████████████████████████████  │  ← STUDY block (coral, 8–9:30 AM)
│  📖 Calculus   1h 30m     ●─── │    circular progress fills as time passes
│    12 min remaining            │    live countdown on current block
│                                 │
│  ──── NOW ────────────────────  │  ← red "now" line (Structured)
│                                 │
│  10 AM ─────────────────────── │
│  ████████████████████          │  ← Schedule block (rose, 30 min)
│  📧 Answer Emails  30 min    ○  │    empty circle = not complete
│                                 │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← empty slot
│  + What do you have to do?     │
│                                 │
│  11 PM ─────────────────────── │
│  ████████████████████████████  │  ← Go to Bed block (purple)
│  🌙 Go to Bed  11 PM           │
└─────────────────────────────────┘
       [ Today ][ Week ][ + ][ Stats ][ Goals ]
```

**Block anatomy** (pill shape, proportional height):
```
┌──────────────────────────────┐
│ [icon]  Title           time │  ← single line, truncates
│         subtitle / note      │  ← optional second line
│         ● ─────────── ○     │  ← progress arc (current block only)
│         12 min remaining     │  ← countdown (current block only)
└──────────────────────────────┘   [○] completion circle (right edge)
```

**Interactions:**
- **Drag block** up/down to reschedule (Structured)
- **Tap block** → opens detail/edit bottom sheet
- **Tap completion circle** → marks done, block fades to gray + checkmark
- **Tap empty slot prompt** → opens quick-add sheet pre-filled with tapped time
- **Pull down** on timeline → transitions to Week view (Structured pull gesture)
- **Long-press block** → drag handle activates, enable multi-select

---

### 2. Week Screen

**Layout: 7-column compressed timeline grid** (Structured weekly view)

```
┌─────────────────────────────────────────┐
│  Week of May 12 – 18         [< >]      │
│                                         │
│  S   M   T   W   T   F   S             │
│  12  13  14  15  16  17  18            │
│  ○   ○   ○   ●   ○   ○   ○            │  ← dot = study streak days
│ ─────────────────────────────────────  │
│  🌙  🌙  🌙  🌙  🌙  🌙  🌙          │  ← sleep icons per day
│  ☀   ☀   ☀   ☀                        │  ← morning blocks
│  📖  📖  📖  📖                        │  ← study blocks
│  📧                                     │
│  🏃                  🏃               │  ← other schedule blocks
│  🌙  🌙  🌙  🌙  🌙  🌙  🌙          │  ← bedtime blocks
│ ─────────────────────────────────────  │
│  Weekly Summary Cards                   │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ 😴 Sleep │ │ 📖 Study │ │ 📅 Day │ │
│  │  6.8h avg│ │  9.5h    │ │  74%   │ │
│  │  vs 7h ↓ │ │  vs 10h✓ │ │ done   │ │
│  └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────┘
```

- Tap any day column → drills into Today view for that day
- Tap any icon → opens that block's detail sheet
- Summary cards at bottom are tappable → link to Stats tab

---

### 3. Quick-Add Sheet (FAB "+")

**Layout: bottom sheet, slides up 60% of screen**

```
┌─────────────────────────────────┐
│  ───────  (drag handle)         │
│                                 │
│  [ 📖 Study ]  [ 📅 Schedule ]  │  ← domain toggle (3 segments)
│  [          🌙 Sleep          ] │
│                                 │
│  ┌─────────────────────────────┐│
│  │ What are you adding?       ││  ← natural language input (Fantastical)
│  └─────────────────────────────┘│
│  e.g. "Biology 2hrs at 3pm"     │
│                                 │
│  ── or fill manually ─────────  │
│                                 │
│  Subject / Title    [Calculus▾] │
│  Start time         [3:00 PM  ] │
│  Duration           [1h 30m   ] │
│  Icon               [📖       ] │
│  Repeat             [None     ▾]│
│                                 │
│  [        Add Block        ]    │
└─────────────────────────────────┘
```

---

### 4. Stats Screen

**Layout: segmented control → domain-specific charts below**

```
┌─────────────────────────────────┐
│  Stats              [Week ▾]    │
│  [ Sleep ]  [ Study ]  [ Days ] │  ← segmented control
├─────────────────────────────────┤
```

#### 4a. Stats — Sleep tab

```
│  Sleep Quality          82 / 100│
│  ┌─────────────────────────────┐│
│  │ Hypnogram — Last Night      ││  ← stepped chart (Sleep Cycle style)
│  │  Awake  ─────────           ││    Y-axis: Awake / REM / Light / Deep
│  │  REM    ──────────────      ││    X-axis: hours
│  │  Light  ─────────────────── ││    color bands per stage
│  │  Deep   ──────────          ││
│  └─────────────────────────────┘│
│                                 │
│  7-Night Trend                  │
│  ████░███████░████░██████████░  │  ← bar chart, each bar = one night
│  S   M   T   W   T   F   S     │    red bar = missed goal
│                                 │
│  Avg Duration   6h 48m  (↓12m) │
│  Regularity     88%             │  ← Sleep Cycle regularity score
│  Sleep Debt     –36 min / week  │
│  Streak         5 nights ✓      │
└─────────────────────────────────┘
```

#### 4b. Stats — Study tab

```
│  Total This Week    9h 30m      │
│  Goal               10h  (95%)  │
│                                 │
│  Subject Breakdown              │
│  Calculus    ████████  3h 20m  │  ← horizontal bar per subject
│  Biology     ██████    2h 40m  │    color matches subject tag
│  Spanish     █████     2h 10m  │
│  History     ████      1h 20m  │
│                                 │
│  Weekly Heatmap                 │
│  ┌──────────────────────────┐  │
│  │ M  T  W  T  F  S  S     │  │  ← GitHub-style grid
│  │ ██ ░░ ██ ██ ░░ █░ ░░    │  │    intensity = minutes studied
│  │ ██ ██ ██ ██ ██ ██ ░░    │  │
│  │ (4 weeks shown)          │  │
│  └──────────────────────────┘  │
│                                 │
│  Focus Streak       12 days 🔥  │
│  Avg Session        47 min      │
│  Distractions/day   2.1         │
└─────────────────────────────────┘
```

#### 4c. Stats — Days tab

```
│  Schedule Completion This Week  │
│                                 │
│  Mon  ██████████████░░  87%    │
│  Tue  ██████████░░░░░░  63%    │
│  Wed  ████████████████  100%   │
│  Thu  ████████░░░░░░░░  51% ←  │  ← today, in progress
│  Fri  ░░░░░░░░░░░░░░░░  —      │
│                                 │
│  Blocks done this week  28/38  │
│  On-time rate           79%    │
│  Busiest day            Wed    │
│                                 │
│  Time by Category               │
│  Study   ████████████  9.5h   │  ← Sunsama channel breakdown
│  Sleep   ████████████  47.4h  │
│  Other   ████░░░░░░░░  4.2h   │
└─────────────────────────────────┘
```

---

### 5. Goals Screen (Weekly Goals Dashboard)

**Layout: scrollable cards, one per domain**

```
┌─────────────────────────────────┐
│  Weekly Goals        May 12–18  │
│  [< Last week]   [Next week >]  │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🌙  Sleep Goals             ││
│  │                             ││
│  │  Nightly target    7h 30m   ││
│  │  Progress  ████████░░  80% ││  ← arc ring (large, centered)
│  │            6.8h / 7.5h avg ││
│  │                             ││
│  │  Bedtime goal    10:30 PM   ││
│  │  Consistency     88% ✓      ││
│  │  Debt this week  –36 min    ││
│  │                             ││
│  │  [Edit Sleep Goals]         ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📖  Study Goals             ││
│  │                             ││
│  │  Weekly total target  10h   ││
│  │  Progress  █████████░  95% ││
│  │            9.5h / 10h       ││
│  │                             ││
│  │  Per-subject targets        ││
│  │  Calculus  ████████  3h/3h ││  ← mini bar per subject
│  │  Biology   ██████░░  2h/3h ││
│  │  Spanish   ████████  2h/2h ││
│  │                             ││
│  │  Focus streak    12 days 🔥 ││
│  │                             ││
│  │  [Edit Study Goals]         ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📅  Schedule Goals          ││
│  │                             ││
│  │  Completion target   80%    ││
│  │  Progress  ████████░░  74% ││
│  │            28 / 38 blocks   ││
│  │                             ││
│  │  Anchor habits              ││
│  │  ✓ Morning Routine  5/5 d  ││  ← recurring habit streaks
│  │  ✓ Exercise         4/5 d  ││    (Sunsama objectives model)
│  │  ○ Evening Review   2/5 d  ││
│  │                             ││
│  │  [Edit Schedule Goals]      ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✍  Weekly Reflection        ││  ← Sunsama-inspired
│  │                             ││
│  │  "How did this week go?"    ││
│  │  ┌───────────────────────┐  ││
│  │  │ (free text field)     │  ││
│  │  └───────────────────────┘  ││
│  │                             ││
│  │  [Save Reflection]          ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Goal-setting flow** (tapping "Edit" opens a bottom sheet):
```
Sleep Goals sheet:
  • Nightly duration target  [7h 30m ±]
  • Bedtime target           [10:30 PM]
  • Wake time target         [6:00 AM ]
  • Weekly hours target      [auto-calc]

Study Goals sheet:
  • Weekly total target      [10h ±   ]
  • Per-subject toggle       [on/off  ]
  • Per-subject target       [3h each ±]
  • Pomodoro default         [25/5 min]

Schedule Goals sheet:
  • Completion target %      [80%  ±  ]
  • Anchor habits list       [+ Add Habit]
  • Days per week per habit  [5/7     ±]
```

---

### 6. Block Detail / Edit Sheet

**Layout: bottom sheet slides to 90% height**

```
┌─────────────────────────────────┐
│  ───  (drag handle)             │
│  [📖]  Calculus Study    [Done] │  ← icon (tappable), title, done button
│                                 │
│  9:00 AM → 10:30 AM  (1h 30m)  │
│  [─────●──────────────────────] │  ← time range slider
│                                 │
│  Subject   [Calculus ▾]         │
│  Mode      [● Free  ○ Pomodoro] │
│  Repeat    [None ▾]             │
│  Note      [Recharging focus…]  │
│                                 │
│  ─── Session History ─────────  │
│  Today  9:00–10:32  +2 min      │  ← actual vs planned
│                                 │
│  [Delete Block]                 │
└─────────────────────────────────┘
```

---

### 7. Morning Sleep Reveal (Sleep Cycle pattern)

Triggered when user taps "Good Morning" notification, or opens app within 30 min of wake goal:

```
┌─────────────────────────────────┐
│                                 │
│     Good morning! 👋            │
│     You slept 7h 02m            │
│                                 │
│  ┌─────────────────────────────┐│
│  │   Sleep Score    84 / 100   ││  ← large number, colored ring
│  │   ████████████████░░░░░░   ││
│  └─────────────────────────────┘│
│                                 │
│  Hypnogram ─ Last night         │
│  [stepped chart, 4 stage bands] │
│                                 │
│  Duration    7h 02m   Goal ✓    │
│  Bedtime     10:42 PM  (+12m)   │
│  Wake time   5:44 AM   (–16m)   │
│  Quality     Good               │
│                                 │
│  How do you feel?               │
│  😴  😐  🙂  😄                 │  ← 4-tap mood picker
│                                 │
│  [Start my day →]               │
│                                 │
└─────────────────────────────────┘
```

Swiping up (or tapping "Start my day") transitions to the Today timeline.

---

## Color Language

| Domain | Block color | Hex | Usage |
|---|---|---|---|
| Sleep (night) | Deep violet | `#5C4BCC` | Sleep blocks, sleep stats |
| Sleep (nap) | Soft lavender | `#9B8FE0` | Nap blocks |
| Study — focused | Coral red | `#E8604C` | Active study session |
| Study — review | Warm orange | `#F0884A` | Review/light study |
| Study — break | Sage green | `#6DB87A` | Pomodoro break |
| Schedule — routine | Amber | `#F5A623` | Morning/evening anchors |
| Schedule — event | Dusty rose | `#C97B84` | One-off events |
| Completed | Muted gray | `#C0BFCF` | Any completed block |
| Goal — on track | Forest green | `#3D9970` | Progress bars ≥ target |
| Goal — behind | Warm red | `#E84040` | Progress bars < 70% target |
| Now line | Signal red | `#FF3B30` | Current time indicator |

---

## Data Models

```
SleepEntry
  id, date, bedtime, wakeTime, durationMin,
  quality (1–5), moodEmoji, note,
  source (manual | healthkit | googlefit)

StudySession
  id, startTime, endTime, subjectId,
  mode (free | pomodoro), pomodoroCount,
  distractionCount, note

Subject
  id, name, colorHex, icon,
  weeklyGoalMinutes, sortOrder

ScheduleBlock
  id, title, icon, startTime, durationMinutes,
  category, recurrence (none | daily | weekly | custom),
  completedAt, actualDurationMinutes, note

WeeklyGoal
  weekStartDate,
  sleepNightlyTargetMin, sleepBedtime, sleepWakeTime,
  studyWeeklyTargetMin,
  scheduleCompletionTargetPct,
  reflectionText

SubjectGoal
  weekStartDate, subjectId, targetMinutes

AnchorHabit
  id, title, icon, targetDaysPerWeek, recurrence

DayStats (computed, cached)
  date, sleepScore, sleepDurationMin,
  studyMinutes, blocksCompleted, blocksTotal,
  completionPct
```

---

## Interaction Patterns (Borrowed & Adapted)

| Pattern | Source | Applied where |
|---|---|---|
| Drag block to reschedule | Structured | Today timeline |
| Block height ∝ duration | Structured | All timeline blocks |
| Pull-down to week view | Structured 4.0 | Today → Week transition |
| Circular progress on icon | Structured | In-progress block icon |
| Live countdown | Structured | Current block subtitle |
| 5-tab floating bottom bar | Sleep Cycle / Structured 4.0 | Global nav |
| Swipe-up morning reveal | Sleep Cycle | Morning summary screen |
| Hypnogram sleep chart | Sleep Cycle | Stats → Sleep tab |
| Single-tap to start focus | Forest | Study session FAB |
| Session grid/forest view | Forest | Stats → Study heatmap |
| Channel-hour breakdown | Sunsama | Stats → Days tab |
| Weekly reflection field | Sunsama | Goals screen |
| Per-objective progress | Sunsama | Goals → Study card |
| Natural language quick-add | Fantastical | Quick-add sheet |
| DayTicker strip | Fantastical | Today screen top |

---

## Version Roadmap

### v1.0 — Core Loop
- Today timeline (sleep + study + schedule blocks, manual entry)
- Morning sleep reveal screen
- Study session timer (free mode)
- Basic Goals screen (weekly targets, progress rings)
- Stats screen — Sleep + Study + Days tabs

### v1.5 — Depth
- Pomodoro mode with auto-inserted break blocks
- Sleep score algorithm (duration + consistency + timing)
- HealthKit / Google Fit sync
- Per-subject study goals
- Anchor habits in Goals
- Recurring schedule blocks
- Weekly reflection field

### v2.0 — Polish
- Pull-down Week view with 7-column icon grid
- Copy-tasks-from-yesterday / last week
- Lock screen + home screen widgets (sleep score, study ring, next block)
- Streak milestone badges
- Weekly PDF/CSV export
- Natural language quick-add (NLP parser)

---

## Tech Stack (React Native)

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo | Cross-platform, fast iteration |
| Navigation | Expo Router | File-based, supports tab + stack |
| State | Zustand + MMKV | Fast persistence, minimal boilerplate |
| Gestures | Reanimated 3 + Gesture Handler | Smooth drag-to-reschedule |
| Charts | React Native Skia (custom) | Full control over hypnogram + heatmap |
| Health sync | expo-health | HealthKit + Health Connect unified API |
| Notifications | expo-notifications | Wake alarm, study reminders |

---

## Differentiators

| App | Gap this fills |
|---|---|
| Structured | No sleep or study tracking, no weekly goals |
| Sleep Cycle | No schedule or study context |
| Forest / Focus Bear | No sleep or schedule, no weekly goal dashboard |
| Sunsama | No sleep tracking, mobile-secondary, subscription-heavy |
| Notion / Todoist | No timeline view, no passive tracking, no domain goals |

**This is the only app that unifies sleep, study, and schedule in one scrollable day — with a weekly goals dashboard that ties all three together.**
