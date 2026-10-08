export interface QuestionAttemptRecord {
  questionId: string;
  chapterId: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface UserArenaProgress {
  solvedQuestionIds: string[]; // only correct ones
  attemptedQuestionIds: string[]; // all attempted questions
  savedQuestionIds: string[]; // bookmarked question IDs
  records: Record<string, QuestionAttemptRecord>;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  todaySolvedCount: number;
  dailyGoal: number; // default e.g. 10
  sessionStartTime: number;
  totalTimeSpentSeconds: number;
}

const STORAGE_KEY = 'jee_arena_user_progress_v2';
const SAVED_QUESTIONS_STORAGE_KEY = 'jee_arena_saved_questions_v1';

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function loadArenaProgress(): UserArenaProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayDateString();

    if (raw) {
      const data: UserArenaProgress = JSON.parse(raw);

      // Check if day changed to update streak & today count
      if (data.lastActiveDate !== today) {
        const lastDate = new Date(data.lastActiveDate);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continuous consecutive day streak
          data.streakDays = (data.streakDays || 1) + 1;
        } else if (diffDays > 1) {
          // Missed days, streak resets to 1
          data.streakDays = 1;
        }
        data.lastActiveDate = today;
        data.todaySolvedCount = 0;
      }

      data.savedQuestionIds = Array.isArray(data.savedQuestionIds)
        ? data.savedQuestionIds
        : loadSavedQuestionIds();
      data.sessionStartTime = Date.now();
      return data;
    }
  } catch (err) {
    console.warn('Failed to load arena progress from storage:', err);
  }

  // Initial fresh progress state
  return {
    solvedQuestionIds: [],
    attemptedQuestionIds: [],
    savedQuestionIds: loadSavedQuestionIds(),
    records: {},
    streakDays: 1,
    lastActiveDate: getTodayDateString(),
    todaySolvedCount: 0,
    dailyGoal: 10,
    sessionStartTime: Date.now(),
    totalTimeSpentSeconds: 0,
  };
}

export function saveArenaProgress(progress: UserArenaProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save arena progress:', err);
  }
}

export function recordQuestionAttempt(
  questionId: string,
  chapterId: string,
  isCorrect: boolean
): UserArenaProgress {
  const current = loadArenaProgress();
  const today = getTodayDateString();

  if (!current.attemptedQuestionIds.includes(questionId)) {
    current.attemptedQuestionIds.push(questionId);
  }

  if (isCorrect && !current.solvedQuestionIds.includes(questionId)) {
    current.solvedQuestionIds.push(questionId);
    current.todaySolvedCount = (current.todaySolvedCount || 0) + 1;
  }

  current.records[questionId] = {
    questionId,
    chapterId,
    isCorrect,
    timestamp: Date.now(),
  };

  current.lastActiveDate = today;
  saveArenaProgress(current);
  return current;
}

export function getChapterProgressStats(
  chapterId: string,
  totalAvailableInChapter: number,
  progress: UserArenaProgress
): { solved: number; attempted: number; total: number; accuracy: number } {
  let solved = 0;
  let attempted = 0;

  Object.values(progress.records).forEach((r) => {
    if (r.chapterId === chapterId) {
      attempted++;
      if (r.isCorrect) solved++;
    }
  });

  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  return {
    solved,
    attempted,
    total: Math.max(totalAvailableInChapter, attempted),
    accuracy,
  };
}

export function formatTimeMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Loads all bookmarked/saved question IDs from persistent storage
 */
export function loadSavedQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load saved question IDs:', err);
  }
  return [];
}

/**
 * Persists bookmarked/saved question IDs to storage and broadcasts update event
 */
export function saveSavedQuestionIds(ids: string[]): void {
  try {
    localStorage.setItem(SAVED_QUESTIONS_STORAGE_KEY, JSON.stringify(ids));
    // Dispatch custom event for real-time synchronization across UI tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jee_arena_saved_updated', { detail: ids }));
    }
  } catch (err) {
    console.warn('Failed to save saved question IDs:', err);
  }
}

/**
 * Toggles bookmark status for a question ID
 */
export function toggleSavedQuestionId(questionId: string): { isSaved: boolean; allSaved: string[] } {
  const current = loadSavedQuestionIds();
  const exists = current.includes(questionId);
  const next = exists ? current.filter((id) => id !== questionId) : [...current, questionId];

  saveSavedQuestionIds(next);

  // Also update progress snapshot if loaded
  try {
    const progress = loadArenaProgress();
    progress.savedQuestionIds = next;
    saveArenaProgress(progress);
  } catch {
    // Non-critical
  }

  return { isSaved: !exists, allSaved: next };
}

/**
 * Checks whether a question is currently bookmarked
 */
export function isQuestionSaved(questionId: string): boolean {
  return loadSavedQuestionIds().includes(questionId);
}

/**
 * Clears all saved question bookmarks
 */
export function clearAllSavedQuestionIds(): void {
  saveSavedQuestionIds([]);
  try {
    const progress = loadArenaProgress();
    progress.savedQuestionIds = [];
    saveArenaProgress(progress);
  } catch {
    // Non-critical
  }
}

