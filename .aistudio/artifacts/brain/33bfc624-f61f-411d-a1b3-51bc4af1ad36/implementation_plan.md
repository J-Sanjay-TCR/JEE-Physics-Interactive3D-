# Mini Progress Dashboard & Gamified Tracker for JEE Question Arena

An engaging, expandable mini progress dashboard integrated directly into the top of the **JEE Questions Arena** and simulation question panels. Features an interactive circular donut visualization displaying solved vs. attempted questions per chapter, centered accuracy metrics, a chapter-wise mastery distribution ring, daily problem-solving streaks, and active practice time tracking.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Specifications from Clarification Phase**:
> 1. **Circular Visualization Style**: High-contrast SVG/Recharts Donut ring displaying Solved vs. Attempted questions with an animated center Accuracy percentage and chapter-wise breakdown segments.
> 2. **Placement**: Expandable / collapsible dashboard card situated at the very top of the Question Arena (and collapsible in the simulation question tab), keeping questions uncluttered while accessible with a single click.
> 3. **Gamification & Rewards**:
>    - **Daily Problem-Solving Streak Counter** (tracking consecutive active study days with celebratory particle effects).
>    - **Active Practice Session Time Tracker** (minutes/seconds engaged in problem-solving).
>    - **Chapter Mastery Status** (Solved vs. Attempted ratios per chapter with colored progress indicators).
> 4. **Persistence**: Tracks user progress in `localStorage` under `jee_arena_user_progress` so solved questions, streaks, and timestamps persist seamlessly across reloads.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. Displays an interactive **Circular Progress Ring**: Solved (emerald), Attempted (cyan/amber), and Remaining questions per chapter.
  2. The center of the donut displays live **Accuracy %** (`(Solved / Attempted) * 100%`) with total questions answered.
  3. Displays a **Chapter Mastery Distribution Ring** and breakdown bars showing progress across all 18 JEE chapters.
  4. Features a **Gamified Streak & Time Tracker**: Daily active streak counter with flame badge and a live stopwatch tracking active session time.
  5. Expandable / Collapsible: A sleek collapsed summary bar shows quick stats (`🔥 3-Day Streak`, `🎯 85% Accuracy`, `⏱️ 14m Spent`, `Solved: 12/18`), expanding smoothly into the full visual chart deck.
- **Target Audience**: JEE aspirants needing motivating visual feedback, gamified daily momentum, and clear diagnosis of weak vs. strong chapters.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **At-a-Glance Ribbon**:
   - Above the questions feed in the Arena, students see a streamlined gamification banner:
     - `🔥 Daily Streak: X Days`
     - `⏱️ Session Practice: MM:SS`
     - `🎯 Accuracy: XX%`
     - `📊 Questions Solved: N / Total`
     - `[Expand Dashboard / Hide Dashboard]` toggle button.
2. **Expanded Circular Dashboard**:
   - **Left Zone (Donut Chart & Accuracy Core)**:
     - Dual-stroke circular SVG donut ring: Green arc for correct answers, Amber arc for incorrect attempts, Muted grey for unattempted.
     - Center display: Big tabular bold Accuracy percentage with a glowing radial gradient and ratio `Solved / Attempted`.
   - **Center Zone (Chapter Breakdown Matrix)**:
     - Mini chapter bars / ring segments showing solved vs attempted for each active chapter (e.g. *Rotational Dynamics*, *Electrostatics*, *Ray Optics*, *Modern Physics*).
     - Clicking a chapter filters the question feed immediately to that chapter.
   - **Right Zone (Gamified Streaks & Milestones)**:
     - Today's Goal Progress bar (e.g. `Goal: 10 Questions / Day`).
     - Session Timer with Pause / Resume control.
     - Confetti burst when completing a chapter milestone or maintaining a streak.

#### B. Visual Identity & Theme
- Background: Deep Void `#070a18` with subtle quantum grid texture and hairline borders (`border-cyan-500/25`).
- Solved Stroke: `#10B981` (Emerald Glow).
- Attempted / Incorrect Stroke: `#F59E0B` (Amber Flame).
- Unattempted Track: `rgba(255, 255, 255, 0.08)`.
- Typography: `Plus Jakarta Sans` for headers, `JetBrains Mono` / `tabular-nums` for percentages and timers.

---

### 3. Technical Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JEE Questions Arena                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Mini Progress Dashboard (Collapsible Header Banner)              │  │
│  │ ┌──────────────────────┐  ┌───────────────────┐  ┌─────────────┐ │  │
│  │ │ Donut Progress Ring  │  │ Chapter Breakdown │  │ Gamification│ │  │
│  │ │ • Solved (Emerald)   │  │ • Mechanics       │  │ • Streak 🔥 │ │  │
│  │ │ • Attempted (Amber)  │  │ • Electromagnetism│  │ • Timer ⏱️  │ │  │
│  │ │ • Center: Accuracy % │  │ • Optics & Waves  │  │ • Goal Bar  │ │  │
│  │ └──────────────────────┘  └───────────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Filter Controls: [All Eras] [Recent 2022-26] [Chapters] [Years]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Active Question Cards Feed / Mock Exam Canvas                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core State & Storage Model:
```typescript
interface UserQuestionProgress {
  solvedQuestionIds: string[]; // correct answers
  attemptedQuestionIds: string[]; // any attempt
  answersMap: Record<string, { answer: any; isCorrect: boolean; timestamp: number; chapterId: string }>;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoal: number; // default 10
  todaySolvedCount: number;
  sessionSeconds: number;
}
```

---

### 4. Implementation Steps

1. **Progress Tracking Utilities (`src/utils/arenaProgress.ts`)**:
   - LocalStorage synchronization for user progress, daily streaks calculation based on `Date.now()`, chapter-wise aggregation, and session time tracking.
2. **Circular Donut Visualization Component (`src/components/arena/CircularProgressDonut.tsx`)**:
   - High-fidelity responsive SVG circular progress chart with smooth stroke dash-offset animations, multi-arc rendering (Solved, Incorrect Attempts, Remaining), and center metric display with hover tooltips.
3. **Mini Progress Dashboard Component (`src/components/arena/MiniProgressDashboard.tsx`)**:
   - Collapsible panel with condensed top bar and expanded full analytics view.
   - Chapter breakdown list with quick-filter triggers.
   - Daily streak badge with motivational messaging and live session stopwatch.
4. **Integration with `JeeQuestionsArena.tsx` & Simulation `QuestionArena.tsx`**:
   - Embed `<MiniProgressDashboard />` at the top of `JeeQuestionsArena`.
   - Update user progress automatically whenever a question is answered in Topic Drill or Mock Mode.
   - Also connect to the 3D lab's embedded `QuestionArena.tsx` so progress is unified across the entire application.
5. **Verification**:
   - Run `lint_applet` and `compile_applet` to ensure zero compilation or type issues.
